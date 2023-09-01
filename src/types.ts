export type NovaMensagemInfo = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
export type MensagemInfo = NovaMensagemInfo & {
  user_name: string;
};
export interface FuncionarioInfo {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
}

export interface FuncionarioContratadoInfo extends FuncionarioInfo {
  created_at: string;
  id: string;
}

export enum Nomes_de_Tabelas {
  FUNCIONARIOS = "funcionarios",
}
