import { Router } from "express";
import { DataTransformer, SQLArmazenamento } from "../Armazenamento";
import { FuncionarioContratado, Funcionarios } from "../Funcionarios";
import {
  FuncionarioContratadoInfo,
  FuncionarioInfo,
  Nomes_de_Tabelas,
} from "../types";

export const employeeRouter = Router();

employeeRouter.get("/", async (req, res, next) => {
  let currentEmployees = await Funcionarios.getAllEmployees(
    new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
  );

  if (currentEmployees.length <= 0) {
    return res.render("paginas/funcionarios", {
      employees: currentEmployees,
      agruparpor: req.query.agruparpor == "desc" ? "asc" : "desc",
    });
  }

  if (req.query.agruparpor == "desc" || req.query.agruparpor == "asc") {
    DataTransformer.ordenarPor(
      currentEmployees,
      "created_at",
      req.query.agruparpor
    );
  }

  if (
    typeof req.query.agruparpor !== "undefined" &&
    Object.keys(currentEmployees[0]).includes(req.query.groupby as string)
  ) {
    DataTransformer.agruparPor(
      req.query.agruparpor as keyof FuncionarioContratadoInfo,
      currentEmployees
    );
  }

  res.render("paginas/funcionarios", {
    employees: currentEmployees,
    order: req.query.ordem == "desc" ? "asc" : "desc",
  });
});

employeeRouter.get("/new", async (req, res, next) => {
  res.render("paginas/novo_funcionario");
});
employeeRouter.post("/new", async (req, res, next) => {
  const armazenamentoFuncionarios = new SQLArmazenamento(
    Nomes_de_Tabelas.FUNCIONARIOS
  );
  if (!FuncionarioContratado.funcionarioValido(req.body)) {
    return res.json({
      message: "funcionario invalido",
    });
  }

  const funcionario = Funcionarios.novoFuncionario(
    req.body as unknown as FuncionarioInfo
  );

  await armazenamentoFuncionarios.upload(funcionario);

  return res.redirect("/funcionarios");
});
employeeRouter.param("idEmpregado", async (req, res, next, idEmpregado) => {
  req.idEmpregado = idEmpregado;

  const empregado = await Funcionarios.getFuncionario(
    idEmpregado,
    new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
  );

  if (!empregado) {
    return res.status(404).send({ error: "id de empregado incorreto." });
  }
  req.empregado = empregado;
  next();
});
employeeRouter.get("/:idEmpregado/editar", async (req, res) => {
  const empregado = req.empregado;

  res.render("paginas/editar_empregado", { empregado: empregado });
});
employeeRouter.post("/:idEmpregado/editar", async (req, res) => {
  const emp = req.empregado;

  const isValid = FuncionarioContratado.funcionarioValido(req.body);
  if (isValid) {
    await Funcionarios.updateEmployee(
      {
        ...req.body,
        id: req.params.idEmpregado,
      },
      new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
    );
    const employees = await Funcionarios.getAllEmployees(
      new SQLArmazenamento(Nomes_de_Tabelas.FUNCIONARIOS)
    );
    return res.render("paginas/funcionarios", { employees: employees });
  }

  res.render("paginas/editar_empregado", { employee: emp });
});
