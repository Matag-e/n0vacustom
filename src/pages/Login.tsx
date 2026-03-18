import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccessMsg(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setSuccessMsg('Enviamos um link de recuperação para o seu e-mail.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          // Improve error message
          if (error.message === 'Invalid login credentials') {
            throw new Error('Email ou senha incorretos.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Por favor, confirme seu email antes de entrar.');
          }
          throw error;
        }
        navigate('/profile');
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });
        
        if (error) throw error;
        
        // Tenta logar automaticamente se a sessão não vier direto
        if (data.session) {
          navigate('/profile');
        } else if (data.user) {
          // Se criou o usuário mas não veio a sessão, tenta fazer login explícito
          // Isso resolve casos onde o "Confirm Email" está desligado mas o auto-login falha
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInData.session) {
            navigate('/profile');
          } else {
            // Se falhar o login explícito, aí sim assume que precisa confirmar
            alert('Cadastro realizado! Se necessário, verifique seu email.');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex transition-colors duration-300">
      
      {/* Left Column - Image/Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 dark:bg-zinc-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-multiply" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2560&auto=format&fit=crop")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <img src="/logo.svg" alt="NovaCustom" className="h-16 w-auto mb-6 brightness-0 invert" />
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Vista a paixão.<br />Crie seu legado.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Junte-se a milhares de torcedores que já garantiram mantos exclusivos com qualidade premium.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Loja
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
              {isResettingPassword 
                ? 'Recuperar Senha' 
                : isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isResettingPassword
                ? 'Digite seu e-mail para receber um link de redefinição.'
                : isLogin ? 'Entre para acessar seus pedidos e perfil.' : 'Preencha seus dados para começar.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={isResettingPassword ? handleResetPassword : handleSubmit} className="space-y-4">
            {!isLogin && !isResettingPassword && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {!isResettingPassword && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {!isResettingPassword && isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(true);
                    setError(null);
                    setSuccessMsg(null);
                  }} 
                  className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                isResettingPassword ? 'Enviar Link' : (isLogin ? 'Entrar' : 'Criar Conta')
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-black text-gray-500 text-xs uppercase font-bold tracking-wider">Segurança Garantida</span>
            </div>
          </div>

          {/* Google Login Disabled 
          <button
            onClick={() => signInWithGoogle()}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          */}

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              {isResettingPassword ? (
                <button
                  onClick={() => {
                    setIsResettingPassword(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-black dark:text-white hover:underline"
                >
                  Voltar para o login
                </button>
              ) : (
                <>
                  {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="ml-2 font-bold text-black dark:text-white hover:underline"
                  >
                    {isLogin ? 'Cadastre-se' : 'Entrar'}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}