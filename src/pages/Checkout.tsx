import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, ShoppingBag, Copy, CheckCircle2, QrCode, X, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn, transformImageUrl, buildSrcSet, originalImageUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { maskCPF, maskPhone, maskCEP } from '@/lib/masks';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface PixResult {
  id: number;
  orderId: string;
  order_code?: string;
  qr_code: string;
  qr_code_base64: string;
  status: string;
  amount: number;
  ticket_url?: string;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<{ 
    type: 'percentage' | 'fixed' | 'buy_x_get_y', 
    value: number, 
    code: string,
    min_purchase_amount?: number,
    min_quantity?: number
  } | null>(null);
  const [pixResult, setPixResult] = useState<PixResult | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialize Mercado Pago Device ID
  useEffect(() => {
    const initializeMP = async () => {
      try {
        if ((window as any).MercadoPago) {
          const mp = new (window as any).MercadoPago('TEST-fc7592ea-d8bb-4fe0-a42d-ca7e78d278de');
          const sid = mp.getFingerprint();
          if (sid) {
            setDeviceId(sid);
            console.log('[MP] Device ID gerado:', sid);
          }
        }
      } catch (err) {
        console.error('[MP] Erro ao inicializar SDK para Device ID:', err);
      }
    };

    initializeMP();
  }, []);

  // Auto-apply promotions
  useEffect(() => {
    async function checkAutoPromos() {
      try {
        const { data, error } = await supabase
          .rpc('get_active_auto_promos')
          .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const promo = data[0];
          const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
          
          if (totalItems >= promo.value) {
            setDiscount({
              type: promo.type as any,
              value: promo.value,
              code: 'PROMOÇÃO AUTOMÁTICA',
              min_purchase_amount: promo.min_purchase_amount,
              min_quantity: promo.min_quantity
            });
          } else {
            // Se o carrinho diminuiu e não atende mais a promo automática
            if (discount?.code === 'PROMOÇÃO AUTOMÁTICA') {
              setDiscount(null);
            }
          }
        }
      } catch (err) {
        console.error('Error checking auto promos:', err);
      }
    }

    checkAutoPromos();
  }, [items, discount?.code]);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Realtime: assina atualização de status do pedido
  useEffect(() => {
    if (!pixResult?.orderId) return;
    const channel = supabase
      .channel(`order:${pixResult.orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${pixResult.orderId}`,
      }, (payload) => {
        const status = (payload.new as any)?.status;
        if (status === 'paid') {
          setIsPaid(true);
          toast.success('Pagamento confirmado!');
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [pixResult?.orderId]);

  // Polling para verificar se o PIX foi pago
  useEffect(() => {
    let interval: any;

    if (pixResult && !isPaid) {
      console.log('[Checkout] Iniciando polling para verificar pagamento do pedido:', pixResult.orderId);
      
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('status')
            .eq('id', pixResult.orderId)
            .maybeSingle();

          if (error) {
            console.error('[Checkout] Erro ao verificar status do pedido:', error);
            return;
          }

          if (data?.status === 'paid') {
            console.log('[Checkout] Pagamento confirmado via polling!');
            setIsPaid(true);
            clearInterval(interval);
            toast.success('Pagamento confirmado com sucesso!');
          }
        } catch (err) {
          console.error('[Checkout] Erro no polling:', err);
        }
      }, 5000); // Verifica a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixResult, isPaid]);

  useEffect(() => {
    if (items.length > 0 && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_ids: items.map(item => item.product.id),
        content_type: 'product',
        value: totalPrice,
        currency: 'BRL',
        num_items: items.reduce((acc, item) => acc + item.quantity, 0)
      });
    }
  }, []);

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
    createAccount: false,
    password: '',
  });

  const calculateTotal = () => {
    let subtotal = totalPrice;
    let discountAmount = 0;

    if (discount) {
      if (discount.type === 'percentage') {
        discountAmount = subtotal * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'buy_x_get_y') {
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
        const freeItemsCount = Math.floor(totalItems / discount.value);
        
        if (freeItemsCount > 0) {
          const allPrices = items.flatMap(item => Array(item.quantity).fill(item.product.price + (item.isCustomized ? 30 : 0)))
            .sort((a, b) => a - b);
          
          discountAmount = allPrices.slice(0, freeItemsCount).reduce((acc, price) => acc + price, 0);
        }
      }
    }

    const afterCoupon = subtotal - discountAmount;
    const pixDiscount = formData.paymentMethod === 'pix' ? afterCoupon * 0.05 : 0;
    
    return {
      subtotal,
      discountAmount,
      pixDiscount,
      total: Math.max(0, afterCoupon - pixDiscount)
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const { data, error } = await supabase
        .rpc('validate_coupon', { p_code: couponCode.toUpperCase() })
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Cupom inválido ou expirado');
        return;
      }

      // 1. Verificar expiração
      const now = new Date();
      if (data.expires_at && new Date(data.expires_at) < now) {
        toast.error('Este cupom já expirou');
        return;
      }

      // 2. Limite global de usos
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        toast.error('Este cupom atingiu o limite de usos');
        return;
      }

      // 3. Compra mínima
      if (data.min_purchase_amount && totalPrice < data.min_purchase_amount) {
        toast.error(`Compra mínima para este cupom: R$ ${data.min_purchase_amount}`);
        return;
      }

      // 4. Quantidade mínima
      const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
      if (data.min_quantity && totalItems < data.min_quantity) {
        toast.error(`Mínimo de ${data.min_quantity} itens para este cupom`);
        return;
      }

      // 5. Regra de Primeira Compra (Só para usuários logados)
      if (data.is_first_purchase) {
        if (!user) {
          toast.error('Faça login para usar este cupom de primeira compra');
          return;
        }

        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('status', 'eq', 'cancelled');
          
        if (countError) throw countError;
        
        if (count && count > 0) {
          toast.error('Este cupom é exclusivo para a primeira compra');
          return;
        }
      }

      // 6. Limite de uso por usuário (Só para usuários logados)
      if (data.usage_limit_per_user && user) {
        const { count, error: usageError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('coupon_code', data.code)
          .not('status', 'eq', 'cancelled');
          
        if (usageError) throw usageError;
        
        if (count && count >= data.usage_limit_per_user) {
          toast.error(`Você já usou este cupom o limite de ${data.usage_limit_per_user} vezes`);
          return;
        }
      }

      setDiscount({
        type: data.type,
        value: data.value,
        code: data.code,
        min_purchase_amount: data.min_purchase_amount,
        min_quantity: data.min_quantity
      });
      toast.success(`Cupom ${data.code} aplicado!`);
    } catch (err) {
      console.error('Erro ao aplicar cupom:', err);
      toast.error('Erro ao processar cupom');
    }
  };

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email || prev.email }));
      
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, cpf, cep, address, number, complement, district, city, state')
          .eq('id', user.id)
          .single();
        
        if (data) {
          const names = (data.full_name || '').split(' ');
          setFormData(prev => ({
            ...prev,
            firstName: names[0] || prev.firstName,
            lastName: names.slice(1).join(' ') || prev.lastName,
            phone: data.phone || prev.phone,
            cpf: data.cpf || prev.cpf,
            cep: data.cep || prev.cep,
            address: data.address || prev.address,
            number: data.number || prev.number,
            complement: data.complement || prev.complement,
            district: data.district || prev.district,
            city: data.city || prev.city,
            state: data.state || prev.state,
          }));
        }
      };
      
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'phone') maskedValue = maskPhone(value);
    if (name === 'cep') maskedValue = maskCEP(value);
    if (name === 'cvv' || name === 'number') maskedValue = value.replace(/\D/g, '');

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            district: data.bairro || prev.district,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPix = formData.paymentMethod === 'pix';
    console.log('[Checkout] Iniciando finalização do pedido. Método:', formData.paymentMethod);

    setLoading(true);
    
    try {
      const { total, discountAmount, pixDiscount } = calculateTotal();
      const totalAmount = Number(total.toFixed(2));

      let currentUserId = user?.id || null;

      // 0. CRIAR CONTA SE SOLICITADO
      if (formData.createAccount && !user) {
        console.log('[Checkout] Tentando criar conta para o usuário...');
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                cpf: formData.cpf,
                cep: formData.cep,
                address: formData.address,
                number: formData.number,
                complement: formData.complement,
                district: formData.district,
                city: formData.city,
                state: formData.state,
              }
            }
          });

          if (signUpError) {
            console.error('[Checkout] Erro ao criar conta:', signUpError);
            if (signUpError.message.includes('already registered')) {
              toast.error('Este e-mail já possui conta. A compra seguirá como convidado.');
            } else {
              toast.error('Erro ao criar conta. A compra seguirá como convidado.');
            }
          } else if (signUpData.user) {
            currentUserId = signUpData.user.id;
            console.log('[Checkout] Conta criada com sucesso ID:', currentUserId);
            toast.success('Conta criada! Verifique seu e-mail futuramente.');
          }
        } catch (err) {
          console.error('[Checkout] Falha crítica no signUp:', err);
        }
      }

      // 1. CRIAR O PEDIDO NO SUPABASE
      let orderId = String(Date.now()); // Fallback ID

      const orderPayload: any = {
        user_id: currentUserId, // Usa o ID logado ou recém-criado
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
      };

      if (discount) {
        orderPayload.coupon_code = discount.code;
        orderPayload.discount_amount = discountAmount;
      }

      console.log('[Checkout] Salvando pedido no Supabase...');
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error('[Checkout] Erro ao salvar pedido no Supabase:', orderError);
        throw new Error(`Erro ao registrar pedido: ${orderError.message}`);
      }
      
      if (orderData) {
        orderId = orderData.id;
        console.log('[Checkout] Pedido salvo com sucesso. ID:', orderId);

        // Incrementar uso do cupom se existir
        if (discount) {
          await supabase.rpc('increment_coupon_usage', { coupon_code: discount.code });
        }

        try {
          const { data } = await supabase.auth.getSession()
          const token = data.session?.access_token
          
          const emailRes = await fetch('/api/emails/order-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ orderId }),
          })

          if (!emailRes.ok) {
            const json = await emailRes.json().catch(() => ({}))
            console.error('[Checkout] Email confirmação (pedido) falhou:', json)
          }
        } catch (emailErr) {
          console.error('[Checkout] Falha ao disparar e-mail de confirmação:', emailErr)
        }
        
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price + (item.isCustomized ? 30 : 0),
          customization_name: item.isCustomized ? item.customName : null,
          customization_number: item.isCustomized ? item.customNumber : null
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('[Checkout] Erro ao salvar itens do pedido:', itemsError);
        }
      }

      // 2. TRATAR PAGAMENTO
      if (isPix) {
        console.log('[Checkout] Finalizando como PIX Direto via Mercado Pago API');
        
        try {
          const response = await fetch('/api/payments/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalAmount: totalAmount,
              paymentMethod: 'pix',
              orderId: orderId,
              deviceId: deviceId,
              payer: {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                cpf: formData.cpf.replace(/\D/g, ''),
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.details?.message || `Erro ao gerar PIX (Status ${response.status})`);
          }

          const data = await response.json();
          console.log('[Checkout] Pagamento PIX gerado com sucesso:', data);

          setPixResult({
            id: data.id,
            orderId: orderId,
            order_code: orderData?.order_code,
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            status: data.status,
            amount: totalAmount,
            ticket_url: data.ticket_url
          });
          
          clearCart();
          return;
        } catch (pixErr: any) {
          console.error('[Checkout] Erro ao processar PIX no servidor:', pixErr);
          throw new Error(`Erro ao gerar PIX: ${pixErr.message}`);
        }
      }

      // 3. SE NÃO FOR PIX, REDIRECIONAR PARA MERCADO PAGO
      if (formData.paymentMethod === 'mercadopago') {
        console.log('[Checkout] Redirecionando para Mercado Pago (Cartão/Boleto)');
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(item => ({
              product: {
                id: item.product.id,
                name: item.isCustomized ? `${item.product.name} (Personalizada)` : item.product.name,
                price: item.product.price + (item.isCustomized ? 30 : 0),
              },
              quantity: item.quantity,
            })),
            orderId: orderId,
            paymentMethod: formData.paymentMethod,
            totalAmount: totalAmount
          }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            console.error('[Checkout] Erro na API do Mercado Pago:', errorData);
            
            const mpError = errorData.error || 
                            errorData.details?.message || 
                            (errorData.details?.cause && errorData.details.cause[0]?.description) ||
                            'Erro ao criar preferência de pagamento';
            
            throw new Error(mpError);
          } else {
            const textError = await response.text();
            console.error('[Checkout] Erro na API (Não-JSON):', textError);
            throw new Error(`Erro no servidor (Status ${response.status}). Verifique se o backend está rodando.`);
          }
        }

        const data = await response.json();
        if (data.init_point) {
          clearCart();
          window.location.href = data.init_point;
          return;
        }
        throw new Error('Link de pagamento não gerado');
      }
      
    } catch (error: any) {
      console.error('[Checkout] Erro detalhado no processamento:', {
        message: error.message,
        error: error,
        stack: error.stack
      });
      toast.error(`Houve um erro ao processar seu pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (pixResult) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Sucesso */}
            <div className={cn(
              "p-10 text-center text-white space-y-4 transition-colors duration-500",
              isPaid ? "bg-green-600" : "bg-black"
            )}>
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-in zoom-in duration-500",
                isPaid ? "bg-white text-green-600" : "bg-green-500 text-white shadow-green-500/20"
              )}>
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                {isPaid ? 'Pagamento Confirmado!' : 'Pedido Realizado!'}
              </h2>
              <p className={cn(
                "text-sm",
                isPaid ? "text-green-50" : "text-gray-400"
              )}>
                {isPaid 
                  ? 'Seu pagamento foi identificado. Estamos preparando seu pedido!' 
                  : 'Agora falta pouco para seu manto estar a caminho.'}
              </p>
            </div>

            {/* Instruções PIX ou Sucesso */}
            <div className="p-8 md:p-12 space-y-8 text-center">
              {!isPaid ? (
                <>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número do Pedido</span>
                    <p className="text-lg font-black text-gray-900">#{pixResult.order_code || pixResult.orderId?.slice(0, 8)}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor do Pagamento</span>
                    <p className="text-4xl font-black text-gray-900">
                      R$ {pixResult.amount.toFixed(2).replace('.', ',')}
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
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">PIX Copia e Cola (BR Code)</p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-[10px] font-mono text-gray-500 break-all text-left">
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
                  </div>
                </>
              ) : (
                <div className="py-10 space-y-6">
                  <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                    <p className="text-green-800 font-medium">
                      Obrigado pela sua compra! Você receberá um e-mail com os detalhes do seu pedido em instantes.
                    </p>
                  </div>
                  
                  {!user && (
                    <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-blue-600 mb-2">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-blue-900 uppercase tracking-tighter">Quer acompanhar seu pedido?</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Crie uma conta agora para acompanhar o status da entrega, salvar seus endereços e ganhar descontos exclusivos em suas próximas compras!
                      </p>
                      <button 
                        onClick={() => navigate(`/login?isRegister=true&email=${encodeURIComponent(formData.email)}&fullName=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}`)}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                      >
                        Criar minha conta agora
                      </button>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                        Ou enviaremos as atualizações para seu e-mail e celular
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(user ? '/profile' : '/')}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    {user ? 'Ver Meus Pedidos' : 'Voltar para a Loja'}
                  </button>
                </div>
              )}
              
              <div className="pt-4">
                {!isPaid && (
                  <button 
                    onClick={() => navigate(user ? '/profile' : '/')}
                    className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
                  >
                    {user ? 'Ver meus pedidos' : 'Voltar para a loja'}
                  </button>
                )}
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
      <Helmet>
        <title>Finalizar Pedido | NovaCustom</title>
      </Helmet>
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

                  {/* Optional Signup */}
                  {!user && (
                    <div className="md:col-span-2 pt-6 mt-2 border-t border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={formData.createAccount}
                            onChange={(e) => setFormData(prev => ({ ...prev, createAccount: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-black peer-checked:border-black transition-all flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-tight group-hover:text-black transition-colors">
                            Criar uma conta para acompanhar meu pedido e salvar meus dados
                          </span>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                            Ganhe acesso ao histórico de pedidos e salve seus dados para compras futuras.
                          </p>
                        </div>
                      </label>

                      {formData.createAccount && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Defina sua Senha</label>
                            <input 
                              type="password"
                              name="password"
                              required={formData.createAccount}
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                              placeholder="Mínimo 6 caracteres"
                              minLength={6}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                      toast.info('Pague via PIX com 5% de desconto! O QR Code será gerado ao finalizar o pedido.');
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
                    <div className="relative">
                      <input 
                        required 
                        name="cep" 
                        onChange={handleChange} 
                        onBlur={handleCepBlur}
                        value={formData.cep} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                        placeholder="00000-000" 
                        maxLength={9} 
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
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
                      <img 
                        src={transformImageUrl(item.product.image_url || '', { width: 160, quality: 80, format: 'webp' })} 
                        srcSet={buildSrcSet(item.product.image_url || '', [120, 160, 240], 80, 'webp')}
                        sizes="(max-width: 640px) 120px, 160px"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = originalImageUrl(item.product.image_url || '');
                          img.srcset = '';
                          img.sizes = '';
                        }}
                        loading="lazy"
                        alt={item.product.name} 
                        className="w-full h-full object-cover mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">Tamanho: {item.size}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Qtd: {item.quantity}</span>
                        <span className="text-sm font-bold text-gray-900">R$ {((item.product.price + (item.isCustomized ? 30 : 0)) * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 mb-8">
                {/* Cupom de Desconto */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Cupom de Desconto</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="CUPOM10"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all uppercase"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                    >
                      Aplicar
                    </button>
                  </div>
                  {discount && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                      <span className="text-[10px] font-bold text-green-700 uppercase">Cupom {discount.code} aplicado!</span>
                      <button 
                        onClick={() => setDiscount(null)}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {discount && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Desconto ({discount.code})</span>
                    <span>- R$ {calculateTotal().discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Grátis</span>
                </div>
                
                {formData.paymentMethod === 'pix' && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      Desconto PIX (5%)
                      <span className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 rounded-full font-black">OFF</span>
                    </span>
                    <span>- R$ {calculateTotal().pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-gray-900">
                    R$ {calculateTotal().total.toFixed(2).replace('.', ',')}
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
                  formData.paymentMethod === 'pix' ? 'Gerar QR Code Pix' : 'Finalizar e Pagar'
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
