
import { z } from "zod";

/**
 * Schema for adjusting the stock of an existing product_stock row by a delta.
 * A positive delta adds stock; a negative delta subtracts it.
 * Validates productId (composite PK part 1) and sizeCm3 (composite PK part 2).
 * Non-negativity of the resulting stock is enforced at the DB layer.
 */
export const adjustStockSchema = z.object({
	productId: z
		.number({ message: "El ID del producto es obligatorio." })
		.int("El ID del producto debe ser un entero.")
		.positive("El ID del producto debe ser positivo."),
	sizeCm3: z
		.number({ message: "El tamaño es obligatorio." })
		.int("El tamaño debe ser un entero.")
		.min(0, "El tamaño no puede ser negativo."),
	delta: z
		.number({ message: "El ajuste es obligatorio." })
		.int("El ajuste debe ser un número entero.")
		.refine((v) => v !== 0, "El ajuste no puede ser cero."),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

/**
 * Schema for creating a new product_stock row.
 * Validates all fields of the composite-PK table: productId, sizeCm3,
 * quantity, and price.
 */
export const createStockSchema = z.object({
	productId: z
		.number({ message: "Selecciona un producto." })
		.int("El ID del producto debe ser un entero.")
		.positive("El ID del producto debe ser positivo."),
	sizeCm3: z
		.number({ message: "El tamaño es obligatorio." })
		.int("El tamaño debe ser un entero.")
		.min(0, "El tamaño no puede ser negativo."),
	quantity: z
		.number({ message: "La cantidad es obligatoria." })
		.int("La cantidad debe ser un número entero.")
		.min(0, "La cantidad no puede ser negativa."),
	price: z
		.number({ message: "El precio es obligatorio." })
		.min(0, "El precio no puede ser negativo."),
});

export type CreateStockInput = z.infer<typeof createStockSchema>;
