import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const lookbookItems = [
  {
    id: 1,
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Streetwear%20fashion%20model%20wearing%20vintage%20football%20jersey%20with%20jeans%20urban%20setting%20black%20and%20white&image_size=portrait_4_3",
    title: "Casual Urbano",
    description: "Do estádio para as ruas.",
    link: "/lookbook/urbano"
  },
  {
    id: 2,
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Couple%20wearing%20matching%20football%20jerseys%20lifestyle%20photography%20black%20and%20white&image_size=portrait_4_3",
    title: "Match Day",
    description: "Para torcer juntos.",
    link: "/lookbook/matchday"
  },
  {
    id: 3,
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Fashion%20model%20wearing%20oversized%20retro%20football%20shirt%20minimalist%20studio%20shot%20black%20and%20white&image_size=portrait_4_3",
    title: "Retrô Chic",
    description: "Clássicos nunca morrem.",
    link: "/lookbook/retro"
  },
  {
    id: 4,
    image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Group%20of%20friends%20wearing%20football%20jerseys%20laughing%20candid%20shot%20black%20and%20white&image_size=portrait_4_3",
    title: "Torcida Organizada",
    description: "A união faz a força.",
    link: "/lookbook/torcida"
  }
];

export function LookbookGallery() {
  return (
    <section className="bg-white dark:bg-black py-24 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Nova Culture
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
              Inspire-se em como nossa comunidade veste a paixão pelo futebol no dia a dia.
            </p>
          </div>
          <Link 
            to="/lookbook" 
            className="hidden md:flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors mt-4 md:mt-0"
          >
            Ver Galeria Completa <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lookbookItems.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-medium mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/lookbook" 
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
          >
            Ver Galeria Completa <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
