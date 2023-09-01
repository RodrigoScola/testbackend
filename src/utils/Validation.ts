export class Validation {
  private static validEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  private static validPhoneNumberRegex =
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;

  public static isValidEmail(email: string): boolean {
    if (email.match(Validation.validEmailRegex)) {
      return true;
    }
    return false;
  }
  public static isValidPhoneNumber(tel: string): boolean {
    if (tel.match(Validation.validPhoneNumberRegex)) {
      return true;
    }
    return false;
  }
}
