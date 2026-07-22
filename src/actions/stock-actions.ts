"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { productStock } from "@/db/schema";
import {
	adjustStockSchema,
	createStockSchema,
	type AdjustStockInput,
	type CreateStockInput,
} from "@/lib/validations/stock";
import { sql } from "drizzle-orm";
import type { ZodSchema } from "zod";


const ADMIN_STOCK_PATH = "/admin/stock";


export interface ActionResponse<T = undefined> {
	success: boolean;
	data?: T;
	error?: string;
}

// Auxiliary functions

/** Parses and validates raw input against a Zod schema. Returns a typed error on failure. */
function parseInput<T>(
	schema: ZodSchema<T>,
	raw: unknown
): { success: true; data: T } | { success: false; error: string } {
	const result = schema.safeParse(raw);
	if (!result.success) {
		return {
			success: false,
			error: result.error.issues[0]?.message ?? "Datos inválidos.",
		};
	}
	return { success: true, data: result.data };
}

/** Returns true if a DB error is a unique-constraint violation on the composite PK. */
function isDuplicateKeyError(err: unknown): boolean {
	return err instanceof Error && err.message.includes("duplicate key");
}

/** Returns true if a DB error is a check-constraint violation for quantity. */
function isCheckConstraintError(err: unknown): boolean {
	return err instanceof Error && err.message.includes("quantity_chk");
}


/**
 * Applies a signed delta to the stock quantity for a specific composite-PK row.
 * Relies on the database CHECK constraint "quantity_chk" to prevent negative stock.
 * Returns true if the row was updated, false if it wasn't found.
 * Throws an error if the constraint is violated.
 */
async function dbAdjustStockByDelta(
	productId: number,
	sizeCm3: number,
	delta: number
): Promise<boolean> {
	const updated = await db
		.update(productStock)
		.set({ quantity: sql`${productStock.quantity} + ${delta}` })
		.where(
			and(
				eq(productStock.productId, productId),
				eq(productStock.sizeCm3, sizeCm3)
			)
		)
		.returning({ productId: productStock.productId });

	return updated.length > 0;
}

/** Inserts a new product_stock row. Throws on duplicate-key or other DB errors. */
async function dbInsertProductStock(
	productId: number,
	sizeCm3: number,
	quantity: number,
	price: number
): Promise<void> {
	await db.insert(productStock).values({
		productId,
		sizeCm3,
		quantity,
		price: price.toFixed(2),
	});
}

// Server Actions

/**
 * Adjusts the stock quantity of an existing product_stock row by a signed delta.
 * Rejects the operation if the resulting quantity would go below zero.
 */
export async function adjustStockByDelta(
	raw: AdjustStockInput
): Promise<ActionResponse> {
	const parsed = parseInput(adjustStockSchema, raw);
	if (!parsed.success) return { success: false, error: parsed.error };

	const { productId, sizeCm3, delta } = parsed.data;

	try {
		const found = await dbAdjustStockByDelta(productId, sizeCm3, delta);

		if (!found) {
			return { success: false, error: "No se encontró el registro de stock." };
		}

		revalidatePath(ADMIN_STOCK_PATH);
		return { success: true };
	} catch (err: unknown) {
		if (isCheckConstraintError(err)) {
			return {
				success: false,
				error: "Stock insuficiente: no se puede dejar el stock en negativo.",
			};
		}
		console.error("[adjustStockByDelta]", err);
		return { success: false, error: "Error al ajustar el stock." };
	}
}

/**
 * Creates a new product_stock row (a new size/price variant for a product).
 * Fails gracefully if the composite PK already exists.
 */
export async function createProductStock(
	raw: CreateStockInput
): Promise<ActionResponse> {
	const parsed = parseInput(createStockSchema, raw);
	if (!parsed.success) return { success: false, error: parsed.error };

	const { productId, sizeCm3, quantity, price } = parsed.data;

	try {
		await dbInsertProductStock(productId, sizeCm3, quantity, price);
		revalidatePath(ADMIN_STOCK_PATH);
		return { success: true };
	} catch (err: unknown) {
		if (isDuplicateKeyError(err)) {
			return { success: false, error: "Ya existe un registro con ese producto y tamaño." };
		}
		console.error("[createProductStock]", err);
		return { success: false, error: "Error al crear el registro de stock." };
	}
}
