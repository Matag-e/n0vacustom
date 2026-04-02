import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Truck, CheckCircle2, Clock, XCircle, Search, 
  ChevronDown, Filter, DollarSign, Calendar, Eye, Copy, FileText, Download, Plus, Trash2,
  AlertTriangle, TrendingUp, BarChart3, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  tracking_code: string;
  order_code: string;
  order_items: {
    quantity: number;
    price: number;
    size: string;
    product: {
      name: string;
    };
  }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Pago', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  completed: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchLowStock();
  }, []);

  async function fetchLowStock() {
    try {
      const { data, error } = await supabase
        .from('product_stock')
        .select('*, product:products(name)')
        .lt('quantity', 3)
        .gt('quantity', 0)
        .order('quantity', { ascending: true });

      if (error) throw error;
      setLowStockItems(data || []);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            size,
            product:products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos.');
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
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Status atualizado!');

      if (newStatus === 'shipped') {
        const order = orders.find(o => o.id === orderId)
        if (!order?.tracking_code) {
          toast.error('Defina o código de rastreio para disparar o e-mail de envio.')
        } else {
          await triggerOrderShippedEmail(orderId)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status.');
    }
  }

  async function updateTracking(orderId: string, code: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_code: code })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_code: code } : o));
      toast.success('Código de rastreio salvo!');

      const order = orders.find(o => o.id === orderId)
      if (order?.status === 'shipped') {
        await triggerOrderShippedEmail(orderId)
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Erro ao salvar código.');
    }
  }

  async function triggerOrderShippedEmail(orderId: string) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      const response = await fetch('/api/emails/order-shipped', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error('Erro ao enviar e-mail de envio.')
        console.error('order-shipped email error:', json)
        return
      }

      if (json?.skipped) {
        return
      }

      toast.success('E-mail de envio disparado!')
    } catch (err) {
      console.error('triggerOrderShippedEmail error:', err)
      toast.error('Erro ao disparar e-mail de envio.')
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Não foi possível excluir o pedido. Verifique se as políticas de RLS foram aplicadas no Supabase.');
      }

      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Pedido excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido: ' + (error.message || 'Verifique as permissões.'));
    }
  }

  const copyAddress = (order: Order) => {
    const text = `${order.first_name} ${order.last_name}
CPF: ${order.cpf}
CEP: ${order.cep}
Endereço: ${order.address}, ${order.number} ${order.complement ? `(${order.complement})` : ''}
Bairro: ${order.district}
Cidade: ${order.city} - ${order.state}`;
    
    navigator.clipboard.writeText(text);
    toast.success('Endereço copiado!');
  };

  const printDeclaration = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Gerar etiqueta ZPL (simulada como HTML para impressora térmica 10x15)
    const shippingLabelHtml = `
      <html>
        <head>
          <title>Etiqueta de Envio - Pedido #${order.id?.slice(0, 8) || ''}</title>
          <style>
            @media print {
              @page { size: 100mm 150mm; margin: 0; }
              body { margin: 0; padding: 0; }
            }
            body { font-family: Arial, sans-serif; width: 100mm; height: 150mm; padding: 5mm; box-sizing: border-box; border: 1px dashed #ccc; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
            .logo { font-size: 20px; font-weight: bold; text-transform: uppercase; }
            .tracking { text-align: center; margin: 15px 0; }
            .barcode { height: 50px; background: #000; width: 80%; margin: 0 auto; } /* Simulação */
            .address-box { border: 2px solid #000; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .label-title { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
            .recipient-name { font-size: 16px; font-weight: bold; }
            .address-text { font-size: 12px; line-height: 1.4; margin-top: 5px; }
            .sender-box { font-size: 10px; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NOVA CUSTOM</div>
            <div style="font-size: 12px;">Pedido: #${order.id?.slice(0, 8) || ''}</div>
          </div>

          <div class="address-box">
            <div class="label-title">DESTINATÁRIO</div>
            <div class="recipient-name">${order.first_name} ${order.last_name}</div>
            <div class="address-text">
              ${order.address}, ${order.number} ${order.complement ? `(${order.complement})` : ''}<br>
              ${order.district}<br>
              ${order.city} - ${order.state}<br>
              <strong>CEP: ${order.cep}</strong>
            </div>
          </div>

          <div class="tracking">
            <div style="font-size: 12px; margin-bottom: 5px;">Rastreamento</div>
            <div style="border: 1px solid #000; padding: 10px; font-family: monospace; font-weight: bold; font-size: 14px;">
              ${order.tracking_code || 'PENDENTE DE POSTAGEM'}
            </div>
          </div>

          <div class="sender-box">
            <strong>REMETENTE:</strong><br>
            NOVA CUSTOM - CNPJ: 49.364.325/0001-00<br>
            Rua Tetsuko Kanai, 1515<br>
            São Paulo - SP - 05757-280
          </div>

          <div class="footer">
            Declaração de Conteúdo Simplificada Anexa
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(shippingLabelHtml);
    printWindow.document.close();
  };

  const exportToShippingCSV = () => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    
    if (paidOrders.length === 0) {
      toast.error('Nenhum pedido pago encontrado para exportar.');
      return;
    }

    // Header compatible with most platforms (Melhor Envio / Super Frete)
    const headers = [
      'ID Pedido', 'Nome Destinatário', 'CPF/CNPJ', 'E-mail', 'Celular', 
      'CEP', 'Endereço', 'Número', 'Complemento', 'Bairro', 'Cidade', 'UF',
      'Produto', 'Quantidade', 'Valor Unitário'
    ].join(';');

    const rows = paidOrders.flatMap(order => 
      order.order_items.map(item => [
        order.id?.slice(0, 8) || '',
        `${order.first_name} ${order.last_name}`,
        order.cpf.replace(/\D/g, ''),
        order.email,
        order.phone.replace(/\D/g, ''),
        order.cep.replace(/\D/g, ''),
        order.address,
        order.number,
        order.complement || '',
        order.district,
        order.city,
        order.state.substring(0, 2).toUpperCase(),
        item.product?.name || 'Produto',
        item.quantity,
        item.price.toFixed(2)
      ].join(';'))
    );

    const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `envios_novacustom_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const totalRevenue = orders
    .filter(o => ['paid', 'shipped', 'completed'].includes(o.status))
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  async function clearCancelledOrders() {
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    if (cancelledOrders.length === 0) {
      toast.error('Nenhum pedido cancelado para excluir.');
      return;
    }

    if (!confirm(`Deseja excluir permanentemente todos os ${cancelledOrders.length} pedidos cancelados?`)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('status', 'cancelled')
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Nenhum pedido foi excluído. Verifique se as políticas de RLS foram aplicadas no Supabase.');
      }

      setOrders(orders.filter(o => o.status !== 'cancelled'));
      toast.success('Pedidos cancelados excluídos!');
    } catch (error: any) {
      console.error('Error clearing cancelled orders:', error);
      toast.error('Erro ao limpar pedidos: ' + (error.message || 'Verifique as permissões.'));
    }
  }

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard Admin | NovaCustom</title>
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral da sua loja Nova Custom.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/products"
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto
          </Link>
          <button 
            onClick={exportToShippingCSV}
            className="flex items-center gap-2 bg-white text-black border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button 
            onClick={clearCancelledOrders}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Cancelados
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Faturamento Total</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase">Em crescimento</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Pedidos</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{orders.length}</p>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">Volume total de vendas</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Ticket Médio</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            R$ {orders.length > 0 ? (totalRevenue / orders.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </p>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">Média por pedido</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Pendentes</h3>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">Aguardando pagamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
            <h3 className="font-black uppercase tracking-tight flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Estoque Crítico
            </h3>
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {lowStockItems.length}
            </span>
          </div>
          <div className="p-6">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-green-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase">Tudo em dia!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-red-200 transition-all">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase truncate">
                        {item.product?.name || 'Produto'}
                      </p>
                      <p className="text-sm font-bold text-gray-900">Tamanho {item.size}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-red-600">{item.quantity}</span>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Restantes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {lowStockItems.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link to="/admin/inventory" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest block text-center">
                Gerenciar Inventário Completo
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID do pedido..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          

        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          {['all', 'pending', 'paid', 'shipped', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap",
                filterStatus === status 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {status === 'all' ? 'Todos' : STATUS_MAP[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Pedido</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Data</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Cliente</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Total</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Carregando pedidos...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = STATUS_MAP[order.status]?.icon || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">#{order.order_code || order.id?.slice(0, 8) || ''}</span>
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
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500" title={order.user_id}>
                          {order.user_id?.slice(0, 8) || ''}...
                        </span>
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
