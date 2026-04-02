import { MessageCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RequestProductCard() {
  return (
    <div className="group relative bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary/50 hover:bg-white dark:hover:bg-black min-h-[400px]">
      <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
        <Search className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors" />
      </div>
      
      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
        Não encontrou o que procurava?
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-[240px] leading-relaxed">
        Nós podemos encomendar qualquer manto exclusivo para você.
      </p>
      
      <Link 
        to="/encomenda-especial"
        className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20"
      >
        <MessageCircle className="w-4 h-4" />
        Fazer Encomenda
      </Link>
      
      <div className="absolute top-4 right-4">
        <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">
          Personalizado
        </span>
      </div>
    </div>
  );
}
