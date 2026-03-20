import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, ArrowRight, CreditCard, Landmark, QrCode } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 transition-colors duration-300 pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img src="/logo.svg" alt="NovaCustom" className="h-20 w-auto dark:brightness-0 dark:invert transition-all" />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              A NovaCustom é a sua loja premium de mantos exclusivos. Qualidade tailandesa 1:1, personalização oficial e a paixão pelo futebol em cada detalhe.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Navegação</h4>
            <ul className="space-y-3">
              <li><Link to="/nacionais" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Nacionais</Link></li>
              <li><Link to="/internacionais" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Internacionais</Link></li>
              <li><Link to="/retro" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Coleção Retrô</Link></li>
              <li><Link to="/personalizacao" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Serviços de Personalização</Link></li>
              <li><Link to="/restauracao" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Restauração de Mantos</Link></li>
            </ul>
          </div>

          {/* Institutional */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Institucional</h4>
            <ul className="space-y-3">
              <li><Link to="/envio-e-entrega" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Envio e Entrega</Link></li>
              <li><Link to="/trocas-e-devolucoes" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Trocas e Devoluções</Link></li>
              <li><Link to="/politica-de-privacidade" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Privacidade</Link></li>
              <li><Link to="/termos-de-uso" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Termos de Uso</Link></li>
              <li><Link to="/faq" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">Dúvidas Frequentes</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Fique por dentro</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Receba lançamentos exclusivos e promoções diretamente no seu e-mail.
            </p>
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg hover:opacity-80 transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Mail className="w-3 h-3" />
                <span>contato@novacustom.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Security Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
              <QrCode className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Pix</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cartão</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
              <Landmark className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Boleto</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} NovaCustom Mantos Exclusivos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

