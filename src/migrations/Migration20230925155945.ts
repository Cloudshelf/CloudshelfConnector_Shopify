import { Migration } from '@mikro-orm/migrations';

export class Migration20230925155945 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "shopify_store" add constraint "shopify_store_domain_unique" unique ("domain");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "shopify_store" drop constraint "shopify_store_domain_unique";');
  }

}
