import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'NovaCustom <pedidos@novacustom.com.br>';
