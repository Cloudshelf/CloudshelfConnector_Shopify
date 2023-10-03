import { Migration } from '@mikro-orm/migrations';

export class Migration20230927133959 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" alter column "storefront_token" type text using ("storefront_token"::text);');
    this.addSql('alter table "shopify_store" alter column "storefront_token" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" alter column "storefront_token" type text using ("storefront_token"::text);');
    this.addSql('alter table "shopify_store" alter column "storefront_token" set not null;');
  }

}
