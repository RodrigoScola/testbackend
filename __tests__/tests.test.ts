import { ProcessadorDeMensagens } from "../src/ProcessadorMensagens";
import { User } from "../src/User";
import { NovaMensagemInfo } from "../src/types";
import { Validacao } from "../src/utils/Validacao";

describe("Testes Username no email", () => {
  it("Deve retornar uma string da função", () => {
    expect(typeof User.userNameFromEmail("Hayden@althea.biz")).toEqual(
      "string"
    );
  });
  it("O user_name deve ser Hayden", () => {
    expect(User.userNameFromEmail("Hayden@althea.biz")).toEqual("Hayden");
  });

  it("O user_name deve ser Presley Mueller", () => {
    expect(User.userNameFromEmail("Presley.Mueller@myrl.com")).toEqual(
      "Presley Mueller"
    );
  });
  it("O user_name deve ser Mallory Kunze", () => {
    expect(User.userNameFromEmail("Mallory_Kunze@marie.org")).toEqual(
      "Mallory Kunze"
    );
  });
  it("O user_name deve ser John Green Mackeys", () => {
    expect(User.userNameFromEmail("John_Green.Mackeys@marie.org")).toEqual(
      "John Green Mackeys"
    );
  });
});

describe("Testes de Processador de mensagens", () => {
  test("Should add usernames to objects", () => {
    const mensagens_base = [
      { id: 1, email: "Eliseo@gardner.biz" },
      { id: 2, email: "Jayne_Kuhic@sydney.com" },
      { id: 3, email: "Nikita@garfield.biz" },
    ];
    const com_usernames = [
      { id: 1, email: "Eliseo@gardner.biz", user_name: "Eliseo" },
      { id: 2, email: "Jayne_Kuhic@sydney.com", user_name: "Jayne Kuhic" },
      { id: 3, email: "Nikita@garfield.biz", user_name: "Nikita" },
    ];
    const newMessages = ProcessadorDeMensagens.AdicionarUsernames(
      mensagens_base as NovaMensagemInfo[]
    );
    expect(newMessages).toStrictEqual(com_usernames);
  });
});

describe("Testes de validação", () => {
  describe("Testes de emails válidos", () => {
    it("Deve retornar verdadeiro quando o input for um email válido", () => {
      expect(Validacao.emailValido("rodrigo.sgarabotto.scola@gmail.com")).toBe(
        true
      );
    });
    it("Deve retornar falso quando o input for um email inválido", () => {
      expect(Validacao.emailValido("rodrigo.sgarabotto.scola.gmail.com")).toBe(
        false
      );
    });
  });
  describe("Valid Phone Number Tests", () => {
    it("Deve retornar verdadeiro quando receber um telefone válido", () => {
      expect(Validacao.telefoneValido("54 991982471")).toBe(true);
      expect(Validacao.telefoneValido("991982471")).toBe(true);
    });
    it("Deve retornar falso quando receber um telefone inválido", () => {
      expect(Validacao.telefoneValido("55 54 991982471")).toBe(false);
    });
  });
});
