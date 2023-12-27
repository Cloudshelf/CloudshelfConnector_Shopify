import { Migration } from '@mikro-orm/migrations';

export class Migration20231227152145 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" rename column "last_synced_at" to "last_safety_sync";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" rename column "last_safety_sync" to "last_synced_at";');
  }

}
