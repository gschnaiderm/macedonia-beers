import { getRandomProducts } from "@/db/queries";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";

// Force this page to render dynamically on the server
// so the random beer selection changes on every request.
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Query 3 random products directly from the Server Component (0 latency)
  const randomProducts = await getRandomProducts(3);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 min-h-screen">

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center space-y-8 mb-20 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900">
          Bienvenido a <span className="text-red-700">Macedonia</span>
        </h1>

        <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
          Explora nuestra selección de cervezas artesanales. Calidad, variedad y el mejor sabor directo a tu vaso.
        </p>
      </div>

      {/* Random Products Grid */}
      <div className="max-w-6xl w-full relative z-10">
        <SectionTitle
          title="Nuestros productos"
          badge="En Stock"
        />

        {randomProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                category={product.category}
                imageUrl={product.imageUrl}
                stockOptions={product.stockOptions}
                attributes={product.attributes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-sm">
            <p className="text-zinc-500">
              No hay productos disponibles en este momento. Vuelve a revisar más tarde.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
