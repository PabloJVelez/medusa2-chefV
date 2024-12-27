// Add menuId to chef_event table

import { Migration } from '@mikro-orm/migrations';

export class Migration20241226034819 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "chef_event" add column "templateProductId" text;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "chef_event" drop column "templateProductId";');
  }
}