import { Truck, ShieldCheck, Clock, CreditCard } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "Para todo o Brasil"
  },
  {
    icon: ShieldCheck,
    title: "Compra Segura",
    description: "Proteção total"
  },
  {
    icon: Clock,
    title: "Envio Rápido",
    description: "Em até 24h"
  },
  {
    icon: CreditCard,
    title: "Parcele Sem Juros",
    description: "Em até 12x"
  }
];

export function BenefitsBar() {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300 relative z-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-3 group p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/10">
                <benefit.icon className="w-6 h-6 text-gray-900 dark:text-white stroke-[1.5] group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {benefit.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {benefit.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}