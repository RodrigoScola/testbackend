import { randomUUID } from "crypto"
import { S3Bucket } from "./Storage"

export interface NewEmployeeInfo {
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
  private static employeesEmails: string[] = []
  private static employees: Map<string, Employee> = new Map()

  public static async getEmployee(
    employeeId: string,
    bucket: S3Bucket
  ): Promise<EmployeeInfo | null> {
    const file = await bucket.getFile(`employees/${employeeId}.json`)
    if (file.Body == null || typeof file.Body === "undefined") {
      return null
    }
    return JSON.parse(file.Body.toLocaleString()) as EmployeeInfo
  }

  public static async updateEmployee(
    employeeInfo: EmployeeInfo,
    bucket: S3Bucket
  ) {
    const j = await bucket.upload(
      `employees/${employeeInfo.id}.json`,
      JSON.stringify(employeeInfo)
    )
    return j
  }

  public static async getAllEmployees(bucket: S3Bucket): Promise<Employee[]> {
    const files = await bucket.ListFiles("employees/")
    let filenames = []
    if (typeof files.Contents !== "undefined") {
      for (let { Key: key } of files.Contents) {
        console.log(key)
        if (typeof key === "undefined") continue
        filenames.push(key)
      }
    }
    const employeesInfos = await bucket.getFiles(filenames)

    let employees: Employee[] = employeesInfos.map((e) =>
      e.Body ? JSON.parse(e.Body.toString()) : 0
    )

    return employees
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
    const keys = Object.keys(employeeprops)
    if (Object.keys(n).length < keys.length) return false

    for (let i = 0; i < keys.length; i++) {
      if (!Object.keys(n).includes(keys[i])) return false
    }
    return true
  }
}
