import { User } from "../src/User"

describe("Username From Email Tests", () => {
  it("Should return a string from UserNameFromEmail", () => {
    expect(typeof User.userNameFromEmail("Hayden@althea.biz")).toEqual("string")
  })
  it("The user_name should be Hayden", () => {
    expect(User.userNameFromEmail("Hayden@althea.biz")).toEqual("Hayden")
  })

  it("The user_name should be Presley Mueller", () => {
    expect(User.userNameFromEmail("Presley.Mueller@myrl.com")).toEqual(
      "Presley Mueller"
    )
  })
  it("The user_name should be Mallory Kunze", () => {
    expect(User.userNameFromEmail("Mallory_Kunze@marie.org")).toEqual(
      "Mallory Kunze"
    )
  })
  it("The user_name should be John Green Mackeys", () => {
    expect(User.userNameFromEmail("John_Green.Mackeys@marie.org")).toEqual(
      "John Green Mackeys"
    )
  })
})
