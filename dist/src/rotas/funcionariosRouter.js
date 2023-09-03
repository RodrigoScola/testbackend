"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.funcionariosRouter = void 0;
var express_1 = require("express");
var Armazenamento_1 = require("../Armazenamento");
var Funcionarios_1 = require("../Funcionarios");
var types_1 = require("../types");
exports.funcionariosRouter = (0, express_1.Router)();
exports.funcionariosRouter.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var funcionarios, agruparpor, ordem;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Funcionarios_1.Funcionarios.getTodosFuncionarios(new Armazenamento_1.SQLArmazenamento(types_1.Nomes_de_Tabelas.FUNCIONARIOS))];
            case 1:
                funcionarios = _a.sent();
                agruparpor = (req.query.agruparpor ||
                    "created_at");
                ordem = req.query.ordem == "desc" ? "asc" : "desc";
                if (funcionarios.length <= 0) {
                    return [2 /*return*/, res.render("paginas/funcionarios", {
                            funcionarios: [],
                            ordem: req.query.order == "desc" ? "asc" : "desc",
                        })];
                }
                if (ordem == "desc" || ordem == "asc") {
                    Armazenamento_1.DataTransformer.ordenarPor(funcionarios, "created_at", ordem);
                }
                if (Object.keys(funcionarios[0]).includes(agruparpor)) {
                    Armazenamento_1.DataTransformer.agruparPor(agruparpor, funcionarios);
                }
                res.render("paginas/funcionarios", {
                    funcionarios: funcionarios,
                    ordem: ordem,
                });
                return [2 /*return*/];
        }
    });
}); });
exports.funcionariosRouter.get("/novo", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render("paginas/novo_funcionario");
        return [2 /*return*/];
    });
}); });
exports.funcionariosRouter.post("/novo", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var armazenamentoFuncionarios, funcionario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                armazenamentoFuncionarios = new Armazenamento_1.SQLArmazenamento(types_1.Nomes_de_Tabelas.FUNCIONARIOS);
                if (!req.body.email ||
                    !req.body.telefone ||
                    !Funcionarios_1.FuncionarioContratado.funcionarioValido(req.body)) {
                    return [2 /*return*/, res.json({
                            error: "funcionario invalido",
                        })];
                }
                funcionario = Funcionarios_1.Funcionarios.novoFuncionario(req.body);
                return [4 /*yield*/, armazenamentoFuncionarios.upload(funcionario)];
            case 1:
                _a.sent();
                return [2 /*return*/, res.redirect("/funcionarios")];
        }
    });
}); });
exports.funcionariosRouter.param("idFuncionario", function (req, res, next, idFuncionario) { return __awaiter(void 0, void 0, void 0, function () {
    var funcionario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req.idFuncionario = idFuncionario;
                return [4 /*yield*/, Funcionarios_1.Funcionarios.getFuncionario(idFuncionario, new Armazenamento_1.SQLArmazenamento(types_1.Nomes_de_Tabelas.FUNCIONARIOS))];
            case 1:
                funcionario = _a.sent();
                if (!funcionario) {
                    return [2 /*return*/, res.status(404).send({ error: "id de empregado incorreto." })];
                }
                req.funcionario = funcionario;
                next();
                return [2 /*return*/];
        }
    });
}); });
exports.funcionariosRouter.get("/:idFuncionario/editar", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var funcionario;
    return __generator(this, function (_a) {
        funcionario = req.funcionario;
        res.render("paginas/editar_funcionario", { funcionario: funcionario });
        return [2 /*return*/];
    });
}); });
exports.funcionariosRouter.post("/:idFuncionario/editar", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var funcionario, isValid, novoFuncionario, funcionarios;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                funcionario = req.funcionario;
                isValid = Funcionarios_1.FuncionarioContratado.funcionarioValido(__assign(__assign({}, funcionario), req.body));
                if (!isValid) {
                    return [2 /*return*/, res.json({
                            erro: "funcionario invalido",
                        })];
                }
                novoFuncionario = Funcionarios_1.Funcionarios.novoFuncionario(req.body);
                return [4 /*yield*/, Funcionarios_1.Funcionarios.updateFuncionario(__assign(__assign({}, novoFuncionario), { email: funcionario.email, id: req.params.idFuncionario }), new Armazenamento_1.SQLArmazenamento(types_1.Nomes_de_Tabelas.FUNCIONARIOS))];
            case 1:
                _a.sent();
                return [4 /*yield*/, Funcionarios_1.Funcionarios.getTodosFuncionarios(new Armazenamento_1.SQLArmazenamento(types_1.Nomes_de_Tabelas.FUNCIONARIOS))];
            case 2:
                funcionarios = _a.sent();
                // redireciona para /funcionarios onde adiciona os parametros ordem e agrupar por
                return [2 /*return*/, res.redirect("/funcionarios")];
        }
    });
}); });
