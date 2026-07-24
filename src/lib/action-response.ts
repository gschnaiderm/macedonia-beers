/**
 * Shared types and utilities for Server Action responses.
 *
 * This file is importable from both Server and Client components.
 * The backend uses ActionErrorCode + ActionError to describe failures.
 * The frontend uses getErrorMessage() to translate codes into user-facing strings.
 */


export type ActionErrorCode =
	| "NEGATIVE_STOCK_ATTEMPT"
	| "DUPLICATE_PRODUCT_STOCK"
	| "STOCK_NOT_FOUND"
	| "VALIDATION_ERROR"
	| "INTERNAL_SERVER_ERROR";

export interface ActionError {
	code: ActionErrorCode;
	message: string;
	details?: unknown;
}


export interface ActionResponse<T = undefined> {
	success: boolean;
	data?: T;
	error?: ActionError;
}


