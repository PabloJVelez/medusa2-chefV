import { Migration } from '@mikro-orm/migrations';

export class Migration20251021022040 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "landing_lead" ("id" text not null, "email" text not null, "firstName" text null, "lastName" text null, "phone" text null, "source" text not null default 'landing_page', "referrer" text null, "utmSource" text null, "utmMedium" text null, "utmCampaign" text null, "utmTerm" text null, "utmContent" text null, "landingPage" text null, "interestedIn" jsonb null, "message" text null, "metadata" jsonb null, "status" text check ("status" in ('new', 'contacted', 'qualified', 'converted', 'unsubscribed', 'spam')) not null default 'new', "convertedAt" timestamptz null, "convertedToEventId" text null, "convertedToOrderId" text null, "emailSentAt" timestamptz null, "followUpCount" integer not null default 0, "lastContactedAt" timestamptz null, "unsubscribedAt" timestamptz null, "notes" text null, "assignedTo" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "landing_lead_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_landing_lead_deleted_at" ON "landing_lead" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "landing_lead" cascade;`);
  }

}
