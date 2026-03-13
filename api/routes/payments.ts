import { Router, type Request, type Response } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createSuperFreteShipment } from '../services/superfrete.js'

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

    // Se temos items detalhados, usamos eles. Caso contrário (re-pagamento), usamos um item genérico.
    const mpItems = items ? items.map((item: any) => ({
      id: String(item.product.id),
      title: item.product.name,
      unit_price: Number(item.product.price),
      quantity: Number(item.quantity),
      currency_id: 'BRL',
    })) : [{
      id: String(orderId),
      title: `Pedido #${String(orderId).slice(0, 8)}`,
      unit_price: Number(totalAmount),
      quantity: 1,
      currency_id: 'BRL',
    }]

    const back_urls = {
      success: `${origin}/profile`,
      failure: `${origin}/profile`,
      pending: `${origin}/profile`,
    }
    
    console.log('Back URLs for MP:', back_urls)

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls,
        external_reference: String(orderId),
        notification_url: 'https://n0vacustom.vercel.app/api/payments/webhook',
        payment_methods: {
          default_payment_method_id: paymentMethod === 'pix' ? 'pix' : undefined,
          installments: 12,
        },
      },
    })

    res.json({ id: result.id, init_point: result.init_point })
  } catch (error: any) {
    console.error('Error creating preference:', error.message || error)
    if (error.apiResponse) {
      console.error('MP API Error:', error.apiResponse.body)
    }
    res.status(500).json({ error: 'Failed to create preference' })
  }
})

/**
 * Rota manual para tentar gerar frete novamente
 */
router.post('/retry-shipping/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product:products (name)
        )
      `)
      .eq('id', orderId)
      .single()

    if (!order || orderError) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    console.log(`[Manual Retry] Tentando gerar frete para pedido: ${orderId}`)
    
    const result = await createSuperFreteShipment({
      orderId: order.id,
      from: {
        postal_code: process.env.SENDER_CEP || '01001000',
        address: process.env.SENDER_ADDRESS || 'Rua da Loja',
        number: process.env.SENDER_NUMBER || '1',
        district: process.env.SENDER_DISTRICT || 'Centro',
        city: process.env.SENDER_CITY || 'São Paulo',
        state: process.env.SENDER_STATE || 'SP'
      },
      to: {
        name: `${order.first_name} ${order.last_name}`,
        email: order.email,
        phone: order.phone,
        cpf: order.cpf,
        postal_code: order.cep,
        address: order.address,
        number: order.number,
        complement: order.complement,
        district: order.district,
        city: order.city,
        state: order.state
      },
      items: order.order_items.map((item: any) => ({
        name: item.product?.name || 'Camisa Personalizada',
        quantity: item.quantity,
        price: item.price,
        weight: 0.5,
        height: 2,
        width: 20,
        length: 30
      })),
      service_id: 1 // SEDEX
    })

    const cartUrl = process.env.SUPERFRETE_SANDBOX === 'true' 
      ? 'https://sandbox.superfrete.com/#/cart' 
      : 'https://web.superfrete.com/#/cart'

    res.json({ 
      success: true, 
      message: 'Etiqueta enviada ao carrinho!', 
      data: result,
      cartUrl
    })
  } catch (error: any) {
    console.error('[Manual Retry] Erro:', error.message)
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
        // 1. Atualizar pedido no Supabase para 'paid'
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating order status in Supabase:', updateError)
        } else {
          console.log(`Order ${orderId} marked as paid.`)

          // 2. Buscar detalhes para Super Frete
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                quantity,
                price,
                product:products (name)
              )
            `)
            .eq('id', orderId)
            .single()

          if (order && !orderError) {
            try {
              console.log(`[Webhook] Iniciando integração com Super Frete para Pedido ${orderId}...`)
              const sfResult = await createSuperFreteShipment({
                orderId: order.id,
                from: {
                  postal_code: process.env.SENDER_CEP || '01001000',
                  address: process.env.SENDER_ADDRESS || 'Rua da Loja',
                  number: process.env.SENDER_NUMBER || '1',
                  district: process.env.SENDER_DISTRICT || 'Centro',
                  city: process.env.SENDER_CITY || 'São Paulo',
                  state: process.env.SENDER_STATE || 'SP'
                },
                to: {
                  name: `${order.first_name} ${order.last_name}`,
                  email: order.email,
                  phone: order.phone,
                  cpf: order.cpf,
                  postal_code: order.cep,
                  address: order.address,
                  number: order.number,
                  complement: order.complement,
                  district: order.district,
                  city: order.city,
                  state: order.state
                },
                items: order.order_items.map((item: any) => ({
                  name: item.product?.name || 'Camisa Personalizada',
                  quantity: item.quantity,
                  price: item.price,
                  weight: 0.5,
                  height: 2,
                  width: 20,
                  length: 30
                })),
                service_id: 1 // SEDEX
              })
              console.log('[Webhook] Sucesso Super Frete:', JSON.stringify(sfResult))
              
              // Se deu certo, podemos opcionalmente mudar para 'shipped' 
              // mas geralmente o lojista prefere mudar quando postar
            } catch (sfError: any) {
              console.error('[Webhook] Falha na integração Super Frete:', sfError.message)
              if (sfError.response) {
                console.error('[Webhook] Detalhes do erro Super Frete:', JSON.stringify(sfError.response.data))
              }
            }
          }
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

export default router
