import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Truck, CheckCircle2, Clock, XCircle, Search, 
  ChevronDown, Filter, DollarSign, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  user_id: string;
  order_items: {
    quantity: number;
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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-8">
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
                        {/* We don't have user name joined yet, would need profile join. Showing ID for now */}
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
