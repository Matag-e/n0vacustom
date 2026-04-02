import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FloatingRequestButton() {
  return (
    <Link
      to="/encomenda-especial"
      className="fixed bottom-6 left-6 z-50 bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group border border-white/10 dark:border-black/10"
      aria-label="Encomenda Especial"
    >
      <Search className="w-7 h-7 relative z-10" />
      
      {/* Label Tooltip */}
      <span className="absolute left-full ml-4 bg-white dark:bg-zinc-900 text-black dark:text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-gray-100 dark:border-zinc-800 -translate-x-2 group-hover:translate-x-0">
        Não encontrou sua camisa?
      </span>
    </Link>
  );
}
