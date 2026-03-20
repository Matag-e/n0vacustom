import { useState } from 'react';
import { Sparkles, Type, ShieldCheck, MessageCircle, ArrowRight, CheckCircle2, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { maskPhone } from '@/lib/masks';
import { Helmet } from 'react-helmet-async';

export default function CustomizationService() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    jerseyInfo: '',
    customDetails: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'phone') maskedValue = maskPhone(value);

    setFormData({ ...formData, [name]: maskedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Olá! Gostaria de personalizar uma camisa que já tenho.%0A%0A*Dados:*%0ANome: ${formData.name}%0ACamisa: ${formData.jerseyInfo}%0APersonalização: ${formData.customDetails}`;
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const portfolio = [
    {
      title: "Fonte Oficial Seleção",
      image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up%20of%20a%20yellow%20Brazil%20National%20Team%20jersey%20with%20official%20font%20for%20name%20and%20number%2C%20pristine%20condition%2C%20sharp%20details%2C%20studio%20photography&image_size=portrait_4_3",
      tag: "Patch Original"
    },
    {
      title: "Nomes e Números Retrô",
      image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Back%20of%20a%20vintage%20football%20jersey%20from%20the%2090s%2C%20large%20velvet%20number%2010%2C%20iconic%20font%2C%20textured%20fabric%2C%20warm%20lighting&image_size=portrait_4_3",
      tag: "Veludo Premium"
    },
    {
      title: "Patches de Campeão",
      image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Detail%20of%20a%20football%20jersey%20sleeve%20with%20a%20gold%20champions%20patch%2C%20official%20embroidery%2C%20high%20quality%2C%20macro%20photography&image_size=portrait_4_3",
      tag: "Aplicação Oficial"
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <Helmet>
        <title>Personalização de Mantos | NovaCustom</title>
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Sua Camisa, Suas Regras</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
              COLOQUE SEU NOME <br />
              <span className="text-primary text-outline-white">NA HISTÓRIA.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              Já tem o manto mas ele está "liso"? Nós aplicamos nomes, números e patches oficiais 
              ou personalizados com qualidade de jogador profissional.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#custom-form" className="bg-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Personalizar minha camisa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Galeria</h2>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Nossos Trabalhos</h3>
            </div>
            <p className="text-gray-500 max-w-md">
              Confira a qualidade das aplicações que realizamos em camisas de colecionadores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolio.map((item, index) => (
              <div key={index} className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl bg-zinc-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold uppercase tracking-widest text-xs">
                    Serviço de Personalização
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-primary font-bold text-xs uppercase tracking-widest mb-2 block">{item.tag}</span>
                  <h4 className="text-xl font-bold text-white uppercase">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Zap, title: "Aplicação Térmica", desc: "Prensagem profissional com temperatura e tempo controlados." },
              { icon: Star, title: "Fontes Oficiais", desc: "Trabalhamos com as mesmas fontes usadas pelos clubes." },
              { icon: ShieldCheck, title: "Durabilidade", desc: "Material que não racha e não desbota na lavagem." },
              { icon: MessageCircle, title: "Consultoria", desc: "Ajudamos você a escolher a fonte certa para cada época." }
            ].map((f, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-zinc-100">
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 uppercase text-sm tracking-wider">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="custom-form" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-zinc-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block">
                <img src="/logo.svg" alt="" className="w-full h-full object-contain translate-x-1/4 translate-y-1/4" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter uppercase leading-tight">
                  Traga sua camisa <br /> para o time.
                </h3>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                  Preencha os detalhes abaixo e nossa equipe entrará em contato para passar o orçamento e as instruções de envio.
                </p>
                
                <div className="space-y-4">
                  {[
                    "Personalização em 24h (após recebimento)",
                    "Opções de nomes e números customizados",
                    "Aplicação de patches de competições",
                    "Envio de volta via Sedex com seguro"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-zinc-300 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seu Nome</label>
                    <input 
                      required
                      name="name"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm text-zinc-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="Nome completo" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
                    <input 
                      required
                      name="phone"
                      onChange={handleChange}
                      value={formData.phone}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm text-zinc-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="(00) 00000-0000" 
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Qual a camisa? (Time/Ano)</label>
                    <input 
                      required
                      name="jerseyInfo"
                      onChange={handleChange}
                      value={formData.jerseyInfo}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm text-zinc-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="Ex: Flamengo 2019" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">O que deseja aplicar?</label>
                    <textarea 
                      required
                      name="customDetails"
                      onChange={handleChange}
                      value={formData.customDetails}
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm text-zinc-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" 
                      placeholder="Ex: Nome GABIGOL e número 9 + Patch Libertadores" 
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-zinc-950 text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Solicitar Orçamento
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
