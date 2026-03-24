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
    image: '/CARRO 1.jpeg',
    mobileImage: '/teste1 mob.jpeg',
    link: '/clubes',
    buttonText: 'Explorar Clubes',
    color: 'from-zinc-900 to-zinc-800'
  },
  {
    id: 2,
    title: 'Vida Nova ao Manto',
    subtitle: 'Restauração',
    description: 'Sua camisa antiga merece brilhar novamente. Especialistas em restauração de mantos históricos.',
    image: '/CARRO 2.jpeg',
    mobileImage: '/CARRO 2.jpeg', // Recomendado: substituir por imagem vertical 4:5
    link: '/restauracao',
    buttonText: 'Ver Restauração',
    color: 'from-zinc-900 to-zinc-800'
  },
  {
    id: 3,
    title: 'Seu Estilo Único',
    subtitle: 'Personalização',
    description: 'Nomes, números e patches oficiais. Deixe seu manto com a sua cara e exclusividade total.',
    image: '/CARRO 3.jpeg',
    mobileImage: '/CARRO 3.jpeg', // Recomendado: substituir por imagem vertical 4:5
    link: '/personalizacao',
    buttonText: 'Personalizar Agora',
    color: 'from-zinc-900 to-zinc-800'
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
    <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-[600px] overflow-hidden bg-black group mt-[72px] md:mt-20">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Link to={slide.link} className="block w-full h-full relative">
            {/* Desktop Image */}
            {slide.image && (
              <img 
                src={slide.image} 
                alt={slide.title} 
                className={cn(
                  "hidden md:block w-full h-full object-cover transition-all duration-700 ease-out",
                  currentSlide === index ? "scale-100" : "scale-105"
                )}
              />
            )}
            
            {/* Mobile Image */}
            {slide.mobileImage && (
              <img 
                src={slide.mobileImage} 
                alt={slide.title} 
                className={cn(
                  "block md:hidden w-full h-full object-cover transition-all duration-700 ease-out",
                  currentSlide === index ? "scale-100" : "scale-105"
                )}
              />
            )}

            {/* Fallback if no image */}
            {!slide.image && !slide.mobileImage && (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <div className="text-zinc-800 font-black text-9xl uppercase select-none opacity-20">
                  NovaCustom
                </div>
              </div>
            )}
            
            {/* Elegant Gradients restored */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-24 pb-20 md:pb-32">
              <div className={cn(
                "max-w-2xl transition-all duration-700 delay-300 transform",
                currentSlide === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <span className="inline-block text-primary font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3 md:mb-4 bg-primary/10 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20">
                  {slide.subtitle}
                </span>
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h2>
                <p className="text-gray-300 text-xs md:text-lg max-w-md leading-relaxed mb-6 md:mb-8 font-medium">
                  {slide.description}
                </p>
                <div className="inline-flex items-center gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary hover:text-white transition-all group/btn shadow-xl">
                  {slide.buttonText}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-4 md:right-12 z-30 flex items-center gap-6">
        {/* Slide Counter */}
        <div className="text-white font-mono text-sm tracking-widest hidden sm:block">
          <span className="text-2xl font-bold">0{currentSlide + 1}</span>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-gray-500">0{slides.length}</span>
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button 
            onClick={prevSlide}
            className="p-3 border border-white/20 hover:bg-white hover:text-black transition-all rounded-full group bg-black/20 backdrop-blur-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 border border-white/20 hover:bg-white hover:text-black transition-all rounded-full group bg-black/20 backdrop-blur-sm"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentSlide === index ? "bg-white w-8" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}