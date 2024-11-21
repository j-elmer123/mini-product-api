import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductPricePrecision1732160429114 implements MigrationInterface {
  name = 'ProductPricePrecision1732160429114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_price" ALTER COLUMN "price" TYPE numeric(17,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_price" ALTER COLUMN "price" TYPE numeric(2,0)`,
    );
  }
}
