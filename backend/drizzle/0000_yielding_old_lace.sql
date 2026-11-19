CREATE TYPE "public"."cpu_brand" AS ENUM('Intel', 'AMD');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('DDR4', 'DDR5');--> statement-breakpoint
CREATE TABLE "cpus" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" "cpu_brand" NOT NULL,
	"name" text NOT NULL,
	"socket" text NOT NULL,
	"cores" integer NOT NULL,
	"threads" integer NOT NULL,
	"base_clock_ghz" numeric(4, 2),
	"boost_clock_ghz" numeric(4, 2),
	"tdp_w" integer NOT NULL,
	"memory_types" "memory_type"[] NOT NULL,
	"max_memory_speed_mts" integer,
	"has_integrated_graphics" boolean DEFAULT false NOT NULL,
	"pcie_version" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpus_slug_unique" UNIQUE("slug")
);
