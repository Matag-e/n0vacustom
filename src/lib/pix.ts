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
  // 1. Formatar a Chave
  // Se a chave tiver 11 dígitos e começar com DDD válido (ex: 11), tratamos como telefone e adicionamos +55
  let cleanKey = key.replace(/\D/g, '');
  if (cleanKey.length === 11 && !cleanKey.startsWith('000') && !cleanKey.startsWith('111')) {
    // Checagem simples: se os 2 primeiros dígitos são um DDD válido (11-99)
    const ddd = parseInt(cleanKey.substring(0, 2));
    if (ddd >= 11 && ddd <= 99) {
      cleanKey = '+55' + cleanKey;
    }
  } else if (cleanKey.length === 13 && cleanKey.startsWith('55')) {
    cleanKey = '+' + cleanKey;
  }
  
  // Para chaves que não são telefone, usamos como está (email, CPF, CNPJ, EVP)
  // No caso de email, não removemos @ nem pontos
  if (key.includes('@')) {
    cleanKey = key.trim();
  }

  // 2. Formatar o Valor (sempre com 2 casas decimais)
  const formattedAmount = amount.toFixed(2);
  
  // 3. Funções Auxiliares para campos EMV
  const getField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // 4. Montar subcampos do Merchant Account Information (ID 26)
  const gui = getField('00', 'br.gov.bcb.pix');
  const keyField = getField('01', cleanKey);
  const merchantAccountInfo = getField('26', gui + keyField);
  
  // 5. Montar Payload Base
  const payloadBase = [
    getField('00', '01'), // Payload Format Indicator
    merchantAccountInfo,
    getField('52', '0000'), // Merchant Category Code
    getField('53', '986'), // Currency (BRL)
    getField('54', formattedAmount), // Amount
    getField('58', 'BR'), // Country Code
    getField('59', name.substring(0, 25).toUpperCase()), // Merchant Name (max 25)
    getField('60', city.substring(0, 15).toUpperCase()), // Merchant City (max 15)
    getField('62', getField('05', '***')), // Additional Data Field (TXID)
  ].join('');
  
  // 6. Calcular CRC16
  const payloadWithIndicator = payloadBase + '6304';
  const crc = crc16(payloadWithIndicator);
  
  return payloadWithIndicator + crc;
}
