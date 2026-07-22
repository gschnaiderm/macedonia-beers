"use client";

import { useState } from "react";

interface StockOption {
  sizeCm3: number;
  price: number;
}

interface AddToCartFormProps {
  productId: number;
  productName: string;
  stockOptions: StockOption[];
}

export function AddToCartForm({ productId, productName, stockOptions }: AddToCartFormProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(
    stockOptions.length > 0 ? stockOptions[0].sizeCm3 : null
  );
  const [quantity, setQuantity] = useState<number>(1);

  const hasStock = stockOptions.length > 0;

  if (!hasStock) {
    return (
      <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
        <p className="text-zinc-500 font-medium">Actualmente no disponible</p>
      </div>
    );
  }

  const currentOption = stockOptions.find(opt => opt.sizeCm3 === selectedSize) || stockOptions[0];
  const totalPrice = currentOption ? currentOption.price * quantity : 0;

  const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity(prev => prev + 1);

  const handleAddToCart = () => {
    // Aquí implementaremos la lógica del carrito más adelante
    console.log("Añadido al carrito:", {
      productId,
      productName,
      sizeCm3: selectedSize,
      quantity,
      totalPrice
    });
    alert(`Añadiste ${quantity}x ${productName} (${selectedSize} cm³) al carrito.`);
  };

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Selector de tamaño */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Tamaño (cm³)</h3>
        <div className="flex flex-wrap gap-3">
          {stockOptions.map((opt) => {
            const isSelected = selectedSize === opt.sizeCm3;
            return (
              <button
                key={opt.sizeCm3}
                onClick={() => setSelectedSize(opt.sizeCm3)}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl border p-3 min-w-[90px] transition-all
                  ${isSelected
                    ? "border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                  }
                `}
              >
                <span className="text-sm font-bold">{opt.sizeCm3}</span>
                <span className="text-xs mt-1 font-medium opacity-90">${opt.price.toLocaleString("es-AR")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input de cantidad y precio */}
      <div className="flex items-end justify-between border-t border-zinc-100 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Cantidad</h3>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 max-w-fit shadow-sm">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center text-sm font-bold text-zinc-900 focus:outline-none"
              min={1}
            />
            <button
              onClick={handleIncrease}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Precio Total</span>
          <span className="text-3xl font-bold text-red-600">${totalPrice.toLocaleString("es-AR")}</span>
        </div>
      </div>

      {/* Botón de Añadir */}
      <button
        onClick={handleAddToCart}
        className="w-full mt-2 rounded-xl bg-red-600 px-6 py-4 text-white font-bold text-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        Añadir al carrito
      </button>
    </div>
  );
}
