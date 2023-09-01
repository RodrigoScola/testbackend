import { FuncionarioContratadoInfo } from "./src/types";

export {};

declare global {
  namespace Express {
    export interface Request {
      idFuncionario?: string;
      funcionario?: FuncionarioContratadoInfo;
    }
  }
}
