import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import Account from 'src/entities/Account';
import JwtAuthGuard from 'src/guards/JwtAuthGuard';
import AuthenticationService, {
  AuthenticationPayload,
} from 'src/services/AuthenticationService';

class AuthenticationRequestPayload {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export default class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async createAccount(
    @Body() { username, password }: AuthenticationRequestPayload,
  ): Promise<AuthenticationPayload> {
    return this.authenticationService.register(username, password);
  }

  @Post('login')
  async login(
    @Body() { username, password }: AuthenticationRequestPayload,
  ): Promise<AuthenticationPayload> {
    return this.authenticationService.login(username, password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.authenticationService.logout(req.user as Account);
  }
}
