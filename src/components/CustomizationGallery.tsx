import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomizationExample {
  id: string;
  thumbnail: string;
  images: string[];
  customerName?: string;
}

// Mock data - In a real app, this would come from the database based on the product ID
const MOCK_CUSTOMIZATIONS: CustomizationExample[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1577212017184-80e68a2703bb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518605348486-965555d5b768?q=80&w=1200&auto=format&fit=crop'
    ],
    customerName: 'Cliente Matheus'
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507436667083-261563724c08?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=1200&auto=format&fit=crop'
    ],
    customerName: 'Cliente João'
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1507436667083-261563724c08?q=80&w=200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507436667083-261563724c08?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=1200&auto=format&fit=crop'
    ],
    customerName: 'Cliente Ana'
  }
];

export function CustomizationGallery() {
  const [selectedCustomization, setSelectedCustomization] = useState<CustomizationExample | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (customization: CustomizationExample) => {
    setSelectedCustomization(customization);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedCustomization(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCustomization) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedCustomization.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCustomization) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedCustomization.images.length) % selectedCustomization.images.length);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-center gap-3 px-2 overflow-x-auto pb-2 scrollbar-hide">
        {MOCK_CUSTOMIZATIONS.map((customization) => (
          <button
            key={customization.id}
            onClick={() => openModal(customization)}
            className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-all group"
          >
            <img 
              src={customization.thumbnail} 
              alt="Exemplo de personalização" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
          </button>
        ))}
      </div>

      {/* Modal / Lightbox */}
      {selectedCustomization && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={closeModal} />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Main Image Container */}
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={selectedCustomization.images[currentImageIndex]} 
                alt={`Personalização ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {selectedCustomization.images.length}
              </div>
            </div>

            {/* Thumbnails in Modal */}
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full py-2">
              {selectedCustomization.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={cn(
                    "w-16 h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0",
                    currentImageIndex === idx ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  )}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {selectedCustomization.customerName && (
              <p className="text-white/60 text-sm mt-2">
                Personalização de {selectedCustomization.customerName}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
