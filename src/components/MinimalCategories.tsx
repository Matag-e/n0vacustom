import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 1,
    title: "LANÇAMENTOS",
    subtitle: "Nova Coleção",
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern%20minimalist%20football%20jersey%20black%20and%20white%20photography%20studio%20lighting&image_size=square",
    link: "/lancamentos",
    size: "large" // occupy 2 columns on desktop
  },
  {
    id: 2,
    title: "MAIS VENDIDOS",
    subtitle: "Os Preferidos",
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Stack%20of%20folded%20football%20jerseys%20high%20quality%20black%20and%20white%20detail&image_size=square",
    link: "/mais-vendidos",
    size: "normal"
  },
  {
    id: 3,
    title: "PERSONALIZADOS",
    subtitle: "Do Seu Jeito",
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close%20up%20of%20football%20jersey%20custom%20name%20printing%20process%20black%20and%20white%20macro&image_size=square",
    link: "/personalizados",
    size: "normal"
  },
  {
    id: 4,
    title: "CLUBES",
    subtitle: "Nacionais e Internacionais",
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Football%20stadium%20atmosphere%20black%20and%20white%20crowd%20cheering&image_size=landscape_16_9",
    link: "/clubes",
    size: "large"
  }
];

export function MinimalCategories() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-2 block">Categorias</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Explore por Estilo</h2>
        </div>
        <Link to="/clubes" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group">
          <span className="text-sm font-medium uppercase tracking-wider">Ver todas</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={category.link}
            className={cn(
              "group relative overflow-hidden bg-gray-100 dark:bg-gray-900",
              category.size === "large" ? "md:col-span-2" : "md:col-span-1"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transform transition-transform duration-500">
              <span className="text-gray-300 text-xs md:text-sm tracking-[0.2em] uppercase mb-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                {category.subtitle}
              </span>
              <h3 className="text-white text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4">
                {category.title}
              </h3>
              <div className="w-12 h-[1px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200 origin-center"></div>
              
              <span className="mt-4 inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-300">
                Explorar <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center md:hidden">
        <Link to="/clubes" className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-medium uppercase tracking-wider text-sm border-b border-gray-900 dark:border-white pb-1">
          Ver todas as categorias <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}