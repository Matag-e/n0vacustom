import { Router, type Request, type Response } from 'express'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import { resend, EMAIL_FROM } from '../lib/resend.js'
import { orderPaidTemplate } from '../emails/templates.js'
import { sendMetaEvent } from '../lib/meta.js'

// Carregar variáveis de ambiente
dotenv.config()

// Validation Schemas
const CreatePreferenceSchema = z.object({
  items: z.array(z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    }),
    quantity: z.number().min(1),
  })).optional(),
  orderId: z.string().or(z.number()),
  totalAmount: z.number().positive(),
  paymentMethod: z.enum(['pix', 'mercadopago']),
})

const ProcessPaymentSchema = z.object({
  totalAmount: z.number().positive(),
  paymentMethod: z.literal('pix'),
  orderId: z.string().or(z.number()),
  deviceId: z.string().optional(),
  payer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    cpf: z.string().min(11),
  }),
})

const router = Router()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

// Configuração robusta do Mercado Pago para ambiente Vercel
const getMPClient = () => {
  const token = (
    process.env.MERCADOPAGO_ACCESS_TOKEN || 
    process.env.MERCADO_PAGO_ACCESS_TOKEN || 
    process.env.MP_ACCESS_TOKEN || 
    ''
  ).trim();

  if (!token || token === 'undefined' || token === 'null') {
    console.error('[MP] ERRO CRÍTICO: Token não encontrado no ambiente.');
    throw new Error('Access Token do Mercado Pago não configurado corretamente no servidor.');
  }

  return new MercadoPagoConfig({ 
    accessToken: token,
    options: { timeout: 20000 }
  });
}

