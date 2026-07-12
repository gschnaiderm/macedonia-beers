import { getProductByName } from "@/db/queries";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import type { BeerAttributes } from "@/db/types";

interface PageProps {
  params: Promise<{
    category: string;
    name: string;
  }>;
}

// Generamos metadata dinámica para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.name);
  const product = await getProductByName(decodedName);

  if (!product) {
    return {
      title: "Producto no encontrado | Macedonia",
    };
  }

  return {
    title: `${product.name} | Macedonia Cervezas`,
    description: product.description || `Cerveza artesanal ${product.name}`,
  };
}

export const revalidate = 60; // ISR

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.name);
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  console.log(decodedName);
  const product = await getProductByName(decodedName);

  if (!product) {
    notFound();
  }

  const beerAttrs = product.attributes as BeerAttributes | undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb / Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/productos/${encodeURIComponent(decodedCategory)}`}
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">

          {/* Image Column */}
          <div className="relative flex-col flex bg-zinc-100 rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[700px] shadow-sm">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-lg">
                Sin imagen
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="mt-10 px-2 sm:px-0 lg:mt-0 lg:py-8 flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
              {product.name}
            </h1>

            {/* Badges */}
            {beerAttrs && (
              <div className="flex gap-3 mb-6">
                {beerAttrs.abv && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    {beerAttrs.abv}% ABV
                  </span>
                )}
                {beerAttrs.ibu && (
                  <span className="inline-flex items-center rounded-full bg-zinc-50 px-3 py-1.5 text-sm font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                    {beerAttrs.ibu} IBU
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-zinc prose-lg text-zinc-600">
              <p>{product.description || "Sin descripción disponible para esta cerveza."}</p>
            </div>

            {/* Form */}
            <div className="mt-auto pt-8">
              <AddToCartForm
                productId={product.id}
                productName={product.name}
                stockOptions={product.stockOptions}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
