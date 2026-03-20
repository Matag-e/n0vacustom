import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, User, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  image_url?: string;
  created_at: string;
  user_email?: string; // Para exibir quem avaliou (opcional)
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReviews(data);
        const total = data.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating(data.length > 0 ? total / data.length : 0);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para avaliar.');
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating: newRating,
          comment: newComment,
          image_url: newImageUrl || null,
        });

      if (error) throw error;

      setNewComment('');
      setNewRating(5);
      setNewImageUrl('');
      fetchReviews(); // Recarrega a lista
      toast.success('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Tem certeza que deseja excluir sua avaliação?')) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id); // Garante que só deleta a própria

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  }

  return (
    <div className="mt-16 border-t border-gray-100 pt-12">
      <h3 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
        Avaliações
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-yellow-600">({reviews.length})</span>
          </div>
        )}
      </h3>

      {/* Lista de Avaliações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {loading ? (
          <p className="text-gray-400">Carregando avaliações...</p>
        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "w-3 h-3", 
                            i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 block">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user?.id === review.user_id && (
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir avaliação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>
              {review.image_url && (
                <div className="relative aspect-[4/3] w-full max-w-[200px] rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:scale-105 transition-transform duration-300">
                  <img 
                    src={review.image_url} 
                    alt="Foto da avaliação" 
                    className="w-full h-full object-cover"
                    onClick={() => window.open(review.image_url, '_blank')}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulário de Nova Avaliação */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h4 className="text-lg font-bold uppercase mb-6">Deixe sua avaliação</h4>
        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Sua Nota</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={cn(
                        "w-8 h-8 transition-colors", 
                        star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seu Comentário</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="O que você achou do produto?"
                rows={4}
                className="w-full bg-gray-50 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Foto (URL)</label>
              <div className="relative">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://sua-imagem.com/foto.jpg"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                />
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">Faça login para deixar sua avaliação.</p>
            {/* O link de login poderia ser adicionado aqui */}
          </div>
        )}
      </div>
    </div>
  );
}
