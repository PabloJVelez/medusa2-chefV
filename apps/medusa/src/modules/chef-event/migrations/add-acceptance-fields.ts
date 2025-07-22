import { Migration } from '@mikro-orm/migrations';

export class Migration20250608201445 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "chef_event" ADD COLUMN "productId" text null;`);
    this.addSql(`ALTER TABLE "chef_event" ADD COLUMN "acceptedAt" timestamptz null;`);
    this.addSql(`ALTER TABLE "chef_event" ADD COLUMN "acceptedBy" text null;`);
    this.addSql(`ALTER TABLE "chef_event" ADD COLUMN "rejectionReason" text null;`);
    this.addSql(`ALTER TABLE "chef_event" ADD COLUMN "chefNotes" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "chef_event" DROP COLUMN "productId";`);
    this.addSql(`ALTER TABLE "chef_event" DROP COLUMN "acceptedAt";`);
    this.addSql(`ALTER TABLE "chef_event" DROP COLUMN "acceptedBy";`);
    this.addSql(`ALTER TABLE "chef_event" DROP COLUMN "rejectionReason";`);
    this.addSql(`ALTER TABLE "chef_event" DROP COLUMN "chefNotes";`);
  }

} 