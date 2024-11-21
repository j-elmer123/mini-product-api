import { Injectable, UnauthorizedException } from '@nestjs/common';
import SecurityService from './SecurityService';
import Account from 'src/entities/Account';
import { compare, hash } from 'bcrypt';

@Injectable()
export default class AccountService {
  constructor(private securityService: SecurityService) {}

  async createAccount(username: string, password: string): Promise<Account> {
    const hashedPassword = await hash(password, 12);
    const {
      ciphertext: encryptedHashedPassword,
      iv,
      tag,
    } = this.securityService.encrypt(hashedPassword);

    return Account.new(username, encryptedHashedPassword, iv, tag).save();
  }

  async assertAccount(username: string, password: string): Promise<Account> {
    const account = await Account.findOneBy({ username });

    if (account == null) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    const {
      password: encryptedHashedPassword,
      passwordIv,
      passwordTag,
    } = account;

    const decryptedHashedPassword = this.securityService.decrypt(
      encryptedHashedPassword,
      passwordIv,
      passwordTag,
    );

    const isValidPassword = await compare(password, decryptedHashedPassword);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Username or Password');
    }

    return account;
  }
}
