import { Migration } from '@mikro-orm/migrations';

export class Migration20260115223449 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "chef_event" add column if not exists "tipAmount" numeric null, add column if not exists "tipMethod" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "chef_event" drop column if exists "tipAmount", drop column if exists "tipMethod";`);
  }

}
