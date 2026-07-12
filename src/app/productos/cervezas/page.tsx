import { getProductsByCategory } from "@/db/queries";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cervezas | Macedonia",
  description: "Explora nuestra selección de cervezas artesanales. Calidad y variedad en cada pinta.",
};

// Forzar renderizado dinámico o estático según sea necesario.
// Como el catálogo puede cambiar, revalidate en tiempo de construcción o dynamic es útil.
// En este caso confiaremos en el App Router default caching, pero si necesitamos datos siempre frescos:
export const revalidate = 60; // Revalida cada 60 segundos si hay requests

export default async function CervezasPage() {
  // Fetch all products in the "beer" category
  const beers = await getProductsByCategory("beer");

  return (
    <div className="flex flex-col items-center justify-start py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header Section */}
      <div className="max-w-4xl w-full text-center space-y-6 mb-16 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900">
          Nuestras <span className="text-amber-600">Cervezas</span>
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Descubrí todas nuestras variedades. Desde las más suaves y refrescantes hasta las más intensas y amargas. 
          Seleccionadas cuidadosamente para cada paladar.
        </p>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl w-full relative z-10">
        <SectionTitle
          title="Catálogo de cervezas"
          badge="Catálogo"
        />

        {beers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {beers.map((beer) => (
              <ProductCard
                key={beer.id}
                id={beer.id}
                name={beer.name}
                description={beer.description}
                category={beer.category}
                imageUrl={beer.imageUrl}
                stockOptions={beer.stockOptions}
                attributes={beer.attributes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-sm mt-8">
            <p className="text-zinc-500">
              No hay cervezas disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
