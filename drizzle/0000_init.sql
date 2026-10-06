CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"pack_size" numeric(14, 4) DEFAULT '1' NOT NULL,
	"pack_price" numeric(14, 2),
	"stock" numeric(14, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materials_pack_size_pos" CHECK ("materials"."pack_size" > 0),
	CONSTRAINT "materials_stock_nonneg" CHECK ("materials"."stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit" text DEFAULT 'шт' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"qty_per_unit" numeric(14, 4) NOT NULL,
	"waste_pct" numeric(6, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "recipe_items_qty_pos" CHECK ("recipe_items"."qty_per_unit" > 0),
	CONSTRAINT "recipe_items_waste_range" CHECK ("recipe_items"."waste_pct" >= 0 AND "recipe_items"."waste_pct" < 1000)
);
--> statement-breakpoint
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "materials_name_uq" ON "materials" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_uq" ON "products" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_items_product_material_uq" ON "recipe_items" USING btree ("product_id","material_id");