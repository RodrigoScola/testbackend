import AWS from "aws-sdk";
import { StorageNames } from "./constants";
import { SQLclient } from "./server";
import { TABLENAMES } from "./types";

require("dotenv").config();

export const s3Bucket = new AWS.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY_ID || "",
  },
});

// implementation of the strategy pattern to fetch data from different storages
// in the future, would be smart to make an adapter for the storage

export interface MyStorage {
  getOne<T = string>(identifier: string): Promise<T | null>;
  getAll<T = string>(identifier: string): Promise<T | null>;
  upload<T>(contents: any, identifier: string): Promise<T>;
  update(identifier: string, contents: any): void;
}

export class DataTransformer {
  public static orderBy<T>(items: T[], key: keyof T, order: "asc" | "desc") {
    items.sort((a: T, b: T) =>
      order === "desc" ? (b[key] > a[key] ? 1 : -1) : a[key] > b[key] ? 1 : -1
    );
  }
  public static groupBy<T>(property: keyof T, items: T[]) {
    items.sort((a: T, b: T) => (a[property] > b[property] ? 1 : -1));
  }
}

export class SQLStorage implements MyStorage {
  public tableName: TABLENAMES;
  constructor(private tablename: TABLENAMES) {
    this.tableName = tablename;
  }

  static async getAll<T>(tablename: string): Promise<T> {
    return new Promise((res, rej) => {
      const a = SQLclient.query(
        `select * from ${tablename} order by created_at desc `,
        (error, result) => {
          if (error) rej(error);
          if (typeof result !== "undefined") {
            res(result as Promise<T>);
          }
          rej([]);
        }
      );
    });
  }

  // just a wrapper for the static `Bucket.getAll` function
  async getAll<T>(): Promise<T> {
    return await SQLStorage.getAll(this.tablename);
  }
  getOne<T>(id: string): Promise<T> {
    return new Promise((res, rej) => {
      SQLclient.query(
        "select * from " +
          this.tablename +
          " where id = " +
          SQLclient.escape(id),
        (error, result, field) => {
          if (error || result.length == 0) rej(error);

          res(result[0]);
        }
      );
    });
  }

  // instead of writing the individual columns, this accepts an object and generates the query based on it's keys
  // { name: "jerry", age: 28 } becomes "name = ?, age = ?".
  // we dont use the `entries` because they need to be escaped later on
  public static ObjectToSql(info: object): string {
    const keys = Object.keys(info);

    return keys.join(" = ?, ") + " = ? ";
  }

  async update<T extends Record<string, any>>(id: string, info: T) {
    return new Promise((res, rej) => {
      const query: string =
        "update " + this.tablename + " set " + SQLStorage.ObjectToSql(info);

      SQLclient.query(
        `${query} where id = ${SQLclient.escape(id)}`,
        [...Object.values<string>(info)],
        (error, result) => {
          if (error) {
            rej(error);
          }
          res(result);
        }
      );
    });
  }

  static upload<T>(tablename: TABLENAMES, contents: any): Promise<T> {
    return new Promise((res, rej) => {
      const a = SQLclient.query(
        `insert into ${tablename} set ?`,
        contents,
        (error, result) => {
          if (error) {
            rej(error);
          }
          res(result as Promise<T>);
        }
      );
    });
  }
  async upload<T>(info: T): Promise<T> {
    return await SQLStorage.upload(this.tablename, info);
  }
}

export class S3Storage implements MyStorage {
  public storageName: StorageNames;
  constructor(bucketName: StorageNames) {
    this.storageName = bucketName;
  }

  public ListFiles(prefix: string): Promise<AWS.S3.Types.ListObjectsV2Output> {
    return new Promise(async (resolve, reject) => {
      try {
        s3Bucket.listObjectsV2(
          {
            Bucket: this.storageName,
            Prefix: prefix,
          },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          }
        );
      } catch (err) {
        reject(err);
        return;
      }
    });
  }
  public async getFiles(filenames: string[]) {
    let promises: any[] = [];

    filenames.forEach((filename) => {
      promises.push(this.getOne(filename));
    });
    return await Promise.all(promises);
  }
  getAll<T = string>(identifier: string): Promise<T> {
    return new Promise(async (res, rej) => {
      try {
        const files = await this.ListFiles(identifier);

        const filenames = files.Contents?.map((file) => file.Key as string);

        const promisses = filenames?.map((filename) => this.getOne(filename));

        const allFilesString = await Promise.all(promisses as any);

        if (allFilesString.length == 0) {
          rej(new Error("There were no files found"));
        }

        res(allFilesString as T); // Promise.all(promisses))
      } catch (err) {
        rej(err);
      }
    });
  }
  public getOne<T = string>(filename: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        s3Bucket.getObject(
          {
            Bucket: this.storageName,
            Key: filename,
          },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            if (!data.Body) {
              reject(new Error("Failed to get body"));
              return;
            }
            // s3 sends a buffer, this is so we return the string
            resolve(data.Body.toString() as T);
          }
        );
      } catch (err) {}
    });
  }
  public upload<T extends string>(contents: T, identifier: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.storageName,
          Key: identifier,
          Body: new Buffer(contents),
        };
        s3Bucket.putObject(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data as Promise<T>);
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
  public async update<T>(filename: string, contents: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.storageName,
          Key: filename,
          Body: new Buffer(contents),
        };
        s3Bucket.putObject(params, (err: any, data: any) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(data);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  public static CreateBucket(name: string): Promise<boolean> {
    return new Promise((res, rej) => {
      s3Bucket.createBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err);
        }
        res(true);
      });
    });
  }
  public static async RemoveBucket(name: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await s3Bucket.deleteBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err);
          return;
        }
        res(true);
      });
    });
  }
}
