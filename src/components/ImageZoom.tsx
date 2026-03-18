import { useState, useRef, MouseEvent } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setPosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair group ${className}`}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain"
      />
      
      {showZoom && (
        <div 
          className="absolute inset-0 pointer-events-none bg-no-repeat bg-white hidden lg:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '200%',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
}
