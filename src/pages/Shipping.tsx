import { Truck, Clock, ShieldCheck, Mail, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

export default function Shipping() {
  const sections = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Prazos de Postagem",
      content: "Após a confirmação do pagamento, levamos de 2 a 5 dias úteis para processar seu pedido, realizar a conferência de qualidade e fazer a postagem. Para produtos personalizados (nome e número), o prazo pode se estender por mais 2 dias úteis devido ao processo artesanal de aplicação."
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Prazos de Entrega",
      content: (
        <div className="space-y-3">
          <p>Trabalhamos com dois tipos de estoque:</p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span><strong>Estoque Nacional:</strong> 10 a 15 dias úteis.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span><strong>Importação Direta:</strong> 30 a 45 dias.</span>
            </li>
          </ul>
          <p className="text-xs text-gray-400 italic">O prazo total é a soma do tempo de processamento + o tempo de transporte até sua região.</p>
        </div>
      )
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Rastreamento",
      content: "Você receberá o código de rastreamento automaticamente por e-mail e WhatsApp assim que o pedido for despachado. Também é possível acompanhar o status do seu pedido diretamente na sua conta em nosso site, na seção 'Meus Pedidos'."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Garantia de Entrega",
      content: "Todos os nossos envios possuem seguro contra extravio ou roubo. Caso seu pedido seja extraviado pelos Correios, nós enviamos um novo produto sem custo adicional ou realizamos o estorno total do valor pago."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Endereço e Destinatário",
      content: "Certifique-se de que haverá alguém no local para receber o pacote. Os Correios realizam até 3 tentativas de entrega. Em caso de endereço incorreto preenchido pelo cliente, o custo do reenvio será de responsabilidade do comprador."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Dúvidas?",
      content: "Se tiver qualquer dúvida sobre o status do seu envio, entre em contato com nosso suporte via WhatsApp ou pelo e-mail: suporte@novacustom.com.br. Estamos prontos para te ajudar!"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <Helmet>
        <title>Envio e Entrega | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">Envio e Entrega</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Tudo o que você precisa saber sobre como seu manto chega até você com segurança e agilidade.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:border-black transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-tight">{section.title}</h3>
              <div className="text-gray-600 text-sm leading-relaxed">{section.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-black text-white rounded-[2.5rem] text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest relative z-10">Frete Grátis</h2>
          <p className="text-gray-400 max-w-md mx-auto relative z-10">Oferecemos frete grátis para todo o Brasil em compras acima de R$ 299,00. Aproveite para completar sua coleção!</p>
        </div>
      </div>
    </div>
  );
}
