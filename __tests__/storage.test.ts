import { MessageProcessor } from "../src/MessageProcessor";
import { NewMessageInfo } from "../src/types";
import { Validation } from "../src/utils/Validation";

describe("Message Processor test", () => {
  test("Should add usernames to objects", () => {
    const base_messages = [
      { id: 1, email: "Eliseo@gardner.biz" },
      { id: 2, email: "Jayne_Kuhic@sydney.com" },
      { id: 3, email: "Nikita@garfield.biz" },
    ];
    const with_usernames = [
      { id: 1, email: "Eliseo@gardner.biz", user_name: "Eliseo" },
      { id: 2, email: "Jayne_Kuhic@sydney.com", user_name: "Jayne Kuhic" },
      { id: 3, email: "Nikita@garfield.biz", user_name: "Nikita" },
    ];
    const newMessages = MessageProcessor.AddUsernamesToMessages(
      base_messages as NewMessageInfo[]
    );
    expect(newMessages).toStrictEqual(with_usernames);
  });
});

describe("Validation Tests", () => {
  describe("Valid Email Tests", () => {
    it("Should return true when receiving a valid email", async () => {
      expect(
        Validation.isValidEmail("rodrigo.sgarabotto.scola@gmail.com")
      ).toBe(true);
    });
    it("Should return false when receiving an invalid email", async () => {
      expect(
        Validation.isValidEmail("rodrigo.sgarabotto.scola.gmail.com")
      ).toBe(false);
    });
  });
  describe("Valid Phone Number Tests", () => {
    it("Should return true when receiving a valid Phone Number", async () => {
      expect(Validation.isValidPhoneNumber("54 991982471")).toBe(true);
      expect(Validation.isValidPhoneNumber("991982471")).toBe(true);
    });
    it("Should return false when receiving an invalid phone number", async () => {
      expect(Validation.isValidPhoneNumber("55 54 991982471")).toBe(true);
    });
  });
});
