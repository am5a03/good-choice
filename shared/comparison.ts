import type { Metric, NutrientKey, Product } from './models';

export const METRICS = {
  fibre: { label: 'More fibre', name: 'fibre', unit: 'g', direction: 1 },
  sugars: { label: 'Less sugar', name: 'total sugars', unit: 'g', direction: -1 },
  sodium: { label: 'Less sodium', name: 'sodium', unit: 'mg', direction: -1 },
  price: { label: 'Lower price', name: 'unit price', unit: 'CAD', direction: -1 },
} as const;
export const NUTRIENTS: Record<NutrientKey | 'price', { label: string; unit: string }> = {
  fibre: { label: 'Fibre', unit: 'g' }, sugars: { label: 'Total sugars', unit: 'g' }, sodium: { label: 'Sodium', unit: 'mg' },
  price: { label: 'Unit price', unit: 'CAD' }, protein: { label: 'Protein', unit: 'g' }, saturated: { label: 'Saturated fat', unit: 'g' },
  fat: { label: 'Total fat', unit: 'g' }, carbs: { label: 'Carbohydrate', unit: 'g' }, calories: { label: 'Energy', unit: 'kcal' },
  addedSugars: { label: 'Added sugars', unit: 'g' },
};
export function valuePer100(product: Product, key: NutrientKey | 'price'): number | null {
  if (key === 'price') {
    return product.price !== null && Number.isFinite(product.price) && product.price >= 0 && product.weight !== null && product.weight > 0 && Number.isFinite(product.weight)
      ? product.price / product.weight * 100 : null;
  }
  const value = product.nutrients[key];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
export function valueAt(product: Product, key: NutrientKey | 'price', grams: number): number | null {
  if (!Number.isFinite(grams) || grams <= 0) throw new RangeError('The comparison quantity must be positive.');
  const value = valuePer100(product, key);
  return value === null ? null : value * grams / 100;
}
export function formatValue(product: Product, key: NutrientKey | 'price', grams = 100): string {
  const value = valueAt(product, key, grams);
  if (value === null) return key === 'addedSugars' ? 'Not declared' : 'Not available';
  if (key === 'price') return money(value);
  return `${value.toLocaleString('en-CA', { maximumFractionDigits: key === 'sodium' || key === 'calories' ? 1 : 2 })} ${NUTRIENTS[key].unit}`;
}
export const money = (value: number | null) => value === null ? 'Not entered' : `C$${value.toFixed(2)}`;
export type Comparison = {
  status: 'insufficient' | 'missing' | 'tie' | 'ready'; winners: Product[]; missing: Product[]; base: Product | null;
};
// Pure business logic, shared and unit-tested. No UI state, network or hidden overall score.
export function compareProducts(products: Product[], metric: Metric, usualId: string): Comparison {
  const unique = [...new Map(products.map((product) => [product.id, product])).values()];
  const base = unique.find((product) => product.id === usualId) ?? unique[0] ?? null;
  if (unique.length < 2) return { status: 'insufficient', winners: [], missing: [], base };
  const missing = unique.filter((product) => valuePer100(product, metric) === null);
  if (missing.length) return { status: 'missing', winners: [], missing, base };
  const values = unique.map((product) => valuePer100(product, metric)!);
  const best = METRICS[metric].direction === 1 ? Math.max(...values) : Math.min(...values);
  const winners = unique.filter((product) => Math.abs(valuePer100(product, metric)! - best) < 1e-8);
  return { status: winners.length > 1 ? 'tie' : 'ready', winners, missing: [], base };
}
export function explainComparison(products: Product[], metric: Metric, usualId: string) {
  const result = compareProducts(products, metric, usualId);
  if (result.status === 'insufficient') return { ...result, title: 'Bring another option to the table.', body: 'Select two to four products to compare equivalent quantities.', tradeoffs: [] as string[] };
  if (result.status === 'missing') return { ...result, title: 'A little more information first.', body: `We are missing ${METRICS[metric].name} information for ${result.missing.map((product) => product.name).join(', ')}. We will not guess a winner.`, tradeoffs: [] as string[] };
  if (result.status === 'tie') return { ...result, title: 'No single winner for this priority.', body: `${result.winners.map((product) => product.name).join(' and ')} are tied on ${METRICS[metric].name}. Consider a different priority, price or taste.`, tradeoffs: [] as string[] };
  const winner = result.winners[0];
  const base = result.base!;
  const target = winner.id === base.id ? products.find((product) => product.id !== winner.id)! : base;
  const tradeoffs = (Object.keys(METRICS) as Metric[]).filter((key) => key !== metric).map((key) => {
    const a = valuePer100(winner, key), b = valuePer100(target, key);
    if (a === null || b === null) return `${METRICS[key].name}: incomplete information.`;
    const relationship = Math.abs(a - b) < 1e-8 ? 'the same' : a < b ? 'lower' : 'higher';
    return `${NUTRIENTS[key].label}: ${relationship} (${formatValue(winner, key)} vs ${formatValue(target, key)} per 100 g).`;
  });
  return { ...result,
    title: winner.id === usualId ? 'Your usual fits this priority.' : `Consider ${winner.brand}.`,
    body: `${winner.name} has ${formatValue(winner, metric)} per 100 g. This is a match for ${METRICS[metric].label.toLowerCase()}, not an overall health verdict.`,
    tradeoffs,
    comparedWith: target.name,
  };
}
