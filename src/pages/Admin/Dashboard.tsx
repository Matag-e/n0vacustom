import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Search, Filter, Calendar, Clock, ChevronDown, Eye, Trash2, 
  XCircle, Truck, MapPin, Phone, MessageSquare, Copy, Users, FileText, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  size: string;
  is_customized: boolean;
  custom_name?: string;
  custom_number?: string;
  product?: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  tracking_code: string;
  order_code: string;
  payment_method: string;
  order_items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Truck },
  completed: { label: 'Entregue', color: 'bg-purple-100 text-purple-800', icon: Package },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  async function updateTracking(orderId: string, code: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_code: code,
          status: code ? 'shipped' : undefined
        })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { 
          ...order, 
          tracking_code: code,
          status: code ? 'shipped' : order.status
        } : order
      ));
      
      if (code) {
        // Disparar e-mail de rastreio
        fetch('/api/emails/order-shipped', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, trackingCode: code })
        }).catch(err => console.error('Erro ao disparar e-mail de rastreio:', err));
      }

      toast.success('Código de rastreio atualizado');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Erro ao atualizar rastreio');
    }
  }

  async function deleteOrder(orderId: string) {
    if (!window.confirm('Tem certeza que deseja excluir este pedido permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Pedido excluído');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    }
  }

  const copyAddress = (order: Order) => {
    const text = `
Destinatário: ${order.first_name} ${order.last_name}
CPF: ${order.cpf}
Endereço: ${order.address}, ${order.number}
Bairro: ${order.district}
Complemento: ${order.complement || 'N/A'}
Cidade/UF: ${order.city} - ${order.state}
CEP: ${order.cep}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Endereço copiado para a área de transferência!');
  };

  const printDeclaration = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Gerar etiqueta ZPL (simulada como HTML para impressora térmica 10x15)
    const shippingLabelHtml = `
      <html>
        <head>
          <title>Etiqueta de Envio - Pedido #${order.order_code || order.id?.slice(0, 8)}</title>
          <style>
            @page { size: 100mm 150mm; margin: 0; }
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 10mm; color: #000; }
            .label-container { border: 2px solid #000; height: 130mm; padding: 5mm; display: flex; flex-direction: column; }
            .header { border-bottom: 2px solid #000; padding-bottom: 5mm; margin-bottom: 5mm; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
            .order-info { text-align: right; }
            .section { margin-bottom: 8mm; }
            .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm; display: block; border-bottom: 1px solid #ddd; }
            .content { font-size: 14px; line-height: 1.4; font-weight: bold; }
            .cep { font-size: 24px; font-weight: 900; margin-top: 5mm; }
            .footer { margin-top: auto; border-top: 2px solid #000; pt: 5mm; display: flex; justify-content: space-between; font-size: 10px; }
            .barcode-sim { background: #000; height: 15mm; width: 100%; margin: 5mm 0; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <div class="logo">NovaCustom</div>
              <div class="order-info">
                <div style="font-size: 10px;">Data: ${new Date(order.created_at).toLocaleDateString()}</div>
                <div style="font-size: 12px;">Pedido: #${order.order_code || order.id?.slice(0, 8)}</div>
              </div>
            </div>

            <div class="section">
              <span class="section-title">Destinatário</span>
              <div class="content">
                ${order.first_name} ${order.last_name}<br>
                ${order.address}, ${order.number}<br>
                ${order.complement ? order.complement + '<br>' : ''}
                ${order.district}<br>
                ${order.city} - ${order.state}
              </div>
              <div class="cep">CEP: ${order.cep}</div>
            </div>

            <div class="barcode-sim"></div>

            <div class="section" style="margin-top: 5mm;">
              <span class="section-title">Remetente</span>
              <div style="font-size: 12px;">
                NovaCustom Mantos Exclusivos<br>
                Logística Reversa / E-commerce<br>
                São Paulo - SP
              </div>
            </div>

            <div class="footer">
              <div>Peso Estimado: 0.350kg</div>
              <div>Declaração de Conteúdo Anexa</div>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;

    printWindow.document.write(shippingLabelHtml);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.order_code && order.order_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total_amount, 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Dashboard | Admin NovaCustom</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Gestão de Pedidos</h1>
          <p className="text-gray-500">Acompanhe e gerencie as vendas da loja em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Painel ao vivo</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Pedidos realizados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendentes</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Aguardando pagto</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagos</span>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.paid}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Prontos para envio</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receita</span>
          </div>
          <p className="text-2xl font-black text-gray-900">R$ {stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Vendas brutas</p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                filterStatus === 'all' ? "bg-black text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              )}
            >
              Todos
            </button>
            {Object.entries(STATUS_MAP).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
                  filterStatus === status ? "bg-black text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
              >
                <config.icon className="w-3 h-3" />
                {config.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, Código ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data/Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contato</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = STATUS_MAP[order.status]?.icon || Clock;
                  const whatsappNumber = order.phone?.replace(/\D/g, '');
                  const whatsappMessage = encodeURIComponent(
                    `Olá, ${order.first_name}! Tudo certo?\n\nAqui é da Nova Custom.\n\nIdentificamos sua compra e seu pedido já está em produção!\n\nDentro de 2 a 3 dias, vamos te enviar fotos das camisas para aprovação. Após o seu ok, já liberamos o envio e te mandamos o código de rastreio pra acompanhar tudo.\n\nQualquer dúvida, só chamar!`
                  );
                  const whatsappUrl = whatsappNumber ? `https://wa.me/55${whatsappNumber}?text=${whatsappMessage}` : null;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">#{order.order_code || order.id?.slice(0, 8)}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.order_items?.length || 0} itens
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-bold">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-xs text-gray-500 lowercase">
                          {order.email}
                        </div>
                        {!order.user_id && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold mt-1 inline-block">
                            Convidado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{order.phone || 'N/A'}</span>
                          </div>
                          {whatsappUrl && (
                            <a 
                              href={whatsappUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-bold text-[10px] uppercase transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        R$ {order.total_amount.toFixed(2).replace('.', ',')}
                        <div className="text-xs font-normal text-gray-500 mt-1 uppercase">
                          {order.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase",
                          STATUS_MAP[order.status]?.color || "bg-gray-100 text-gray-800"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_MAP[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative group/actions">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg p-2 pr-8 focus:ring-2 focus:ring-black focus:border-transparent outline-none cursor-pointer appearance-none hover:border-gray-400 transition-colors"
                            >
                              <option value="pending">Pendente</option>
                              <option value="paid">Pago</option>
                              <option value="shipped">Enviado</option>
                              <option value="completed">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingInput(order.tracking_code || '');
                            }}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir Pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Detalhes do Pedido</h2>
                <p className="text-xs text-gray-400 font-mono">#{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    Dados de Entrega
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                    <p><strong>Nome:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                    <p><strong>CPF:</strong> {selectedOrder.cpf}</p>
                    <p><strong>CEP:</strong> {selectedOrder.cep}</p>
                    <p><strong>Endereço:</strong> {selectedOrder.address}, {selectedOrder.number}</p>
                    <p><strong>Bairro:</strong> {selectedOrder.district}</p>
                    <p><strong>Cidade/UF:</strong> {selectedOrder.city} - {selectedOrder.state}</p>
                    {selectedOrder.complement && <p><strong>Comp:</strong> {selectedOrder.complement}</p>}
                    
                    <button 
                      onClick={() => copyAddress(selectedOrder)}
                      className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-all w-full justify-center"
                    >
                      <Copy className="w-3 h-3" />
                      COPIAR ENDEREÇO PARA FRETE
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Informações de Contato
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4 text-sm">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <strong>E-mail:</strong> 
                        <span className="text-gray-600">{selectedOrder.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>Telefone:</strong> 
                        <span className="text-gray-600">{selectedOrder.phone || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>Tipo:</strong> 
                        <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase font-bold">
                          {selectedOrder.user_id ? 'Cliente Cadastrado' : 'Convidado'}
                        </span>
                      </p>
                    </div>

                    {selectedOrder.phone && (
                      <a 
                        href={`https://wa.me/55${selectedOrder.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá, ${selectedOrder.first_name}! Tudo certo?\n\nAqui é da Nova Custom.\n\nIdentificamos sua compra e seu pedido já está em produção!\n\nDentro de 2 a 3 dias, vamos te enviar fotos das camisas para aprovação. Após o seu ok, já liberamos o envio e te mandamos o código de rastreio pra acompanhar tudo.\n\nQualquer dúvida, só chamar!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-3 rounded-lg transition-all w-full justify-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        ENTRAR EM CONTATO VIA WHATSAPP
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    Logística & Rastreio
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Código de Rastreio</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="Ex: BR123456789"
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                        />
                        <button 
                          onClick={() => updateTracking(selectedOrder.id, trackingInput)}
                          className="bg-black text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-900 transition-all"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => printDeclaration(selectedOrder)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black bg-white border border-gray-200 px-3 py-2 rounded-lg transition-all w-full justify-center"
                    >
                      <FileText className="w-3 h-3" />
                      IMPRIMIR ETIQUETA DE ENVIO
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Itens do Pedido</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px]">Produto</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase text-[10px]">Tam</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase text-[10px]">Qtd</th>
                        <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase text-[10px]">Preço</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.order_items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-medium">{item.product?.name || 'Produto'}</td>
                          <td className="px-4 py-3 text-center">{item.size || 'N/A'}</td>
                          <td className="px-4 py-3 text-center">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-right font-bold">R$ {(item.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-black">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right uppercase text-[10px]">Total do Pedido</td>
                        <td className="px-4 py-3 text-right text-lg text-blue-600">
                          R$ {selectedOrder.total_amount.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
