import { Router } from "express";
import { S3Storage } from "../Armazenamento";
import { ProcessadorDeMensagens } from "../ProcessadorMensagens";
import {
  BASE_MESSAGE_URL,
  MessagesDirectoryNames,
  NomesArmazenamento,
} from "../constants";

export const mensagensRouter = Router();

mensagensRouter.get("/", async (req, res) => {
  const bucket = new S3Storage(NomesArmazenamento.NOME_MENSAGENS_BUCKET);

  const m = await bucket.getTodos<string[]>(
    MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS
  );

  const mensagensJSON = m?.map((s) => {
    if (s.length <= 0) {
      return {};
    }
    return JSON.parse(s);
  });
  res.json({
    mensagens: mensagensJSON,
  });
});

mensagensRouter.get("/comecarprocesso", async (req, res) => {
  try {
    const mensagensDaApi = await ProcessadorDeMensagens.FetchMessagesFromURL(
      BASE_MESSAGE_URL
    );

    const bucket = new S3Storage(NomesArmazenamento.NOME_MENSAGENS_BUCKET);

    // check if the messages are already in the bucket
    const totalMessages = await bucket.ListFiles(
      `/${MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS}`
    );

    if (
      typeof totalMessages.Contents != "undefined" &&
      totalMessages?.Contents?.length <= 0
    ) {
      let promessas: any[] = [];

      mensagensDaApi.forEach((item) => {
        if (item.postId) {
          if (item) {
            promessas.push(
              bucket.upload(
                JSON.stringify(item),
                `${MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS}/message_` +
                  item.id +
                  ".json"
              )
            );
          }
        }
      });
      promessas.push(
        bucket.upload(JSON.stringify(mensagensDaApi), "base_messages.json")
      );
      await Promise.all(promessas);
    }

    res.json({
      treatments: ProcessadorDeMensagens.AdicionarUsernames(mensagensDaApi),
    });
  } catch (e) {
    return res.json({ error: "Could not add messages." });
  }
});

mensagensRouter.get("/agrupadas", async (req, res) => {
  const armazenamento = new S3Storage(NomesArmazenamento.NOME_MENSAGENS_BUCKET);

  const mensagens = await armazenamento.getTodos(
    MessagesDirectoryNames.BASE_MENSAGEM_AGRUPADAS
  );

  // they will be in a csv format, in order to make excel files
  res.json({
    m: mensagens,
  });
});
mensagensRouter.get("/com_usernames", async (req, res) => {
  const armazenamento = new S3Storage(NomesArmazenamento.NOME_MENSAGENS_BUCKET);

  const mensagens = await armazenamento.getTodos(
    MessagesDirectoryNames.DIRETORIO_MENSAGENS_COM_USERNAME
  );

  // seriam em formatos csv, em ordem de criar arquivos do excel
  res.json({
    m: mensagens,
  });
});
