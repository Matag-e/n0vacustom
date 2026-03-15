/**
 * Utilitário para gerar a string do PIX Copia e Cola (BR Code)
 * Baseado no padrão do Banco Central do Brasil
 */

function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(amount: number, key: string, name: string = "NovaCustom", city: string = "SAO PAULO"): string {
  // Limpar a chave (remover parênteses, espaços, hífens)
  const cleanKey = key.replace(/\D/g, '');
  
  // Formatar o valor com 2 casas decimais e ponto
  const formattedAmount = amount.toFixed(2);
  
  // Padrão do Merchant Account Information (GUI + Key)
  const merchantAccountInfo = `0014br.gov.bcb.pix01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
  
  // Montar o payload base
  let payload = [
    '000201', // Payload Format Indicator
    `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`, // Merchant Account Info
    '52040000', // Merchant Category Code
    '5303986', // Currency (BRL)
    `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`, // Amount
    '5802BR', // Country Code
    `59${name.length.toString().padStart(2, '0')}${name}`, // Merchant Name
    `60${city.length.toString().padStart(2, '0')}${city}`, // Merchant City
    '62070503***', // Additional Data (TXID *** para dinâmico/geral)
    '6304' // CRC16 Indicator
  ].join('');
  
  // Calcular o CRC16 e anexar ao final
  const crc = crc16(payload);
  return payload + crc;
}
