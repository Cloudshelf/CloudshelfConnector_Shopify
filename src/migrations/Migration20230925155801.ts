import { Migration } from '@mikro-orm/migrations';

export class Migration20230925155801 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add column "domain" text not null, add column "access_token" text not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop column "domain";');
    this.addSql('alter table "shopify_store" drop column "access_token";');
  }

}
