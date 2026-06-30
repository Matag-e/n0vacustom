import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  size: string;
  customization_name?: string;
  customization_number?: string;
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
  order_items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Package },
  completed: { label: 'Entregue', color: 'bg-purple-100 text-purple-800', icon: Package },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Package },
};

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching orders for reports:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total_amount, 0),
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
  };

  // Calculate top selling products
  const getTopSellingProducts = () => {
    const productSales: Record<string, { name: string; image_url?: string; quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      
      order.order_items?.forEach(item => {
        const productName = item.product?.name || 'Produto Desconhecido';
        const productImage = item.product?.image_url;
        
        if (!productSales[productName]) {
          productSales[productName] = { 
            name: productName, 
            image_url: productImage, 
            quantity: 0, 
            revenue: 0 
          };
        }
        
        productSales[productName].quantity += item.quantity || 0;
        productSales[productName].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topSellingProducts = getTopSellingProducts();
  const maxQuantity = topSellingProducts.length > 0 ? Math.max(...topSellingProducts.map(p => p.quantity)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Relatórios | Admin Nova Custom</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Análise de dados da sua loja.</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Pedidos Total</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">R$ {stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Receita Total</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.cancelledOrders}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Pedidos Cancelados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalOrders - stats.cancelledOrders}</p>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase">Pedidos Válidos</p>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Produtos Mais Vendidos
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase">Top 5</span>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhum produto vendido ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {topSellingProducts.map((product, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        R$ {product.revenue.toFixed(2).replace('.', ',')} • {product.quantity} un.
                      </p>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-700"
                      style={{
                        width: maxQuantity > 0 ? `${(product.quantity / maxQuantity) * 100}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Distribuição de Pedidos
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(STATUS_MAP).map(([status, config]) => {
              const count = orders.filter(o => o.status === status).length;
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className="w-3 h-3" style={{ color: status === 'pending' ? '#ca8a04' : status === 'paid' ? '#16a34a' : status === 'shipped' ? '#2563eb' : status === 'completed' ? '#a855f7' : '#dc2626' }} />
                      <span className="text-xs font-bold text-gray-700 uppercase">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">{count}</span>
                      <span className="text-xs text-gray-400">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: status === 'pending' ? '#eab308' : status === 'paid' ? '#22c55e' : status === 'shipped' ? '#3b82f6' : status === 'completed' ? '#a855f7' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
