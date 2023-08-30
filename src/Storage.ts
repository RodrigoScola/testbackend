import AWS from "aws-sdk"

require("dotenv").config()
export const s3Bucket = new AWS.S3({
  region: "sa-east-1",
  credentials: {
    // TODO: Change to env
    accessKeyId: "AKIA37RB447XVIMEPAE5" as string,
    secretAccessKey: "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" as string,
  },
})
export interface MyBucket {
  getOne(filename: string): unknown
  upload(name: string, contents: any): unknown
}

export class SQLBucket implements MyBucket {
  getOne(filename: string): unknown {
    throw new Error("Method not implemented.")
  }
  upload(name: string, contents: any): unknown {
    throw new Error("Method not implemented.")
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

  public getOne(filename: string): Promise<AWS.S3.GetObjectOutput> {
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
            resolve(data)
          }
        )
      } catch (err) {}
    })
  }
  public upload(filename: string, contents: string): Promise<Object> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.bucketName,
          Key: filename,
          Body: new Buffer(contents),
        }
        s3Bucket.putObject(params, (err: any, data: any) => {
          if (err) {
            console.error(err)
            reject(err)
          }
          resolve(data)
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }
  public update(filename: string, contents: string): Promise<Object> {
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
  public static CreateBucket(name: string): boolean {
    let success = false
    s3Bucket.createBucket({ Bucket: name }, function (err, data) {
      if (err) {
        return
      }
      success = true
    })
    return success
  }
  public static RemoveBucket(name: string): boolean {
    let success = false
    s3Bucket.deleteBucket({ Bucket: name }, function (err, data) {
      if (err) {
        return
      }
      success = true
    })
    return success
  }
}
