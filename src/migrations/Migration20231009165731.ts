import { Migration } from '@mikro-orm/migrations';

export class Migration20231009165731 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add column "last_synced_at" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop column "last_synced_at";');
  }

}