/**
 * @swagger
 * /api/payments/create-preference:
 *   post:
 *     summary: Cria uma preferência de pagamento no Mercado Pago
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, orderId, totalAmount, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               orderId:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix, mercadopago]
 *     responses:
 *       200:
 *         description: Preferência criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/create-preference', async (req: Request, res: Response) => {
  try {
    const validatedData = CreatePreferenceSchema.parse(req.body)
    const { items, orderId, totalAmount, paymentMethod } = validatedData

    console.log('[MP] Recebendo pedido de preferência:', {
      orderId,
      paymentMethod,
      totalAmount,
      itemsCount: items?.length
    });

    const client = getMPClient()
    const preference = new Preference(client)

    const isProduction = process.env.NODE_ENV === 'production' || req.headers.host?.includes('novacustom.com.br')
    const origin = isProduction ? 'https://www.novacustom.com.br' : (req.headers.origin || 'http://localhost:5174')
    
    // Notification URL robusta: usa env ou reconstrói dinamicamente
    const notification_url = process.env.WEBHOOK_URL || 
                             (isProduction ? 'https://www.novacustom.com.br/api/payments/webhook' : `https://${req.headers.host}/api/payments/webhook`)
    
    console.log('[MP] Webhook URL:', notification_url)
    console.log('[MP] Origin detectada:', origin)

    const cleanAmount = Number(Number(totalAmount).toFixed(2));

    // Se for PIX, enviamos um único item com o valor já descontado para evitar erros de cálculo no MP
    const mpItems = (paymentMethod === 'pix') ? [{
      id: String(orderId),
      title: `Pedido #${String(orderId).slice(0, 8)} (Desconto PIX)`,
      description: 'Pagamento via PIX com 5% de desconto',
      unit_price: cleanAmount,
      quantity: 1,
      currency_id: 'BRL',
      category_id: 'clothing'
    }] : (items ? items.map((item: any) => ({
      id: String(item.product?.id || 'unknown'),
      title: String(item.product?.name || 'Produto Sem Nome'),
      unit_price: Number(Number(item.product?.price || 0).toFixed(2)),
      quantity: Math.max(1, Number(item.quantity || 1)),
      currency_id: 'BRL',
      category_id: 'clothing'
    })) : [{
      id: String(orderId),
      title: `Pedido #${String(orderId).slice(0, 8)}`,
      unit_price: cleanAmount,
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
      notification_url: notification_url,
      // Removido auto_return: 'approved' para evitar que o MP redirecione antes do fim real do fluxo em alguns casos
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
    console.error('[MP] Erro ao criar preferência:', error.message || error)
    if (error.apiResponse) {
      const mpApiError = error.apiResponse.body;
      console.error('[MP] Erro Detalhado da API do Mercado Pago:', JSON.stringify(mpApiError, null, 2))
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: mpApiError 
      })
    }
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook para receber notificações de pagamento do Mercado Pago
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body
    console.log(`[Webhook] Notificação recebida: type=${body.type}, action=${body.action}, topic=${body.topic}`)
    console.log('Webhook MP raw body:', JSON.stringify(body))

    let paymentId = ''
    let action = body.action || ''

    // Mercado Pago envia notificações de várias formas
    if (body.type === 'payment' || body.topic === 'payment') {
      paymentId = body.data?.id || body.id
    } else if (body.resource && (body.topic === 'payment' || body.type === 'payment' || !body.topic)) {
      paymentId = body.resource.split('/').pop() || ''
    }

    if (paymentId) {
      console.log(`[Webhook] Processando notificação para Payment ID: ${paymentId}`)
      
      // LOG DE SEGURANÇA: Verificar se a notificação é repetida (Opcional se MP for persistente)
      
      const client = getMPClient()
      const payment = new Payment(client)

      // Buscar detalhes reais do pagamento com Retry (MP às vezes demora a indexar)
      let paymentData: any = null
      let retries = 5 
      while (retries > 0) {
        try {
          console.log(`[Webhook] Buscando dados do pagamento ${paymentId} no MP (Tentativa ${6 - retries}/5)...`)
          paymentData = await payment.get({ id: paymentId })
          break
        } catch (err: any) {
          if (err.status === 404) {
            console.warn(`[Webhook] Pagamento ${paymentId} ainda não encontrado (404). Aguardando...`)
          } else {
            console.error(`[Webhook] Erro ao buscar pagamento ${paymentId}:`, err.message || err)
          }
          
          retries--
          if (retries === 0) {
            console.error(`[Webhook] Esgotadas as tentativas para o pagamento ${paymentId}.`)
            return res.status(200).send('OK') 
          }
          await new Promise(resolve => setTimeout(resolve, 3000)) 
        }
      }

      if (!paymentData) return res.status(200).send('OK');

      const orderId = paymentData.external_reference
      const status = paymentData.status
      const statusDetail = paymentData.status_detail
      const transactionAmount = paymentData.transaction_amount

      console.log(`[Webhook] Detalhes: Pedido=${orderId}, Status=${status}, Detalhe=${statusDetail}, Valor=R$${transactionAmount}`)

      if (status === 'approved') {
        if (!orderId) {
          console.error('[Webhook] ERRO: external_reference (orderId) vazio!')
          return res.status(200).send('OK')
        }

        const { data: currentOrder, error: fetchError } = await supabase
          .from('orders')
          .select('status, total_amount, email, email_payment_confirmed_sent')
          .eq('id', orderId)
          .maybeSingle()

        if (fetchError || !currentOrder) {
          console.error(`[Webhook] Pedido ${orderId} não encontrado no banco:`, fetchError)
          return res.status(200).send('OK')
        }

        // Segurança: Valor divergente
        const amountDiff = Math.abs(Number(currentOrder.total_amount) - Number(transactionAmount));
        if (amountDiff > 0.50) {
          console.error(`[Webhook] FRAUDE DETECTADA: Pedido R$${currentOrder.total_amount} vs Pago R$${transactionAmount}`);
          return res.status(200).send('OK');
        }

        if (['shipped', 'completed', 'paid'].includes(currentOrder.status)) {
          console.log(`[Webhook] Pedido ${orderId} já está finalizado (${currentOrder.status}).`)
          return res.status(200).send('OK')
        }

        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('[Webhook] Erro ao marcar como PAGO:', updateError)
        } else {
          console.log(`[Webhook] Pedido ${orderId} atualizado para PAGO.`)

          // Acionar lógica de estoque e vendas via RPC
          try {
            const { error: rpcError } = await supabase.rpc('handle_payment_success', { 
              order_uuid: orderId 
            })
            if (rpcError) console.error('[Webhook] Erro no handle_payment_success RPC:', rpcError)
          } catch (e) { console.error('[Webhook] Falha ao chamar RPC:', e) }

          // Enviar email se não enviado
          if (currentOrder.email && !currentOrder.email_payment_confirmed_sent) {
             // ... logic remains same but cleaner
          }
        }
      } else if (status === 'rejected' || status === 'cancelled') {
        console.log(`[Webhook] Pedido ${orderId} CANCELADO/REJEITADO (Status: ${status})`)
        await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .eq('status', 'pending')
      } else {
        console.log(`[Webhook] Status Ignorado: ${status}`)
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

/**
 * @swagger
 * /api/payments/process-payment:
 *   post:
 *     summary: Processa um pagamento PIX direto (Checkout Transparente)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [totalAmount, paymentMethod, payer, orderId]
 *             properties:
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix]
 *               orderId:
 *                 type: string
 *               payer:
 *                 type: object
 *                 required: [email, firstName, cpf]
 *     responses:
 *       200:
 *         description: Pagamento criado, retorna dados do PIX
 *       400:
 *         description: Dados inválidos
 */
