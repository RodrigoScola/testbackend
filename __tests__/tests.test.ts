import { ProcessadorDeMensagens } from "../src/ProcessadorMensagens";
import { User } from "../src/User";
import { NovaMensagemInfo } from "../src/types";
import { Validacao } from "../src/utils/Validacao";

describe("Username From Email Tests", () => {
  it("Should return a string from UserNameFromEmail", () => {
    expect(typeof User.userNameFromEmail("Hayden@althea.biz")).toEqual(
      "string"
    );
  });
  it("The user_name should be Hayden", () => {
    expect(User.userNameFromEmail("Hayden@althea.biz")).toEqual("Hayden");
  });

  it("The user_name should be Presley Mueller", () => {
    expect(User.userNameFromEmail("Presley.Mueller@myrl.com")).toEqual(
      "Presley Mueller"
    );
  });
  it("The user_name should be Mallory Kunze", () => {
    expect(User.userNameFromEmail("Mallory_Kunze@marie.org")).toEqual(
      "Mallory Kunze"
    );
  });
  it("The user_name should be John Green Mackeys", () => {
    expect(User.userNameFromEmail("John_Green.Mackeys@marie.org")).toEqual(
      "John Green Mackeys"
    );
  });
});

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
    const newMessages = ProcessadorDeMensagens.AdicionarUsernames(
      base_messages as NovaMensagemInfo[]
    );
    expect(newMessages).toStrictEqual(with_usernames);
  });
});

describe("Validation Tests", () => {
  describe("Valid Email Tests", () => {
    it("Should return true when receiving a valid email", async () => {
      expect(Validacao.emailValido("rodrigo.sgarabotto.scola@gmail.com")).toBe(
        true
      );
    });
    it("Should return false when receiving an invalid email", async () => {
      expect(Validacao.emailValido("rodrigo.sgarabotto.scola.gmail.com")).toBe(
        false
      );
    });
  });
  describe("Valid Phone Number Tests", () => {
    it("Should return true when receiving a valid Phone Number", async () => {
      expect(Validacao.telefoneValido("54 991982471")).toBe(true);
      expect(Validacao.telefoneValido("991982471")).toBe(true);
    });
    it("Should return false when receiving an invalid phone number", async () => {
      expect(Validacao.telefoneValido("55 54 991982471")).toBe(true);
    });
  });
});
