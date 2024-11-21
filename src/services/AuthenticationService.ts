import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import AccountService from './AccountService';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import Account from 'src/entities/Account';

export type AuthenticationPayload = { access_token: string };
export type JwtPayload = { sub: number; v: number };

@Injectable()
export default class AuthenticationService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  async register(
    username: string,
    password: string,
  ): Promise<AuthenticationPayload> {
    try {
      const account = await this.accountService.createAccount(
        username,
        password,
      );

      const accessToken = await this.jwtService.signAsync(
        { sub: account.id, v: account.tokenVersion },
        { expiresIn: '90d' },
      );

      return {
        access_token: accessToken,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException('Username already exist');
      }

      throw error;
    }
  }

  async login(
    username: string,
    password: string,
  ): Promise<AuthenticationPayload> {
    const account = await this.accountService.assertAccount(username, password);

    account.tokenVersion += 1;
    await account.save();

    const accessToken = await this.jwtService.signAsync(
      { sub: account.id, un: account.username },
      { expiresIn: '90d' },
    );

    return {
      access_token: accessToken,
    };
  }

  async validate(
    accountId: Account['id'],
    tokenVersion: Account['tokenVersion'],
  ): Promise<Account> {
    const account = await Account.findOneBy({ id: accountId, tokenVersion });

    if (account == null) {
      throw new UnauthorizedException('Token is Invalid or Expired');
    }

    return account;
  }

  async logout(account: Account): Promise<void> {
    account.tokenVersion += 1;
    await account.save();
  }
}
