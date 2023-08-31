import { HiredEmployeeInfo } from "./src/Employee"

declare namespace Express {
  export interface Request {
    user?: User
    employeeId?: string
    employee?: HiredEmployeeInfo
  }
}
