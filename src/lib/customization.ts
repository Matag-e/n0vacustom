export function getCustomizationFee(customName?: string, customNumber?: string) {
  const hasName = Boolean(customName?.trim());
  const digitCount = (customNumber || '').replace(/\D/g, '').length;

  if (!hasName && digitCount === 0) return 0;
  if (hasName && digitCount === 0) return 30;
  if (!hasName && digitCount > 0) return 45;
  if (digitCount === 1) return 65;
  return 80;
}
