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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Storage = exports.SQLArmazenamento = exports.DataTransformer = exports.s3armazenamento = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var server_1 = require("./server");
require("dotenv").config();
exports.s3armazenamento = new aws_sdk_1.default.S3({
    region: process.env.AWS_S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY_ID || "",
    },
});
var DataTransformer = /** @class */ (function () {
    function DataTransformer() {
    }
    DataTransformer.ordenarPor = function (itens, chave, ordem) {
        itens.sort(function (a, b) {
            return ordem === "desc"
                ? b[chave] > a[chave]
                    ? 1
                    : -1
                : a[chave] > b[chave]
                    ? 1
                    : -1;
        });
    };
    DataTransformer.agruparPor = function (chave, itens) {
        itens.sort(function (a, b) { return (a[chave] > b[chave] ? 1 : -1); });
    };
    return DataTransformer;
}());
exports.DataTransformer = DataTransformer;
var SQLArmazenamento = /** @class */ (function () {
    function SQLArmazenamento(nomeDaTabela) {
        this.nomeDaTabela = nomeDaTabela;
    }
    SQLArmazenamento.getTodos = function (nomeDaTabela) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolucao, rejeitado) {
                        var a = server_1.SQLcliente.query("select * from ".concat(nomeDaTabela, " order by created_at desc "), function (erros, resultado) {
                            if (erros)
                                rejeitado(erros);
                            if (typeof resultado !== "undefined") {
                                resolucao(resultado);
                            }
                            rejeitado([]);
                        });
                    })];
            });
        });
    };
    // apenas um wrapper para a função estática `Bucket.getTodos`
    // mais para qualidade de vida do que realmente necessário
    SQLArmazenamento.prototype.getTodos = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLArmazenamento.getTodos(this.nomeDaTabela)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SQLArmazenamento.prototype.getUm = function (id) {
        var _this = this;
        return new Promise(function (resolucao, rejeitado) {
            server_1.SQLcliente.query("select * from " +
                _this.nomeDaTabela +
                " where id = " +
                server_1.SQLcliente.escape(id), function (erros, resultado) {
                if (erros || resultado.length == 0)
                    rejeitado(erros);
                resolucao(resultado[0]);
            });
        });
    };
    // em vez de escrever as colunas individuais, aceita um objeto e gera a consulta com base em suas chaves
    // {nome: "jerry", idade: 28} torna-se "nome =?, idade =?".
    // nós não usamos as `entradas` porque elas precisam ser escapadas mais tarde
    SQLArmazenamento.objetoParaSQL = function (info) {
        var chaves = Object.keys(info);
        return chaves.join(" = ?, ") + " = ? ";
    };
    SQLArmazenamento.prototype.update = function (info, id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolucao, rejeitado) {
                        var query = "update " +
                            _this.nomeDaTabela +
                            " set " +
                            SQLArmazenamento.objetoParaSQL(info);
                        server_1.SQLcliente.query("".concat(query, " where id = ").concat(server_1.SQLcliente.escape(id)), __spreadArray([], Object.values(info), true), function (error, result) {
                            if (error) {
                                rejeitado(error);
                            }
                            resolucao(result);
                        });
                    })];
            });
        });
    };
    SQLArmazenamento.upload = function (nomeDaTabela, conteudos) {
        return new Promise(function (resolucao, rejeitado) {
            server_1.SQLcliente.query("insert into ".concat(nomeDaTabela, " set ?"), conteudos, function (error, result) {
                if (error) {
                    rejeitado(error);
                }
                resolucao(result);
            });
        });
    };
    SQLArmazenamento.prototype.upload = function (info) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLArmazenamento.upload(this.nomeDaTabela, info)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SQLArmazenamento;
}());
exports.SQLArmazenamento = SQLArmazenamento;
var S3Storage = /** @class */ (function () {
    function S3Storage(bucketName) {
        this.storageName = bucketName;
    }
    S3Storage.prototype.ListFiles = function (prefix) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    exports.s3armazenamento.listObjectsV2({
                        Bucket: this.storageName,
                        Prefix: prefix,
                    }, function (err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                }
                catch (err) {
                    reject(err);
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        }); });
    };
    S3Storage.prototype.getFiles = function (filenames) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        filenames.forEach(function (filename) {
                            promises.push(_this.getUm(filename));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Storage.prototype.getTodos = function (identifier) {
        var _this = this;
        return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
            var files, filenames, promisses, allFilesString, err_1;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ListFiles(identifier)];
                    case 1:
                        files = _b.sent();
                        filenames = (_a = files.Contents) === null || _a === void 0 ? void 0 : _a.map(function (file) { return file.Key; });
                        promisses = filenames === null || filenames === void 0 ? void 0 : filenames.map(function (filename) { return _this.getUm(filename); });
                        return [4 /*yield*/, Promise.all(promisses)];
                    case 2:
                        allFilesString = _b.sent();
                        if (allFilesString.length == 0) {
                            rej(new Error("There were no files found"));
                        }
                        res(allFilesString); // Promise.all(promisses))
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        rej(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    S3Storage.prototype.getUm = function (filename) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    exports.s3armazenamento.getObject({
                        Bucket: this.storageName,
                        Key: filename,
                    }, function (err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (!data.Body) {
                            reject(new Error("Failed to get body"));
                            return;
                        }
                        // s3 sends a buffer, this is so we return the string
                        resolve(data.Body.toString());
                    });
                }
                catch (err) { }
                return [2 /*return*/];
            });
        }); });
    };
    S3Storage.prototype.upload = function (contents, identifier) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                try {
                    params = {
                        Bucket: this.storageName,
                        Key: identifier,
                        Body: new Buffer(contents),
                    };
                    exports.s3armazenamento.putObject(params, function (err, data) {
                        if (err) {
                            reject(err);
                        }
                        resolve(data);
                    });
                }
                catch (err) {
                    console.error(err);
                    reject(err);
                }
                return [2 /*return*/];
            });
        }); });
    };
    S3Storage.prototype.update = function (conteudos, identificador) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var parametros;
                        return __generator(this, function (_a) {
                            try {
                                if (typeof conteudos !== "string") {
                                    conteudos = JSON.stringify(conteudos);
                                }
                                parametros = {
                                    Bucket: this.storageName,
                                    Key: identificador,
                                    Body: new Buffer(conteudos),
                                };
                                exports.s3armazenamento.putObject(parametros, function (err, data) {
                                    if (err) {
                                        console.log(err);
                                        reject(err);
                                    }
                                    resolve(data);
                                });
                            }
                            catch (err) {
                                reject(err);
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    S3Storage.CreateBucket = function (name) {
        return new Promise(function (res, rej) {
            exports.s3armazenamento.createBucket({ Bucket: name }, function (err) {
                if (err) {
                    rej(err);
                }
                res(true);
            });
        });
    };
    S3Storage.RemoveBucket = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, exports.s3armazenamento.deleteBucket({ Bucket: name }, function (err) {
                                        if (err) {
                                            rej(err);
                                            return;
                                        }
                                        res(true);
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    return S3Storage;
}());
exports.S3Storage = S3Storage;
