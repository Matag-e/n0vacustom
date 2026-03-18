import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 transition-colors duration-300 pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="inline-block">
              <img src="/logo.svg" alt="NovaCustom" className="h-24 w-auto dark:brightness-0 dark:invert transition-all" />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Sua loja especializada em camisas de futebol personalizadas. 
              Unimos paixão, qualidade e estilo em cada detalhe para você vestir o manto sagrado.
            </p>
            <div className="flex gap-4 pt-2 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Loja</h4>
            <ul className="space-y-3">
              <li><Link to="/clubes" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Clubes</Link></li>
              <li><Link to="/selecoes" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Seleções</Link></li>
              <li><Link to="/retro" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Retrô</Link></li>
              <li><Link to="/brasileirao" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Brasileirão</Link></li>
              <li><Link to="/restauracao" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Restauração</Link></li>
              <li><Link to="/personalizacao" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-semibold">Personalização</Link></li>
              <li><Link to="/profile" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Meus Pedidos</Link></li>
            </ul>
          </div>

          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/envio-e-entrega" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Envio e Entrega</Link></li>
              <li><Link to="/trocas" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Trocas e Devoluções</Link></li>
              <li><Link to="/contato" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">Contato</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} NovaCustom. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
