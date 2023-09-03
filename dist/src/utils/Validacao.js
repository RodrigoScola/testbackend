"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validacao = void 0;
var Validacao = exports.Validacao = /** @class */ (function () {
    function Validacao() {
    }
    Validacao.emailValido = function (email) {
        if (email.match(Validacao.RegexEmailValido)) {
            return true;
        }
        return false;
    };
    Validacao.telefoneValido = function (telefone) {
        if (telefone.match(Validacao.RegexTelefoneValido)) {
            return true;
        }
        return false;
    };
    Validacao.RegexEmailValido = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    Validacao.RegexTelefoneValido = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;
    return Validacao;
}());
