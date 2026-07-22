import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productStock } from "@/db/schema";
import { StockCard } from "./_components/stock-card";
import { AddStockModal } from "./_components/add-stock-modal";
import { PackageSearchIcon } from "lucide-react";

/** Represents a fully hydrated stock row for the UI. */
interface StockRow {
	productId: number;
	productName: string;
	imageUrl: string | null;
	sizeCm3: number;
	quantity: number;
	price: string;
}

export default async function AdminStockPage() {
	// 1. Fetch all stock rows with their product names via a JOIN.
	const stockRows: StockRow[] = await db
		.select({
			productId: productStock.productId,
			productName: products.name,
			imageUrl: products.imageUrl,
			sizeCm3: productStock.sizeCm3,
			quantity: productStock.quantity,
			price: productStock.price,
		})
		.from(productStock)
		.innerJoin(products, eq(productStock.productId, products.id))
		.orderBy(products.name, productStock.sizeCm3);

	// 2. Fetch the product list for the "Add Stock" Combobox.
	const productList = await db
		.select({ id: products.id, name: products.name })
		.from(products)
		.orderBy(products.name);

	return (
		<div>
			{/* Page header */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-semibold tracking-tight text-zinc-900">
						Gestión de Stock
					</h2>
					<p className="text-sm text-muted-foreground">
						{stockRows.length}{" "}
						{stockRows.length === 1 ? "registro" : "registros"} en inventario
					</p>
				</div>
				<AddStockModal products={productList} />
			</div>

			{/* Stock grid */}
			{stockRows.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 text-center">
					<PackageSearchIcon className="size-10 text-zinc-300" />
					<p className="text-sm text-muted-foreground">
						No hay registros de stock todavía.
					</p>
					<p className="text-xs text-muted-foreground">
						Usá el botón &quot;Agregar Stock&quot; para crear el primero.
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{stockRows.map((row) => (
						<StockCard
							key={`${row.productId}-${row.sizeCm3}`}
							productId={row.productId}
							productName={row.productName}
							sizeCm3={row.sizeCm3}
							quantity={row.quantity}
							price={row.price}
							imageUrl={row.imageUrl}
						/>
					))}
				</div>
			)}
		</div>
	);
}
