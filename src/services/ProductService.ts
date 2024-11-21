import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Account from 'src/entities/Account';
import Product from 'src/entities/Product';
import ProductPrice from 'src/entities/ProductPrice';
import Brand from 'src/enums/Brand';
import CountryCode from 'src/enums/CountryCode';
import CurrencyCode from 'src/enums/CurrencyCode';
import { Brackets, DataSource, IsNull } from 'typeorm';

export type LiteProductPrice = Pick<ProductPrice, 'currency' | 'price'>;

@Injectable()
export default class ProductService {
  constructor(private dataSource: DataSource) {}

  async addProduct(
    name: string,
    brand: Brand,
    referenceNumber: string,
    releaseDate: string,
    countryOrigin: CountryCode,
    prices: LiteProductPrice[],
    accountId: Account['id'],
  ): Promise<Product> {
    return this.dataSource.transaction(async (entityManager) => {
      const product = await entityManager.save(
        Product.new(
          name,
          brand,
          referenceNumber,
          releaseDate,
          countryOrigin,
          accountId,
        ),
      );

      const productPrices = await entityManager.save(
        prices.map((price) =>
          ProductPrice.new(product.id, price.price, price.currency),
        ),
      );

      product.prices = productPrices;

      return product;
    });
  }

  async updateProduct(
    id: Product['id'],
    accountId: Account['id'],
    brand?: Brand,
    referenceNumber?: string,
    releaseDate?: string,
    countryOrigin?: CountryCode,
  ): Promise<Product> {
    const product = await Product.findOneBy({ id });

    if (product == null) {
      throw new NotFoundException('Watch Not Found');
    }

    if (product.accountId !== accountId) {
      throw new ForbiddenException('Only the Creator Can Update the Product');
    }

    product.brand = brand ?? product.brand;
    product.referenceNumber = referenceNumber || product.referenceNumber;
    product.releaseDate = releaseDate || product.releaseDate;
    product.countryOrigin = countryOrigin ?? product.countryOrigin;

    return product.save();
  }

  async getProducts(
    currency: CurrencyCode,
    page: number,
    size: number,
    brand?: Brand,
    searchText?: string,
  ): Promise<ProductPrice[]> {
    const productPrices = ProductPrice.createQueryBuilder('productPrice')
      .innerJoinAndSelect('productPrice.product', 'product')
      .where('productPrice.currency = :currency', { currency })
      .orderBy('product.createdAt', 'DESC');

    if (brand != null) {
      productPrices.andWhere('product.brand = :brand', { brand });
    }

    if (searchText != null) {
      productPrices.andWhere(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :searchText', {
            searchText: `%${searchText}%`,
          }).orWhere('product.referenceNumber ILIKE :searchText', {
            searchText: `%${searchText}%`,
          });
        }),
      );
    }

    if (page > 1) {
      productPrices.skip((page - 1) * size);
    }

    return productPrices.take(size).getMany();
  }

  async getProductDetails(
    id: Product['id'],
    currency: CurrencyCode,
  ): Promise<ProductPrice> {
    const productPrice = await ProductPrice.findOne({
      relations: { product: true },
      where: {
        product: { id },
        currency,
      },
    });

    if (productPrice == null) {
      throw new NotFoundException('Product Price Not Found');
    }

    return productPrice;
  }

  async deleteProduct(
    id: Product['id'],
    accountId: Account['id'],
  ): Promise<void> {
    await this.dataSource.transaction(async (entityManager) => {
      const product = await entityManager.findOneBy(Product, {
        id,
        deletedAt: IsNull(),
      });

      if (product == null) {
        throw new NotFoundException('Product Price Not Found');
      }

      if (product.accountId !== accountId) {
        throw new ForbiddenException('Only the Creator Can Delete the Product');
      }

      const productPrices = await entityManager.findBy(ProductPrice, {
        productId: product.id,
        deletedAt: IsNull(),
      });
      entityManager.softRemove([product, ...productPrices]);
    });
  }

  async deleteProductPrice(
    id: ProductPrice['id'],
    productId: Product['id'],
    accountId: Account['id'],
  ): Promise<void> {
    const productPrice = await ProductPrice.findOneBy({
      id,
      productId,
      deletedAt: IsNull(),
    });
    if (productPrice == null) {
      throw new NotFoundException('Product Price Not Found');
    }

    const product = await Product.findOneBy({ id: productPrice.productId });
    if (product == null) {
      throw new NotFoundException('Product Price Not Found');
    }

    if (product.accountId !== accountId) {
      throw new ForbiddenException(
        'Only the Creator Can Delete the Product Price',
      );
    }

    await productPrice.softRemove();
  }
}
