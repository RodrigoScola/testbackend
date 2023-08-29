import express, { Router } from "express"
import fs from "fs"
import { User, UserInfo } from "./User"
require("dotenv").config()

import AWS from "aws-sdk"

const s3Bucket = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string,
  },
})
const BUCKETNAME = "backendtestbucket2"

const app = express()

interface Storage {
  save(...args: any): unknown
  update(): unknown
  getOne(...args: any): unknown
}

export class UserStorage implements Storage {
  update(): unknown {
    throw new Error("Method not implemented.")
  }
  getOne(...args: any): unknown {
    throw new Error("Method not implemented.")
  }
  private static AllUsers: Map<string, User> = new Map()

  save(id: string, data: User) {
    console.log(id, data)
  }
  static update(id: string, newData: Partial<UserInfo>) {}

  static hasUser(userId: string): boolean {
    return this.AllUsers.has(userId)
  }
  static getOne(id: string): User | null {
    if (this.AllUsers.has(id)) {
      return this.AllUsers.get(id) as User
    }
    return null
  }
}

class UserHandler {
  private static AllUsers: Map<string, User> = new Map()

  static getAllUsers(): User[] {
    return Array.from(UserHandler.AllUsers.values())
  }
  getUser(id: string): User | null {
    if (!UserHandler.AllUsers.has(id)) {
      return null
    }
    return UserHandler.AllUsers.get(id) as User
  }
}
export class MessageStorage implements Storage {
  save(...args: any): unknown {
    return 1
  }
  update(): unknown {
    return 1
  }
  getOne(...args: any): unknown {
    return 1
  }
}

const route = Router()

app.use(express.json())

route.get("/", (req, res) => {
  res.json({
    response: "Hello World",
  })
})
route.param("userId", (req, res, next, userId: string) => {
  if (!UserStorage.hasUser(userId)) {
    return next("User not exist")
  }
  req.user = UserStorage.getOne(userId) as User
  next()
})

route.get("/users", (req, res) => {
  const users = UserHandler.getAllUsers()

  const usersInfo: UserInfo[] = users.map((user) => user.info)

  res.json({
    users: usersInfo,
  })
})
route.get("/users/:userId", (req, res, next) => {
  const user = req.user

  res.json({
    user,
  })
})

// gets the user, updates with the current info then saves it into database
route.put("/users/:userId", (req, res, next) => {
  const user: UserInfo = req.user.info

  //   just gets the part of the body we want
  const newInformation: Partial<UserInfo> = {
    company: req.body.company,
    email: req.body.email,
    name: req.body.name,
    phone: parseInt(req.body.phone),
  }

  const updatedInformation = UserStorage.update(user.email, newInformation)

  res.json({
    user: updatedInformation,
  })
})

// creates a new user
route.post("/users", (req, res, next) => {
  const newUser: UserInfo = req.body
  if (!User.isValidUser(newUser)) {
    return next("Invalid user")
  }
})

type NewMessageInfo = {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

type MessageInfo = {
  postId: number
  id: number
  user_name: string
  name: string
  email: string
  body: string
}
route.get("/messages", (req, res, next) => {
  const messagesFromfile = fs.readFileSync("files/comments.json")
  const newJsonMessages: MessageInfo[] = JSON.parse(messagesFromfile.toString())

  const treatedJsonMessages = newJsonMessages.map((message) => {
    return {
      ...message,
      user_name: User.userNameFromEmail(message.email),
    }
  })
  console.log(treatedJsonMessages)

  res.json({ treatments: treatedJsonMessages })
})

route.get("/messages/post/:postId", (req, res, next) => {
  const messagesFromfile = fs.readFileSync("files/comments.json")
  const newJsonMessages: MessageInfo[] = JSON.parse(messagesFromfile.toString())

  const treatedJsonMessages = newJsonMessages
    .filter((i) => i.postId == parseInt(req.params.postId))
    .map((message) => {
      return {
        ...message,
        user_name: User.userNameFromEmail(message.email),
      }
    })

  res.json({
    postId: req.params.postId,
    message_count: treatedJsonMessages.length,
    last_message: treatedJsonMessages[treatedJsonMessages.length - 1],
  })
})

app.use("/", route)

const uploat_to_s3 = (filepath: string, filename: string) => {
  console.log(filepath)
  return new Promise((resolve, reject) => {
    try {
      const file = fs.readFileSync("files/comments.json")

      const uploadParams = {
        Bucket: BUCKETNAME,
        Key: filename,
        Body: file,
      }
      // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
      // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
      s3Bucket.upload(uploadParams, function (err: any, data: any) {
        if (err) {
          return reject(err)
        }
        if (data) {
          return resolve(data)
        }
      })
    } catch (err) {
      return reject(err)
    }
  })
}

app.listen(5000, () => {
  uploat_to_s3("filepath", "filename")
  console.log("App listening in PORT 5000")
})
