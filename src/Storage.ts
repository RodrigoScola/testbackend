import AWS from "aws-sdk"
import { SQLclient } from "./server"

require("dotenv").config()

export type QueryResultType<T> = {
  RowDataPacket: T
}

export const s3Bucket = new AWS.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY_ID || "",
  },
})

export interface MyBucket {
  getOne<T>(identifier: string): Promise<T | null>
  getAll<T>(identifier: string): Promise<T | null>
  upload<T>(identifier: string, contents: T): Promise<T>
  update(identifier: string, contents: any): void
}

export class SQLBucket implements MyBucket {
  constructor(private tablename: string) {}

  static async getAll<T>(tablename: string): Promise<T> {
    return new Promise((res, rej) => {
      const a = SQLclient.query(
        `select * from ${tablename} order by created_at desc `,
        (error, result, field) => {
          if (error) rej(error)
          if (typeof result !== "undefined") {
            res(result as Promise<T>)
          }
          rej([])
        }
      )
    })
  }
  async getAll<T>(): Promise<T> {
    return await SQLBucket.getAll(this.tablename)
  }
  getOne<T>(id: string): Promise<T> {
    return new Promise((res, rej) => {
      SQLclient.query(
        "select * from " +
          this.tablename +
          " where id = " +
          SQLclient.escape(id),
        (error, result, field) => {
          if (error || result.length == 0) rej(error)

          res(result[0])
        }
      )
    })
  }
  public static ObjectToSql(info: object): string {
    const keys = Object.keys(info)

    return keys.join(" = ?, ") + " = ? "
  }

  async update<T extends object>(id: string, info: T) {
    return new Promise((res, rej) => {
      const query: string =
        "update " + this.tablename + " set " + SQLBucket.ObjectToSql(info)

      SQLclient.query(
        `${query} where id = ${SQLclient.escape(id)}`,
        [...Object.values<string>(info)],
        (error, result, field) => {
          if (error) {
            rej(error)
          }
          res(result)
        }
      )
    })
  }

  upload<T>(name: string, contents: any): Promise<T> {
    return new Promise((res, rej) => {
      const a = SQLclient.query(
        `insert into ${name} set ?`,
        contents,
        (error, result, field) => {
          if (error) {
            rej(error)
          }
          res(result as Promise<T>)
        }
      )
    })
  }
}

export class S3Bucket implements MyBucket {
  public bucketName: string
  constructor(bucketName: string) {
    this.bucketName = bucketName
  }

  public ListFiles(prefix: string): Promise<AWS.S3.Types.ListObjectsV2Output> {
    return new Promise(async (resolve, reject) => {
      try {
        s3Bucket.listObjectsV2(
          {
            Bucket: this.bucketName,
            Prefix: prefix,
          },
          (err, data) => {
            if (err) {
              reject(err)
              return
            }
            resolve(data)
          }
        )
      } catch (err) {
        reject(err)
        return
      }
    })
  }
  public async getFiles(filenames: string[]) {
    let promises: any[] = []

    filenames.forEach((filename) => {
      promises.push(this.getOne(filename))
    })
    return await Promise.all(promises)
  }
  getAll<T>(identifier: string): Promise<T | null> {
    return new Promise(async (res, rej) => {
      try {
        const files = await this.ListFiles(identifier)

        console.log(files)

        const filenames = files.Contents?.map((file) => file.Key as string)

        const promisses = filenames?.map((filename) => this.getOne(filename))

        const allFilesJson = Promise.all(promisses as any)

        console.log(allFilesJson)

        res(allFilesJson as Promise<T>) // Promise.all(promisses))
      } catch (err) {
        rej(err)
      }
    })
  }
  public getOne<T extends string = string>(filename: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        s3Bucket.getObject(
          {
            Bucket: this.bucketName,
            Key: filename,
          },
          (err, data) => {
            if (err) {
              reject(err)
              return
            }
            if (!data.Body) {
              reject(new Error("Failed to get body"))
              return
            }
            resolve(data.Body.toString() as T)
          }
        )
      } catch (err) {}
    })
  }
  public upload<T>(identifier: string, contents: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.bucketName,
          Key: identifier,
          Body: new Buffer(contents),
        }
        s3Bucket.putObject(params, (err: any, data: any) => {
          if (err) {
            reject(err)
          }
          resolve(data as Promise<T>)
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }
  public async update<T>(filename: string, contents: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.bucketName,
          Key: filename,
          Body: new Buffer(contents),
        }
        s3Bucket.putObject(params, (err: any, data: any) => {
          if (err) {
            console.log(err)
            reject(err)
          }
          resolve(data)
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  public static CreateBucket(name: string): Promise<boolean> {
    return new Promise((res, rej) => {
      s3Bucket.createBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err)
        }
        res(true)
      })
    })
  }
  public static async RemoveBucket(name: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await s3Bucket.deleteBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err)
          return
        }
        res(true)
      })
    })
  }
}
