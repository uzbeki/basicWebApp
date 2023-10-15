import { hashQueryColumns } from "@/parser/utils";

describe("hashQueryColumns", () => {
  it("should hash column names in a SELECT query", () => {
    const sqlQuery = "SELECT id, name FROM users";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toHaveLength(2);
  });

  it("should hash column names in an INSERT query", () => {
    const sqlQuery = "INSERT INTO users (id, name) VALUES (1, 'John')";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toHaveLength(2);
  });

  it("should hash column names in a DELETE query", () => {
    const sqlQuery = "DELETE FROM users WHERE id = 1";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toHaveLength(1);
  });

  it("should hash column names in an ALTER query", () => {
    const sqlQuery = "ALTER TABLE users ADD COLUMN age INT";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("age");
    expect(columnList).toHaveLength(1);
  });

  it("should hash column names in a CREATE query", () => {
    const sqlQuery = "CREATE TABLE users (id INT, name VARCHAR(255))";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toHaveLength(2);
  });

  it("should hash column names in a DROP query", () => {
    const sqlQuery = "DROP TABLE users";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toHaveLength(0);
  });

  it("should handle empty input", () => {
    const sqlQuery = "";
    expect(() => {
      hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    }).toThrowError();
  });

  it("should handle queries with no columns", () => {
    const sqlQuery = "SELECT * FROM users";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toHaveLength(0);
  });

  it("should handle queries with duplicate columns", () => {
    const sqlQuery = "SELECT id, name, id FROM users";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toHaveLength(2);
  });

  it("should handle queries with special characters in column names", () => {
    const sqlQuery = "SELECT `id`, `first name`, `last name` FROM users";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("first name");
    expect(columnList).toContain("last name");
    expect(columnList).toHaveLength(3);
  });

  it("should handle complex queries with subqueries and joins", () => {
    const sqlQuery =
      "SELECT u.id, u.name, o.order_id, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE o.order_date >= '2021-01-01' AND o.order_date <= '2021-12-31' AND u.name LIKE '%John%'";
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toContain("order_id");
    expect(columnList).toContain("order_date");
    expect(columnList).toContain("user_id");
    expect(columnList).toHaveLength(5);
  });

  it("should handle invalid SQL queries", () => {
    const sqlQuery = "SELECT * FROM users WHERE id = '1";
    expect(() => {
      hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    }).toThrow();
  });

  it("should handle invalid SQL queries2", () => {
    const sqlQuery = "al;skb1y819187 127y1 2981ybjha bajk";
    expect(() => {
      hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    }).toThrow();
  });

  it("should handle invalid SQL queries3", () => {
    const sqlQuery = "1111";
    expect(() => {
      hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    }).toThrow();
  });

  it("should hash column names in a complex SELECT query with JOINs and WHERE clause", () => {
    const sqlQuery = `
    SELECT
      t1.column1,
      t2.column2,
      t3.column3
    FROM
      table1 t1
    JOIN table2 t2 ON
      t1.id = t2.table1_id
    JOIN table3 t3 ON
      t2.id = t3.table2_id
    WHERE
      t1.column4 = 'value' AND t2.column5 = 'value' AND t3.column6 = 'value'
    ORDER BY
      t1.column7 DESC,
      t2.column8 ASC,
      t3.column9 DESC
    LIMIT 50;
    `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toContain("column2");
    expect(columnList).toContain("column3");
    expect(columnList).toContain("column4");
    expect(columnList).toContain("column5");
    expect(columnList).toContain("column6");
    expect(columnList).toContain("column7");
    expect(columnList).toContain("column8");
    expect(columnList).toContain("column9");
    expect(columnList).toContain("id");
    expect(columnList).toContain("table1_id");
    expect(columnList).toContain("table2_id");
    expect(columnList).toHaveLength(12);
  });

  it("should handle a complex query with CTEs and subqueries", () => {
    const sqlQuery = `
      WITH
        order_totals AS(
          SELECT
            o.order_id,
            SUM(od.quantity * p.unit_price) AS total
          FROM
            orders o
          JOIN order_details od ON
            o.order_id = od.order_id
          JOIN products p ON
            od.product_id = p.product_id
          GROUP BY
            o.order_id
        )
      SELECT
        c.customer_name,
        ot.total
      FROM
        customers c
      JOIN orders o ON
        c.customer_id = o.customer_id
      JOIN order_totals ot ON
        o.order_id = ot.order_id
      WHERE
        o.order_date BETWEEN '2021-01-01' AND '2021-12-31' AND ot.total >(
          SELECT
            AVG(total)
          FROM
            order_totals
        )
      ORDER BY
        ot.total
      DESC;
    `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("customer_name");
    expect(columnList).toContain("total");
    expect(columnList).toContain("order_id");
    expect(columnList).toContain("quantity");
    expect(columnList).toContain("unit_price");
    expect(columnList).toContain("product_id");
    expect(columnList).toContain("customer_id");
    expect(columnList).toContain("order_date");
    expect(columnList).toHaveLength(8);
  });

  it("should handle insert with calculated value", () => {
    const sqlQuery = `
      INSERT INTO my_table (column1, column2, column3)
      SELECT column4, column5, column6 + column7
      FROM other_table
      WHERE column7 = 'value';
    `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toContain("column2");
    expect(columnList).toContain("column3");
    expect(columnList).toContain("column4");
    expect(columnList).toContain("column5");
    expect(columnList).toContain("column6");
    expect(columnList).toContain("column7");
    expect(columnList).toHaveLength(7);
  });

  it("should handle a complex insert query with a CASE statement", () => {
    const sqlQuery = `
      INSERT INTO my_table (column1, column2, column3)
      SELECT column4, column5, CASE WHEN column3 > column1 THEN 'value1' ELSE 'value2' END
      FROM other_table
      WHERE column6 = 'value';
    `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toContain("column2");
    expect(columnList).toContain("column3");
    expect(columnList).toContain("column4");
    expect(columnList).toContain("column5");
    expect(columnList).toContain("column6");
    expect(columnList).toHaveLength(6);
  });

  it("should handle an insert query with a join", () => {
    const sqlQuery = `
        INSERT INTO my_table (column1, column2, column3)
        SELECT t1.column4, t2.column5, t1.column6
        FROM table1 t1
        JOIN table2 t2 ON t1.id = t2.id
        WHERE column7 = 'value';
      `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toContain("column2");
    expect(columnList).toContain("column3");
    expect(columnList).toContain("column4");
    expect(columnList).toContain("column5");
    expect(columnList).toContain("column6");
    expect(columnList).toContain("column7");
    expect(columnList).toContain("id");
    expect(columnList).toHaveLength(8);
  });

  it("should handle a query with comments", () => {
    const sqlQuery = `-- This is a comment
            UPDATE my_table SET column1 = 'value1' -- This is another comment
            WHERE TRUE -- And one more comment`;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toHaveLength(1);
  });

  it("should handle a complex update query", () => {
    const sqlQuery = `UPDATE my_table1
            JOIN my_table2 ON my_table1.id = my_table2.id
            SET my_table1.column1 = (SELECT COUNT(*) FROM other_table WHERE other_table.id = my_table1.id),
                my_table2.column2 = CASE WHEN my_table1.column1 > 0 THEN 'positive' ELSE 'negative' END,
                my_table1.column3 = NOW()
            WHERE column4 = 'value'`;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("column1");
    expect(columnList).toContain("column2");
    expect(columnList).toContain("column3");
    expect(columnList).toContain("column4");
    expect(columnList).toContain("id");
    expect(columnList).toHaveLength(5);
  });

  it("should handle a create table query", () => {
    const sqlQuery = `
        CREATE TABLE my_table (
          id INTEGER,
          name VARCHAR(50) NOT NULL,
          age INTEGER CHECK (age >= 18),
          email VARCHAR(100) UNIQUE,
          phone VARCHAR(20),
          address VARCHAR(200),
          city VARCHAR(50),
          state VARCHAR(50),
          country VARCHAR(50),
          zip VARCHAR(10),
          user_id INTEGER REFERENCES users(id),
          PRIMARY KEY (name, email)
        );
      `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toContain("age");
    expect(columnList).toContain("email");
    expect(columnList).toContain("phone");
    expect(columnList).toContain("address");
    expect(columnList).toContain("city");
    expect(columnList).toContain("state");
    expect(columnList).toContain("country");
    expect(columnList).toContain("zip");
    expect(columnList).toContain("user_id");
    expect(columnList).toHaveLength(11);
  });

  it("should handle a create table query with a composite primary key, foreign key, generated column, and constraints", () => {
    const sqlQuery = `CREATE TABLE my_table (
          id INTEGER,
          name VARCHAR(50) NOT NULL,
          age INTEGER DEFAULT 18 CHECK (age >= 18),
          email VARCHAR(100) UNIQUE,
          phone VARCHAR(20),
          address VARCHAR(200),
          city VARCHAR(50),
          state VARCHAR(50),
          country VARCHAR(50),
          zip VARCHAR(10),
          user_id INTEGER REFERENCES users(id),
          PRIMARY KEY (name, email),
          full_address VARCHAR(500) GENERATED ALWAYS AS (CONCAT(address, ', ', city, ', ', state, ', ', country, ' ', zip)) STORED,
          CONSTRAINT valid_zip CHECK (REGEXP_LIKE(zip, '^[0-9]{5}(?:-[0-9]{4})?$'))
        );
      `;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toContain("name");
    expect(columnList).toContain("age");
    expect(columnList).toContain("email");
    expect(columnList).toContain("phone");
    expect(columnList).toContain("address");
    expect(columnList).toContain("city");
    expect(columnList).toContain("state");
    expect(columnList).toContain("country");
    expect(columnList).toContain("zip");
    expect(columnList).toContain("user_id");
    expect(columnList).toContain("full_address");
    expect(columnList).toHaveLength(12);
  });

  it("should handle a complex delete query", () => {
    const sqlQuery = `DELETE my_table1, my_table2 FROM my_table1 JOIN my_table2 ON my_table1.id = my_table2.id WHERE my_table1.id IN (SELECT id FROM other_table WHERE TRUE)`;
    const { query, modifiedAst, columnList } = hashQueryColumns({ sql: sqlQuery, database: "MySQL" });
    expect(query).not.toEqual(sqlQuery);
    expect(modifiedAst).toBeDefined();
    expect(columnList).toContain("id");
    expect(columnList).toHaveLength(1);
  });
});
