import { Armazenamento } from "./Armazenamento";
import { MensagemInfo, NovaMensagemInfo } from "./types";
export declare class ProcessadorDeMensagens {
    static AdicionarUsernames(mensagens: NovaMensagemInfo[]): MensagemInfo[];
    static uploadMensagens(mensagens: MensagemInfo[], armazenamento: Armazenamento): Promise<void>;
    static FetchMessagesFromURL(url: string): Promise<MensagemInfo[]>;
}
