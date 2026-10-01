// A native number input accepts "e", a sign and a decimal point, and hands
// back "" for anything it cannot parse — which reads as "cleared".
export const digitsOnly = (value: string): string => value.replace(/\D/g, '');
