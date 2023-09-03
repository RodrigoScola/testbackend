import express from "express";
import mysql from "mysql";
import { funcionariosRouter } from "./rotas/funcionariosRouter";
import { mensagensRouter } from "./rotas/mensagensRouter";

require("dotenv").config();

const PORT = process.env.port || 8080;

// // bas
export const SQLcliente = mysql.createConnection({
  host: process.env.AWS_RDS_HOST,
  port: parseInt(process.env.AWS_RDS_PORT || "3306") || 3306,
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE_NAME,
  user: process.env.AWS_RDS_USERNAME,
});

const app = express();
const rota = Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", rota);
app.use("/mensagens", mensagensRouter);
app.use("/funcionarios", funcionariosRouter);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.status(200).json({
    response: "Hello World",
  });
});

app.listen(8080, async () => {
  SQLcliente.connect((err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("> Conectado na Database");
    try {
      SQLcliente.query(
        `create table if not exists funcionarios ( id text not null, email varchar(50) not null, nome varchar(50) not null, empresa varchar(50) not null, telefone varchar(15) not null, created_at datetime default now())`
      );
    } catch (err) {
      console.log(err);
    }
  });

  console.log(`Servidor funcionando no port ${8080}`);
});
