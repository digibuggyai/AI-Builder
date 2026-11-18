CREATE TYPE "public"."form_factor" AS ENUM('E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX');--> statement-breakpoint
CREATE TYPE "public"."part_category" AS ENUM('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case', 'monitor');--> statement-breakpoint
CREATE TYPE "public"."gpu_chip_maker" AS ENUM('NVIDIA', 'AMD', 'Intel');--> statement-breakpoint
CREATE TYPE "public"."storage_type" AS ENUM('NVMe', 'SATA SSD', 'HDD');--> statement-breakpoint
CREATE TYPE "public"."psu_efficiency" AS ENUM('80+ White', '80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium');--> statement-breakpoint
CREATE TYPE "public"."psu_form_factor" AS ENUM('ATX', 'SFX');--> statement-breakpoint
CREATE TYPE "public"."psu_modular" AS ENUM('Full', 'Semi', 'Non');--> statement-breakpoint
CREATE TYPE "public"."cooler_type" AS ENUM('Air', 'Liquid');--> statement-breakpoint
CREATE TYPE "public"."panel_type" AS ENUM('IPS', 'VA', 'TN', 'OLED');--> statement-breakpoint
CREATE TABLE "gpus" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"chip_maker" "gpu_chip_maker" NOT NULL,
	"chipset" text NOT NULL,
	"vram_gb" integer NOT NULL,
	"length_mm" integer NOT NULL,
	"slot_width" numeric(2, 1),
	"tdp_w" integer NOT NULL,
	"recommended_psu_w" integer NOT NULL,
	"power_connectors" text,
	"pcie_version" integer NOT NULL,
	CONSTRAINT "gpus_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "motherboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"socket" text NOT NULL,
	"chipset" text NOT NULL,
	"form_factor" "form_factor" NOT NULL,
	"memory_type" "memory_type" NOT NULL,
	"ram_slots" integer NOT NULL,
	"max_ram_gb" integer NOT NULL,
	"max_ram_speed_mts" integer,
	"m2_slots" integer NOT NULL,
	"sata_ports" integer NOT NULL,
	"pcie_version" integer NOT NULL,
	"has_wifi" boolean DEFAULT false NOT NULL,
	CONSTRAINT "motherboards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ram_kits" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"memory_type" "memory_type" NOT NULL,
	"modules" integer NOT NULL,
	"capacity_gb" integer NOT NULL,
	"speed_mts" integer NOT NULL,
	"cas_latency" integer,
	"height_mm" integer,
	"rgb" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ram_kits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" "storage_type" NOT NULL,
	"capacity_gb" integer NOT NULL,
	"pcie_version" integer,
	"read_mbps" integer,
	"write_mbps" integer,
	CONSTRAINT "storage_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "psus" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"wattage" integer NOT NULL,
	"efficiency" "psu_efficiency" NOT NULL,
	"modular" "psu_modular" NOT NULL,
	"form_factor" "psu_form_factor" DEFAULT 'ATX' NOT NULL,
	"has_12v_2x6" boolean DEFAULT false NOT NULL,
	CONSTRAINT "psus_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coolers" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" "cooler_type" NOT NULL,
	"sockets" text[] NOT NULL,
	"tdp_rating_w" integer NOT NULL,
	"height_mm" integer,
	"radiator_mm" integer,
	CONSTRAINT "coolers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"motherboard_support" "form_factor"[] NOT NULL,
	"psu_support" "psu_form_factor"[] NOT NULL,
	"max_gpu_length_mm" integer NOT NULL,
	"max_cooler_height_mm" integer NOT NULL,
	"radiator_support_mm" integer[] NOT NULL,
	"drives_2_5" integer DEFAULT 0 NOT NULL,
	"drives_3_5" integer DEFAULT 0 NOT NULL,
	"color" text,
	CONSTRAINT "cases_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"size_inch" numeric(3, 1) NOT NULL,
	"width_px" integer NOT NULL,
	"height_px" integer NOT NULL,
	"refresh_hz" integer NOT NULL,
	"panel" "panel_type" NOT NULL,
	"response_ms" numeric(3, 1),
	CONSTRAINT "monitors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_category" "part_category" NOT NULL,
	"part_id" integer NOT NULL,
	"retailer_id" integer NOT NULL,
	"url" text NOT NULL,
	"price_paise" integer,
	"in_stock" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"price_paise" integer NOT NULL,
	"in_stock" boolean NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retailers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "retailers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "build_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"build_id" uuid NOT NULL,
	"part_category" "part_category" NOT NULL,
	"part_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_paise" integer
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"mode" text NOT NULL,
	"use_case" text,
	"budget_paise" integer,
	"total_paise" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_retailer_id_retailers_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_items" ADD CONSTRAINT "build_items_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listings_retailer_url_idx" ON "listings" USING btree ("retailer_id","url");--> statement-breakpoint
CREATE INDEX "listings_part_idx" ON "listings" USING btree ("part_category","part_id");--> statement-breakpoint
CREATE INDEX "price_history_listing_time_idx" ON "price_history" USING btree ("listing_id","recorded_at");--> statement-breakpoint
CREATE INDEX "build_items_build_idx" ON "build_items" USING btree ("build_id");