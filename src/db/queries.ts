import { inArray, eq, sql, type InferSelectModel } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "./index";
import { products, productStock, categories, users } from "./schema";

export type ProductWithStock = InferSelectModel<typeof products> & {
  categorySlug?: string;
  categoryMetadata?: any; // We'll cast this where needed or import CategoryMetadata
  stockOptions: {
    sizeCm3: number;
    price: number;
  }[];
};

type RawStockRow = InferSelectModel<typeof productStock>;

/**
 * Filters stock rows to only those belonging to a specific product with
 * available quantity > 0, then sorts them by size ascending.
 */
function filterAndSortAvailableStock(
  stocks: RawStockRow[],
  productId: number
): { sizeCm3: number; price: number }[] {
  return stocks
    .filter((s) => s.productId === productId && s.quantity > 0)
    .map((s) => ({ sizeCm3: s.sizeCm3, price: parseFloat(s.price) }))
    .sort((a, b) => a.sizeCm3 - b.sizeCm3);
}

/**
 * Fetches a random list of products along with their available stock sizes and prices.
 * @param limit Amount of products to return
 */
export async function getRandomProducts(limit: number = 3): Promise<ProductWithStock[]> {
  // 1. Get random products
  const randomProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      categoryId: products.categoryId,
      imageUrl: products.imageUrl,
      attributes: products.attributes,
      categoryMetadata: categories.metadata,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
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
  return randomProducts.map((product) => ({
    ...product,
    stockOptions: filterAndSortAvailableStock(stocks, product.id),
  }));
}

/**
 * Fetches all products of a specific category along with their available stock sizes and prices.
 * @param categorySlug Slug of the category to return products for
 */
export async function getProductsByCategory(
  categorySlug: string
): Promise<ProductWithStock[]> {
  // Find category by slug
  const categoryArr = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);

  if (categoryArr.length === 0) return [];
  const categoryId = categoryArr[0].id;

  // Get products by categoryId
  const categoryProducts = await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId));

  if (categoryProducts.length === 0) return [];

  const productIds = categoryProducts.map((p) => p.id);

  // Fetch stock for these specific products
  const stocks = await db
    .select()
    .from(productStock)
    .where(inArray(productStock.productId, productIds));

  // Format data for the UI
  return categoryProducts.map((product) => ({
    ...product,
    stockOptions: filterAndSortAvailableStock(stocks, product.id),
  }));
}

/**
 * Fetches a specific product by its exact name, along with its available stock sizes and prices.
 * @param name Exact name of the product
 */
export async function getProductByName(name: string): Promise<ProductWithStock | null> {
  // 1. Get product by name
  const productArr = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      categoryId: products.categoryId,
      imageUrl: products.imageUrl,
      attributes: products.attributes,
      categoryMetadata: categories.metadata,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.name, name))
    .limit(1);

  if (productArr.length === 0) return null;
  const product = productArr[0];

  // 2. Fetch stock for this specific product
  const stocks = await db
    .select()
    .from(productStock)
    .where(eq(productStock.productId, product.id));

  // 3. Format data for the UI
  return {
    ...product,
    stockOptions: filterAndSortAvailableStock(stocks, product.id),
  };
}

/**
 * Fetches a specific category by its slug.
 * @param slug Slug of the category
 */
export async function getCategoryBySlug(slug: string): Promise<InferSelectModel<typeof categories> | null> {
  const categoryArr = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return categoryArr.length > 0 ? categoryArr[0] : null;
}

/**
 * Fetches all categories, caching the result to avoid unnecessary database hits.
 * Refreshes every hour (3600 seconds).
 */
export const getCachedCategories = unstable_cache(
  async () => {
    return await db.select().from(categories);
  },
  ['categories-list'],
  { revalidate: 3600 }
);

/**
 * Fetches the internal user DB row by their Clerk ID.
 * @param clerkId The user's ID from Clerk Auth
 */
export async function getUserByClerkId(clerkId: string): Promise<InferSelectModel<typeof users> | null> {
  const userArr = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return userArr.length > 0 ? userArr[0] : null;
}
