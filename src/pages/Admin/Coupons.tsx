import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Save, Loader2, Ticket, Tag, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_purchase_amount: '0',
    min_quantity: '0',
    usage_limit: '',
    expires_at: '',
    active: true,
    is_first_purchase: false,
    usage_limit_per_user: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoadingCoupons(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erro ao carregar cupons.');
    } finally {
      setLoadingCoupons(false);
    }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Se for buy_x_get_y, o código é opcional para ser automático
      const isAutomatic = newCoupon.type === 'buy_x_get_y' && !newCoupon.code;
      
      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: newCoupon.code ? newCoupon.code.toUpperCase() : null,
          type: newCoupon.type,
          value: parseFloat(newCoupon.value),
          min_purchase_amount: parseFloat(newCoupon.min_purchase_amount || '0'),
          min_quantity: parseInt(newCoupon.min_quantity || '0'),
          usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
          expires_at: newCoupon.expires_at || null,
          active: newCoupon.active,
          is_first_purchase: newCoupon.is_first_purchase,
          usage_limit_per_user: newCoupon.usage_limit_per_user ? parseInt(newCoupon.usage_limit_per_user) : null
        }]);

      if (error) throw error;
      
      toast.success('Cupom criado com sucesso!');
      setNewCoupon({
        code: '',
        type: 'percentage',
        value: '',
        min_purchase_amount: '0',
        min_quantity: '0',
        usage_limit: '',
        expires_at: '',
        active: true,
        is_first_purchase: false,
        usage_limit_per_user: ''
      });
      fetchCoupons();
    } catch (error: any) {
      toast.error('Erro ao criar cupom: ' + error.message);
    }
  }

  async function toggleCoupon(id: string, active: boolean) {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? { ...c, active } : c));
      toast.success(active ? 'Cupom ativado!' : 'Cupom desativado!');
    } catch (error: any) {
      toast.error('Erro ao atualizar cupom');
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Excluir este cupom permanentemente?')) return;
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Cupom excluído!');
    } catch (error: any) {
      toast.error('Erro ao excluir cupom');
    }
  }

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Cupons & Promoções Admin | NovaCustom</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-8 h-8 text-black" />
            Gestão de Cupons & Promoções
          </h1>
          <p className="text-gray-500 text-sm mt-1">Crie códigos de desconto e promoções automáticas (ex: Leve 4 Pague 3).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to Create Coupon */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Cupom
            </h3>
            <form onSubmit={createCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  Código (Opcional p/ Automático)
                </label>
                <input 
                  required={newCoupon.type !== 'buy_x_get_y'}
                  type="text" 
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  placeholder={newCoupon.type === 'buy_x_get_y' ? "Vazio = Automático" : "EX: MANTONOVO10"}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tipo de Promoção</label>
                <select 
                  value={newCoupon.type}
                  onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="buy_x_get_y">Leve X Pague Y (Automático)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                  {newCoupon.type === 'buy_x_get_y' ? 'Qtd. Mínima p/ Desconto' : 'Valor do Desconto'}
                </label>
                <input 
                  required
                  type="number" 
                  value={newCoupon.value}
                  onChange={e => setNewCoupon({...newCoupon, value: e.target.value})}
                  placeholder={newCoupon.type === 'buy_x_get_y' ? 'Ex: 4 (Leve 4)' : 'Ex: 10'}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Qtd. Mínima de Itens</label>
                <input 
                  required
                  type="number" 
                  value={newCoupon.min_quantity}
                  onChange={e => setNewCoupon({...newCoupon, min_quantity: e.target.value})}
                  placeholder="Ex: 1 (padrão)"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Limite de Usos</label>
                <input 
                  type="number" 
                  value={newCoupon.usage_limit}
                  onChange={e => setNewCoupon({...newCoupon, usage_limit: e.target.value})}
                  placeholder="∞ (ilimitado)"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Limite por Usuário</label>
                <input 
                  type="number" 
                  value={newCoupon.usage_limit_per_user}
                  onChange={e => setNewCoupon({...newCoupon, usage_limit_per_user: e.target.value})}
                  placeholder="Ex: 1 (uma vez por CPF)"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={newCoupon.is_first_purchase}
                      onChange={e => setNewCoupon({...newCoupon, is_first_purchase: e.target.checked})}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-10 h-5 rounded-full transition-colors duration-200 ease-in-out",
                      newCoupon.is_first_purchase ? "bg-black" : "bg-gray-200"
                    )} />
                    <div className={cn(
                      "absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out",
                      newCoupon.is_first_purchase ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 group-hover:text-black transition-colors uppercase">
                    Apenas Primeira Compra
                  </span>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Criar Promoção
              </button>
            </form>
          </div>
        </div>

        {/* List of Coupons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Promoções Ativas no Site
              </h3>
              <span className="bg-zinc-100 text-zinc-600 text-[10px] font-black px-2 py-1 rounded-md">
                {coupons.length} TOTAL
              </span>
            </div>
            
            <div className="p-6">
              {loadingCoupons ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-xs text-gray-400 font-bold uppercase">Nenhuma promoção ativa no momento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className={cn(
                      "p-5 rounded-2xl border transition-all relative group",
                      coupon.active ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-60"
                    )}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-mono font-black text-xl tracking-tighter text-black">
                            {coupon.code || "🔥 PROMO AUTOMÁTICA"}
                          </span>
                          <div className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block",
                            coupon.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                          )}>
                            {coupon.active ? 'Ativo' : 'Pausado'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                            title={coupon.active ? "Pausar Cupom" : "Ativar Cupom"}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              coupon.active ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                            )}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteCoupon(coupon.id)}
                            title="Excluir Permanentemente"
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-gray-50">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-gray-400 block">Tipo</span>
                          <span className="text-xs font-bold text-gray-700 uppercase">
                            {coupon.type === 'percentage' ? 'Porcentagem' : coupon.type === 'fixed' ? 'Fixo' : 'Leve X Pague Y'}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-gray-400 block">Valor</span>
                          <span className="text-xs font-black text-black uppercase">
                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : coupon.type === 'fixed' ? `R$ ${coupon.value} OFF` : `Leve ${coupon.value} Pague ${coupon.value - 1}`}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-gray-400 block">Usos</span>
                          <span className="text-xs font-bold text-gray-700">
                            {coupon.usage_count} <span className="text-gray-300 font-normal">/ {coupon.usage_limit || '∞'}</span>
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-gray-400 block">Qtd. Mínima</span>
                          <span className="text-xs font-bold text-gray-700">
                            {coupon.min_quantity || '1'} {coupon.min_quantity === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        {coupon.usage_limit_per_user && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Limite/User</span>
                            <span className="text-xs font-bold text-gray-700">
                              {coupon.usage_limit_per_user}x por CPF
                            </span>
                          </div>
                        )}
                        {coupon.is_first_purchase && (
                          <div className="col-span-2 mt-2">
                            <span className="bg-black text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">
                              Exclusivo Primeira Compra
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
