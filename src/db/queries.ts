import { inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { products, productStock } from "./schema";

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
