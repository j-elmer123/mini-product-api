import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import Sqids from 'sqids';
import Account from 'src/entities/Account';
import Brand from 'src/enums/Brand';
import CountryCode from 'src/enums/CountryCode';
import CurrencyCode from 'src/enums/CurrencyCode';
import JwtAuthGuard from 'src/guards/JwtAuthGuard';
import ProductService from 'src/services/ProductService';

class ProductPriceRequestPayload {
  @ApiProperty({ required: true })
  @IsEnum(CurrencyCode)
  @IsNotEmpty()
  currency: CurrencyCode;

  @ApiProperty({ required: true })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price: number;
}

class ProductPriceResponsePayload extends ProductPriceRequestPayload {
  id: string;
}

class UpdateProductRequestPayload {
  @ApiProperty({ required: false })
  @IsEnum(Brand)
  @IsOptional()
  brand?: Brand;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reference_number?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  release_date?: string;

  @ApiProperty({ required: false })
  @IsEnum(CountryCode)
  @IsOptional()
  country_origin?: CountryCode;
}

class UpdateProductResponsePayload extends UpdateProductRequestPayload {
  id: string;
}

class AddProductRequestPayload {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsEnum(Brand)
  @IsNotEmpty()
  brand: Brand;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  reference_number: string;

  @ApiProperty({ required: true })
  @IsDateString()
  @IsNotEmpty()
  release_date: string;

  @ApiProperty({ required: true })
  @IsEnum(CountryCode)
  @IsNotEmpty()
  country_origin: CountryCode;

  @ApiProperty({ type: [ProductPriceRequestPayload], required: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsNotEmpty()
  product_prices: ProductPriceRequestPayload[];
}

class AddProductResponsePayload extends AddProductRequestPayload {
  id: string;
  product_prices: ProductPriceResponsePayload[];
}

class ProductQueryPayload {
  @ApiProperty({ required: true })
  @IsEnum(CurrencyCode)
  @IsNotEmpty()
  currency: CurrencyCode;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiProperty({ required: false })
  @IsEnum(Brand)
  @IsOptional()
  brand?: Brand;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  searchText?: string;
}

class ProductResponsePayload {
  id: string;
  name: string;
  brand: Brand;
  reference_number: string;
  release_date: string;
  country_origin: CountryCode;
  product_price: ProductPriceResponsePayload;
}

class ProductListResponsePayload {
  products: ProductResponsePayload[];
  page: number;
  size: number;
}

class ProductDetailQueryPayload {
  @ApiProperty({ required: true })
  @IsEnum(CurrencyCode)
  @IsNotEmpty()
  currency: CurrencyCode;
}

@Controller('products')
export default class ProductController {
  private sqids: Sqids;

  constructor(private readonly productService: ProductService) {
    this.sqids = new Sqids({ minLength: 10 });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addProduct(
    @Body()
    {
      name,
      brand,
      reference_number: referenceNumber,
      release_date: releaseDate,
      country_origin: countryOrigin,
      product_prices: productPrices,
    }: AddProductRequestPayload,
    @Request() req,
  ): Promise<AddProductResponsePayload> {
    const product = await this.productService.addProduct(
      name,
      brand,
      referenceNumber,
      releaseDate,
      countryOrigin,
      productPrices,
      req.user.id as Account['id'],
    );

    const mappedProductPrices: ProductPriceResponsePayload[] =
      product.prices.map(({ id, currency, price }) => ({
        id: this.sqids.encode([id]),
        currency,
        price,
      }));

    return {
      id: this.sqids.encode([product.id]),
      name: product.name,
      brand: product.brand,
      reference_number: product.referenceNumber,
      release_date: product.releaseDate,
      country_origin: product.countryOrigin,
      product_prices: mappedProductPrices,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body()
    {
      brand,
      reference_number: referenceNumber,
      release_date: releaseDate,
      country_origin: countryOrigin,
    }: UpdateProductRequestPayload,
    @Request() req,
  ): Promise<UpdateProductResponsePayload> {
    const cleanedId = this.sqids.decode(id)[0];

    const product = await this.productService.updateProduct(
      cleanedId,
      req.user.id as Account['id'],
      brand,
      referenceNumber,
      releaseDate,
      countryOrigin,
    );

    return {
      id: this.sqids.encode([product.id]),
      brand: product.brand,
      reference_number: product.referenceNumber,
      release_date: product.releaseDate,
      country_origin: product.countryOrigin,
    };
  }

  @Get()
  async getProducts(
    @Query()
    { brand, currency, page = 1, size = 5, searchText }: ProductQueryPayload,
  ): Promise<ProductListResponsePayload> {
    const products = await this.productService.getProducts(
      currency,
      page,
      size,
      brand,
      searchText,
    );

    const mappedProducts = products.map(
      ({
        id: priceId,
        currency,
        price,
        product: {
          id,
          name,
          brand,
          referenceNumber,
          releaseDate,
          countryOrigin,
        },
      }) => {
        return {
          id: this.sqids.encode([id]),
          name,
          brand,
          reference_number: referenceNumber,
          release_date: releaseDate,
          country_origin: countryOrigin,
          product_price: {
            id: this.sqids.encode([priceId]),
            currency,
            price: parseFloat(price.toString()),
          },
        };
      },
    );

    return {
      products: mappedProducts,
      page,
      size: mappedProducts.length,
    };
  }

  @Get(':id')
  async getProduct(
    @Param('id') id: string,
    @Query() { currency }: ProductDetailQueryPayload,
  ): Promise<ProductResponsePayload> {
    const {
      id: priceId,
      currency: priceCurrency,
      price,
      product: {
        id: productId,
        name,
        brand,
        referenceNumber,
        releaseDate,
        countryOrigin,
      },
    } = await this.productService.getProductDetails(
      this.sqids.decode(id)[0],
      currency,
    );

    return {
      id: this.sqids.encode([productId]),
      name,
      brand,
      reference_number: referenceNumber,
      release_date: releaseDate,
      country_origin: countryOrigin,
      product_price: {
        id: this.sqids.encode([priceId]),
        currency: priceCurrency,
        price: parseFloat(price.toString()),
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string, @Request() req): Promise<void> {
    await this.productService.deleteProduct(
      this.sqids.decode(id)[0],
      req.user.id as Account['id'],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/prices/:priceId')
  async deleteProductPrice(
    @Param('id') id: string,
    @Param('priceId') priceId: string,
    @Request() req,
  ): Promise<void> {
    await this.productService.deleteProductPrice(
      this.sqids.decode(priceId)[0],
      this.sqids.decode(id)[0],
      req.user.id as Account['id'],
    );
  }
}
