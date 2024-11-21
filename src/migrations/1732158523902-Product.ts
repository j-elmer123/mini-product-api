import { MigrationInterface, QueryRunner } from 'typeorm';

export class Product1732158523902 implements MigrationInterface {
  name = 'Product1732158523902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."product_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "release_date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "account_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daa453ced004cace7c950dace6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_price" ALTER COLUMN "currency" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0da08b762f53700e4f8760a9b5" ON "product_price" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_daa453ced004cace7c950dace6" ON "product_price" ("product_id", "currency") WHERE deleted_at is null`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22cc43e9a74d7498546e9a63e7" ON "product" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c52ec48c7e07ae12d1c3a781d" ON "product" ("reference_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6675123e3d543e03467fd38985" ON "product" ("account_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_6675123e3d543e03467fd389858" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_6675123e3d543e03467fd389858"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6675123e3d543e03467fd38985"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c52ec48c7e07ae12d1c3a781d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_22cc43e9a74d7498546e9a63e7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daa453ced004cace7c950dace6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0da08b762f53700e4f8760a9b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_price" ALTER COLUMN "currency" SET DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_daa453ced004cace7c950dace6" ON "product_price" ("product_id", "currency") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "account_id"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "release_date"`);
    await queryRunner.query(
      `CREATE TYPE "public"."product_type_enum" AS ENUM('WATCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "type" "public"."product_type_enum" NOT NULL DEFAULT 'WATCH'`,
    );
  }
}
