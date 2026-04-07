import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] A variável RESEND_API_KEY não está definida! O envio de e-mails irá falhar.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const EMAIL_FROM = 'NovaCustom <pedidos@novacustom.com.br>';
console.log(`[Resend] Configurado com remetente: ${EMAIL_FROM}`);
