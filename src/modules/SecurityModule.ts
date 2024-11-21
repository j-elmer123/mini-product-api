import { Module } from '@nestjs/common';
import SecurityService from 'src/services/SecurityService';

@Module({
  providers: [SecurityService],
  exports: [SecurityService],
})
export default class SecurityModule {}
