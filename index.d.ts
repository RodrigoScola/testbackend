import { HiredEmployeeInfo } from "./src/Employee";

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: Employee;
      employeeId?: string;
      employee?: HiredEmployeeInfo;
    }
  }
}
