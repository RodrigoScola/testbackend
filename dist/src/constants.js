"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_MESSAGE_URL = exports.BACKEND_EMPLOYEE_BUCKET_NAME = exports.MessagesDirectoryNames = exports.NomesArmazenamento = void 0;
var NomesArmazenamento;
(function (NomesArmazenamento) {
    NomesArmazenamento["NOME_MENSAGENS_BUCKET"] = "backendtestbucket2";
})(NomesArmazenamento = exports.NomesArmazenamento || (exports.NomesArmazenamento = {}));
// used to make sure that the pathing is correct to find the files
var MessagesDirectoryNames;
(function (MessagesDirectoryNames) {
    MessagesDirectoryNames["DIRETORIO_BASE_MENSAGENS"] = "base_messages";
    MessagesDirectoryNames["DIRETORIO_MENSAGENS_COM_USERNAME"] = "mensagens_com_username";
    MessagesDirectoryNames["BASE_MENSAGEM_AGRUPADAS"] = "mensagens_agrupadas_postId";
})(MessagesDirectoryNames = exports.MessagesDirectoryNames || (exports.MessagesDirectoryNames = {}));
exports.BACKEND_EMPLOYEE_BUCKET_NAME = "backendtestemployees";
exports.BASE_MESSAGE_URL = "https://jsonplaceholder.typicode.com/comments";
