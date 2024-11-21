import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATASOURCE_OPTIONS } from './typeorm-config';
import { ConfigModule } from '@nestjs/config';
import AuthenticationModule from './modules/AuthenticationModule';
import ProductModule from './modules/ProductModule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ ...DATASOURCE_OPTIONS, autoLoadEntities: true }),
    AuthenticationModule,
    ProductModule,
  ],
})
export class AppModule {
  constructor() {}
}
