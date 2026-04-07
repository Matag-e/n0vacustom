import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2, LayoutDashboard, Package, ShoppingBag, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Bar: Logo and View Store */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100 md:border-none">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white p-1 rounded font-bold text-[10px] tracking-widest px-2">ADMIN</div>
              <span className="font-bold text-gray-900 hidden sm:block">Nova Custom</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden md:block">{user?.email}</span>
              <Link 
                to="/"
                className="text-xs font-black text-gray-900 hover:underline uppercase tracking-widest"
              >
                Ver Loja
              </Link>
            </div>
          </div>

          {/* Navigation Links: Second row on mobile, same row on desktop */}
          <div className="py-2 md:py-0 md:pb-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit mx-auto md:mx-0">
              <Link 
                to="/admin" 
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  location.pathname === "/admin" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Início</span>
              </Link>
              <Link 
                to="/admin/products" 
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  location.pathname === "/admin/products" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Produtos
              </Link>
              <Link 
                to="/admin/inventory" 
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  location.pathname === "/admin/inventory" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Package className="w-3.5 h-3.5" />
                Estoque
              </Link>
              <Link 
                to="/admin/coupons" 
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  location.pathname === "/admin/coupons" 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Ticket className="w-3.5 h-3.5" />
                Cupons
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
