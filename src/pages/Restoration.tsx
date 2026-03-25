import { useState } from 'react';
import { Sparkles, Camera, MessageCircle, Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import { maskPhone } from '@/lib/masks';

export default function Restoration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jerseyModel: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'phone') maskedValue = maskPhone(value);

    setFormData({ ...formData, [name]: maskedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an email or save to DB
    // For now, let's redirect to WhatsApp with the data
    const message = `Olá! Gostaria de um orçamento de restauração.%0A%0A*Dados:*%0ANome: ${formData.name}%0ACamisa: ${formData.jerseyModel}%0ADetalhes: ${formData.description}`;
    window.open(`https://wa.me/5511963268510?text=${message}`, '_blank');
  };

  const steps = [
    {
      icon: Camera,
      title: "Envie Fotos",
      description: "Tire fotos nítidas da sua camisa, focando nas áreas que precisam de reparo (silk rachado, manchas, fios puxados)."
    },
    {
      icon: Sparkles,
      title: "Avaliação",
      description: "Nossa equipe técnica analisará o material e o tipo de dano para definir as melhores técnicas de restauração."
    },
    {
      icon: MessageCircle,
      title: "Orçamento",
      description: "Enviaremos o orçamento detalhado e o prazo estimado para deixar sua camisa nova de novo."
    },
    {
      icon: ShieldCheck,
      title: "Restauração",
      description: "Após aprovação, realizamos o serviço com materiais de alta qualidade e técnicas exclusivas."
    }
  ];

  const showcase = [
    {
      title: "Restauração total",
      before: "https://ejzimdctlmmeylmlfmvj.supabase.co/storage/v1/object/sign/publics/barcaantes.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YzgyMTA0Ni02MzdiLTRhY2EtYmE5Zi05MDhhOWZkZGM1ZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwdWJsaWNzL2JhcmNhYW50ZXMuanBlZyIsImlhdCI6MTc3NDA1OTg3OSwiZXhwIjoxODA1NTk1ODc5fQ.uiXQj7QOW6OVh1NoiaxTHnhXS1uQzOYbD_qGxyXQoQE",
      after: "https://ejzimdctlmmeylmlfmvj.supabase.co/storage/v1/object/sign/publics/barcadepois.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YzgyMTA0Ni02MzdiLTRhY2EtYmE5Zi05MDhhOWZkZGM1ZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwdWJsaWNzL2JhcmNhZGVwb2lzLmpwZWciLCJpYXQiOjE3NzQwNTk5MjAsImV4cCI6MTgwNTU5NTkyMH0.ldL0GbDyWlDz70cs-O7cdpfP4GQ2ZNgCQYdd6exppN0",
      description: "Aplicação de novo material idêntico ao original."
    },
    {
      title: "Restauração nome e número",
      before: "/antes.jpeg",
      after: "/depois.jpeg",
      description: "Restauração do nome e número do jogador na camisa."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Restauração de Mantos | NovaCustom</title>
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>
          <img src="/restaura.jpeg" className="w-full h-full object-cover" alt="Hero" />
        </div>
        
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Serviço Especializado</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
              DEVOLVA A GLÓRIA <br />
              <span className="text-primary">À SEU MANTO.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              Somos especialistas em restaurar camisas de futebol clássicas e modernas. 
              Do silk rachado à limpeza profunda, cuidamos da sua história.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#quote-form"
                className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                Solicitar Orçamento
                <ArrowRight className="w-5 h-5" />
              </a>
              <div className="flex items-center gap-4 px-6 py-4 rounded-xl border border-white/20 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-300">+20 camisas restauradas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Processo</h2>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Como funciona</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                  <step.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Before & After */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Resultados</h2>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Transformações Reais</h3>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Prazo Médio: 15 dias</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {showcase.map((item, index) => (
              <div key={index} className="space-y-6">
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group">
                   <div className="absolute inset-0 grid grid-cols-2">
                      <div className="relative overflow-hidden bg-zinc-100">
                         {item.before ? (
                           <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold uppercase tracking-widest text-xs">Antes</div>
                         )}
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Antes</div>
                      </div>
                      <div className="relative overflow-hidden bg-zinc-200">
                         {item.after ? (
                           <img src={item.after} alt="After" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Depois</div>
                         )}
                         <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-lg">Depois</div>
                      </div>
                   </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote-form" className="py-24 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Contato</h2>
              <h3 className="text-5xl font-black mb-8 tracking-tighter uppercase leading-tight">
                Pronto para renovar <br /> sua camisa?
              </h3>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Preencha o formulário ou nos chame no WhatsApp para uma avaliação preliminar. 
                Atendemos colecionadores de todo o Brasil via correios.
              </p>
              
              <div className="space-y-6">
                {[
                  "Garantia de satisfação no serviço",
                  "Materiais originais ou similares premium",
                  "Envio seguro para todo o Brasil",
                  "Pagamento facilitado no cartão ou PIX"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-12 rounded-3xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome Completo</label>
                    <input 
                      required
                      name="name"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="Seu nome" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      onChange={handleChange}
                      value={formData.email}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="seu@email.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
                  <input 
                    required
                    name="phone"
                    onChange={handleChange}
                    value={formData.phone}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    placeholder="(00) 00000-0000" 
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Modelo da Camisa (Ano/Time)</label>
                  <input 
                    required
                    name="jerseyModel"
                    onChange={handleChange}
                    value={formData.jerseyModel}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    placeholder="Ex: São Paulo 1992 - Mundial" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">O que precisa ser feito?</label>
                  <textarea 
                    required
                    name="description"
                    onChange={handleChange}
                    value={formData.description}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" 
                    placeholder="Descreva os danos da camisa..." 
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
