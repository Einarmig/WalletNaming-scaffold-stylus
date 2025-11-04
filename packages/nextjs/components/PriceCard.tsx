import React from "react";

interface PriceCardProps {
  symbol: string;
  price: string;
  amount: string;
  totalUsd: string;
  isLoading: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({ symbol, price, amount, totalUsd, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E]">
        <div className="bg-base-100 rounded-2xl p-8 backdrop-blur-md">
          <div className="animate-pulse">
            <div className="h-6 bg-base-300 rounded w-20 mb-3"></div>
            <div className="h-10 bg-base-300 rounded w-32 mb-3"></div>
            <div className="h-4 bg-base-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-[#3283EB] to-[#E3066E] hover:shadow-lg hover:shadow-[#E3066E]/20 transition-all duration-300">
      <div className="bg-base-100 rounded-2xl p-8 backdrop-blur-md h-full flex flex-col">
        {/* Header: Precio unitario (izquierda) y Balance (derecha) */}
        <div className="flex justify-between items-center text-xs text-base-content/60 mb-6">
          <span className="font-medium">
            {symbol}/USD: ${price}
          </span>
          <span className="font-medium">
            Balance: {amount} {symbol}
          </span>
        </div>

        {/* Valor Total en USD - DESTACADO */}
        <div className="flex-1 flex items-center justify-center">
          <p
            className="text-6xl font-bold bg-gradient-to-r from-[#3283EB] to-[#E3066E] bg-clip-text text-transparent"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            ${totalUsd}
          </p>
        </div>

        {/* Footer: Nombre del token */}
        <div className="text-center text-sm text-base-content/70 mt-6">
          {symbol === "ARB" ? "🔷 Arbitrum" : "Ξ Ethereum"}
        </div>
      </div>
    </div>
  );
};
