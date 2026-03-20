import { Router, type Request, type Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { resend, EMAIL_FROM } from '../lib/resend.js'
import { orderConfirmationTemplate, orderShippedTemplate } from '../emails/templates.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const ADMIN_EMAIL = 'novacustom2k26@gmail.com'

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization
  if (!header) return null
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) return null
  return token
}

async function requireAdmin(req: Request): Promise<{ ok: boolean; error?: string }> {
  const token = getBearerToken(req)
  if (!token) return { ok: false, error: 'missing_token' }

  const supabaseAuth = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  )

  const { data, error } = await supabaseAuth.auth.getUser()
  if (error || !data.user) return { ok: false, error: 'invalid_token' }
  if (data.user.email !== ADMIN_EMAIL) return { ok: false, error: 'forbidden' }
  return { ok: true }
}

async function getAuthedUser(req: Request): Promise<{ ok: boolean; error?: string; user?: { id: string; email: string | null } }> {
  const token = getBearerToken(req)
  if (!token) return { ok: false, error: 'missing_token' }

  const supabaseAuth = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  )

  const { data, error } = await supabaseAuth.auth.getUser()
  if (error || !data.user) return { ok: false, error: 'invalid_token' }
  return { ok: true, user: { id: data.user.id, email: data.user.email } }
}

const OrderIdSchema = z.object({
  orderId: z.string().uuid(),
})

/**
 * @swagger
 * /api/emails/order-confirmation:
 *   post:
 *     summary: Envia e-mail de confirmação de pedido (usuário)
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/order-confirmation', async (req: Request, res: Response) => {
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: 'resend_not_configured' })
  }

  const auth = await getAuthedUser(req)
  if (!auth.ok || !auth.user) {
    return res.status(401).json({ success: false, error: auth.error })
  }

  const { orderId } = OrderIdSchema.parse(req.body)

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, email, first_name, total_amount, email_order_confirmation_sent')
    .eq('id', orderId)
    .single()

  if (!order) return res.status(404).json({ success: false, error: 'order_not_found' })

  const isAdmin = auth.user.email === ADMIN_EMAIL
  if (!isAdmin && order.user_id !== auth.user.id) {
    return res.status(403).json({ success: false, error: 'forbidden' })
  }

  if (!order.email) return res.status(400).json({ success: false, error: 'order_missing_email' })
  if (order.email_order_confirmation_sent) return res.status(200).json({ success: true, skipped: true })

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.email,
    subject: 'Recebemos o seu pedido! ⚽ NovaCustom',
    html: orderConfirmationTemplate(String(order.id).slice(0, 8), order.first_name || 'Cliente', Number(order.total_amount)),
  })

  await supabaseAdmin
    .from('orders')
    .update({ email_order_confirmation_sent: true })
    .eq('id', orderId)

  return res.status(200).json({ success: true })
})

/**
 * @swagger
 * /api/emails/order-shipped:
 *   post:
 *     summary: Envia e-mail de pedido enviado (admin)
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/order-shipped', async (req: Request, res: Response) => {
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: 'resend_not_configured' })
  }

  const auth = await requireAdmin(req)
  if (!auth.ok) {
    return res.status(401).json({ success: false, error: auth.error })
  }

  const { orderId } = OrderIdSchema.parse(req.body)

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, email, first_name, tracking_code, email_shipped_sent, status')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return res.status(404).json({ success: false, error: 'order_not_found' })
  }

  if (!order.email) {
    return res.status(400).json({ success: false, error: 'order_missing_email' })
  }

  if (!order.tracking_code) {
    return res.status(400).json({ success: false, error: 'tracking_required' })
  }

  if (order.email_shipped_sent) {
    return res.status(200).json({ success: true, skipped: true })
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: order.email,
    subject: 'Seu pedido foi enviado! 📦 NovaCustom',
    html: orderShippedTemplate(String(order.id).slice(0, 8), order.first_name || 'Cliente', order.tracking_code),
  })

  await supabaseAdmin
    .from('orders')
    .update({ email_shipped_sent: true })
    .eq('id', orderId)

  return res.status(200).json({ success: true })
})

export default router
