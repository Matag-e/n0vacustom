export const orderConfirmationTemplate = (orderId: string, customerName: string, totalAmount: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header img { height: 60px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; color: #999; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .order-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NovaCustom</h1>
    </div>
    <div class="content">
      <h2>Olá, ${customerName}! 👋</h2>
      <p>Recebemos o seu pedido com sucesso! Estamos muito felizes que você escolheu a NovaCustom para vestir o seu manto.</p>
      
      <div class="order-info">
        <p><strong>Pedido:</strong> #${orderId}</p>
        <p><strong>Valor Total:</strong> R$ ${totalAmount.toFixed(2).replace('.', ',')}</p>
        <p><strong>Status:</strong> Aguardando Pagamento</p>
      </div>

      <p>Assim que o pagamento for confirmado, iniciaremos o processo de separação e envio do seu produto.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://www.novacustom.com.br/profile" class="button">Acompanhar Pedido</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NovaCustom Mantos Exclusivos. Todos os direitos reservados.</p>
      <p>Este é um e-mail automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>
`;

export const orderPaidTemplate = (orderId: string, customerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; color: #999; font-size: 12px; }
    .badge { display: inline-block; padding: 5px 10px; background-color: #4CAF50; color: #fff; border-radius: 3px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NovaCustom</h1>
    </div>
    <div class="content">
      <h2>Pagamento Confirmado! ⚽🔥</h2>
      <p>Olá, ${customerName}! Ótimas notícias: o pagamento do seu pedido <strong>#${orderId}</strong> foi confirmado com sucesso.</p>
      <p>Nossa equipe já está preparando o seu manto com todo o cuidado que ele merece. Você receberá um novo e-mail assim que o produto for postado com o código de rastreio.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://www.novacustom.com.br/profile" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver meu pedido</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NovaCustom Mantos Exclusivos. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

export const orderShippedTemplate = (orderId: string, customerName: string, trackingCode?: string | null) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; color: #999; font-size: 12px; }
    .box { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NovaCustom</h1>
    </div>
    <div class="content">
      <h2>Seu pedido foi enviado! 📦🚚</h2>
      <p>Olá, ${customerName}! Seu pedido <strong>#${orderId}</strong> já foi postado e está a caminho.</p>

      <div class="box">
        <p><strong>Status:</strong> Enviado</p>
        ${trackingCode ? `<p><strong>Código de rastreio:</strong> <span class="code">${trackingCode}</span></p>` : ''}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://www.novacustom.com.br/profile" class="button">Acompanhar pedido</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} NovaCustom Mantos Exclusivos. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
