import AWS from "aws-sdk";
import { NomesArmazenamento } from "./constants";
import { Nomes_de_Tabelas } from "./types";
export declare const s3armazenamento: AWS.S3;
export interface Armazenamento {
    getUm<T = string>(identificador: string): Promise<T | null>;
    getTodos<T = string>(identificador: string): Promise<T | null>;
    upload<T>(conteudos: any, identificador: string): Promise<T>;
    update(conteudos: any, identificador: string): void;
}
export declare class DataTransformer {
    static ordenarPor<T>(itens: T[], chave: keyof T, ordem: "asc" | "desc"): void;
    static agruparPor<T>(chave: keyof T, itens: T[]): void;
}
export declare class SQLArmazenamento implements Armazenamento {
    nomeDaTabela: Nomes_de_Tabelas;
    constructor(nomeDaTabela: Nomes_de_Tabelas);
    static getTodos<T>(nomeDaTabela: string): Promise<T>;
    getTodos<T>(): Promise<T>;
    getUm<T>(id: string): Promise<T>;
    static objetoParaSQL(info: object): string;
    update<T extends Record<string, any>>(info: T, id: string): Promise<unknown>;
    static upload<T>(nomeDaTabela: Nomes_de_Tabelas, conteudos: any): Promise<T>;
    upload<T>(info: T): Promise<T>;
}
export declare class S3Storage implements Armazenamento {
    storageName: NomesArmazenamento;
    constructor(bucketName: NomesArmazenamento);
    ListFiles(prefix: string): Promise<AWS.S3.Types.ListObjectsV2Output>;
    getFiles(filenames: string[]): Promise<any[]>;
    getTodos<T = string>(identifier: string): Promise<T>;
    getUm<T = string>(filename: string): Promise<T>;
    upload<T extends string>(contents: T, identifier: string): Promise<T>;
    update<T>(conteudos: any, identificador: string): Promise<void>;
    static CreateBucket(name: string): Promise<boolean>;
    static RemoveBucket(name: string): Promise<boolean>;
}
