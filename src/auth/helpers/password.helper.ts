import * as bcrypt from 'bcrypt';
 
export class PwdUtils {
    static pwdCrypt(password: string): string {
        return bcrypt.hashSync(password, 11);
    }
}