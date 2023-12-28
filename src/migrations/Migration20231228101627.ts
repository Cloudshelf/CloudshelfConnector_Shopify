import { Migration } from '@mikro-orm/migrations';

export class Migration20231228101627 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add column "last_product_sync" timestamptz(0) null, add column "last_product_group_sync" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop column "last_product_sync";');
    this.addSql('alter table "shopify_store" drop column "last_product_group_sync";');
  }

}
