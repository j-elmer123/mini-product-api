import { Module } from '@nestjs/common';
import AccountModule from './AccountModule';
import AuthenticationService from 'src/services/AuthenticationService';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import JwtStrategy from 'src/strategies/JwtStrategy';
import AuthenticationController from 'src/controllers/AuthenticationController';

@Module({
  imports: [
    AccountModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    PassportModule,
  ],
  providers: [AuthenticationService, JwtStrategy],
  controllers: [AuthenticationController],
})
export default class AuthenticationModule {}
