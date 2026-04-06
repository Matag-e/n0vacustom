import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

interface MetaEventData {
  eventName: string;
  eventSourceUrl: string;
  userData: {
    em?: string; // Email (hashed)
    ph?: string; // Phone (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
  };
}

/**
 * Hash data using SHA256 as required by Meta
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Send event to Meta Conversions API (CAPI)
 */
export async function sendMetaEvent({ eventName, eventSourceUrl, userData, customData }: MetaEventData) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[Meta CAPI] Pixel ID ou Access Token não configurados.');
    return;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: {
          em: hashData(userData.em),
          ph: hashData(userData.ph),
          client_ip_address: userData.client_ip_address,
          client_user_agent: userData.client_user_agent,
          fbc: userData.fbc,
          fbp: userData.fbp,
        },
        custom_data: customData,
      },
    ],
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('[Meta CAPI] Erro ao enviar evento:', result);
    } else {
      console.log(`[Meta CAPI] Evento ${eventName} enviado com sucesso.`);
    }
    return result;
  } catch (error) {
    console.error('[Meta CAPI] Erro na requisição:', error);
  }
}
