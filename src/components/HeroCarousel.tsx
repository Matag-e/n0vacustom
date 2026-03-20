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
    link: '/nacionais',
    buttonText: 'Explorar Nacionais',
    color: 'from-zinc-900 to-zinc-800'
  },
  {
    id: 2,
    title: 'Elite Europeia',
    subtitle: 'Internacionais',
    description: 'Os maiores clubes do mundo. Qualidade premium e design exclusivo para quem entende de futebol.',
    image: '/CARRO 2.jpeg',
    link: '/internacionais',
    buttonText: 'Explorar Internacionais',
    color: 'from-zinc-900 to-zinc-800'
  },
  {
    id: 3,
    title: 'Lendas do Futebol',
    subtitle: 'Retrô',
    description: 'Reviva a história com nossa coleção clássica. Camisas que marcaram época e gerações.',
    image: '/CARRO 3.jpeg',
    link: '/retro',
    buttonText: 'Ver Coleção Retrô',
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
    <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden bg-black group mt-20">
      
      {/* Background Images Layer */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Link to={slide.link} className="block w-full h-full">
            {/* Image with object-cover to preserve quality and aspect ratio */}
            {slide.image ? (
              <img 
                src={slide.image} 
                alt={slide.title} 
                className={cn(
                  "w-full h-full object-cover transition-transform duration-[8000ms] ease-out",
                  currentSlide === index ? "scale-110" : "scale-100"
                )}
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <div className="text-zinc-800 font-black text-9xl uppercase select-none opacity-20">
                  NovaCustom
                </div>
              </div>
            )}
            
            {/* Elegant Gradients restored */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
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