// Explanations carried forward from the original prototype; sources describe ingredient
// function and label interpretation, not the safety of these fictional products.
export const INGREDIENT_GUIDE = [
  { id: 'lecithin', name: 'Lecithin', tag: 'Texture & mixing', symbol: '≈',
    intro: 'An ingredient used to help mixtures stay together.',
    body: 'Lecithin is listed by Health Canada among emulsifying, gelling, stabilizing or thickening agents. An emulsifier helps ingredients such as oil and water stay mixed.',
    context: 'The name does not tell us how much is in a product. This card does not establish allergy suitability or assess an individual product’s safety.',
    source: 'Health Canada · Emulsifying and stabilizing agents', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/lists-permitted/4-emulsifying-gelling-stabilizing-thickening-agents.html' },
  { id: 'tocopherols', name: 'Mixed tocopherols', tag: 'Preservation', symbol: 'α',
    intro: 'An antioxidant used to help protect food from oxidation.',
    body: 'Health Canada lists tocopherols as preservatives. Here, “antioxidant” describes the ingredient’s function in the food. It is not a health rating for the finished product.',
    context: 'The label name alone does not give us the concentration. We do not use it to create a safe/unsafe score.',
    source: 'Health Canada · Permitted preservatives', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/lists-permitted/11-preservatives.html' },
  { id: 'sugars', name: 'Sugars on a Canadian label', tag: 'Reading the label', symbol: '◇',
    intro: 'Total sugars and added-sugar ingredients are different pieces of information.',
    body: 'A Canadian nutrition table gives total sugars for the stated serving. Sugar-based ingredients are grouped in the ingredient list. The list does not provide a separate gram value for added sugars.',
    context: 'Added sugars remain “Not declared” when unavailable. We never infer an added-sugar quantity from total sugars.',
    source: 'Health Canada · Sugars: using the food labels', url: 'https://www.canada.ca/en/health-canada/services/nutrients/sugars/using-food-labels.html' },
  { id: 'additives', name: 'Every ingredient has a job', tag: 'The bigger picture', symbol: '↔',
    intro: 'Start with what an ingredient does—not how familiar its name sounds.',
    body: 'Food additives are used for technical effects. Health Canada’s assessments consider the requested use and factors such as exposure, allergenicity and toxicology. Permitted uses have conditions.',
    context: 'GoodChoice separates ingredient explanations, numerical comparisons and preferences. It does not diagnose a condition or certify a food as allergy-safe.',
    source: 'Health Canada · Food additives overview', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives.html' },
] as const;
export type IngredientCard = typeof INGREDIENT_GUIDE[number];
export function ingredientCard(name: string) {
  const lower = name.toLowerCase();
  return INGREDIENT_GUIDE.find((card) => card.id === (lower.includes('lecithin') ? 'lecithin' : lower.includes('tocopherol') ? 'tocopherols' : lower.startsWith('sugars') ? 'sugars' : ''));
}
