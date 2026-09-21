/**
 * Keeps a numeric text field to digits. A native number input still accepts
 * "e", a sign and a decimal point, and hands back an empty string for anything
 * it cannot parse — which reads as "cleared" and silently drops the old value.
 */
export const digitsOnly = (value: string): string => value.replace(/\D/g, '');
