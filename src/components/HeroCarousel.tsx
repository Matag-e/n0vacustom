import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'Manto Sagrado',
    subtitle: 'Nacionais',
    description: 'A paixão pelo futebol brasileiro em cada detalhe. Vista as cores do seu time com orgulho.',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Brazilian%20football%20jerseys%20collection%20green%20and%20yellow%20stadium%20background%20high%20quality&image_size=landscape_16_9',
    link: '/nacionais',
    buttonText: 'Explorar Nacionais',
    color: 'from-green-900/80 to-black/40'
  },
  {
    id: 2,
    title: 'Elite Europeia',
    subtitle: 'Internacionais',
    description: 'Os maiores clubes do mundo. Qualidade premium e design exclusivo para quem entende de futebol.',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=European%20football%20jerseys%20collection%20champions%20league%20style%20dark%20moody&image_size=landscape_16_9',
    link: '/internacionais',
    buttonText: 'Explorar Internacionais',
    color: 'from-blue-900/80 to-black/40'
  },
  {
    id: 3,
    title: 'Lendas do Futebol',
    subtitle: 'Retrô',
    description: 'Reviva a história com nossa coleção clássica. Camisas que marcaram época e gerações.',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Retro%20football%20jerseys%20vintage%20style%20nostalgic%20atmosphere&image_size=landscape_16_9',
    link: '/retro',
    buttonText: 'Ver Coleção Retrô',
    color: 'from-yellow-900/80 to-black/40'
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, 6000);

    return () => {
      resetTimeout();
    };
  }, [currentSlide]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black text-white group">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Image with Parallax-like scale effect */}
          <img 
            src={slide.image} 
            alt={slide.title} 
            className={cn(
              "w-full h-full object-cover transition-transform duration-[8000ms] ease-out",
              currentSlide === index ? "scale-110" : "scale-100"
            )}
          />
          
          {/* Advanced Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r via-transparent to-transparent opacity-90",
            slide.color
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-20 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-4xl space-y-6">
          {slides.map((slide, index) => (
            currentSlide === index && (
              <div key={slide.id} className="space-y-6 overflow-hidden">
                {/* Subtitle with slide-in effect */}
                <div className="overflow-hidden">
                  <span className="inline-block text-primary font-bold tracking-[0.2em] uppercase text-sm md:text-base animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                    {slide.subtitle}
                  </span>
                </div>

                {/* Main Title with staggered reveal */}
                <div className="overflow-hidden">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
                    {slide.title.split(' ').map((word, i) => (
                      <span key={i} className="inline-block mr-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                        {word}
                      </span>
                    ))}
                  </h1>
                </div>

                {/* Description */}
                <div className="overflow-hidden max-w-2xl">
                  <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
                    {slide.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-8 animate-slide-up-fade" style={{ animationDelay: '0.7s' }}>
                  <Link 
                    to={slide.link} 
                    className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors group"
                  >
                    <span className="relative">
                      {slide.buttonText}
                      <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white group-hover:bg-primary transition-colors"></span>
                    </span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-4 md:right-12 z-30 flex items-center gap-6">
        {/* Slide Counter */}
        <div className="text-white font-mono text-sm tracking-widest">
          <span className="text-2xl font-bold">0{currentSlide + 1}</span>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-gray-500">0{slides.length}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-24 h-[2px] bg-gray-800 overflow-hidden">
          <div 
            key={currentSlide} 
            className="h-full bg-white animate-progress origin-left"
          />
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button 
            onClick={prevSlide}
            className="p-3 border border-white/20 hover:bg-white hover:text-black transition-all rounded-full group"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 border border-white/20 hover:bg-white hover:text-black transition-all rounded-full group"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </div>
  );
}