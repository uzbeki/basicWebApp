import { getRecordsByHashes, insertRecords } from "@/database";
import { HashRecord } from "@/types";
import crypto from "crypto";
import { AST, Parser, Option } from "node-sql-parser";

function generateRandomString(length: number): string {
  if (length <= 0) {
    throw new Error("Length must be a positive integer.");
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomBytes = crypto.randomBytes(length);

  return randomBytes.reduce((result, byte) => {
    const randomIndex = byte % characters.length;
    return result + characters.charAt(randomIndex);
  }, "");
}

function createHmacHash(input: string, secretKey = generateRandomString(32)): string {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(input);
  return hmac.digest("hex").slice(0, 64); // Slice it to get the first 64 characters
}

const options: Option = { database: "Postgresql" };
export const parser = new Parser();

/**
 * Extracts the column name from a string in the format "{type}::{tableName}::{columnName}".
 */
function extractColumnName(inputString: string) {
  const regex = /::([^:]+)$/;
  const match = inputString.match(regex);
  return match ? match[1] : inputString;
}

function createHashRecords(columns: string[]): HashRecord[] {
  const records = columns.map(column => ({ hash: createHmacHash(column), column_name: column }));
  insertRecords(records);
  return records;
}

/**
 * Updates column names in the given object or array of objects based on the provided records.
 * @param obj - The object or array of objects to update.
 * @param records - The array of records to use for updating column names.
 * @param hash - Whether to use the hash value of the column or the column name itself.
 * @returns The updated object or array of objects.
 */
function updateColumnNames(obj: any, records: HashRecord[], hash = true): AST | AST[] {
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        updateColumnNames(obj[i], records, hash);
      }
    } else {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          if (prop === "type" && obj[prop] === "column_ref") {
            const column = hash
              ? records.find(record => record.column_name === obj["column"])?.hash
              : records.find(record => record.hash === obj["column"])?.column_name;
            obj["column"] = column || "NOT_FOUND";
          } else if (prop === "set" && obj["type"] === "update" && Array.isArray(obj[prop])) {
            for (const setItem of obj[prop]) {
              const column = hash
                ? records.find(record => record.column_name === setItem["column"])?.hash
                : records.find(record => record.hash === setItem["column"])?.column_name;
              setItem["column"] = column || "NOT_FOUND";
            }
          }
          updateColumnNames(obj[prop], records, hash);
        }
      }
    }
  }
  return obj;
}

const checkIfValueInArray = (value: string): boolean => {
  const databases = [
    "bigquery",
    "db2",
    "hive",
    "mariadb",
    "mysql",
    "postgresql",
    "sqlite",
    "transactsql",
    "flinksql",
    "snowflake",
  ];
  return databases.includes(value.trim().toLowerCase());
};

export const getModifiedAst = (sql: string) => {
  const { ast, columnList } = parser.parse(sql);

  const records = createHashRecords(
    Array.from(new Set(columnList.filter(str => !str.includes("*")).map(extractColumnName)))
  );
  if (records.length === 0) return ast;
  const modifiedAst = updateColumnNames(ast, records);
  return modifiedAst;
};

export const rebuildQuery = async (ast: AST) => {
  const query = parser.sqlify(ast);
  const { ast: _ast, columnList } = parser.parse(query);
  const columns = Array.from(new Set(columnList.filter(str => !str.includes("*")).map(extractColumnName)));
  const records = await getRecordsByHashes(columns);
  if (records.length === 0) return query;
  const modifiedAst = updateColumnNames(ast, records, false);
  return parser.sqlify(modifiedAst);
};

const removeQuotes = (str: string) => str.replace(/["]+/g, "'");

/**
 * Hashes the column names in a SQL query and returns the modified query, modified AST, and column list.
 * @param sqlQuery - The SQL query to hash the column names for.
 * @returns An object containing the modified query, modified AST, and column list.
 */
export const hashQueryColumns = ({ sql: sqlQuery, database = "MySQL" }: { sql: string; database: string }) => {
  if (!sqlQuery) throw new Error(`sql query (${String(sqlQuery)}) is invalid`);

  if (!checkIfValueInArray(database)) throw new Error(`This database (${database}) is not supported.`);
  const { ast, columnList } = parser.parse(sqlQuery, { database });

  const records = createHashRecords(
    Array.from(new Set(columnList.filter(str => !str.includes("*")).map(extractColumnName)))
  );
  if (records.length === 0) {
    return {
      query: sqlQuery,
      modifiedAst: ast,
      columnList: [],
    };
  }
  const modifiedAst = updateColumnNames(ast, records);
  return {
    query: removeQuotes(parser.sqlify(modifiedAst, { database })),
    modifiedAst,
    columnList: records.map(record => record.column_name),
  };
};

/**
 * Replaces hashed column names in a SQL query with their original names.
 * @param sqlQuery - The SQL query to be modified.
 * @returns An object containing the modified SQL query, the modified AST, and the list of column names.
 */
export const unhashQueryColumns = async ({ sql: sqlQuery, database }: { sql: string; database: string }) => {
  if (!checkIfValueInArray(database)) throw new Error(`This database (${database}) is not supported.`);
  const { ast, columnList } = parser.parse(sqlQuery, { database });
  const columns = Array.from(new Set(columnList.filter(str => !str.includes("*")).map(extractColumnName)));
  const records = await getRecordsByHashes(columns);
  if (records.length === 0) {
    return {
      query: sqlQuery,
      modifiedAst: ast,
      columnList: [],
    };
  }
  const modifiedAst = updateColumnNames(ast, records, false);
  return {
    query: removeQuotes(parser.sqlify(modifiedAst, { database })),
    modifiedAst,
    columnList: records.map(record => record.column_name),
  };
};
