import express, { Router } from "express";
import mysql from "mysql";
import { MyStorage } from "./Storage";
import { User } from "./User";
import { employeeRouter } from "./routes/employeesRouter";
import { messagesRouter } from "./routes/messagesRouter";
import { MessageInfo, NewMessageInfo } from "./types";

require("dotenv").config();

export const SQLclient = mysql.createConnection({
  host: process.env.AWS_RDS_HOST,
  port: parseInt(process.env.AWS_RDS_PORT as string),
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE_NAME,
  user: process.env.AWS_RDS_USERNAME,
});

const app = express();
const route = Router();

app.use(express.json());
app.use("/", route);
app.use("/messages", messagesRouter);
app.use("/employees", employeeRouter);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

route.get("/", (req, res) => {
  res.json({
    response: "Hello World",
  });
});

app.listen(5000, async () => {
  SQLclient.connect((err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("> Successfully connected to MySQL database");
  });

  console.log("Listening in PORT 5000");
});
