import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountService from 'src/services/AccountService';
import SecurityModule from './SecurityModule';
import Account from 'src/entities/Account';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), SecurityModule],
  providers: [AccountService],
  exports: [AccountService],
})
export default class AccountModule {}
