CREATE TABLE "sheet_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"tab" text NOT NULL,
	"category" text NOT NULL,
	"group" text,
	"name" text NOT NULL,
	"details" text,
	"sku_id" text,
	"url" text,
	"sheet_price_paise" integer,
	"override_price_paise" integer,
	"in_stock" boolean DEFAULT false NOT NULL,
	"sheet_color" text,
	"sheet_notes" text,
	"sheet_updated_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sheet_products_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"ok" boolean,
	"rows" integer,
	"price_changes" integer,
	"error" text,
	"trigger" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sheet_products_category_idx" ON "sheet_products" USING btree ("category");