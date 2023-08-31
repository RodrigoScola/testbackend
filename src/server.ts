import express, { Router } from "express"
import mysql from "mysql"
import { MyBucket, S3Bucket } from "./Storage"
import { User } from "./User"
import { BASE_MESSAGE_URL, BucketNames, DirectoryNames } from "./constants"
import { employeeRouter } from "./routes/employees"
import { MessageInfo, NewMessageInfo } from "./types"

require("dotenv").config()

export const SQLclient = mysql.createConnection({
  host: process.env.AWS_RDS_HOST,
  port: parseInt(process.env.AWS_RDS_PORT as string),
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE_NAME,
  user: process.env.AWS_RDS_USERNAME,
})

const app = express()
const route = Router()

app.use(express.json())
app.use("/", route)
app.use("/employees", employeeRouter)
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))

export class MessageProcessor {
  public static AddUsernamesToMessages(
    messages: NewMessageInfo[]
  ): MessageInfo[] {
    return messages.map((message) => {
      return {
        ...message,
        user_name: User.userNameFromEmail(message.email),
      }
    })
  }
  public static async uploadMessages(
    messages: MessageInfo[],
    bucket: MyBucket
  ) {
    messages.forEach((message) => {
      bucket.upload(
        "messages/message_" + message.id + ".json",
        JSON.stringify(message)
      )
    })
  }
  public static async FetchMessagesFromURL(
    url: string
  ): Promise<MessageInfo[]> {
    try {
      const data = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      if (data.ok) {
        return await data.json()
      }
      return []
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

route.get("/", (req, res) => {
  res.json({
    response: "Hello World",
  })
})

route.get("/messages/startprocess", async (req, res) => {
  const fetchedMessages = await MessageProcessor.FetchMessagesFromURL(
    BASE_MESSAGE_URL
  )

  const bucket = new S3Bucket(BucketNames.BACKEND_MESSAGES_BUCKET_NAME)

  // check if the messages are already in the bucket
  const totalMessages = await bucket.ListFiles(
    `/${DirectoryNames.BASE_MESSAGES_DIRECTORY}`
  )

  if (
    typeof totalMessages.Contents != "undefined" &&
    totalMessages?.Contents?.length <= 0
  ) {
    let promises: any[] = []
    promises.push(
      bucket.upload("messages.json", JSON.stringify(fetchedMessages))
    )

    fetchedMessages.forEach((item) => {
      promises.push(
        bucket.upload(
          JSON.stringify(item),
          `${DirectoryNames.BASE_MESSAGES_DIRECTORY}/message_` +
            item.id +
            ".json"
        )
      )
    })

    await Promise.all(promises)
  }
  res.json({
    treatments: MessageProcessor.AddUsernamesToMessages(fetchedMessages),
  })
})

app.listen(5000, async () => {
  SQLclient.connect((err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log("> Successfully connected to MySQL database")
  })

  console.log("Listening in PORT 5000")
})
