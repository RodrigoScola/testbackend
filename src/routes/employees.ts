import { Router } from "express"
import {
  EmployeeInfo,
  Employees,
  HiredEmployee,
  HiredEmployeeInfo,
} from "../Employee"
import { DataTransformer, SQLBucket, TABLENAMES } from "../Storage"

export const employeeRouter = Router()

employeeRouter.get("/employees/", async (req, res, next) => {
  let currentEmployees = await Employees.getAllEmployees(
    new SQLBucket(TABLENAMES.EMPLOYEES)
  )

  if (currentEmployees.length <= 0) {
    return res.render("pages/employees", {
      employees: currentEmployees,
      order: req.query.order == "desc" ? "asc" : "desc",
    })
  }

  if (req.query.order == "desc" || req.query.order == "asc") {
    DataTransformer.orderBy("created_at", currentEmployees, req.query.order)
  }

  if (
    typeof req.query.groupby !== "undefined" &&
    Object.keys(currentEmployees[0]).includes(req.query.groupby as string)
  ) {
    DataTransformer.groupBy(
      req.query.groupby as keyof HiredEmployeeInfo,
      currentEmployees
    )
  }

  res.render("pages/employees", {
    employees: currentEmployees,
    order: req.query.order == "desc" ? "asc" : "desc",
  })
})

employeeRouter.get("/employees/new", async (req, res, next) => {
  res.render("pages/new_employee")
})
employeeRouter.post("/employees/new", async (req, res, next) => {
  const employeebucket = new SQLBucket(TABLENAMES.EMPLOYEES)
  if (HiredEmployee.isValidEmployee(req.body)) {
    const employee = Employees.NewEmployee(req.body as unknown as EmployeeInfo)

    await employeebucket.upload(employee)

    return res.redirect("/employees")
  }
  res.json({
    message: "invalid employee",
  })
})
employeeRouter.param("employeeid", async (req, res, next, employeeid) => {
  req.employeeId = employeeid

  const employee = await Employees.getEmployee(
    employeeid,
    new SQLBucket(TABLENAMES.EMPLOYEES)
  )

  if (!employee) {
    return res.json({
      error: "not found",
    })
  }
  req.employee = employee
  next()
})
employeeRouter.get("/employees/:employeeid/edit", async (req, res, next) => {
  const emp = req.employee

  res.render("pages/edit_employee", { employee: emp })
})
employeeRouter.post("/employees/:employeeid/edit", async (req, res, next) => {
  const emp = req.employee

  const isValid = HiredEmployee.isValidEmployee(req.body)
  if (isValid) {
    await Employees.updateEmployee(
      {
        ...req.body,
        id: req.params.employeeid,
      },
      new SQLBucket(TABLENAMES.EMPLOYEES)
    )
    const employees = await Employees.getAllEmployees(
      new SQLBucket(TABLENAMES.EMPLOYEES)
    )
    return res.render("pages/employees", { employees: employees })
  }

  res.render("pages/edit_employee", { employee: emp })
})
