import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'NovaCustom <pedidos@novacustom.com.br>';
