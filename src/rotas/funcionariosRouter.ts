import { Router } from "express";
import { DataTransformer, SQLArmazenamento } from "../Armazenamento";
import { FuncionarioContratado, Funcionarios } from "../Funcionarios";
import {
  FuncionarioContratadoInfo,
  FuncionarioInfo,
  Nomes_de_Tabelas,
} from "../types";

export const funcionariosRouter = Router();

funcionariosRouter.get("/", async (req, res) => {
  let funcionarios = await Funcionarios.getTodosFuncionarios(
    new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
  );

  const agruparpor = (req.query.agruparpor ||
    "created_at") as keyof FuncionarioContratadoInfo;

  const ordem = req.query.ordem == "desc" ? "asc" : "desc";

  if (funcionarios.length <= 0) {
    return res.render("paginas/funcionarios", {
      funcionarios: [],
      ordem: req.query.order == "desc" ? "asc" : "desc",
    });
  }

  if (ordem == "desc" || ordem == "asc") {
    DataTransformer.ordenarPor(funcionarios, "created_at", ordem);
  }

  if (Object.keys(funcionarios[0]).includes(agruparpor)) {
    DataTransformer.agruparPor(agruparpor, funcionarios);
  }

  res.render("paginas/funcionarios", {
    funcionarios: funcionarios,
    ordem,
  });
});

funcionariosRouter.get("/novo", async (req, res, next) => {
  res.render("paginas/novo_funcionario");
});

funcionariosRouter.post("/novo", async (req, res, next) => {
  const armazenamentoFuncionarios = new SQLArmazenamento(
    Nomes_de_Tabelas.FUNCIONARIOS
  );

  if (
    !req.body.email ||
    !req.body.telefone ||
    !FuncionarioContratado.funcionarioValido(req.body)
  ) {
    return res.json({
      error: "funcionario invalido",
    });
  }

  const funcionario = Funcionarios.novoFuncionario(
    req.body as unknown as FuncionarioInfo
  );

  await armazenamentoFuncionarios.upload(funcionario);

  return res.redirect("/funcionarios");
});
funcionariosRouter.param(
  "idFuncionario",
  async (req, res, next, idFuncionario) => {
    req.idFuncionario = idFuncionario;

    const funcionario = await Funcionarios.getFuncionario(
      idFuncionario,
      new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
    );

    if (!funcionario) {
      return res.status(404).send({ error: "id de empregado incorreto." });
    }
    req.funcionario = funcionario;
    next();
  }
);
funcionariosRouter.get("/:idFuncionario/editar", async (req, res) => {
  const funcionario = req.funcionario;

  res.render("paginas/editar_funcionario", { funcionario: funcionario });
});
funcionariosRouter.post("/:idFuncionario/editar", async (req, res) => {
  const funcionario = req.funcionario;

  // em caso o front mande um Objeto vazio ou invalido
  const isValid = FuncionarioContratado.funcionarioValido({
    ...funcionario,
    ...req.body,
  });

  if (!isValid) {
    return res.json({
      erro: "funcionario invalido",
    });
  }
  const novoFuncionario = Funcionarios.novoFuncionario(req.body);
  await Funcionarios.updateFuncionario(
    {
      ...novoFuncionario,
      email: funcionario!.email,

      id: req.params.idFuncionario,
    },
    new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
  );
  const funcionarios = await Funcionarios.getTodosFuncionarios(
    new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
  );
  return res.render("paginas/funcionarios", { funcionarios: funcionarios });
});
