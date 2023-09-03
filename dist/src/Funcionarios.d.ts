import { Armazenamento, SQLArmazenamento } from "./Armazenamento";
import { FuncionarioContratadoInfo, FuncionarioInfo, FuncionarioContratadoInfo as InfoEmpregadoContratado } from "./types";
export declare class Funcionarios {
    static getFuncionario(idFuncionario: string, armazenamento: SQLArmazenamento): Promise<InfoEmpregadoContratado | null>;
    static updateFuncionario(funcionario: FuncionarioContratadoInfo, armazenamento: Armazenamento): Promise<FuncionarioContratadoInfo | null>;
    static getTodosFuncionarios(armazenamento: SQLArmazenamento): Promise<FuncionarioContratado[]>;
    static novoFuncionario(info: FuncionarioInfo): InfoEmpregadoContratado;
}
export declare abstract class Funcionario {
    private _email;
    nome: string;
    telefone: string;
    empresa: string;
    get email(): string;
    set email(novoEmail: string);
    constructor(info: FuncionarioInfo);
    static funcionarioValido(n: FuncionarioInfo): boolean;
}
export declare class NovoFuncionario extends Funcionario {
    constructor(info: FuncionarioInfo);
}
export declare class FuncionarioContratado extends Funcionario {
    id: string;
    created_at: string;
    constructor(employee: InfoEmpregadoContratado);
}
