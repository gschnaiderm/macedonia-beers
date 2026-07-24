"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	PlusIcon,
	ChevronsUpDownIcon,
	Loader2Icon,
} from "lucide-react";
import { createProductStock } from "@/actions/stock-actions";
import { createStockSchema } from "@/lib/validations/stock";
import { getErrorMessage } from "@/locales/es/errors";

interface ProductOption {
	id: number;
	name: string;
}

interface AddStockModalProps {
	products: ProductOption[];
}

export function AddStockModal({ products }: AddStockModalProps) {
	const [open, setOpen] = useState(false);
	const [comboboxOpen, setComboboxOpen] = useState(false);

	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
	const [sizeCm3, setSizeCm3] = useState("");
	const [quantity, setQuantity] = useState("");
	const [price, setPrice] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [isPending, startTransition] = useTransition();

	const selectedProduct = products.find((p) => p.id === selectedProductId);

	function resetForm() {
		setSelectedProductId(null);
		setSizeCm3("");
		setQuantity("");
		setPrice("");
		setErrors({});
	}

	function handleSubmit() {
		setErrors({});

		const rawData = {
			productId: selectedProductId ?? undefined,
			sizeCm3: sizeCm3 === "" ? undefined : parseInt(sizeCm3, 10),
			quantity: quantity === "" ? undefined : parseInt(quantity, 10),
			price: price === "" ? undefined : parseFloat(price),
		};

		const parsed = createStockSchema.safeParse(rawData);
		if (!parsed.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0]);
				if (!fieldErrors[key]) {
					fieldErrors[key] = issue.message;
				}
			}
			setErrors(fieldErrors);
			return;
		}

		startTransition(async () => {
			const result = await createProductStock(parsed.data);

			if (result.success) {
				toast.success("Stock creado correctamente.");
				resetForm();
				setOpen(false);
			} else {
				toast.error(getErrorMessage(result.error?.code));
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
			<DialogTrigger
				render={
					<Button size="lg">
						<PlusIcon data-icon="inline-start" className="size-4" />
						Agregar Stock
					</Button>
				}
			/>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nuevo registro de stock</DialogTitle>
					<DialogDescription>
						Agrega una nueva presentación (tamaño y precio) para un producto existente.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					{/* Product Combobox */}
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Producto</label>
						<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
							<PopoverTrigger
								render={
									<Button
										variant="outline"
										className="w-full justify-between font-normal"
									>
										{selectedProduct?.name ?? "Buscar producto..."}
										<ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								}
							/>
							<PopoverContent className="w-[--anchor-width] p-0">
								<Command>
									<CommandInput placeholder="Escribí para buscar..." />
									<CommandList>
										<CommandEmpty>No se encontraron productos.</CommandEmpty>
										<CommandGroup>
											{products.map((product) => (
												<CommandItem
													key={product.id}
													value={product.name}
													data-checked={selectedProductId === product.id}
													onSelect={() => {
														setSelectedProductId(product.id);
														setComboboxOpen(false);
													}}
												>
													{product.name}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
						{errors.productId && (
							<p className="text-xs text-destructive">{errors.productId}</p>
						)}
					</div>

					{/* Size */}
					<div className="space-y-1.5">
						<label htmlFor="new-size" className="text-sm font-medium">
							Tamaño (cm³)
						</label>
						<Input
							id="new-size"
							type="number"
							min={0}
							placeholder="Ej: 500 (0 para sin tamaño)"
							value={sizeCm3}
							onChange={(e) => setSizeCm3(e.target.value)}
							disabled={isPending}
						/>
						{errors.sizeCm3 && (
							<p className="text-xs text-destructive">{errors.sizeCm3}</p>
						)}
					</div>

					{/* Quantity */}
					<div className="space-y-1.5">
						<label htmlFor="new-quantity" className="text-sm font-medium">
							Cantidad
						</label>
						<Input
							id="new-quantity"
							type="number"
							min={0}
							placeholder="Ej: 100"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							disabled={isPending}
						/>
						{errors.quantity && (
							<p className="text-xs text-destructive">{errors.quantity}</p>
						)}
					</div>

					{/* Price */}
					<div className="space-y-1.5">
						<label htmlFor="new-price" className="text-sm font-medium">
							Precio (ARS)
						</label>
						<Input
							id="new-price"
							type="number"
							min={0}
							step="0.01"
							placeholder="Ej: 1500.00"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							disabled={isPending}
						/>
						{errors.price && (
							<p className="text-xs text-destructive">{errors.price}</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button onClick={handleSubmit} disabled={isPending}>
						{isPending ? (
							<Loader2Icon className="size-4 animate-spin" />
						) : (
							<PlusIcon data-icon="inline-start" className="size-4" />
						)}
						Crear
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
