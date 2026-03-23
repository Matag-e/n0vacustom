import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2, LayoutDashboard, Package, ShoppingBag, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white p-1 rounded font-bold text-xs tracking-widest px-2">ADMIN</div>
              <span className="font-bold text-gray-900 hidden sm:block">Nova Custom</span>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Link 
                to="/admin" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  location.pathname === "/admin" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                to="/admin/products" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  location.pathname === "/admin/products" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <ShoppingBag className="w-4 h-4" />
                Produtos
              </Link>
              <Link 
                to="/admin/inventory" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  location.pathname === "/admin/inventory" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Package className="w-4 h-4" />
                Estoque
              </Link>
              <Link 
                to="/admin/coupons" 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  location.pathname === "/admin/coupons" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Ticket className="w-4 h-4" />
                Cupons
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button 
              onClick={() => navigate('/')}
              className="text-sm font-bold text-gray-900 hover:underline"
            >
              Ver Loja
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
