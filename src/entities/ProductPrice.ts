import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import BaseEntity from '../abstracts/BaseEntity';
import Product from './Product';
import CurrencyCode from 'src/enums/CurrencyCode';

@Entity()
@Index(['productId', 'currency'], { unique: true, where: 'deleted_at is null' })
export default class ProductPrice extends BaseEntity {
  @Index()
  @Column({ type: 'int', update: false })
  productId!: Product['id'];

  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn()
  product!: Product;

  @Column({ type: 'enum', enum: CurrencyCode, update: false })
  currency!: CurrencyCode;

  @Column({ type: 'numeric', precision: 17, scale: 2, update: false })
  price!: number;

  @DeleteDateColumn()
  deletedAt!: Date;

  static new(
    productId: Product['id'],
    price: number,
    currency: CurrencyCode = CurrencyCode.US_DOLLAR,
  ): ProductPrice {
    const productPrice = new ProductPrice();
    productPrice.productId = productId;
    productPrice.price = price;
    productPrice.currency = currency;

    return productPrice;
  }
}
