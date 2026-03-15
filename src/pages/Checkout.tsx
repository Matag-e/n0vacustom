import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, ShoppingBag, Copy, CheckCircle2, QrCode, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { maskCPF, maskPhone, maskCEP } from '@/lib/masks';
import { QRCodeSVG } from 'qrcode.react';

interface PixResult {
  id: number;
  qr_code: string;
  qr_code_base64: string;
  status: string;
  ticket_url?: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pixResult, setPixResult] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  const PIX_KEY = "11991814636"; // Chave PIX da loja (Celular)

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    paymentMethod: 'pix' as 'mercadopago' | 'pix',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'phone') maskedValue = maskPhone(value);
    if (name === 'cep') maskedValue = maskCEP(value);
    if (name === 'cvv' || name === 'number') maskedValue = value.replace(/\D/g, '');

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPix = formData.paymentMethod === 'pix';
    console.log('[Checkout] Iniciando finalização do pedido. Método:', formData.paymentMethod);

    setLoading(true);
    
    try {
      const discount = isPix ? 0.95 : 1;
      const totalAmount = Number((totalPrice * discount).toFixed(2));

      // Se o usuário não estiver logado, tratamos como guest mas ainda mostramos o PIX se selecionado
      if (!user && isPix) {
        setPixResult({
          id: Date.now(), // ID temporário para guest
          qr_code: PIX_KEY,
          qr_code_base64: '',
          status: 'pending'
        });
        clearCart();
        return;
      }

      if (user) {
        // Salvar pedido no Supabase
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending',
            payment_method: formData.paymentMethod,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            cpf: formData.cpf,
            phone: formData.phone,
            cep: formData.cep,
            address: formData.address,
            number: formData.number,
            complement: formData.complement,
            district: formData.district,
            city: formData.city,
            state: formData.state,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        if (orderData) {
          const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            size: item.size,
            price: item.product.price,
            customization_name: item.customName,
            customization_number: item.customNumber
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;

          if (isPix) {
            // Se for PIX, agora usamos a chave estática da loja conforme solicitado
            // O pedido é criado como 'pending' e o admin verifica manualmente
            setPixResult({
              id: orderData.id,
              qr_code: PIX_KEY,
              qr_code_base64: '', // Não temos base64 para a chave estática
              status: 'pending'
            });
            clearCart();
            return;
          }

          // Checkout Pro para outros métodos
          const response = await fetch('/api/payments/create-preference', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: items.map(item => ({
                product: {
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                },
                quantity: item.quantity,
              })),
              orderId: orderData.id,
              paymentMethod: formData.paymentMethod,
              totalAmount: totalAmount
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Payment preference error:', errorData);
            const errorMessage = errorData.details?.message || errorData.error || 'Erro ao criar pagamento';
            throw new Error(errorMessage);
          }

          const { init_point } = await response.json();
          
          if (init_point) {
            clearCart();
            window.location.href = init_point;
            return;
          }
          
          throw new Error('Mercado Pago init_point missing');
        }
      } else {
        console.log('Guest checkout processed locally');
      }

      // Sucesso
      console.log('Order processed successfully. Redirecting to profile.');
      clearCart();
      
      if (user) {
        navigate('/profile', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      
    } catch (error: any) {
      console.error('Error processing order:', error);
      alert(`Houve um erro ao processar seu pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (pixResult) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Sucesso */}
            <div className="bg-black p-10 text-center text-white space-y-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Pedido Realizado!</h2>
              <p className="text-gray-400 text-sm">Agora falta pouco para seu manto estar a caminho.</p>
            </div>

            {/* Instruções PIX */}
            <div className="p-8 md:p-12 space-y-8 text-center">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor do Pagamento</span>
                <p className="text-4xl font-black text-gray-900">
                  R$ {(totalPrice * 0.95).toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 inline-block mx-auto">
                <QRCodeSVG 
                  value={pixResult.qr_code} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="mx-auto mix-blend-multiply"
                />
              </div>

              {/* Copia e Cola */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Chave PIX (Celular)</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xl font-mono font-bold text-gray-900 tracking-wider text-center">
                    {pixResult.qr_code}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixResult.qr_code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest transition-all",
                      copied ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Avisos */}
              <div className="pt-8 border-t border-gray-100 space-y-4">
                <div className="flex items-start gap-3 text-left bg-blue-50 p-4 rounded-2xl">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">!</div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Seu pedido foi registrado! Após o pagamento via PIX para a chave acima, o envio será processado assim que o valor for identificado em nossa conta.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
                >
                  Ver meus pedidos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Seu carrinho está vazio</h2>
          <Link to="/" className="text-primary hover:underline font-medium">Voltar para a loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Simples */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/cart" className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Carrinho
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Ambiente Seguro</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Data */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  Dados Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                    <input required name="firstName" onChange={handleChange} value={formData.firstName} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Sobrenome</label>
                    <input required name="lastName" onChange={handleChange} value={formData.lastName} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Seu sobrenome" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                    <input required type="email" name="email" onChange={handleChange} value={formData.email} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">CPF</label>
                    <input required name="cpf" onChange={handleChange} value={formData.cpf} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="000.000.000-00" maxLength={14} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Celular</label>
                    <input required name="phone" onChange={handleChange} value={formData.phone} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="(00) 00000-0000" maxLength={15} />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: 'pix' }));
                      setShowPixModal(true);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 relative overflow-hidden",
                      formData.paymentMethod === 'pix' 
                        ? "border-green-500 bg-green-50 ring-2 ring-green-500/5" 
                        : "border-gray-100 hover:border-gray-300"
                    )}
                  >
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      5% OFF
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                      <span className="font-bold">PIX (Direto)</span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center">
                      Liberação Instantânea
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'mercadopago' }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3",
                      formData.paymentMethod === 'mercadopago' 
                        ? "border-black bg-gray-50 ring-2 ring-black/5" 
                        : "border-gray-100 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <span className="font-bold">Cartão (MP)</span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center">
                      Parcelado em até 12x
                    </span>
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">CEP</label>
                    <input required name="cep" onChange={handleChange} value={formData.cep} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="00000-000" maxLength={9} />
                  </div>
                  <div className="space-y-2 md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 uppercase">Rua</label>
                    <input required name="address" onChange={handleChange} value={formData.address} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Nome da rua" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Número</label>
                    <input required name="number" onChange={handleChange} value={formData.number} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="123" />
                  </div>
                  <div className="space-y-2 md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 uppercase">Complemento</label>
                    <input name="complement" onChange={handleChange} value={formData.complement} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Apto, Bloco, etc." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
                    <input required name="district" onChange={handleChange} value={formData.district} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Bairro" />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Cidade</label>
                    <input required name="city" onChange={handleChange} value={formData.city} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="Cidade" />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">UF</label>
                    <input required name="state" onChange={handleChange} value={formData.state} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" placeholder="UF" maxLength={2} />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide border-b pb-4">Resumo do Pedido</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.product.image_url || ''} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">Tamanho: {item.size}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Qtd: {item.quantity}</span>
                        <span className="text-sm font-bold text-gray-900">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 mb-8">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Grátis</span>
                </div>
                {formData.paymentMethod === 'pix' && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto PIX (5%)</span>
                    <span>- R$ {(totalPrice * 0.05).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-gray-900">
                    R$ {
                      formData.paymentMethod === 'pix' 
                        ? (totalPrice * 0.95).toFixed(2).replace('.', ',') 
                        : totalPrice.toFixed(2).replace('.', ',')
                    }
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Finalizar e Pagar'
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                <Truck className="w-3 h-3" />
                Entrega Garantida para todo Brasil
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PIX Modal (Static) */}
      {showPixModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-green-500 p-6 text-center relative">
              <button 
                onClick={() => setShowPixModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Pagamento Via PIX</h3>
              <p className="text-white/80 text-xs mt-1">Sua compra com 5% de desconto!</p>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor com Desconto</span>
                <p className="text-3xl font-black text-gray-900">
                  R$ {(totalPrice * 0.95).toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 inline-block">
                <QRCodeSVG 
                  value={PIX_KEY} 
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="mx-auto mix-blend-multiply"
                />
              </div>

              {/* Chave PIX */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chave PIX (Celular)</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <span className="flex-1 font-mono text-lg font-bold text-gray-900 tracking-wider">
                    {PIX_KEY}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(PIX_KEY);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={cn(
                      "p-3 rounded-lg transition-all",
                      copied ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-xl text-left space-y-2">
                <div className="flex gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px]">!</div>
                  Como proceder?
                </div>
                <p className="text-[10px] text-blue-600 leading-relaxed">
                  1. Copie a chave acima ou escaneie o QR Code.<br/>
                  2. Realize o pagamento no app do seu banco.<br/>
                  3. <strong>Clique no botão abaixo</strong> para finalizar seu pedido no site.
                </p>
              </div>

              <button 
                onClick={() => setShowPixModal(false)}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg"
              >
                Já realizei o pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}