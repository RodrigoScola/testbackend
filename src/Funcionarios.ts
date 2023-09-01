import { randomUUID } from "crypto";
import { Armazenamento, SQLArmazenamento } from "./Armazenamento";
import {
  FuncionarioContratadoInfo,
  FuncionarioInfo,
  FuncionarioContratadoInfo as InfoEmpregadoContratado,
} from "./types";
import { Validacao } from "./utils/Validacao";

export class Funcionarios {
  // in the future could add a crude caching by writing the employee object to a map, so there isn't a db call each time we need it

  public static async getFuncionario(
    idFuncionario: string,
    armazenamento: SQLArmazenamento
  ): Promise<InfoEmpregadoContratado | null> {
    const arquivo = await armazenamento.getUm<InfoEmpregadoContratado>(
      idFuncionario
    );
    if (!arquivo) {
      return null;
    }
    return arquivo as InfoEmpregadoContratado;
  }

  public static async updateFuncionario(
    funcionario: FuncionarioContratadoInfo,
    armazenamento: Armazenamento
  ): Promise<FuncionarioContratadoInfo | null> {
    try {
      await armazenamento.update(funcionario, funcionario.id);
      const empl = await armazenamento.getUm<FuncionarioContratadoInfo>(
        funcionario.id
      );
      return empl;
    } catch (err) {
      return null;
    }
  }

  public static async getTodosFuncionarios(
    armazenamento: SQLArmazenamento
  ): Promise<FuncionarioContratado[]> {
    const arquivos = await armazenamento.getTodos<FuncionarioContratado[]>();

    return arquivos;
  }
  public static novoFuncionario(
    info: FuncionarioInfo
  ): InfoEmpregadoContratado {
    return {
      ...info,
      created_at: new Date().toString(),
      id: randomUUID(),
    };
  }
}

export abstract class Funcionario {
  /*

  Como o e-mail não pode ser alterado, ele é convertido em um setter e evita que os e-mails sejam modificados posteriormente.

  */
  private _email: string;
  public nome: string;
  public telefone: string;
  public empresa: string;
  public get email() {
    return this._email;
  }
  public set email(novoEmail: string) {
    if (this.email == "" && Validacao.emailValido(novoEmail)) {
      this._email = novoEmail;
    }
  }
  constructor(info: FuncionarioInfo) {
    this._email = info.email;
    this.nome = info.nome;
    this.telefone = info.telefone;
    this.empresa = info.empresa;
  }

  public static funcionarioValido(n: FuncionarioInfo) {
    if (!Validacao.emailValido(n.email)) {
      return false;
    } else if (!Validacao.telefoneValido(n.telefone)) {
      return false;
    }
    return true;
  }
}

export class NovoFuncionario extends Funcionario {
  constructor(info: FuncionarioInfo) {
    super(info);
  }
}

export class FuncionarioContratado extends Funcionario {
  public id: string;
  public created_at: string;

  constructor(employee: InfoEmpregadoContratado) {
    super(employee);
    this.id = employee.id;
    this.created_at = employee.created_at;
  }
}
