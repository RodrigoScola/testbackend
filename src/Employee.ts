import { randomUUID } from "crypto"
import { MyBucket, SQLBucket } from "./Storage"

export interface EmployeeInfo {
  name: string
  email: string
  telephone: string
  company: string
}
export interface HiredEmployeeInfo extends EmployeeInfo {
  created_at: string
  id: string
}

export class Employees {
  public static async getEmployee(
    employeeId: string,
    bucket: SQLBucket
  ): Promise<HiredEmployeeInfo | null> {
    const file = await bucket.getOne<HiredEmployeeInfo>(employeeId)
    if (!file) {
      return null
    }
    return file as HiredEmployeeInfo
  }

  public static async updateEmployee(
    employeeInfo: HiredEmployeeInfo,
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

  public static async getAllEmployees(
    bucket: SQLBucket
  ): Promise<HiredEmployee[]> {
    const files = await bucket.getAll<HiredEmployee[]>()

    return files
  }
  public static NewEmployee(info: EmployeeInfo): HiredEmployeeInfo {
    return {
      ...info,
      created_at: new Date().toString(),
      id: randomUUID(),
    }
  }
}

export abstract class Employee {
  /*

  Because email cannot be changed, it is converted to a setter, and prevents emails from being modified later.

  */
  private _email: string
  public name: string
  public telephone: string
  public company: string
  public get email() {
    return this._email
  }
  public set email(newEmail: string) {
    if (this.email == "") {
      this._email = newEmail
    }
  }
  constructor(info: EmployeeInfo) {
    this._email = info.email
    this.name = info.name
    this.telephone = info.telephone
    this.company = info.company
  }
  public static isValidEmployee(n: object) {
    return true
  }
}

export class NewEmployee extends Employee {
  constructor(info: EmployeeInfo) {
    super(info)
  }
}

export class HiredEmployee extends Employee {
  public id: string
  public created_at: string

  constructor(employee: HiredEmployeeInfo) {
    super(employee)
    this.id = employee.id
    this.created_at = employee.created_at
  }
}
