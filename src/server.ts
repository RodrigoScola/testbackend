import express, { Router } from "express"
import { MyBucket } from "./Storage"
import { User } from "./User"

import mysql from "mysql"
import { BASE_MESSAGE_URL } from "./constants"
import { employeeRouter } from "./routes/employees"

require("dotenv").config()

export const SQLclient = mysql.createConnection({
  host: process.env.AWS_RDS_HOST,
  port: parseInt(process.env.AWS_RDS_PORT as string),
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE_NAME,
  user: process.env.AWS_RDS_USERNAME,
})

type NewMessageInfo = {
  postId: number
  id: number
  name: string
  email: string
  body: string
}
type MessageInfo = NewMessageInfo & {
  user_name: string
}

const app = express()

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

const route = Router()

app.use(express.json())

route.get("/", (req, res) => {
  res.json({
    response: "Hello World",
  })
})

route.get("/messages", async (req, res, next) => {
  const fetchedMessages = await MessageProcessor.FetchMessagesFromURL(
    BASE_MESSAGE_URL
  )

  res.json({
    treatments: MessageProcessor.AddUsernamesToMessages(fetchedMessages),
  })
})

app.use("/", route)
app.use("/employees", employeeRouter)

const connectDatabase = () => {
  return new Promise((resolve, reject) => {
    SQLclient.connect((err) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      console.log("> Successfully connected to MySQL database")
      resolve(true)
    })
  })
}

app.listen(5000, async () => {
  connectDatabase()

  console.log("Listening in PORT 5000")
})
