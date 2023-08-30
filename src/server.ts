import express, { Router } from "express"
import fs from "fs"
import { Employee, EmployeeInfo, Employees } from "./Employee"
import { S3Bucket } from "./Storage"
import { User } from "./User"

import mysql from "mysql"
import {
  BACKEND_EMPLOYEE_BUCKET_NAME,
  BACKEND_MESSAGES_BUCKET_NAME,
} from "./constants"

export const SQLclient = mysql.createConnection({
  host: "rds-mysql-10mintutorial.cdtxjhkkib1n.sa-east-1.rds.amazonaws.com",
  port: 3306,
  password: "1212Rodrigo",
  database: "database",
  user: "admin",
})

const app = express()

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

interface Storage {
  save(...args: any): unknown
  update(): unknown
  getOne(...args: any): unknown
}

export class MessageStorage implements Storage {
  static async getAll(bucket: S3Bucket) {
    const files = await bucket.getOne("messages.json")
    if (files.Body) {
      return JSON.parse(files.Body.toString())
    }
    return null
  }

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

export class EmployeeStorage implements Storage {
  static async getAll(bucket: S3Bucket) {
    const files = await bucket.getOne("employees.json")
    if (files.Body) {
      return JSON.parse(files.Body.toString())
    }
    return null
  }

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

export class MessageProcessor {
  public static ProcessMessages(messages: MessageInfo[]) {
    const bucket = new S3Bucket(BACKEND_MESSAGES_BUCKET_NAME)

    messages.forEach((message) => {
      bucket.upload(
        "messages/message_" + message.id + ".json",
        JSON.stringify(message)
      )
    })
  }
  public static async FetchMessagesFromURL(url: string) {
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

type MessageInfo = {
  postId: number
  id: number
  user_name: string
  name: string
  email: string
  body: string
}
route.get("/messages", async (req, res, next) => {
  const messages = await MessageStorage.getAll(
    new S3Bucket(BACKEND_MESSAGES_BUCKET_NAME)
  )

  const messagesFromfile = fs.readFileSync("files/comments.json")
  const newJsonMessages: MessageInfo[] = JSON.parse(messagesFromfile.toString())

  const treatedJsonMessages = newJsonMessages.map((message) => {
    return {
      ...message,
      user_name: User.userNameFromEmail(message.email),
    }
  })
  // console.log(treatedJsonMessages)

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

route.get("/employees/", async (req, res, next) => {
  const s = await Employees.getAllEmployees(
    new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)
  )

  res.render("pages/employees", {
    employees: s,
  })
})

route.get("/employees/new", async (req, res, next) => {
  console.log(req.query)
  const employeebucket = new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)

  if (Employee.isValidEmployee(req.query)) {
    const employee = Employee.NewEmployee(req.query as unknown as EmployeeInfo)
    await employeebucket.upload(
      `employees/${employee.id}.json`,
      JSON.stringify(employee)
    )
    res.redirect("/employees")
  }
  res.render("pages/new_employee")
})
route.post("/employees/new", (req, res, next) => {
  res.json({
    h: "h",
  })
})

route.get("/employees/:employeeid/edit", async (req, res, next) => {
  const { employeeid } = req.params

  console.log(req.query)

  const employee = await Employees.getEmployee(
    employeeid,
    new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)
  )
  if (!employee) {
    return res.json({
      error: "not found",
    })
  }

  Employees.updateEmployee(
    {
      ...(req.query as unknown as EmployeeInfo),
      id: employeeid,
    },
    new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)
  )

  const emp = new Employee(employee)

  res.render("pages/edit_employee", { employee: emp })
})
route.post("/employees/:employeeid/edit", async (req, res, next) => {
  const { employeeid } = req.params

  console.log(req.query)

  const employee = await Employees.getEmployee(
    employeeid,
    new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)
  )

  if (!employee) {
    return res.json({
      error: "not found",
    })
  }
  const newemp = await Employees.updateEmployee(
    employee,
    new S3Bucket(BACKEND_EMPLOYEE_BUCKET_NAME)
  )

  res.json({
    employeeId: newemp,
  })
})

app.use("/", route)

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
  // S3Bucket.CreateBucket()
  // const messages: MessageInfo[] = await MessageProcessor.FetchMessagesFromURL(
  //   BASE_MESSAGE_URL
  // )
  // if (messages.length) {
  //   MessageProcessor.ProcessMessages(messages)
  // }
  connectDatabase()

  console.log("Listening in PORT 5000")
})
