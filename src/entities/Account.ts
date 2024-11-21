import { Column, DeleteDateColumn, Entity } from 'typeorm';
import BaseEntity from '../abstracts/BaseEntity';

@Entity()
export default class Account extends BaseEntity {
  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text' })
  passwordIv!: string;

  @Column({ type: 'text' })
  passwordTag!: string;

  @Column({ type: 'int' })
  tokenVersion!: number;

  @DeleteDateColumn()
  deletedAt!: Date;

  static new(
    username: string,
    password: string,
    passwordIv: string,
    passwordTag: string,
  ): Account {
    const account = new Account();
    account.username = username;
    account.password = password;
    account.passwordIv = passwordIv;
    account.passwordTag = passwordTag;
    account.tokenVersion = 1;

    return account;
  }
}
