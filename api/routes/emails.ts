import { Router, type Request, type Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { resend, EMAIL_FROM } from '../lib/resend.js'
import { orderConfirmationTemplate, orderShippedTemplate } from '../emails/templates.js'

dotenv.config()

const router = Router()

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
    process.env.VITE_SUPABASE_ANON_KEY || ''
  )

  const { data, error } = await supabaseAuth.auth.getUser(token)
  if (error || !data.user) return { ok: false, error: 'invalid_token' }
  return { ok: true, user: { id: data.user.id, email: data.user.email || null } }
}

/**
 * Enviar e-mail de confirmação de pedido (para o cliente)
 */
router.post('/order-confirmation', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body
    if (!orderId) return res.status(400).json({ error: 'orderId is required' })

    // Buscar dados do pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return res.status(404).json({ error: 'Order not found' })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [order.email],
      subject: `Pedido Recebido! #${order.id.slice(0, 8)} - NovaCustom`,
      html: orderConfirmationTemplate(order)
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Error sending email' })
    }

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('API error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * Enviar e-mail de pedido enviado (para o cliente)
 */
router.post('/order-shipped', async (req: Request, res: Response) => {
  try {
    const { ok, error: adminError } = await requireAdmin(req)
    if (!ok) return res.status(adminError === 'forbidden' ? 403 : 401).json({ error: adminError })

    const { orderId, trackingCode } = req.body
    if (!orderId || !trackingCode) return res.status(400).json({ error: 'orderId and trackingCode are required' })

    // Buscar dados do pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) return res.status(404).json({ error: 'Order not found' })

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [order.email],
      subject: `Seu manto está a caminho! 🚚 - NovaCustom`,
      html: orderShippedTemplate(order, trackingCode)
    })

    if (error) return res.status(500).json({ error: 'Error sending email' })

    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
