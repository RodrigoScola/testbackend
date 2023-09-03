"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var User = /** @class */ (function () {
    function User(user) {
        this._name = user.name;
        this._email = user.email;
        this._company = user.company;
        this._phone = user.phone;
    }
    Object.defineProperty(User.prototype, "info", {
        // HACK: this is to help the coders to not need to type out every property
        get: function () {
            return {
                name: this._name,
                email: this._email,
                company: this._company,
                phone: this._phone,
            };
        },
        enumerable: false,
        configurable: true
    });
    /*
    NOTE: this was not used in the final project, the final algorithm was using aws glue. and the SQL statement was as follows:
  
    SELECT
      postId,
      COUNT(*) AS quantidade_mensagens,
      MAX(id) AS id_ultima_mensagem,
      MAX(body) AS ultima_mensagem
      FROM
      myDataSource
  GROUP BY
      postId;
  
    */
    User.userNameFromEmail = function (email) {
        var indexOfAt = email.indexOf("@");
        if (indexOfAt == -1) {
            return email;
        }
        return email.slice(0, indexOfAt).replace(/[_|.]/g, " ");
    };
    User.getUserByEmail = function (email) { };
    User.isValidUser = function (newUser) {
        if (!newUser.company || !newUser.email || newUser.name || !newUser.phone) {
            return false;
        }
        return true;
    };
    return User;
}());
exports.User = User;
