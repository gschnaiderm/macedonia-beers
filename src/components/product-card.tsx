import Image from "next/image";
import type { CategoryMetadata } from "@/db/types";

interface StockOption {
  sizeCm3: number;
  price: number;
}

interface ProductCardProps {
  id: number;
  name: string;
  description: string | null;
  categoryMetadata?: CategoryMetadata | null;
  imageUrl: string | null;
  stockOptions: StockOption[];
  attributes: any; // Raw JSONB
}

export function ProductCard({
  name,
  description,
  categoryMetadata,
  imageUrl,
  stockOptions,
  attributes
}: ProductCardProps) {

  // Strategy to render badges based on product category
  const renderBadges = () => {
    if (!categoryMetadata?.attributesSchema || !attributes) return null;
    
    const badges = categoryMetadata.attributesSchema
      .filter(schemaItem => schemaItem.renderAsBadge)
      .map(schemaItem => {
        const val = attributes[schemaItem.key as keyof typeof attributes];
        if (val === undefined || val === null) return null;
        
        return (
          <span key={schemaItem.key} className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            {schemaItem.label}: {val}{schemaItem.unit || ""}
          </span>
        );
      })
      .filter(Boolean);
      
    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {badges}
      </div>
    );
  };

  const hasStock = stockOptions.length > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-red-300">

      {/* Image Container */}
      <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-zinc-900">{name}</h3>

        {renderBadges()}

        <p className="mt-4 text-sm text-zinc-600 line-clamp-3 flex-1">
          {description}
        </p>

        {/* Stock Options Display */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">
            Tamaños disponibles
          </span>
          {hasStock ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {stockOptions.map((opt) => (
                <div key={opt.sizeCm3} className="flex flex-col border border-zinc-200 rounded-md p-2 text-center flex-1 min-w-[80px]">
                  <span className="text-xs text-zinc-500">{opt.sizeCm3} cm³</span>
                  <span className="text-sm font-bold text-red-600">${opt.price.toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <span className="text-sm text-zinc-400 italic">Fuera de stock</span>
            </div>
          )}
        </div>

        <button
          disabled={!hasStock}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${hasStock
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
        >
          {hasStock ? "Ver detalles" : "Actualmente no disponible"}
        </button>
      </div>
    </div>
  );
}
