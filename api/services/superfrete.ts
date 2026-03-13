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
  service_id: number; // ID do serviço (ex: SEDEX, PAC)
}

/**
 * Cria um pedido de frete no Super Frete
 */
export async function createSuperFreteShipment(data: CreateShipmentData) {
  try {
    if (!SUPERFRETE_TOKEN) {
      console.warn('SUPERFRETE_TOKEN não configurado. Pulando integração.');
      return null;
    }

    const payload = {
      from: {
        postal_code: data.from.postal_code.replace(/\D/g, ''),
        address: data.from.address,
        number: data.from.number,
        complement: data.from.complement || '',
        district: data.from.district,
        city: data.from.city,
        state: data.from.state,
      },
      to: {
        name: data.to.name,
        email: data.to.email,
        phone: data.to.phone.replace(/\D/g, ''),
        cpf: data.to.cpf.replace(/\D/g, ''),
        postal_code: data.to.postal_code.replace(/\D/g, ''),
        address: data.to.address,
        number: data.to.number,
        complement: data.to.complement || '',
        district: data.to.district,
        city: data.to.city,
        state: data.to.state,
      },
      products: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.price,
        weight: item.weight,
        height: item.height,
        width: item.width,
        length: item.length,
      })),
      service: Number(data.service_id),
      external_id: String(data.orderId),
    };

    console.log('Super Frete Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/api/v0/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
        'User-Agent': 'NovaCustom (contato@novacustom.com)',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Super Frete API Error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Erro ao criar envio no Super Frete:', error.message);
    throw error;
  }
}

/**
 * Calcula opções de frete
 */
export async function calculateSuperFrete(originZip: string, destinationZip: string, items: ShippingItem[]) {
  try {
    const payload = {
      from: originZip,
      to: destinationZip,
      products: items.map(item => ({
        weight: item.weight,
        height: item.height,
        width: item.width,
        length: item.length,
      })),
      services: "1,2,17", // IDs comuns (SEDEX, PAC, Mini Envios)
    };

    const response = await fetch(`${BASE_URL}/api/v0/calculator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPERFRETE_TOKEN}`,
        'User-Agent': 'NovaCustom (contato@novacustom.com)',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Super Frete API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Erro ao calcular frete:', error.message);
    throw error;
  }
}
