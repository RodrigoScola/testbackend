export class Validacao {
  private static RegexEmailValido =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  private static RegexTelefoneValido =
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;

  public static emailValido(email: string): boolean {
    if (email.match(Validacao.RegexEmailValido)) {
      return true;
    }
    return false;
  }
  public static telefoneValido(telefone: string): boolean {
    if (telefone.match(Validacao.RegexTelefoneValido)) {
      return true;
    }
    return false;
  }
}
