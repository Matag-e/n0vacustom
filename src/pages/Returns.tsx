import { RefreshCcw, ShieldAlert, CheckCircle2, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Returns() {
  const sections = [
    {
      icon: <RefreshCcw className="w-6 h-6" />,
      title: "Direito de Arrependimento",
      content: "De acordo com o Código de Defesa do Consumidor, você tem até 7 dias corridos após o recebimento do produto para solicitar a devolução por arrependimento. O produto deve estar em perfeitas condições, com as etiquetas originais e sem sinais de uso ou lavagem."
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Produtos Personalizados",
      content: "Atenção: Produtos personalizados com nome e número não podem ser trocados ou devolvidos, a menos que apresentem defeito de fabricação ou erro na personalização por parte da Nova Custom. Certifique-se de conferir a tabela de medidas e a grafia do nome antes de finalizar a compra."
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Defeitos de Fabricação",
      content: "Caso seu manto apresente qualquer defeito de fabricação (costuras soltas, silk descolando, manchas), você tem até 30 dias para entrar em contato. Após a análise técnica, realizaremos a troca por um novo produto ou o estorno total."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Condições para Troca",
      content: "Para que a troca seja efetuada, o produto não deve ter sido lavado, não deve apresentar odores e deve estar acompanhado de todos os acessórios (se houver). Reservamo-nos o direito de não aceitar a troca caso as condições não sejam cumpridas."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Como solicitar?",
      content: "Para iniciar um processo de troca ou devolução, envie uma mensagem para nosso WhatsApp de suporte com o número do seu pedido e fotos do produto. Nossa equipe responderá em até 48 horas úteis com as instruções de postagem."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Custos de Envio",
      content: "A primeira troca por defeito de fabricação tem o custo de frete por nossa conta. Em casos de troca por tamanho (em produtos não personalizados), os custos de envio e reenvio são de responsabilidade do cliente."
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <Helmet>
        <title>Trocas e Devoluções | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">Trocas e Devoluções</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Nossa política é transparente e segue as normas do Código de Defesa do Consumidor para garantir sua satisfação.</p>
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
              <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-center">
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Dúvida sobre Tamanho?</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Evite transtornos conferindo nosso Guia de Medidas na página de cada produto. 
            Em caso de dúvida entre dois tamanhos, recomendamos sempre escolher o maior.
          </p>
          <a 
            href="https://wa.me/5511991814636" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  );
}
