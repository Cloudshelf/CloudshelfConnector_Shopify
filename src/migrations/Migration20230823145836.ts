import { Migration } from "@mikro-orm/migrations";

export class Migration20230823145836 extends Migration {
  async up(): Promise<void> {
    this.addSql('create extension if not exists "uuid-ossp";');
    this.addSql(
      'create table "shopify_store" ("id" uuid not null default uuid_generate_v4(), constraint "shopify_store_pkey" primary key ("id"));',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "shopify_store" cascade;');
  }
}
