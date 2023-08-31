import { Router } from "express"
import { Employee, EmployeeInfo, Employees } from "../Employee"
import { SQLBucket } from "../Storage"

export const employeeRouter = Router()

employeeRouter.get("/employees/", async (req, res, next) => {
  const s = await Employees.getAllEmployees(new SQLBucket("employees"))
  let order = "desc"
  let group = "none"

  if (typeof req.query.order !== undefined) {
    order = req.query.order as string
  }
  if (typeof req.query.groupby !== undefined) {
    group = req.query.groupby as string
  }

  if (req.query.order == "desc") {
    s = s.reverse()
  }
  if (group == "company") {
    s = s.sort((a, b) => (a.company > b.company ? 1 : -1))
  }

  res.render("pages/employees", {
    employees: s,
    order: order == "desc" ? "asc" : "desc",
  })
})

employeeRouter.get("/employees/new", async (req, res, next) => {
  res.render("pages/new_employee")
})
employeeRouter.post("/employees/new", async (req, res, next) => {
  const employeebucket = new SQLBucket("employees")
  if (Employee.isValidEmployee(req.body)) {
    const employee = Employee.NewEmployee(req.body as unknown as EmployeeInfo)
    await employeebucket.upload(`employees/${employee.id}.json`, employee)
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
    new SQLBucket("employees")
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

  const isValid = Employee.isValidEmployee(req.body)
  console.log(isValid)
  if (isValid) {
    await Employees.updateEmployee(
      {
        ...req.body,
        id: req.params.employeeid,
      },
      new SQLBucket("employees")
    )
    const employees = await Employees.getAllEmployees(
      new SQLBucket("employees")
    )
    return res.render("pages/employees", { employees: employees })
  }

  res.render("pages/edit_employee", { employee: emp })
})
