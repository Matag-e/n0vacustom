import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      <Helmet>
        <title>404 - Página Não Encontrada | NovaCustom</title>
      </Helmet>
      
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon/Visual */}
        <div className="relative">
          <h1 className="text-[150px] font-black text-gray-200 dark:text-zinc-900 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 p-6 rounded-full animate-bounce">
              <Search className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Manto não encontrado!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Parece que essa página saiu de campo. O link pode estar quebrado ou a página foi removida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Página Anterior
          </button>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-[0.3em]">
            NovaCustom &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
