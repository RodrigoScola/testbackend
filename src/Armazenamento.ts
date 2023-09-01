import AWS from "aws-sdk";
import { StorageNames } from "./constants";
import { SQLcliente } from "./server";
import { Nomes_de_Tabelas } from "./types";

require("dotenv").config();

export const s3armazenamento = new AWS.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY_ID || "",
  },
});

// Implementacao do padrao de estrategia para buscar dados em maquinas diferentes
// No futuro, seria inteligente criar um adaptador para o armazenamento, por que eles usam tecnologias diferentes

export interface Armazenamento {
  getUm<T = string>(identificador: string): Promise<T | null>;
  getTodos<T = string>(identificador: string): Promise<T | null>;
  upload<T>(conteudos: any, identificador: string): Promise<T>;
  update(conteudos: any, identificador: string): void;
}

export class DataTransformer {
  public static ordenarPor<T>(
    itens: T[],
    chave: keyof T,
    ordem: "asc" | "desc"
  ) {
    itens.sort((a: T, b: T) =>
      ordem === "desc"
        ? b[chave] > a[chave]
          ? 1
          : -1
        : a[chave] > b[chave]
        ? 1
        : -1
    );
  }
  public static agruparPor<T>(chave: keyof T, itens: T[]) {
    itens.sort((a: T, b: T) => (a[chave] > b[chave] ? 1 : -1));
  }
}

export class SQLArmazenamento implements Armazenamento {
  public nomeDaTabela: Nomes_de_Tabelas;
  constructor(nomeDaTabela: Nomes_de_Tabelas) {
    this.nomeDaTabela = nomeDaTabela;
  }

  static async getTodos<T>(nomeDaTabela: string): Promise<T> {
    return new Promise((resolucao, rejeitado) => {
      const a = SQLcliente.query(
        `select * from ${nomeDaTabela} order by created_at desc `,
        (erros, resultado) => {
          if (erros) rejeitado(erros);
          if (typeof resultado !== "undefined") {
            resolucao(resultado as Promise<T>);
          }
          rejeitado([]);
        }
      );
    });
  }

  // apenas um wrapper para a função estática `Bucket.getTodos`
  // mais para qualidade de vida do que realmente necessário
  async getTodos<T>(): Promise<T> {
    return await SQLArmazenamento.getTodos(this.nomeDaTabela);
  }
  getUm<T>(id: string): Promise<T> {
    return new Promise((resolucao, rejeitado) => {
      SQLcliente.query(
        "select * from " +
          this.nomeDaTabela +
          " where id = " +
          SQLcliente.escape(id),
        (erros, resultado) => {
          if (erros || resultado.length == 0) rejeitado(erros);
          resolucao(resultado[0]);
        }
      );
    });
  }

  // em vez de escrever as colunas individuais, aceita um objeto e gera a consulta com base em suas chaves
  // {nome: "jerry", idade: 28} torna-se "nome =?, idade =?".
  // nós não usamos as `entradas` porque elas precisam ser escapadas mais tarde
  public static objetoParaSQL(info: object): string {
    const chaves = Object.keys(info);

    return chaves.join(" = ?, ") + " = ? ";
  }

  async update<T extends Record<string, any>>(info: T, id: string) {
    return new Promise((resolucao, rejeitado) => {
      const query: string =
        "update " +
        this.nomeDaTabela +
        " set " +
        SQLArmazenamento.objetoParaSQL(info);

      SQLcliente.query(
        `${query} where id = ${SQLcliente.escape(id)}`,
        [...Object.values<string>(info)],
        (error, result) => {
          if (error) {
            rejeitado(error);
          }
          resolucao(result);
        }
      );
    });
  }

  static upload<T>(nomeDaTabela: Nomes_de_Tabelas, conteudos: any): Promise<T> {
    return new Promise((resolucao, rejeitado) => {
      SQLcliente.query(
        `insert into ${nomeDaTabela} set ?`,
        conteudos,
        (error, result) => {
          if (error) {
            rejeitado(error);
          }
          resolucao(result as Promise<T>);
        }
      );
    });
  }
  async upload<T>(info: T): Promise<T> {
    return await SQLArmazenamento.upload(this.nomeDaTabela, info);
  }
}

export class S3Storage implements Armazenamento {
  public storageName: StorageNames;
  constructor(bucketName: StorageNames) {
    this.storageName = bucketName;
  }

  public ListFiles(prefix: string): Promise<AWS.S3.Types.ListObjectsV2Output> {
    return new Promise(async (resolve, reject) => {
      try {
        s3armazenamento.listObjectsV2(
          {
            Bucket: this.storageName,
            Prefix: prefix,
          },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          }
        );
      } catch (err) {
        reject(err);
        return;
      }
    });
  }
  public async getFiles(filenames: string[]) {
    let promises: any[] = [];

    filenames.forEach((filename) => {
      promises.push(this.getUm(filename));
    });
    return await Promise.all(promises);
  }
  getTodos<T = string>(identifier: string): Promise<T> {
    return new Promise(async (res, rej) => {
      try {
        const files = await this.ListFiles(identifier);

        const filenames = files.Contents?.map((file) => file.Key as string);

        const promisses = filenames?.map((filename) => this.getUm(filename));

        const allFilesString = await Promise.all(promisses as any);

        if (allFilesString.length == 0) {
          rej(new Error("There were no files found"));
        }

        res(allFilesString as T); // Promise.all(promisses))
      } catch (err) {
        rej(err);
      }
    });
  }
  public getUm<T = string>(filename: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        s3armazenamento.getObject(
          {
            Bucket: this.storageName,
            Key: filename,
          },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            if (!data.Body) {
              reject(new Error("Failed to get body"));
              return;
            }
            // s3 sends a buffer, this is so we return the string
            resolve(data.Body.toString() as T);
          }
        );
      } catch (err) {}
    });
  }
  public upload<T extends string>(contents: T, identifier: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.storageName,
          Key: identifier,
          Body: new Buffer(contents),
        };
        s3armazenamento.putObject(params, (err: any, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data as Promise<T>);
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
  public async update<T>(conteudos: any, identificador: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof conteudos !== "string") {
          conteudos = JSON.stringify(conteudos);
        }
        const parametros = {
          Bucket: this.storageName,
          Key: identificador,
          Body: new Buffer(conteudos),
        };
        s3armazenamento.putObject(parametros, (err: any, data: any) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(data);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  public static CreateBucket(name: string): Promise<boolean> {
    return new Promise((res, rej) => {
      s3armazenamento.createBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err);
        }
        res(true);
      });
    });
  }
  public static async RemoveBucket(name: string): Promise<boolean> {
    return new Promise(async (res, rej) => {
      await s3armazenamento.deleteBucket({ Bucket: name }, function (err) {
        if (err) {
          rej(err);
          return;
        }
        res(true);
      });
    });
  }
}
