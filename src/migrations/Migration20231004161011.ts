import { Migration } from '@mikro-orm/migrations';

export class Migration20231004161011 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "bulk_operation" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz(0) not null default now(), "updated_at" timestamptz(0) not null default now(), "domain" text not null, "shopify_bulk_op_id" text not null, "data_url" text null, "started_at" timestamptz(0) null, "ended_at" timestamptz(0) null, "status" text not null default \'\', "type" text check ("type" in (\'ProductGroupSync\', \'ProductSync\')) not null, "explicit_ids" text[] not null default \'{}\', constraint "bulk_operation_pkey" primary key ("id"));');
    this.addSql('alter table "bulk_operation" add constraint "bulk_operation_shopify_bulk_op_id_unique" unique ("shopify_bulk_op_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "bulk_operation" cascade;');
  }

}
