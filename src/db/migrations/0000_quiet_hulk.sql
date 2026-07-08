CREATE TYPE "public"."product_category" AS ENUM('beer');--> statement-breakpoint
CREATE TABLE "product_stock" (
	"product_id" integer NOT NULL,
	"size_cm3" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	CONSTRAINT "product_stock_product_id_size_cm3_pk" PRIMARY KEY("product_id","size_cm3")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "product_category" NOT NULL,
	"attributes" jsonb
);
--> statement-breakpoint
ALTER TABLE "product_stock" ADD CONSTRAINT "product_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;