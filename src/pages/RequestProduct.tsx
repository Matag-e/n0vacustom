import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MessageCircle, Send, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function RequestProduct() {
  const [formData, setFormData] = useState({
    team: '',
    model: 'casa',
    year: '',
    name: '',
    whatsapp: '',
  });

  const [isSubmitting, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const message = `*ENCOMENDA ESPECIAL - NOVACUSTOM*%0A%0A` +
      `*Time:* ${formData.team}%0A` +
      `*Modelo:* ${formData.model.toUpperCase()}%0A` +
      `*Ano:* ${formData.year}%0A%0A` +
      `*Cliente:* ${formData.name}%0A` +
      `*WhatsApp:* ${formData.whatsapp}`;

    // WhatsApp business number from previous context
    const whatsappNumber = '5511963268510';
    
    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      setIsAdding(false);
    }, 800);
  };

  const models = [
    { id: 'casa', label: 'Casa (Home)' },
    { id: 'fora', label: 'Fora (Away)' },
    { id: 'terceira', label: 'Terceira (Third)' },
    { id: 'quarta', label: 'Quarta (Fourth)' },
    { id: 'treino', label: 'Treino' },
    { id: 'especial', label: 'Edição Especial' },
  ];

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-black min-h-screen">
      <Helmet>
        <title>Encomenda Especial | NovaCustom</title>
        <meta name="description" content="Não encontrou sua camisa? Nós encomendamos para você. Indique o time, modelo e ano." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          to="/clubes" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold uppercase tracking-widest">Voltar ao catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] block mb-4">Serviço Exclusivo</span>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                ENCOMENDE SEU <br /> <span className="text-primary">MANTO</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Trabalhamos com uma rede global de fornecedores premium. Se o manto que você deseja não está no catálogo, nós buscamos para você com a mesma qualidade 1:1.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex items-center justify-center text-primary shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Qualidade</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Padrão Tailandês 1:1</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex items-center justify-center text-primary shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prazo</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">30 a 35 dias úteis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-900 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Time / Seleção</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Real Madrid, Brasil, etc..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-zinc-900 dark:text-white font-medium"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Modelo</label>
                  <select 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-zinc-900 dark:text-white font-medium appearance-none"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  >
                    {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Temporada / Ano</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: 24/25 ou 1998"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-zinc-900 dark:text-white font-medium"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Seu Nome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-zinc-900 dark:text-white font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Seu WhatsApp</label>
                  <input 
                    required
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary transition-all outline-none text-zinc-900 dark:text-white font-medium"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-primary/20",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Solicitar Orçamento
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest">
                Você será redirecionado para o nosso WhatsApp oficial
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
