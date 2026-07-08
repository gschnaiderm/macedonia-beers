import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900">
          Bienvenido a <span className="text-red-600">Macedonia Cervezas</span>
        </h1>

        <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
          Plataforma E-Commerce Híbrida en Desarrollo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 text-left">
          {/* Card: Tienda */}
          <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm hover:shadow-md transition-all hover:border-red-300">
            <div className="h-12 w-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">1. Tienda de Cervezas</h3>
            <p className="text-zinc-600 mb-4">
              Venta de cerveza en diferentes presentaciones y merchandising.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2 list-disc list-inside">
              <li>Manejo de carrito de compras</li>
              <li>Checkout con Mercado Pago</li>
              <li>Actualización de stock transaccional</li>
            </ul>
          </div>

          {/* Card: Alquiler */}
          <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm hover:shadow-md transition-all hover:border-red-300">
            <div className="h-12 w-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">2. Alquiler de Chopperas</h3>
            <p className="text-zinc-600 mb-4">
              Sistema de reservas por fecha con validación de disponibilidad.
            </p>
            <ul className="text-sm text-zinc-500 space-y-2 list-disc list-inside">
              <li>Calendario interactivo con Zonas Horarias (ART)</li>
              <li>Flujo de estados de reserva (Deposit, Delivery)</li>
              <li>Pago de garantía/seña obligatoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
