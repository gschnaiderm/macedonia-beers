import { getProductsByCategory, getCategoryBySlug } from "@/db/queries";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  const category = await getCategoryBySlug(decodedCategory);

  if (!category) {
    return {
      title: "Categoría no encontrada | Macedonia",
    };
  }

  return {
    title: `${category.name} | Macedonia`,
    description: category.description || `Explora nuestro catálogo de ${category.name}.`,
  };
}

export const revalidate = 60; // ISR

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);

  // Parallel fetch
  const [category, products] = await Promise.all([
    getCategoryBySlug(decodedCategory),
    getProductsByCategory(decodedCategory)
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-start py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header Section */}
      <div className="max-w-4xl w-full text-center space-y-6 mb-16 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900">
          Nuestras <span className="text-amber-600">{category.name}</span>
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          {category.description || `Descubrí todas nuestras variedades de ${category.name}.`}
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl w-full relative z-10">
        <SectionTitle
          title={`Catálogo de ${category.name}`}
          badge="Catálogo"
        />

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                categoryMetadata={category.metadata as any}
                imageUrl={product.imageUrl}
                stockOptions={product.stockOptions}
                attributes={product.attributes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-sm mt-8">
            <p className="text-zinc-500">
              No hay productos disponibles en esta categoría en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
