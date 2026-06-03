export const UNIT_FACTORS = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
};

export const UNIT_OPTIONS = {
  g: ['g', 'kg'],
  mL: ['mL', 'L'],
  unit: ['unit'],
};

export function convertToBase(quantity, unit) {
  return parseFloat(quantity) * (UNIT_FACTORS[unit] || 1);
}

export function convertFromBase(baseQty, unit) {
  return baseQty / (UNIT_FACTORS[unit] || 1);
}

export function calculatePrice(orderedQty, orderedUnit, basePricePerBaseUnit) {
  const base = convertToBase(orderedQty, orderedUnit);
  return base * parseFloat(basePricePerBaseUnit);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}
