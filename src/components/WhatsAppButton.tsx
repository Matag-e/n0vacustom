import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '5511991814636';
  const message = 'Olá! Gostaria de tirar uma dúvida sobre a NovaCustom.';

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" fill="white" />
      <span className="absolute right-full mr-3 bg-black text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale Conosco
      </span>
    </a>
  );
}
