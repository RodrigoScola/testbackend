import { HiredEmployeeInfo } from "./src/Funcionarios";

export {};

declare global {
  namespace Express {
    export interface Request {
      idEmpregado?: string;
      empregado?: HiredEmployeeInfo;
    }
  }
}
