import { Armazenamento } from "./Armazenamento";
import { User } from "./User";
import { MensagemInfo, NovaMensagemInfo } from "./types";

export class ProcessadorDeMensagens {
  // isto acabou nao sendo utilizado por causa das demandas do time, porem se fosse utilizado nessa etapa, o codigo ficaria assim
  // foi tambem utilizado para testar como seria em codigo sql
  public static AdicionarUsernames(
    mensagens: NovaMensagemInfo[]
  ): MensagemInfo[] {
    return mensagens.map((mensagem) => {
      return {
        ...mensagem,
        user_name: User.userNameFromEmail(mensagem.email),
      };
    });
  }
  public static async uploadMensagens(
    mensagens: MensagemInfo[],
    armazenamento: Armazenamento
  ) {
    mensagens.forEach((mensagem) => {
      armazenamento.upload(
        "mensagens/mensagem_" + mensagem.id + ".json",
        JSON.stringify(mensagem)
      );
    });
  }
  public static async FetchMessagesFromURL(
    url: string
  ): Promise<MensagemInfo[]> {
    try {
      const data = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (data.ok) {
        return await data.json();
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
