import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function WhatsAppButton() {
  const location = useLocation();
  const phoneNumber = '5511963268510';
  
  // Define a mensagem baseada na página atual
  const getMessage = () => {
    const isProductPage = location.pathname.startsWith('/product/');
    const currentUrl = window.location.href;

    if (isProductPage) {
      return `Olá! Estou vendo este produto e gostaria de tirar uma dúvida: ${currentUrl}`;
    }

    if (location.pathname === '/cart') {
      return 'Olá! Estou com uma dúvida sobre os itens no meu carrinho.';
    }

    if (location.pathname === '/checkout') {
      return 'Olá! Estou finalizando meu pedido e gostaria de uma ajuda.';
    }

    return 'Olá! Gostaria de tirar uma dúvida sobre a NovaCustom.';
  };

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(getMessage())}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
      
      <MessageCircle className="w-8 h-8 relative z-10" fill="white" />
      
      {/* Label Tooltip */}
      <span className="absolute right-full mr-4 bg-white text-black text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-gray-100 translate-x-2 group-hover:translate-x-0">
        Suporte Online
      </span>
    </a>
  );
}
