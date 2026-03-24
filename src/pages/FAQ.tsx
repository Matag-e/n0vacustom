import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, Minus, Search, HelpCircle, Truck, CreditCard, 
  RotateCcw, ShieldCheck, Shirt, MessageCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Pedidos e Envio',
    question: 'Qual o prazo de entrega dos pedidos?',
    answer: 'Trabalhamos com dois fluxos de entrega para melhor atendê-lo: \n\n• **Estoque Nacional (Pronta Entrega):** 10 a 15 dias úteis.\n• **Importação Direta (Sob Encomenda):** 30 a 45 dias.\n\n*Nota: Itens personalizados podem levar de 2 a 3 dias adicionais para a produção artesanal.*'
  },
  {
    category: 'Pedidos e Envio',
    question: 'Como acompanho o rastreio do meu pedido?',
    answer: 'Assim que seu pedido for postado, você receberá o código de rastreamento por e-mail e ele também ficará disponível na sua área de cliente no site. Você pode rastreá-lo diretamente pelo site dos Correios ou por aplicativos de rastreio.'
  },
  {
    category: 'Produtos e Qualidade',
    question: 'As camisas são originais/oficiais?',
    answer: 'Trabalhamos com camisas de padrão Tailandês 1:1, que é a melhor qualidade disponível no mercado mundial. Os tecidos, bordados, etiquetas e tecnologias são idênticos aos usados pelos jogadores em campo.'
  },
  {
    category: 'Produtos e Qualidade',
    question: 'Como devo lavar minha camisa para não estragar?',
    answer: 'Para garantir a durabilidade, recomendamos: Lavar sempre à mão, não usar alvejantes, não deixar de molho por muito tempo, secar sempre à sombra e NUNCA passar o ferro sobre as estampas e patrocínios.'
  },
  {
    category: 'Pagamentos',
    question: 'Quais as formas de pagamento aceitas?',
    answer: 'Aceitamos PIX (com 5% de desconto automático) e Cartão de Crédito em até 12x através do Mercado Pago, garantindo total segurança para sua transação.'
  },
  {
    category: 'Trocas e Devoluções',
    question: 'Posso trocar uma camisa personalizada?',
    answer: 'Itens personalizados (com nome e número) não podem ser trocados ou devolvidos, a menos que apresentem defeito de fabricação ou erro na personalização por nossa parte. Por isso, confira bem a tabela de medidas antes de finalizar seu pedido.'
  },
  {
    category: 'Trocas e Devoluções',
    question: 'Como funciona a política de trocas para itens sem personalização?',
    answer: 'Para itens sem personalização, você tem até 7 dias após o recebimento para solicitar a troca ou devolução, desde que o produto esteja com todas as etiquetas originais e sem sinais de uso.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: HelpCircle },
  { id: 'envio', label: 'Envio', icon: Truck },
  { id: 'produtos', label: 'Produtos', icon: Shirt },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'trocas', label: 'Trocas', icon: RotateCcw },
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
                           (activeCategory === 'envio' && faq.category === 'Pedidos e Envio') ||
                           (activeCategory === 'produtos' && faq.category === 'Produtos e Qualidade') ||
                           (activeCategory === 'pagamentos' && faq.category === 'Pagamentos') ||
                           (activeCategory === 'trocas' && faq.category === 'Trocas e Devoluções');
    return matchesSearch && matchesCategory;
  });

  const renderAnswer = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-black font-black">{part.slice(2, -2)}</strong>;
        }
        // Handle italic text *text*
        const subParts = part.split(/(\*.*?\*)/g);
        return subParts.map((subPart, k) => {
          if (subPart.startsWith('*') && subPart.endsWith('*')) {
            return <em key={k} className="text-gray-400 italic font-medium">{subPart.slice(1, -1)}</em>;
          }
          return subPart;
        });
      });

      return (
        <div key={i} className={cn(line.trim() === '' ? 'h-4' : 'mb-1')}>
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <Helmet>
        <title>Dúvidas Frequentes | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm block">Suporte NovaCustom</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900">
            Dúvidas Frequentes
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Encontre respostas rápidas para as principais perguntas sobre seus mantos, envios e pagamentos.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="space-y-8 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por palavra-chave (ex: lavagem, rastreio...)"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all border",
                    activeCategory === cat.id 
                      ? "bg-black text-white border-black shadow-lg" 
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className={cn(
                    "border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300",
                    isOpen ? "bg-gray-50 shadow-md border-transparent" : "bg-white hover:border-gray-300"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 pr-8">{faq.question}</span>
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isOpen ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-0">
                        {renderAnswer(faq.answer)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma dúvida encontrada para sua busca.</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('all');}}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 bg-black text-white p-10 rounded-[2.5rem] relative overflow-hidden text-center group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 relative z-10">Ainda tem dúvidas?</h2>
          <p className="text-gray-400 mb-8 relative z-10">
            Nossa equipe de suporte está pronta para te ajudar via WhatsApp.
          </p>
          <a 
            href="https://wa.me/5511963268510" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-primary/20"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
