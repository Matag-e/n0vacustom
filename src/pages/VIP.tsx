import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  MessageCircle, 
  Bell, 
  ArrowRight,
  Crown
} from 'lucide-react';

export default function VIP() {
  const handleWhatsAppClick = () => {
    // Disparar evento de Lead para a Meta
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Entrada Grupo WhatsApp VIP',
        content_category: 'VIP'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <Helmet>
        <title>GRUPO VIP | NovaCustom</title>
        <meta name="description" content="Acesse o grupo VIP da NovaCustom e receba promoções e novidades em primeira mão." />
      </Helmet>

      <div className="container mx-auto max-w-2xl text-center">
        {/* Simples e Direto */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-8">
          <Crown className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Comunidade NovaCustom</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-6 text-black">
          GRUPO VIP <br />
          <span className="text-purple-600">NO WHATSAPP</span>
        </h1>

        <p className="text-gray-500 text-lg mb-12 font-medium leading-relaxed">
          Entre para o nosso grupo oficial e receba em primeira mão todas as nossas <strong>promoções, lançamentos e ofertas exclusivas</strong> direto no seu celular.
        </p>

        <div className="space-y-6">
          <a 
            href="https://chat.whatsapp.com/G675nJFbpvFHXCnUzTOzOW?mode=gi_t" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-3 w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 group"
          >
            Entrar no Grupo Agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-black">Novidades</p>
                <p className="text-[10px] text-gray-500 font-medium">Lançamentos semanais</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-black">Comunidade</p>
                <p className="text-[10px] text-gray-500 font-medium">Troque ideias com outros membros</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <MessageCircle className="w-3 h-3" />
          Acesso gratuito e seguro via WhatsApp
        </p>
      </div>
    </div>
  );
}
