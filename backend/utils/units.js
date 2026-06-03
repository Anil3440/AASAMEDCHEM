const UNIT_FACTORS = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
};

const UNIT_OPTIONS = {
  g: ['g', 'kg'],
  mL: ['mL', 'L'],
  unit: ['unit'],
};

function convertToBase(quantity, unit) {
  return parseFloat(quantity) * (UNIT_FACTORS[unit] || 1);
}

function convertFromBase(baseQty, unit) {
  return baseQty / (UNIT_FACTORS[unit] || 1);
}

function calculatePrice(orderedQty, orderedUnit, basePricePerBaseUnit) {
  const base = convertToBase(orderedQty, orderedUnit);
  return base * parseFloat(basePricePerBaseUnit);
}

module.exports = { UNIT_FACTORS, UNIT_OPTIONS, convertToBase, convertFromBase, calculatePrice };
