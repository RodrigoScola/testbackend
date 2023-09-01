/*

  NOTE: this ended up not being used. The whole purpose was to demonstrate that this was possible

*/
export type UserInfo = {
  name: string;
  email: string;
  phone: number;
  company: string;
};

export class User {
  private readonly _name: string;
  private readonly _email: string;
  private readonly _company: string;
  private readonly _phone: number;

  constructor(user: UserInfo) {
    this._name = user.name;
    this._email = user.email;
    this._company = user.company;
    this._phone = user.phone;
  }

  // HACK: this is to help the coders to not need to type out every property
  get info(): UserInfo {
    return {
      name: this._name,
      email: this._email,
      company: this._company,
      phone: this._phone,
    };
  }

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
  public static userNameFromEmail(email: string): string {
    const indexOfAt = email.indexOf("@");
    if (indexOfAt == -1) {
      return email;
    }

    return email.slice(0, indexOfAt).replace(/[_|.]/g, " ");
  }

  public static getUserByEmail(email: string) {}
  static isValidUser(newUser: UserInfo): boolean {
    if (!newUser.company || !newUser.email || newUser.name || !newUser.phone) {
      return false;
    }

    return true;
  }
}
