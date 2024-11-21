import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ProductController from 'src/controllers/ProductController';
import Product from 'src/entities/Product';
import ProductPrice from 'src/entities/ProductPrice';
import ProductService from 'src/services/ProductService';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Product, ProductPrice])],
  providers: [ProductService],
  controllers: [ProductController],
})
export default class ProductModule {}
