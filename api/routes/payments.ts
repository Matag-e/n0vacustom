import { Router, type Request, type Response } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createMelhorEnvioShipment } from '../services/melhorenvio.js'

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
 * Webhook do Mercado Pago (IPN / Webhooks)
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { action, data, type, resource, topic } = req.body

    console.log('Webhook MP received:', JSON.stringify(req.body))

    // Mercado Pago pode enviar via 'type'/'data.id' ou 'topic'/'id'
    const notificationType = type || topic
    const paymentId = (data && data.id) || (notificationType === 'payment' ? req.body.id : undefined) || (resource ? resource.split('/').pop() : undefined)

    if (paymentId && (notificationType === 'payment' || action?.includes('payment'))) {
      const client = getMPClient()
      const payment = new Payment(client)

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentData = await payment.get({ id: paymentId })
      
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
          
          // 2. Buscar detalhes do pedido para o Melhor Envio
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                quantity,
                price,
                product:products (
                  name
                )
              )
            `)
            .eq('id', orderId)
            .single()

          if (order && !orderError) {
            try {
              // 3. Criar envio no Melhor Envio
               const shipmentResult = await createMelhorEnvioShipment({
                 orderId: order.id,
                 from: {
                   name: process.env.MELHORENVIO_SENDER_NAME || 'Nova Custom',
                   phone: process.env.MELHORENVIO_SENDER_PHONE || '11999999999',
                   email: process.env.MELHORENVIO_SENDER_EMAIL || 'contato@novacustom.com.br',
                   document: process.env.MELHORENVIO_SENDER_DOCUMENT || '', // CPF ou CNPJ real do remetente
                   address: process.env.MELHORENVIO_SENDER_ADDRESS || 'Endereço da Loja',
                   number: process.env.MELHORENVIO_SENDER_NUMBER || '1',
                   district: process.env.MELHORENVIO_SENDER_DISTRICT || 'Centro',
                   city: process.env.MELHORENVIO_SENDER_CITY || 'São Paulo',
                   state_abbr: process.env.MELHORENVIO_SENDER_STATE || 'SP',
                   postal_code: process.env.MELHORENVIO_SENDER_CEP || '01001000'
                 },
                 to: {
                   name: `${order.first_name} ${order.last_name}`,
                   phone: order.phone,
                   email: order.email,
                   document: order.cpf,
                   address: order.address,
                   number: order.number,
                   complement: order.complement,
                   district: order.district,
                   city: order.city,
                   state_abbr: order.state,
                   postal_code: order.cep
                 },
                 items: order.order_items.map((item: any) => ({
                   name: item.product.name,
                   quantity: item.quantity,
                   price: item.price,
                   weight: 0.5,
                   height: 2,
                   width: 20,
                   length: 30
                 })),
                 service_id: 1 // 1 = Correios SEDEX, 2 = Correios PAC
               })

              if (shipmentResult && shipmentResult.id) {
                console.log('Shipment added to Melhor Envio cart successfully. ID:', shipmentResult.id)
                // Atualizar pedido com info de frete
                await supabase
                  .from('orders')
                  .update({ 
                    shipping_id: String(shipmentResult.id),
                    status: 'shipped' 
                  })
                  .eq('id', orderId)
              }
            } catch (meError) {
              console.error('Erro na integração com Melhor Envio:', meError)
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
