import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260809145053 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "artisan_pricing" ("id" text not null, "variant_id" text null, "artisan_floor_price" integer not null, "regional_multiplier" integer not null default 1, "craft_category" text null, "calculated_final_price" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "artisan_pricing_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_artisan_pricing_deleted_at" ON "artisan_pricing" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "artisan_pricing" cascade;`);
  }

}
