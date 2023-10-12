import { Migration } from '@mikro-orm/migrations';

export class Migration20231006150135 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "bulk_operation" add column "install_style_sync" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "bulk_operation" drop column "install_style_sync";');
  }

}
