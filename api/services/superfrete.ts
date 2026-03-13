import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPERFRETE_TOKEN = process.env.SUPERFRETE_TOKEN;
const IS_SANDBOX = process.env.SUPERFRETE_SANDBOX === 'true';
const BASE_URL = IS_SANDBOX ? 'https://sandbox.superfrete.com' : 'https://api.superfrete.com';

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
    postal_code: string;
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  to: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    postal_code: string;
    address: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
  items: ShippingItem[];
  service_id: number;
}

/**
 * Adiciona um envio ao carrinho do Super Frete
 */
export async function createSuperFreteShipment(data: CreateShipmentData) {
  try {
    if (!SUPERFRETE_TOKEN) {
      throw new Error('SUPERFRETE_TOKEN não configurado nas variáveis de ambiente.');
    }

    const cleanFromZip = data.from.postal_code.replace(/\D/g, '');
    const cleanToZip = data.to.postal_code.replace(/\D/g, '');
    const cleanCPF = data.to.cpf.replace(/\D/g, '');
    const cleanPhone = data.to.phone.replace(/\D/g, '');

    // Payload robusto baseado no padrão Melhor Envio/Super Frete
    const payload = {
      service: Number(data.service_id) || 1, // 1 = SEDEX, 2 = PAC
      from: {
        name: process.env.SENDER_NAME || "NOVA CUSTOM",
        phone: process.env.SENDER_PHONE?.replace(/\D/g, '') || "11991814636",
        email: process.env.SENDER_EMAIL || "novacustom2k26@gmail.com",
        document: process.env.SENDER_DOCUMENT?.replace(/\D/g, '') || "",
        postal_code: cleanFromZip,
        address: data.from.address,
        number: data.from.number,
        complement: data.from.complement || '',
        district: data.from.district,
        city: data.from.city,
        state_abbr: data.from.state.substring(0, 2).toUpperCase(),
      },
      to: {
        name: data.to.name,
        phone: cleanPhone,
        email: data.to.email,
        document: cleanCPF,
        postal_code: cleanToZip,
        address: data.to.address,
        number: data.to.number,
        complement: data.to.complement || '',
        district: data.to.district,
        city: data.to.city,
        state_abbr: data.to.state.substring(0, 2).toUpperCase(),
      },
      products: data.items.map(item => ({
        name: item.name.substring(0, 50),
        quantity: item.quantity,
        unitary_value: Number(item.price.toFixed(2)),
      })),
      volumes: [{
        height: 2,
        width: 20,
        length: 30,
        weight: 0.5
      }],
      options: {
        insurance_value: data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true, // Importante para quem não emite NF
      }
    };

    console.log(`[Super Frete] Enviando para ${IS_SANDBOX ? 'SANDBOX' : 'PRODUÇÃO'}...`);
    
    const response = await fetch(`${BASE_URL}/api/v0/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPERFRETE_TOKEN.trim()}`,
        'User-Agent': `Superfrete (novacustom2k26@gmail.com)`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error('[Super Frete] Erro detalhado:', JSON.stringify(responseData));
      throw new Error(`Super Frete Error: ${response.status} - ${responseData.message || JSON.stringify(responseData)}`);
    }

    console.log('[Super Frete] Sucesso ao adicionar no carrinho!');
    return responseData;
  } catch (error: any) {
    console.error('[Super Frete] Erro na função createSuperFreteShipment:', error.message);
    throw error;
  }
}
