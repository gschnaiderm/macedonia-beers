import { pgTable, serial, varchar, text, integer, numeric, jsonb, pgEnum, primaryKey } from "drizzle-orm/pg-core";

import { ProductsAttributes } from "./types";

export const productCategoryEnum = pgEnum("product_category", ["beer"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: productCategoryEnum("category").notNull(),
  imageUrl: varchar("image_url", { length: 2048 }),
  // Strongly typed dynamic attributes
  attributes: jsonb("attributes").$type<ProductsAttributes>(),
});

export const productStock = pgTable("product_stock", {
  productId: integer("product_id").notNull().references(() => products.id),
  sizeCm3: integer("size_cm3").notNull(), // Use 0 for products without size
  quantity: integer("quantity").notNull().default(0),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.productId, table.sizeCm3] }),
  };
});
