import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, insira seu e-mail.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Link de recuperação enviado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Verifique seu e-mail</h1>
            <p className="text-gray-500">
              Enviamos um link de recuperação para <strong>{email}</strong>. 
              Clique no link para redefinir sua senha.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-bold text-gray-900 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 relative">
      <Link to="/login" className="absolute top-8 left-8 flex items-center text-sm font-bold text-gray-400 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
            Recuperar Senha
          </h1>
          <p className="text-gray-500">
            Esqueceu sua senha? Não tem problema. Digite seu e-mail abaixo e enviaremos um link para você criar uma nova.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
            Lembrou a senha? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
