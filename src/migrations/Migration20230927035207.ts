import { Migration } from '@mikro-orm/migrations';

export class Migration20230927035207 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add column "storefront_token" text not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop column "storefront_token";');
  }

}
