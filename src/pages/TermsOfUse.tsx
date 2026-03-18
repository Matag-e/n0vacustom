import { FileText, ShieldAlert, CreditCard, ShoppingBag, Copyright, Scale } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm block">Regras e Condições</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900">
            Termos de Uso
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Ao utilizar a NovaCustom, você concorda com as condições descritas abaixo.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">1. Aceitação dos Termos</h2>
            </div>
            <p className="pl-14">
              Ao acessar e utilizar o site da NovaCustom, você aceita e concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">2. Produtos e Serviços</h2>
            </div>
            <p className="pl-14">
              A NovaCustom se esforça para exibir as cores e imagens dos produtos com a maior precisão possível. No entanto, não podemos garantir que a exibição de qualquer cor no monitor do seu computador ou tela de celular seja exata. Reservamo-nos o direito de limitar as vendas de nossos produtos a qualquer pessoa, região geográfica ou jurisdição.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">3. Preços e Pagamentos</h2>
            </div>
            <p className="pl-14">
              Os preços dos produtos estão sujeitos a alterações sem aviso prévio. Reservamo-nos o direito de, a qualquer momento, modificar ou descontinuar o Serviço (ou qualquer parte ou conteúdo do mesmo) sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, alteração de preço, suspensão ou descontinuação do Serviço.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Copyright className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">4. Propriedade Intelectual</h2>
            </div>
            <p className="pl-14">
              Todo o conteúdo presente neste site, incluindo textos, gráficos, logotipos, ícones, imagens e software, é propriedade da NovaCustom ou de seus fornecedores de conteúdo e é protegido pelas leis de direitos autorais internacionais e do Brasil.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">5. Limitação de Responsabilidade</h2>
            </div>
            <p className="pl-14">
              Em nenhum caso a NovaCustom, nossos diretores, oficiais, funcionários, afiliados, agentes, contratantes, estagiários, fornecedores, prestadores de serviços ou licenciadores serão responsáveis por qualquer prejuízo, perda, reclamação ou danos diretos, indiretos, incidentais, punitivos, especiais ou consequentes de qualquer tipo.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">6. Alterações nos Termos</h2>
            </div>
            <p className="pl-14">
              Você pode rever a versão mais atual dos Termos de Uso a qualquer momento nesta página. Reservamo-nos o direito, a nosso critério, de atualizar, modificar ou substituir qualquer parte destes Termos de Uso ao publicar atualizações e alterações no nosso site.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
