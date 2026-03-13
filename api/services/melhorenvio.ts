import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MELHORENVIO_TOKEN = process.env.MELHORENVIO_TOKEN;
const IS_SANDBOX = process.env.MELHORENVIO_SANDBOX === 'true';
const BASE_URL = IS_SANDBOX ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';

export interface ShippingItem {
  name: string;
  quantity: number;
  price: number;
  weight: number; // em kg
  height: number; // em cm
  width: number;  // em cm
  length: number; // em cm
}

export interface CreateShipmentData {
  orderId: string;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string; // CPF ou CNPJ
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state_abbr: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string; // CPF
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state_abbr: string;
    postal_code: string;
  };
  items: ShippingItem[];
  service_id: number; // ex: 1 (SEDEX), 2 (PAC)
}

/**
 * Adiciona um envio ao carrinho do Melhor Envio
 */
export async function createMelhorEnvioShipment(data: CreateShipmentData) {
  try {
    if (!MELHORENVIO_TOKEN) {
      console.warn('MELHORENVIO_TOKEN não configurado. Pulando integração.');
      return null;
    }

    const cleanFromDoc = data.from.document.replace(/\D/g, '');
    const cleanToDoc = data.to.document.replace(/\D/g, '');

    const payload = {
      service: data.service_id,
      from: {
        name: data.from.name,
        phone: data.from.phone.replace(/\D/g, ''),
        email: data.from.email,
        document: cleanFromDoc.length <= 11 ? cleanFromDoc : undefined,
        company_document: cleanFromDoc.length > 11 ? cleanFromDoc : undefined,
        address: data.from.address,
        number: data.from.number,
        complement: data.from.complement || '',
        district: data.from.district,
        city: data.from.city,
        state_abbr: data.from.state_abbr,
        postal_code: data.from.postal_code.replace(/\D/g, ''),
      },
      to: {
        name: data.to.name,
        phone: data.to.phone.replace(/\D/g, ''),
        email: data.to.email,
        document: cleanToDoc.length <= 11 ? cleanToDoc : undefined,
        company_document: cleanToDoc.length > 11 ? cleanToDoc : undefined,
        address: data.to.address,
        number: data.to.number,
        complement: data.to.complement || '',
        district: data.to.district,
        city: data.to.city,
        state_abbr: data.to.state_abbr,
        postal_code: data.to.postal_code.replace(/\D/g, ''),
      },
      products: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.price,
      })),
      volumes: data.items.map(item => ({
        height: item.height,
        width: item.width,
        length: item.length,
        weight: item.weight,
      })),
      options: {
        insurance_value: data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true, // Declaração de conteúdo
        tags: [
          {
            tag: String(data.orderId),
            url: `https://n0vacustom.vercel.app/admin/orders/${data.orderId}`
          }
        ]
      }
    };

    console.log(`[Melhor Envio] Environment: ${IS_SANDBOX ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log('Melhor Envio URL:', `${BASE_URL}/api/v2/me/cart`);
    console.log('Melhor Envio Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/api/v2/me/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MELHORENVIO_TOKEN}`,
        'User-Agent': 'NovaCustom (contato@novacustom.com.br)',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Melhor Envio API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao criar envio no Melhor Envio:', error.message);
    throw error;
  }
}
