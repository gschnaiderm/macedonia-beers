import { ActionErrorCode } from "@/lib/action-response";

const ERROR_MESSAGES_ES: Record<ActionErrorCode, string> = {
	NEGATIVE_STOCK_ATTEMPT: "El stock no puede quedar en negativo.",
	DUPLICATE_PRODUCT_STOCK: "Ya existe un registro con ese producto y tamaño.",
	STOCK_NOT_FOUND: "No se encontró el registro de stock.",
	VALIDATION_ERROR: "Los datos ingresados no son válidos.",
	INTERNAL_SERVER_ERROR: "Ocurrió un error inesperado. Intentá de nuevo más tarde.",
	UNAUTHORIZED: "Debes iniciar sesión para realizar esta acción.",
	EQUIPMENT_UNAVAILABLE: "El equipamiento ya no se encuentra disponible para esas fechas.",
	INVALID_DATES: "Las fechas seleccionadas no son válidas.",
	EQUIPMENT_NOT_FOUND: "No se encontró el equipamiento solicitado.",
};

const DEFAULT_ERROR_MESSAGE = "Ocurrió un error inesperado. Intentá de nuevo más tarde.";

/**
 * Traduce un ActionErrorCode en un mensaje amigable para el usuario en español.
 * Si el código es desconocido o undefined, devuelve un mensaje genérico
 * asegurando que la UI nunca dependa del texto original del backend.
 */
export function getErrorMessage(code?: ActionErrorCode): string {
	if (!code) return DEFAULT_ERROR_MESSAGE;
	return ERROR_MESSAGES_ES[code] ?? DEFAULT_ERROR_MESSAGE;
}
