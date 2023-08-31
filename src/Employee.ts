import { randomUUID } from "crypto"
import { NewEmployeeInfo } from "./Employee"
import { SQLBucket } from "./Storage"

export interface NewEmployeeInfo {
  id?: string
  name: string
  email: string
  telephone: string
  company: string
}
export interface EmployeeInfo {
  id: string
  name: string
  email: string
  telephone: string
  company: string
}
const employeeprops = {
  name: "",
  email: "",
  telephone: "",
  company: "",
}
export class Employees {
  public static async getEmployee(
    employeeId: string,
    bucket: SQLBucket
  ): Promise<EmployeeInfo | null> {
    const file = await bucket.getOne(employeeId)
    if (!file) {
      return null
    }
    return file as EmployeeInfo
  }

  public static async updateEmployee(
    employeeInfo: EmployeeInfo,
    bucket: SQLBucket
  ) {
    try {
      await bucket.update(employeeInfo.id, employeeInfo)
      const empl = await bucket.getOne(employeeInfo.id)
      return empl
    } catch (err) {
      return null
    }
  }

  public static async getAllEmployees(bucket: SQLBucket): Promise<Employee[]> {
    const files = await bucket.getAll<Employee>()

    return files
  }
}

export class Employee {
  public name: string
  public email: string
  public telephone: string
  public company: string
  public id?: string

  constructor(employee: EmployeeInfo & { id?: string }) {
    this.name = employee.name
    this.email = employee.email
    this.telephone = employee.telephone
    this.company = employee.company
    if (typeof employee.id !== "undefined") {
      this.id = employee.id
    }
  }

  public static NewEmployee(info: NewEmployeeInfo): EmployeeInfo {
    return {
      ...info,
      id: randomUUID(),
    }
  }

  public static isValidEmployee(n: object) {
    return true
  }
}
