import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import BaseEntity from '../abstracts/BaseEntity';
import Brand from 'src/enums/Brand';
import CountryCode from 'src/enums/CountryCode';
import ProductPrice from './ProductPrice';
import Account from './Account';

@Entity()
export default class Product extends BaseEntity {
  @Index()
  @Column({ type: 'text', update: false })
  name!: string;

  @Index()
  @Column({ type: 'enum', enum: Brand })
  brand!: Brand;

  @Index()
  @Column({ type: 'text', unique: true })
  referenceNumber!: string;

  @Column({ type: 'date' })
  releaseDate!: string;

  @Column({ type: 'enum', enum: CountryCode })
  countryOrigin!: CountryCode;

  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices!: ProductPrice[];

  @Index()
  @Column({ type: 'int', update: false })
  accountId!: Account['id'];

  @ManyToOne(() => Account)
  @JoinColumn()
  account!: Account;

  static new(
    name: string,
    brand: Brand,
    referenceNumber: string,
    releaseDate: string,
    countryOrigin: CountryCode,
    accountId: Account['id'],
  ): Product {
    const product = new Product();
    product.name = name;
    product.brand = brand;
    product.referenceNumber = referenceNumber;
    product.releaseDate = releaseDate;
    product.countryOrigin = countryOrigin;
    product.accountId = accountId;

    return product;
  }
}
