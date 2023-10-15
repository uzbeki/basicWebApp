import type { HashRecord } from "@/types";
import sqlite3 from "sqlite3";
import path from "node:path";

class DatabaseHandler {
  private db: sqlite3.Database;

  constructor(databasePath = `${path.resolve(__dirname, "hash_records.db")}`) {
    this.db = new sqlite3.Database(databasePath);
    this.initializeDatabase();
  }

  initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `
					CREATE TABLE IF NOT EXISTS hash_records (
						hash TEXT PRIMARY KEY,
						column_name TEXT NOT NULL
					)`,
          err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    });
  }

  insertRecords(records: HashRecord[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const placeholders = records.map(() => "(?, ?)").join(", ");
      const values = records.reduce((result, record) => {
        result.push(record.hash, record.column_name);
        return result;
      }, [] as string[]);
      this.db.run(`INSERT INTO hash_records (hash, column_name) VALUES ${placeholders}`, values, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getRecordsByHashes(hashes: string[]) {
    return new Promise<HashRecord[]>((resolve, reject) => {
      const placeholders = hashes.map(() => "?").join(", ");
      this.db.all<HashRecord>(`SELECT * FROM hash_records WHERE hash IN (${placeholders})`, hashes, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  closeDatabase(): void {
    this.db.close();
  }
}

export const insertRecords = async (records: HashRecord[]) => {
  if (records.length === 0) return;
  const db = new DatabaseHandler();
  await db.initializeDatabase();
  await db.insertRecords(records);
  db.closeDatabase();
};

export const getRecordsByHashes = async (hashes: string[]) => {
  if (hashes.length === 0) return [];
  const db = new DatabaseHandler();
  await db.initializeDatabase();
  const result = await db.getRecordsByHashes(hashes);
  db.closeDatabase();
  return result;
};
