import { useEffect, useState } from 'react';

const brands = [
  "NIKE", "ADIDAS", "PUMA", "UMBRO", "KAPPA", "NB", "LE COQ SPORTIF", "MACRON"
];

export function BrandTicker() {
  return (
    <div className="bg-black text-white py-4 overflow-hidden border-t border-gray-800 border-b border-gray-800 relative z-20">
      <div className="flex w-[200%] animate-scroll">
        {/* First set of brands */}
        <div className="flex w-1/2 justify-around items-center px-8">
          {brands.map((brand, index) => (
            <span key={`1-${index}`} className="text-sm md:text-base font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors cursor-default whitespace-nowrap">
              {brand}
            </span>
          ))}
        </div>
        {/* Second set for infinite scroll effect */}
        <div className="flex w-1/2 justify-around items-center px-8" aria-hidden="true">
          {brands.map((brand, index) => (
            <span key={`2-${index}`} className="text-sm md:text-base font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors cursor-default whitespace-nowrap">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
