import { inArray, eq, sql, type InferSelectModel } from "drizzle-orm";
import { db } from "./index";
import { products, productStock } from "./schema";

export type ProductWithStock = InferSelectModel<typeof products> & {
  stockOptions: {
    sizeCm3: number;
    price: number;
  }[];
};

/**
 * Fetches a random list of products along with their available stock sizes and prices.
 * @param limit Amount of products to return
 */
export async function getRandomProducts(limit: number = 3) {
  // 1. Get random products
  const randomProducts = await db
    .select()
    .from(products)
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  if (randomProducts.length === 0) return [];

  const productIds = randomProducts.map((p) => p.id);

  // 2. Fetch stock for these specific products
  const stocks = await db
    .select()
    .from(productStock)
    .where(inArray(productStock.productId, productIds));

  // 3. Format data for the UI
  return randomProducts.map((product) => {
    // Filter stocks belonging to this product that have available quantity
    const availableStock = stocks
      .filter((s) => s.productId === product.id && s.quantity > 0)
      .map(s => ({
        sizeCm3: s.sizeCm3,
        price: parseFloat(s.price)
      }))
      // Order by size ascending
      .sort((a, b) => a.sizeCm3 - b.sizeCm3);

    return {
      ...product,
      stockOptions: availableStock,
    };
  });
}

/**
 * Fetches all products of a specific category along with their available stock sizes and prices.
 * @param category Category of the products to return
 */
export async function getProductsByCategory(
  category: InferSelectModel<typeof products>["category"]
): Promise<ProductWithStock[]> {
  // Get products by category
  const categoryProducts = await db
    .select()
    .from(products)
    .where(eq(products.category, category));

  if (categoryProducts.length === 0) return [];

  const productIds = categoryProducts.map((p) => p.id);

  // Fetch stock for these specific products
  const stocks = await db
    .select()
    .from(productStock)
    .where(inArray(productStock.productId, productIds));

  // Format data for the UI
  return categoryProducts.map((product) => {
    // Filter stocks belonging to this product that have available quantity
    const availableStock = stocks
      .filter((s) => s.productId === product.id && s.quantity > 0)
      .map(s => ({
        sizeCm3: s.sizeCm3,
        price: parseFloat(s.price)
      }))
      // Order by size ascending
      .sort((a, b) => a.sizeCm3 - b.sizeCm3);

    return {
      ...product,
      stockOptions: availableStock,
    };
  });
}
