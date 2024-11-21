import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1732123177505 implements MigrationInterface {
  name = 'Initial1732123177505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_type_enum" AS ENUM('WATCH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_brand_enum" AS ENUM('ROLEX', 'HUBLOT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_country_origin_enum" AS ENUM('CAN', 'IDN', 'SGP', 'USA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "type" "public"."product_type_enum" NOT NULL DEFAULT 'WATCH', "brand" "public"."product_brand_enum" NOT NULL, "reference_number" text NOT NULL, "country_origin" "public"."product_country_origin_enum" NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_8c52ec48c7e07ae12d1c3a781d3" UNIQUE ("reference_number"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_730b1714ac572fdcc90016ec44" ON "product" ("brand") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_price_currency_enum" AS ENUM('AUD', 'GBP', 'CAD', 'SGD', 'USD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_price" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" integer NOT NULL, "currency" "public"."product_price_currency_enum" NOT NULL DEFAULT 'USD', "price" numeric(2) NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_039c4320ccd5ede07440f499268" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_daa453ced004cace7c950dace6" ON "product_price" ("product_id", "currency") WHERE deleted_at is null`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "username" text NOT NULL, "password" text NOT NULL, "password_iv" text NOT NULL, "password_tag" text NOT NULL, "token_version" integer NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_price" ADD CONSTRAINT "FK_0da08b762f53700e4f8760a9b5c" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_price" DROP CONSTRAINT "FK_0da08b762f53700e4f8760a9b5c"`,
    );
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daa453ced004cace7c950dace6"`,
    );
    await queryRunner.query(`DROP TABLE "product_price"`);
    await queryRunner.query(`DROP TYPE "public"."product_price_currency_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_730b1714ac572fdcc90016ec44"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TYPE "public"."product_country_origin_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_brand_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_type_enum"`);
  }
}
