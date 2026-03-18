import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Truck, CheckCircle2, Clock, XCircle, Search, 
  ChevronDown, Filter, DollarSign, Calendar, Eye, Copy, FileText, Download, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

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
      alert('Erro ao carregar pedidos.');
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
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status.');
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
      alert('Código de rastreio salvo!');
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Erro ao salvar código.');
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
    alert('Endereço copiado para a área de transferência!');
  };

  const printDeclaration = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Declaração de Conteúdo - Pedido #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; font-size: 12px; }
            .box { border: 1px solid black; padding: 10px; margin-bottom: 10px; }
            .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; }
            .section-title { font-weight: bold; background: #eee; padding: 5px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid black; padding: 5px; text-align: left; }
            .footer { margin-top: 30px; border-top: 1px solid black; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">DECLARAÇÃO DE CONTEÚDO</div>
          
          <div class="box">
            <div class="section-title">REMETENTE</div>
            <p><strong>Nome:</strong> NOVA CUSTOM</p>
            <p><strong>CPF/CNPJ:</strong> 49364325800</p>
            <p><strong>Endereço:</strong> Rua Tetsuko Kanai, 1515</p>
            <p><strong>Cidade/UF/CEP:</strong> São Paulo - SP - 05757280</p>
          </div>

          <div class="box">
            <div class="section-title">DESTINATÁRIO</div>
            <p><strong>Nome:</strong> ${order.first_name} ${order.last_name}</p>
            <p><strong>CPF/CNPJ:</strong> ${order.cpf}</p>
            <p><strong>Endereço:</strong> ${order.address}, ${order.number} ${order.complement ? `(${order.complement})` : ''}</p>
            <p><strong>Bairro:</strong> ${order.district}</p>
            <p><strong>Cidade/UF/CEP:</strong> ${order.city} - ${order.state} - ${order.cep}</p>
          </div>

          <div class="box">
            <div class="section-title">CONTEÚDO</div>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items?.map(item => `
                  <tr>
                    <td>${item.product?.name || 'Produto'} (Tam: ${item.size || 'N/A'})</td>
                    <td>${item.quantity || 0}</td>
                    <td>R$ ${(item.price || 0).toFixed(2)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="3">Nenhum item encontrado</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/96, logo não sou obrigado a emitir nota fiscal.</p>
            <br><br>
            <div style="text-align: center; border-top: 1px solid black; width: 300px; margin: 0 auto; padding-top: 5px;">
              Assinatura do Remetente
            </div>
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const exportToShippingCSV = () => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    
    if (paidOrders.length === 0) {
      alert('Nenhum pedido pago encontrado para exportar.');
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
        order.id.slice(0, 8),
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
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter(o => ['paid', 'shipped', 'completed'].includes(o.status))
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-8">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Receita Total</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          <p className="text-xs text-gray-400 mt-1">Pedidos pagos e concluídos</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total de Pedidos</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-1">Todos os pedidos registrados</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Pendentes</h3>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-xs text-gray-400 mt-1">Aguardando pagamento</p>
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
                        <span className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
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
                          {order.user_id.slice(0, 8)}...
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
                      GERAR DECLARAÇÃO DE CONTEÚDO
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
