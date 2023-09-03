export type UserInfo = {
    name: string;
    email: string;
    phone: number;
    company: string;
};
export declare class User {
    private readonly _name;
    private readonly _email;
    private readonly _company;
    private readonly _phone;
    constructor(user: UserInfo);
    get info(): UserInfo;
    static userNameFromEmail(email: string): string;
    static getUserByEmail(email: string): void;
    static isValidUser(newUser: UserInfo): boolean;
}
