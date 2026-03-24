import { useState, useEffect } from 'react';
import { X, Truck, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShippingNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal in this session
    const hasSeenNotice = localStorage.getItem('shipping-notice-seen');
    if (!hasSeenNotice) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('shipping-notice-seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-zinc-800">
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Aviso de Entrega</h2>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Informação Importante</p>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Para garantir a melhor qualidade e variedade, trabalhamos com dois fluxos de entrega em nossa loja:
          </p>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4 p-5 rounded-3xl bg-green-50/30 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-green-500 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-[0.2em] mb-1">Pronta Entrega (Nacional)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entrega rápida em <span className="text-green-600 dark:text-green-400 font-black">10 a 15 dias úteis</span>.</p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-primary shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-[0.2em] mb-1">Importação (Sob Encomenda)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mantos exclusivos com entrega em <span className="text-primary font-black">30 a 45 dias</span>.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
          >
            Entendi e desejo continuar
          </button>
          
          <p className="text-center mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Dúvidas? Entre em contato via WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
