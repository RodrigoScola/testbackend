import { randomUUID } from "crypto"
import { MyBucket, SQLBucket } from "./Storage"

export interface NewEmployeeInfo {
  id?: string
  name: string
  email: string
  telephone: string
  company: string
}
export interface EmployeeInfo extends NewEmployeeInfo {
  id: string
}
export class Employees {
  public static async getEmployee(
    employeeId: string,
    bucket: SQLBucket
  ): Promise<EmployeeInfo | null> {
    const file = await bucket.getOne<EmployeeInfo>(employeeId)
    if (!file) {
      return null
    }
    return file as EmployeeInfo
  }

  public static async updateEmployee(
    employeeInfo: EmployeeInfo,
    bucket: MyBucket
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
    const files = await bucket.getAll<Employee[]>()

    return files
  }
  public static NewEmployee(info: NewEmployeeInfo): EmployeeInfo {
    return {
      ...info,
      id: randomUUID(),
    }
  }
}

export class Employee {
  /*

  Because email cannot be changed, it is converted to a setter, and prevents emails from being modified later.

  */
  private _email: string
  public name: string
  public telephone: string
  public company: string
  public id?: string

  public get email() {
    return this._email
  }
  public set email(newEmail: string) {
    if (this.email == "") {
      this._email = newEmail
    }
  }
  constructor(employee: NewEmployeeInfo) {
    this._email = employee.email
    this.name = employee.name
    this.telephone = employee.telephone
    this.company = employee.company
    this.id = typeof employee.id == "string" ? employee.id : undefined
  }

  public static isValidEmployee(n: object) {
    return true
  }
}
