import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FloatingRequestButton() {
  return (
    <Link
      to="/encomenda-especial"
      className="fixed bottom-6 left-6 z-50 bg-black dark:bg-white text-white dark:text-black pl-4 pr-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 group border border-white/10 dark:border-black/10"
      aria-label="Encomenda Especial"
    >
      <div className="bg-primary/20 p-1.5 rounded-full">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">
        Encomenda Especial
      </span>

      {/* Ripple Effect */}
      <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></span>
    </Link>
  );
}
