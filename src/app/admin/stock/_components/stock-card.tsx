"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, Loader2Icon, PackageIcon } from "lucide-react";
import { adjustStockByDelta } from "@/actions/stock-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockCardProps {
	productId: number;
	productName: string;
	sizeCm3: number;
	quantity: number;
	price: string;
	imageUrl: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts cm³ to a human-friendly display string. */
function formatSize(sizeCm3: number): string {
	if (sizeCm3 === 0) return "Sin tamaño";
	if (sizeCm3 >= 1000) return `${(sizeCm3 / 1000).toFixed(1)}L`;
	return `${sizeCm3}ml`;
}

/** Parses a raw string into a non-zero integer, or returns null if invalid. */
function parseDelta(raw: string): number | null {
	const value = parseInt(raw, 10);
	if (isNaN(value) || value === 0) return null;
	return value;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StockCard({
	productId,
	productName,
	sizeCm3,
	quantity,
	price,
	imageUrl,
}: StockCardProps) {
	const [currentQuantity, setCurrentQuantity] = useState<number>(quantity);
	const [deltaInput, setDeltaInput] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	const parsedDelta = parseDelta(deltaInput);

	/** Applies a signed delta to the stock, updating optimistically on success. */
	function handleAdjust(delta: number) {
		startTransition(async () => {
			const result = await adjustStockByDelta({ productId, sizeCm3, delta });

			if (result.success) {
				setCurrentQuantity((prev) => prev + delta);
				setDeltaInput("");
				toast.success(
					`Stock ${delta > 0 ? "aumentado" : "reducido"} correctamente.`
				);
			} else {
				toast.error(result.error ?? "Error al ajustar el stock.");
			}
		});
	}

	function handleAdd() {
		const delta = parseDelta(deltaInput);
		if (delta === null || delta <= 0) {
			toast.error("Ingresá un número entero positivo para sumar.");
			return;
		}
		handleAdjust(delta);
	}

	function handleSubtract() {
		const delta = parseDelta(deltaInput);
		if (delta === null || delta <= 0) {
			toast.error("Ingresá un número entero positivo para restar.");
			return;
		}
		handleAdjust(-delta);
	}

	return (
		<Card className="transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start gap-3">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={productName}
							className="size-10 shrink-0 rounded-lg object-cover"
						/>
					) : (
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
							<PackageIcon className="size-5 text-zinc-400" />
						</div>
					)}
					<div className="min-w-0">
						<CardTitle className="truncate">{productName}</CardTitle>
						<CardDescription>{formatSize(sizeCm3)}</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Price row */}
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Precio</span>
					<span className="font-semibold text-zinc-900">
						${parseFloat(price).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
					</span>
				</div>

				{/* Current stock display */}
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Stock actual</span>
					<span
						className={`text-lg font-bold tabular-nums ${currentQuantity === 0 ? "text-red-500" : "text-zinc-900"
							}`}
					>
						{currentQuantity}
					</span>
				</div>

				{/* Adjustment controls */}
				<div className="space-y-2">
					<label
						htmlFor={`delta-${productId}-${sizeCm3}`}
						className="text-xs text-muted-foreground"
					>
						Ajustar cantidad
					</label>
					<div className="flex items-center gap-2">
						<Input
							id={`delta-${productId}-${sizeCm3}`}
							type="number"
							min={1}
							placeholder="0"
							value={deltaInput}
							onChange={(e) => setDeltaInput(e.target.value)}
							className="w-20 text-center"
							disabled={isPending}
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={handleSubtract}
							disabled={isPending || parsedDelta === null || parsedDelta <= 0}
							className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
							aria-label="Restar stock"
						>
							{isPending ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : (
								<MinusIcon className="size-4" />
							)}
						</Button>
						<Button
							size="sm"
							onClick={handleAdd}
							disabled={isPending || parsedDelta === null || parsedDelta <= 0}
							className="shrink-0"
							aria-label="Sumar stock"
						>
							{isPending ? (
								<Loader2Icon className="size-4 animate-spin" />
							) : (
								<PlusIcon className="size-4" />
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
