import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2, LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  // Se não tem usuário, não renderiza nada enquanto redireciona
  if (!user) return null;

  const isAuthorized = user.email === 'novacustom2k26@gmail.com';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-500 mb-6">
            Você não tem permissão para acessar esta área administrativa.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors"
          >
            Voltar para Loja
          </button>
        </div>
      </div>
    );
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