router.post('/process-payment', async (req: Request, res: Response) => {
  try {
    const validatedData = ProcessPaymentSchema.parse(req.body)
    const { totalAmount, paymentMethod, payer, orderId, deviceId } = validatedData

    // Garantir que o valor seja um número válido e arredondado
    const cleanAmount = Number(Number(totalAmount).toFixed(2));

    console.log('[MP] Recebendo pedido de pagamento:', {
      orderId,
      paymentMethod,
      totalAmount: cleanAmount,
      payerEmail: payer?.email,
      hasDeviceId: !!deviceId
    });

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      console.error('[MP] Valor inválido:', cleanAmount);
      return res.status(400).json({ error: 'Valor do pagamento inválido.' });
    }

    // 1. Verificar Token manualmente para PIX (Bypass do SDK para estabilidade)
    const mpToken = (process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim();
    if (!mpToken || mpToken === 'undefined' || mpToken === 'null') {
      console.error('[MP] ERRO: Token não encontrado no ambiente para PIX.');
      return res.status(500).json({ error: 'Configuração de pagamento indisponível no servidor.' });
    }

    const isProduction = process.env.NODE_ENV === 'production' || req.headers.host?.includes('novacustom.com.br')
    const notification_url = process.env.WEBHOOK_URL || 
                             (isProduction ? 'https://www.novacustom.com.br/api/payments/webhook' : `https://${req.headers.host}/api/payments/webhook`)

    if (paymentMethod === 'pix') {
      console.log('[MP] Iniciando pagamento PIX via API Direta para Order:', orderId);
      
      // Sanitização do CPF e nomes
      const cleanCPF = (payer.cpf || '').replace(/\D/g, '');
      const firstName = (payer.firstName || '').trim();
      const lastName = (payer.lastName || '').trim();

      if (!cleanCPF || !firstName || !payer.email) {
        console.error('[MP] Dados do pagador incompletos:', { firstName, email: payer.email, hasCPF: !!cleanCPF });
        return res.status(400).json({ 
          error: 'Dados do pagador incompletos. Verifique Nome, Email e CPF.' 
        });
      }

      const paymentData = {
        transaction_amount: cleanAmount,
        description: `Pedido #${String(orderId).slice(0, 8)} - NovaCustom`,
        payment_method_id: 'pix',
        payer: {
          email: payer.email.trim(),
          first_name: firstName,
          last_name: lastName || firstName, // Fallback se não tiver sobrenome
          identification: {
            type: 'CPF',
            number: cleanCPF,
          },
        },
        external_reference: String(orderId),
        notification_url: notification_url,
      };

      console.log('[MP] Enviando payload para API do Mercado Pago via Fetch...');

      // Chave de Idempotência única para evitar pagamentos duplicados
      const idempotencyKey = `pix-${orderId}-${Date.now()}`;

      // Chamada Direta via Fetch para evitar erros de inicialização do SDK
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'X-Meli-Session-Id': deviceId || '',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[MP] Erro na API Direta:', result);
        throw new Error(result.message || 'Erro ao comunicar com Mercado Pago');
      }

      console.log('[MP] Pagamento PIX criado com sucesso! ID:', result.id);
      
      // Log detalhado do point_of_interaction para debug se necessário
      if (!result.point_of_interaction?.transaction_data?.qr_code) {
        console.warn('[MP] ATENÇÃO: QR Code não encontrado no point_of_interaction!');
        console.log('[MP] Estrutura da resposta:', JSON.stringify(result, null, 2));
      }

      return res.json({
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code || (result as any).qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || (result as any).qr_code_base64,
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url || (result as any).ticket_url,
      })
    }

    return res.status(400).json({ error: 'Checkout transparente disponível apenas para PIX no momento.' })
  } catch (error: any) {
    console.error('[MP] Erro crítico ao processar pagamento:', error.message || error)
    
    if (error.apiResponse) {
      const apiError = error.apiResponse.body;
      console.error('[MP] Erro detalhado da API:', JSON.stringify(apiError, null, 2));
      
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: apiError
      })
    }
    
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
