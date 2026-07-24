import { pgTable, serial, varchar, text, integer, numeric, jsonb, primaryKey, timestamp, check, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { ProductsAttributes, CategoryMetadata } from "./types";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  // Configuración adicional de la categoría (ej: qué atributos requiere, qué imagen usar)
  metadata: jsonb("metadata").$type<CategoryMetadata>(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").notNull().references(() => categories.id),
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
    quantityCheck: check("quantity_chk", sql`${table.quantity} >= 0`),
  };
});

export const equipments = pgTable("equipments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dailyPrice: numeric("daily_price", { precision: 10, scale: 2 }).notNull(),
  deposit: numeric("deposit", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 2048 }),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const rentalStatuses = [
  "pending_payment", 
  "reserved", 
  "delivered", 
  "returned_ok", 
  "deposit_retained",
  "cancelled"
] as const;

export const equipmentRentals = pgTable("equipment_rentals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  equipmentId: integer("equipment_id").notNull().references(() => equipments.id),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: varchar("status", { enum: rentalStatuses, length: 50 }).notNull().default("pending_payment"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
