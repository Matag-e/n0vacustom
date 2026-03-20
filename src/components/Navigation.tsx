import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { CartDrawer } from './CartDrawer';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signInWithGoogle, signOut } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isAdmin = user?.email === 'novacustom2k26@gmail.com';

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const camisasLinks = [
    { name: 'Clubes', path: '/clubes' },
    { name: 'Seleções', path: '/selecoes' },
    { name: 'Retrô', path: '/retro' },
    { name: 'Personalizados', path: '/personalizados' },
  ];

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 w-full z-40 transition-all duration-300",
          !scrolled && !isOpen
            ? "bg-transparent text-gray-900 dark:text-white" 
            : "bg-white/60 dark:bg-black/60 backdrop-blur-xl text-gray-900 dark:text-gray-100 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Mobile Menu Button (Left) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="focus:outline-none transition-colors p-2 -ml-2 text-gray-700 hover:text-primary dark:text-gray-200"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Logo (Centered on Mobile, Left on Desktop) */}
            <div className="flex-shrink-0 flex items-center md:mr-auto absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-auto">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/logo.svg" 
                  alt="NovaCustom" 
                  className="h-16 md:h-20 w-auto transition-all duration-300" 
                />
              </Link>
            </div>

            {/* Desktop Menu (Center) */}
            <div className="hidden md:flex space-x-8 items-center mx-auto">
              <Link
                to="/"
                className="font-medium transition-colors hover:text-primary text-sm uppercase tracking-wide text-gray-700 dark:text-gray-200"
              >
                Home
              </Link>

              {/* Dropdown Camisas */}
              <div 
                className="relative group"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-1 font-medium transition-colors hover:text-primary text-sm uppercase tracking-wide focus:outline-none text-gray-700 dark:text-gray-200"
                >
                  Camisas
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isDropdownOpen ? "rotate-180" : "")} />
                </button>
                
                <div 
                  className={cn(
                    "absolute top-full left-1/2 transform -translate-x-1/2 pt-2 w-48 transition-all duration-200 origin-top",
                    isDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                  )}
                >
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md shadow-lg overflow-hidden py-1">
                    {camisasLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to="/restauracao"
                className="font-medium transition-colors hover:text-primary text-sm uppercase tracking-wide text-gray-700 dark:text-gray-200"
              >
                Restauração
              </Link>

              <Link
                to="/personalizacao"
                className="font-medium transition-colors hover:text-primary text-sm uppercase tracking-wide text-gray-700 dark:text-gray-200"
              >
                Personalização
              </Link>

              <Link
                to="/contato"
                className="font-medium transition-colors hover:text-primary text-sm uppercase tracking-wide text-gray-700 dark:text-gray-200"
              >
                Contato
              </Link>
            </div>

            {/* Icons (Right) */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button 
                onClick={toggleCart}
                className="relative transition-colors hover:text-primary focus:outline-none text-gray-700 dark:text-gray-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-black">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="transition-colors hover:opacity-80 flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Link>
                    )}
                     <Link to="/profile" className="transition-colors hover:text-primary text-gray-700 dark:text-gray-200">
                      <UserIcon className="h-6 w-6" />
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="transition-colors hover:text-red-500 text-gray-700 dark:text-gray-200"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm uppercase tracking-wide bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out transform origin-top",
            isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
          )}
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <div className="px-4 py-3 rounded-md text-base font-medium text-gray-700">
              <span className="block mb-2 text-gray-400 text-sm uppercase tracking-wider">Camisas</span>
              <div className="space-y-1 pl-4 border-l-2 border-gray-100">
                {camisasLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block py-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/restauracao"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Restauração
            </Link>

            <Link
              to="/contato"
              className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>
            
            <div className="border-t border-gray-100 pt-4 mt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  toggleCart();
                }}
                className="flex w-full items-center px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Carrinho
                {totalItems > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShieldCheck className="h-5 w-5 mr-3" />
                      Painel Admin
                    </Link>
                  )}
                   <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Perfil
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center px-4 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Login
            </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
