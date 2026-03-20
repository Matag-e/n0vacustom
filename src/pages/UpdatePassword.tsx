import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the session automatically via the recovery link.
    // If we have a session, we stay. If not, we check if we're in recovery mode.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // If no session and no hash (which might have been consumed), go to login
        if (!window.location.hash.includes('access_token')) {
          navigate('/login');
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Nova Senha</h1>
          <p className="text-gray-500 text-sm mt-2">Digite sua nova senha abaixo.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center space-y-3 border border-green-100">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <p className="font-bold">Senha atualizada com sucesso!</p>
            <p className="text-sm">Redirecionando para o seu perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}