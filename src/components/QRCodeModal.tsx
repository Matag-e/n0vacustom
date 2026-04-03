import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle, Clock } from 'lucide-react';
import { generatePixPayload } from '@/lib/pix';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    total_amount: number;
    created_at: string;
  };
}

export function QRCodeModal({ isOpen, onClose, order }: QRCodeModalProps) {
  const [pixPayload, setPixPayload] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      // Calcular tempo restante (10 minutos a partir da criação)
      const createdAt = new Date(order.created_at).getTime();
      const expireAt = createdAt + 10 * 60 * 1000; // 10 minutos
      
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((expireAt - now) / 1000);
        
        if (diff <= 0) {
          setExpired(true);
          setTimeLeft(0);
        } else {
          setExpired(false);
          setTimeLeft(diff);
        }
      };

      updateTimer(); // Initial check
      const timer = setInterval(updateTimer, 1000);

      const payload = generatePixPayload(order.total_amount, '11991814636');
      setPixPayload(payload);

      return () => clearInterval(timer);
    }
  }, [isOpen, order]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl font-bold text-green-600">PIX</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">Pagamento Pendente</h2>
          
          {!expired ? (
            <>
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 py-2 px-4 rounded-full mx-auto w-fit">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Escaneie o QR Code para pagar o pedido <span className="font-mono font-bold text-black">#{order.id.slice(0, 8)}</span>
              </p>

              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 inline-block mx-auto">
                {pixPayload ? (
                  <QRCodeSVG value={pixPayload} size={200} level="M" />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                    Carregando...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Pix Copia e Cola</p>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={pixPayload} 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate font-mono focus:outline-none focus:ring-2 focus:ring-black"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button 
                    onClick={handleCopyPix}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                    title="Copiar"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && <span className="text-xs text-green-600 font-bold block animate-in fade-in">Copiado!</span>}
              </div>
            </>
          ) : (
            <div className="py-8 space-y-4">
              <div className="text-red-500 font-bold text-lg">QR Code Expirado</div>
              <p className="text-gray-500 text-sm">
                O tempo para pagamento deste pedido expirou. Por favor, realize um novo pedido.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <button 
            onClick={onClose}
            className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
