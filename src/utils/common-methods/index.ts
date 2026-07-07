export function displayValue(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;

  return String(value);
}

export function formatPrice(value?: number | null, fallback = '-') {
  if (value === null || value === undefined) return fallback;

  return Number(value).toFixed(2);
}

export function toNumberValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function toDateValue(value: number | null | undefined) {
  if (!value) return null;

  return String(value);
}
