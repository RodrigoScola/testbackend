import express, { Router } from "express";
import mysql from "mysql";
import { employeeRouter } from "./rotas/funcionariosRouter";
import { messagesRouter } from "./rotas/messagesRouter";

require("dotenv").config();

export const SQLcliente = mysql.createConnection({
  host: process.env.AWS_RDS_HOST,
  port: 3306,
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE_NAME,
  user: process.env.AWS_RDS_USERNAME,
});

const app = express();
const rota = Router();

app.use(express.json());
app.use("/", rota);
app.use("/mensagens", messagesRouter);
app.use("/funcionarios", employeeRouter);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

rota.get("/", (req, res) => {
  res.json({
    response: "Hello World",
  });
});

app.listen(5000, async () => {
  SQLcliente.connect((err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("> Conectado na Database");
  });

  console.log("Servidor funcionando no PORT 5000; ");
});
