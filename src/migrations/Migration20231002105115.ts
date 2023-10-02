import { Migration } from '@mikro-orm/migrations';

export class Migration20231002105115 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add column "scopes" text[] not null default \'{}\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop column "scopes";');
  }

}
