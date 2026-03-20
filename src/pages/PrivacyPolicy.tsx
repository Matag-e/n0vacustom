import { Shield, Lock, Eye, FileText, Database, UserCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <Helmet>
        <title>Política de Privacidade | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm block">Segurança e Transparência</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900">
            Política de Privacidade
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Entenda como coletamos, usamos e protegemos seus dados pessoais na NovaCustom.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">1. Coleta de Dados</h2>
            </div>
            <p className="pl-14">
              Coletamos informações pessoais que você nos fornece voluntariamente ao se cadastrar, realizar uma compra ou entrar em contato conosco. Isso inclui nome, e-mail, telefone, endereço de entrega e dados de pagamento. Também coletamos dados de navegação automaticamente para melhorar sua experiência no site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">2. Uso das Informações</h2>
            </div>
            <p className="pl-14">
              Utilizamos seus dados para:
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Processar e enviar seus pedidos;</li>
                <li>Comunicar sobre o status da entrega;</li>
                <li>Enviar ofertas e novidades (caso você tenha aceitado);</li>
                <li>Melhorar nossos serviços e personalizar sua experiência;</li>
                <li>Prevenir fraudes e garantir a segurança do sistema.</li>
              </ul>
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">3. Proteção de Dados</h2>
            </div>
            <p className="pl-14">
              Adotamos medidas de segurança técnicas e administrativas para proteger seus dados contra acesso não autorizado, perda ou alteração. Utilizamos criptografia SSL em todas as transações e não armazenamos dados completos de cartão de crédito em nossos servidores.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">4. Cookies</h2>
            </div>
            <p className="pl-14">
              Utilizamos cookies para melhorar a funcionalidade do site e analisar o tráfego. Você pode gerenciar as preferências de cookies nas configurações do seu navegador, mas algumas funcionalidades do site podem ser afetadas se você desativá-los.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">5. Compartilhamento</h2>
            </div>
            <p className="pl-14">
              Não vendemos ou alugamos seus dados pessoais. Compartilhamos informações apenas com parceiros essenciais para a operação (como transportadoras e processadores de pagamento) ou quando exigido por lei.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">6. Seus Direitos</h2>
            </div>
            <p className="pl-14">
              Você tem o direito de solicitar o acesso, correção ou exclusão dos seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato com nosso suporte.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
