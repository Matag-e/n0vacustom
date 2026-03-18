import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { maskPhone } from '@/lib/masks';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'phone') maskedValue = maskPhone(value);

    setFormData({ ...formData, [name]: maskedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an email or save to DB
    const message = `Olá! Meu nome é ${formData.name}.%0AAssunto: ${formData.subject}%0AMensagem: ${formData.message}`;
    window.open(`https://wa.me/5511991814636?text=${message}`, '_blank');
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "WhatsApp",
      details: "(11) 99181-4636",
      subDetails: "Segunda a Sexta, 9h às 18h",
      link: "https://wa.me/5511991814636"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "E-mail",
      details: "contato@novacustom.com.br",
      subDetails: "Respostas em até 24h úteis",
      link: "mailto:contato@novacustom.com.br"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Localização",
      details: "São Paulo, SP",
      subDetails: "Atendimento Online (Enviamos p/ todo Brasil)",
      link: "#"
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm block mb-4">Contato</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter mb-4">Fale Conosco</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Estamos aqui para tirar suas dúvidas sobre pedidos, personalização ou qualquer outro assunto.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {contactInfo.map((info, index) => (
            <a 
              href={info.link} 
              key={index}
              className="p-10 rounded-[2.5rem] border border-gray-100 bg-gray-50 hover:border-black transition-all duration-300 group text-center"
            >
              <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-xl">
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">{info.title}</h3>
              <p className="text-gray-900 font-medium mb-1">{info.details}</p>
              <p className="text-gray-500 text-sm">{info.subDetails}</p>
            </a>
          ))}
        </div>

        <div className="bg-black text-white rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-20 flex flex-col justify-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-tight">Envie uma <br /> mensagem direta</h2>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Se preferir, preencha o formulário ao lado e nossa equipe entrará em contato com você o mais rápido possível.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Clock className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="font-bold uppercase text-xs tracking-widest text-gray-300">Horário de Atendimento</p>
                      <p className="text-sm">Segunda a Sexta: 09:00 - 18:00</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <MessageCircle className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="font-bold uppercase text-xs tracking-widest text-gray-300">Suporte Prioritário</p>
                      <p className="text-sm">Via WhatsApp para clientes registrados</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 lg:p-20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seu Nome</label>
                    <input 
                      required
                      name="name"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="Nome completo" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      onChange={handleChange}
                      value={formData.email}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="seu@email.com" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
                    <input 
                      required
                      name="phone"
                      onChange={handleChange}
                      value={formData.phone}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                      placeholder="(00) 00000-0000" 
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assunto</label>
                    <select 
                      required
                      name="subject"
                      onChange={handleChange}
                      value={formData.subject}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="Dúvida sobre Pedido">Dúvida sobre Pedido</option>
                      <option value="Personalização">Personalização</option>
                      <option value="Trocas e Devoluções">Trocas e Devoluções</option>
                      <option value="Sugestões ou Reclamações">Sugestões ou Reclamações</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mensagem</label>
                  <textarea 
                    required
                    name="message"
                    onChange={handleChange}
                    value={formData.message}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" 
                    placeholder="Como podemos te ajudar?" 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
