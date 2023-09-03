"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mensagensRouter = void 0;
var express_1 = require("express");
var Armazenamento_1 = require("../Armazenamento");
var ProcessadorMensagens_1 = require("../ProcessadorMensagens");
var constants_1 = require("../constants");
exports.mensagensRouter = (0, express_1.Router)();
exports.mensagensRouter.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bucket, m, mensagensJSON;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bucket = new Armazenamento_1.S3Storage(constants_1.NomesArmazenamento.NOME_MENSAGENS_BUCKET);
                return [4 /*yield*/, bucket.getTodos(constants_1.MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS)];
            case 1:
                m = _a.sent();
                mensagensJSON = m === null || m === void 0 ? void 0 : m.map(function (s) {
                    if (s.length <= 0) {
                        return {};
                    }
                    return JSON.parse(s);
                });
                res.json({
                    mensagens: mensagensJSON,
                });
                return [2 /*return*/];
        }
    });
}); });
exports.mensagensRouter.get("/comecarprocesso", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var mensagensDaApi, bucket_1, totalMessages, promessas_1, e_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                return [4 /*yield*/, ProcessadorMensagens_1.ProcessadorDeMensagens.FetchMessagesFromURL(constants_1.BASE_MESSAGE_URL)];
            case 1:
                mensagensDaApi = _b.sent();
                bucket_1 = new Armazenamento_1.S3Storage(constants_1.NomesArmazenamento.NOME_MENSAGENS_BUCKET);
                return [4 /*yield*/, bucket_1.ListFiles("/".concat(constants_1.MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS))];
            case 2:
                totalMessages = _b.sent();
                if (!(typeof totalMessages.Contents != "undefined" &&
                    ((_a = totalMessages === null || totalMessages === void 0 ? void 0 : totalMessages.Contents) === null || _a === void 0 ? void 0 : _a.length) <= 0)) return [3 /*break*/, 4];
                promessas_1 = [];
                mensagensDaApi.forEach(function (item) {
                    if (item.postId) {
                        if (item) {
                            promessas_1.push(bucket_1.upload(JSON.stringify(item), "".concat(constants_1.MessagesDirectoryNames.DIRETORIO_BASE_MENSAGENS, "/message_") +
                                item.id +
                                ".json"));
                        }
                    }
                });
                promessas_1.push(bucket_1.upload(JSON.stringify(mensagensDaApi), "base_messages.json"));
                return [4 /*yield*/, Promise.all(promessas_1)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                res.json({
                    treatments: ProcessadorMensagens_1.ProcessadorDeMensagens.AdicionarUsernames(mensagensDaApi),
                });
                return [3 /*break*/, 6];
            case 5:
                e_1 = _b.sent();
                return [2 /*return*/, res.json({ error: "Could not add messages." })];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.mensagensRouter.get("/agrupadas", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var armazenamento, mensagens;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                armazenamento = new Armazenamento_1.S3Storage(constants_1.NomesArmazenamento.NOME_MENSAGENS_BUCKET);
                return [4 /*yield*/, armazenamento.getTodos(constants_1.MessagesDirectoryNames.BASE_MENSAGEM_AGRUPADAS)];
            case 1:
                mensagens = _a.sent();
                // they will be in a csv format, in order to make excel files
                res.json({
                    m: mensagens,
                });
                return [2 /*return*/];
        }
    });
}); });
exports.mensagensRouter.get("/com_usernames", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var armazenamento, mensagens;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                armazenamento = new Armazenamento_1.S3Storage(constants_1.NomesArmazenamento.NOME_MENSAGENS_BUCKET);
                return [4 /*yield*/, armazenamento.getTodos(constants_1.MessagesDirectoryNames.DIRETORIO_MENSAGENS_COM_USERNAME)];
            case 1:
                mensagens = _a.sent();
                // seriam em formatos csv, em ordem de criar arquivos do excel
                res.json({
                    m: mensagens,
                });
                return [2 /*return*/];
        }
    });
}); });
