CREATE TABLE "equipment_rentals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"equipment_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'pending_payment' NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"deposit_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"daily_price" numeric(10, 2) NOT NULL,
	"deposit" numeric(10, 2) NOT NULL,
	"image_url" varchar(2048),
	"is_available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_equipment_id_equipments_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipments"("id") ON DELETE no action ON UPDATE no action;