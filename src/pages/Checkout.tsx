import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { maskCPF, maskPhone, maskCEP, maskCardNumber, maskExpiry } from '@/lib/masks';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    
    try {
      const totalAmount = totalPrice;

      if (user) {
        // Salvar pedido no Supabase
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending',
            payment_method: 'mercadopago'
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

          // Criar Preferência no Mercado Pago
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
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Payment preference error:', errorData);
            throw new Error(errorData.error || 'Failed to create payment preference');
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
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
}