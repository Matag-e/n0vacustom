import { Router, type Request, type Response } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const router = Router()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
)

// Inicializamos o cliente dentro da rota ou usamos uma função para garantir que pegue o valor atual do process.env
const getMPClient = () => {
  const token = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim()
  return new MercadoPagoConfig({
    accessToken: token,
  })
}

router.post('/create-preference', async (req: Request, res: Response) => {
  try {
    const { items, orderId, totalAmount, paymentMethod } = req.body

    const client = getMPClient()
    const preference = new Preference(client)

    const origin = req.headers.origin || 'http://localhost:5173'
    
    console.log('Origin used for back_urls:', origin)

    // Se for PIX, enviamos um único item com o valor já descontado para evitar erros de cálculo no MP
    const mpItems = (paymentMethod === 'pix') ? [{
      id: String(orderId),
      title: `Pedido #${String(orderId).slice(0, 8)} (Desconto PIX)`,
      description: 'Pagamento via PIX com 5% de desconto',
      unit_price: Number(totalAmount),
      quantity: 1,
      currency_id: 'BRL',
      category_id: 'clothing'
    }] : (items ? items.map((item: any) => ({
      id: String(item.product.id),
      title: item.product.name,
      unit_price: Number(item.product.price),
      quantity: Number(item.quantity),
      currency_id: 'BRL',
      category_id: 'clothing'
    })) : [{
      id: String(orderId),
      title: `Pedido #${String(orderId).slice(0, 8)}`,
      unit_price: Number(totalAmount),
      quantity: 1,
      currency_id: 'BRL',
      category_id: 'clothing'
    }])

    const back_urls = {
      success: `${origin}/profile`,
      failure: `${origin}/profile`,
      pending: `${origin}/profile`,
    }
    
    console.log('Back URLs for MP:', back_urls)

    // Simplificação total para Checkout Pro (Cartão)
    // Se chegamos aqui, não é PIX, então não precisamos de restrições complexas
    const preferencePayload = {
      items: mpItems,
      back_urls,
      external_reference: String(orderId),
      notification_url: 'https://novacustom.vercel.app/api/payments/webhook',
      auto_return: 'approved',
      payment_methods: {
        installments: 12,
      },
    }

    console.log('[MP] Criando preferência com payload:', JSON.stringify(preferencePayload, null, 2))

    const result = await preference.create({
      body: preferencePayload,
    })

    res.json({ id: result.id, init_point: result.init_point })
  } catch (error: any) {
    console.error('Error creating preference:', error.message || error)
    if (error.apiResponse) {
      console.error('MP API Full Error:', JSON.stringify(error.apiResponse.body, null, 2))
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.apiResponse.body 
      })
    }
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Webhook do Mercado Pago (IPN / Webhooks)
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body
    console.log('Webhook MP raw body:', JSON.stringify(body))

    let paymentId = ''
    let action = body.action || ''

    // Mercado Pago envia notificações de várias formas
    if (body.type === 'payment') {
      paymentId = body.data?.id || body.id
    } else if (body.topic === 'payment') {
      paymentId = body.id
    } else if (body.resource) {
      paymentId = body.resource.split('/').pop() || ''
    }

    if (paymentId) {
      console.log(`Processing Webhook for Payment ID: ${paymentId}`)
      const client = getMPClient()
      const payment = new Payment(client)

      // Buscar detalhes reais do pagamento com Retry (MP às vezes demora a indexar)
      let paymentData: any = null
      let retries = 3
      while (retries > 0) {
        try {
          paymentData = await payment.get({ id: paymentId })
          break
        } catch (err: any) {
          console.log(`MP Payment Fetch Attempt Failed. Retries left: ${retries - 1}`)
          retries--
          if (retries === 0) throw err
          await new Promise(resolve => setTimeout(resolve, 2000)) // Espera 2s
        }
      }

      const orderId = paymentData.external_reference
      const status = paymentData.status

      console.log(`Payment Status: ${status} for Order ID: ${orderId}`)

      if (status === 'approved') {
        // Atualizar pedido no Supabase para 'paid'
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating order status in Supabase:', updateError)
        } else {
          console.log(`Order ${orderId} marked as paid.`)
        }
      } else if (status === 'rejected' || status === 'cancelled') {
        // Opcional: Marcar como cancelado se rejeitado
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)
      }
    }

    // MP exige resposta 200/201 para não reenviar a notificação
    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook error:', error)
    // Mesmo com erro, respondemos 200 para evitar loops do MP enquanto corrigimos
    res.status(200).send('OK')
  }
})

router.post('/process-payment', async (req: Request, res: Response) => {
  try {
    const { totalAmount, paymentMethod, payer, orderId } = req.body

    const client = getMPClient()
    const payment = new Payment(client)

    if (paymentMethod === 'pix') {
      const result = await payment.create({
        body: {
          transaction_amount: Number(totalAmount),
          description: `Pedido #${String(orderId).slice(0, 8)} - NovaCustom`,
          payment_method_id: 'pix',
          payer: {
            email: payer.email,
            first_name: payer.firstName,
            last_name: payer.lastName,
            identification: {
              type: 'CPF',
              number: payer.cpf.replace(/\D/g, ''),
            },
          },
          external_reference: String(orderId),
          notification_url: 'https://novacustom.vercel.app/api/payments/webhook',
        }
      })

      return res.json({
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
      })
    }

    // Para outros métodos (cartão), mantemos o checkout pro por segurança/facilidade inicial
    return res.status(400).json({ error: 'Checkout transparente disponível apenas para PIX no momento.' })
  } catch (error: any) {
    console.error('Error processing direct payment:', error.message || error)
    if (error.apiResponse) {
      console.error('MP API Full Error:', JSON.stringify(error.apiResponse.body, null, 2))
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.apiResponse.body 
      })
    }
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
