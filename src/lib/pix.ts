
function crc16ccitt(text: string) {
  let crc = 0xffff;
  for (let c = 0; c < text.length; c++) {
    crc ^= text.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase()).padStart(4, '0');
}

export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txid = '***'
}: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}) {
  const amountStr = amount.toFixed(2);
  
  const payload = [
    '000201', // Payload Format Indicator
    '26', // Merchant Account Information
    (
      '0014br.gov.bcb.pix' +
      `01${key.length.toString().padStart(2, '0')}${key}`
    ).length.toString().padStart(2, '0'),
    '0014br.gov.bcb.pix',
    `01${key.length.toString().padStart(2, '0')}${key}`,
    
    '52040000', // Merchant Category Code
    '5303986', // Transaction Currency (BRL)
    `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`, // Transaction Amount
    '5802BR', // Country Code
    `59${name.length.toString().padStart(2, '0')}${name}`, // Merchant Name
    `60${city.length.toString().padStart(2, '0')}${city}`, // Merchant City
    
    '62', // Additional Data Field Template
    (
      `05${txid.length.toString().padStart(2, '0')}${txid}`
    ).length.toString().padStart(2, '0'),
    `05${txid.length.toString().padStart(2, '0')}${txid}`,
    
    '6304' // CRC16
  ].join('');

  return `${payload}${crc16ccitt(payload)}`;
}
