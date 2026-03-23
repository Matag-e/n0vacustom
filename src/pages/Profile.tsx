import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Package, User, LogOut, ChevronRight, Clock, CheckCircle2, XCircle, ShoppingBag, CreditCard, Banknote, Trash2, Heart } from 'lucide-react';
import { QRCodeModal } from '@/components/QRCodeModal';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  tracking_code?: string;
}

import { Wishlist } from '@/components/Wishlist';

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Remove o filtro de 5 minutos que estava escondendo pedidos pendentes antigos
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    // Check for Mercado Pago return parameters
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') || urlParams.get('collection_status');
    
    if (status === 'approved') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Limpar os parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (user) {
      fetchOrders();
      // Set up an interval to re-check/refresh orders every minute
      const interval = setInterval(fetchOrders, 30000); // Reduzi para 30s para ser mais responsivo após pagamento
      return () => clearInterval(interval);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido: ' + (error.message || 'Verifique se o pedido já foi pago.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (order: Order) => {
    if (order.payment_method === 'pix') {
      setSelectedOrder(order);
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          totalAmount: order.total_amount,
          paymentMethod: order.payment_method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro no servidor (Status ${response.status})`);
      }

      const { init_point } = await response.json();
      
      if (init_point) {
        window.location.href = init_point;
      } else {
        toast.error('Houve um erro ao gerar o pagamento. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Error generating MP preference:', error);
      toast.error('Erro de conexão ao Mercado Pago. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Acesso Restrito</h2>
          <p className="text-gray-500">Faça login para visualizar seu perfil e acompanhar seus pedidos.</p>
          <Link 
            to="/login" 
            className="block w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pt-24 pb-20 transition-colors duration-300">
      <Helmet>
        <title>Meu Perfil | NovaCustom</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {showSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold">Pagamento Confirmado!</p>
              <p className="text-sm opacity-90">Seu pedido foi processado e em breve será preparado para envio.</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-gray-400 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Minha Conta</span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">
              Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'Torcedor'}
            </h1>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar / User Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Usuário</p>
                  <p className="font-bold text-gray-900 truncate max-w-[200px]">{user.email}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">ID da Conta</span>
                  <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded text-gray-400">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Membro desde</span>
                  <span className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  const element = document.getElementById('orders-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-black transition-colors"
              >
                 <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                 </div>
                 <span className="text-2xl font-black text-gray-900">{orders.length}</span>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedidos</span>
              </button>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:border-green-500 transition-colors">
                 <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <span className="text-2xl font-black text-gray-900">{orders.filter(o => o.status === 'completed').length}</span>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entregues</span>
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black uppercase tracking-wider mb-2 text-lg">Bem-vindo ao Vestiário</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Aqui você escala seus próximos mantos e acompanha sua coleção. O jogo começa agora.
                </p>
                <Link to="/clubes" className="inline-flex items-center text-xs font-bold uppercase tracking-widest border-b border-white pb-1 hover:opacity-80 transition-opacity">
                  Ver Novidades <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Wishlist Sidebar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Meus Favoritos
              </h3>
              <Wishlist />
            </div>
          </div>

          {/* Main Content / Orders */}
          <div className="lg:col-span-8">
            <h2 id="orders-section" className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 scroll-mt-24">
              <Package className="w-5 h-5" />
              Histórico de Pedidos
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Parece que você ainda não garantiu seu manto. Explore nossa coleção e vista a paixão.
                </p>
                <Link 
                  to="/clubes" 
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-900 transition-all"
                >
                  Explorar Coleção
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Order Info */}
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                          order.status === 'paid' || order.status === 'completed' ? "bg-green-50 text-green-600" :
                          order.status === 'shipped' ? "bg-blue-50 text-blue-600" :
                          order.status === 'delivered' ? "bg-purple-50 text-purple-600" :
                          order.status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                          "bg-gray-50 text-gray-400"
                        )}>
                          {order.status === 'paid' || order.status === 'completed' || order.status === 'delivered' ? <CheckCircle2 className="w-6 h-6" /> :
                           order.status === 'shipped' ? <Package className="w-6 h-6" /> :
                           order.status === 'pending' ? <Clock className="w-6 h-6" /> :
                           <XCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <h3 className="font-bold text-gray-900">
                            {new Date(order.created_at).toLocaleDateString('pt-BR', { 
                              day: '2-digit', month: 'long', year: 'numeric' 
                            })}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs text-gray-500 flex items-center gap-1">
                               {order.payment_method === 'pix' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                               {order.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                             </span>
                             {order.tracking_code && (
                               <a 
                                 href={`https://www.linkcorreios.com.br/${order.tracking_code}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                 onClick={(e) => e.stopPropagation()}
                               >
                                 <Truck className="w-3 h-3" />
                                 Rastrear: {order.tracking_code}
                               </a>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Total */}
                      <div className="flex items-center justify-between md:justify-end gap-8 flex-1">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">Status</p>
                          <div className="flex flex-col items-end gap-2">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                              order.status === 'paid' ? "bg-blue-100 text-blue-800" :
                              order.status === 'shipped' ? "bg-indigo-100 text-indigo-800" :
                              order.status === 'completed' || order.status === 'delivered' ? "bg-green-100 text-green-800" :
                              order.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            )}>
                              {order.status === 'pending' ? 'Pendente' : 
                               order.status === 'paid' ? 'Pago' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'completed' || order.status === 'delivered' ? 'Entregue' :
                               order.status === 'cancelled' ? 'Cancelado' : order.status}
                            </span>
                            
                            {order.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(order.id);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Excluir Pedido"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayNow(order);
                                  }}
                                  className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-900 transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  {order.payment_method === 'pix' ? 'Pagar com PIX' : 'Pagar com Cartão'}
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            {order.status === 'cancelled' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir Pedido"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[100px]">
                          <p className="text-xs text-gray-400 mb-1">Total</p>
                          <p className="text-lg font-black text-gray-900">
                            R$ {order.total_amount.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedOrder && (
        <QRCodeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
