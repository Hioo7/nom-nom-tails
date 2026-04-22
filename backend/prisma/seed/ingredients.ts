import prisma from '../../src/lib/prisma';

export interface IngredientsResult {
  chicken: { id: string };
  rice: { id: string };
  uradDal: { id: string };
  fenugreekSeeds: { id: string };
  onion: { id: string };
  tomato: { id: string };
  spiceMix: { id: string };
  cookingOil: { id: string };
  wheatBread: { id: string };
  cheeseSlice: { id: string };
  lettuce: { id: string };
  cucumber: { id: string };
  semolina: { id: string };
  coconutChutney: { id: string };
  sambar: { id: string };
  butter: { id: string };
}

// availableQty is in the ingredient's own unit (kg, liter, pieces, g)
// DishIngredient.quantity stores milli-units: grams for kg, ml for liter,
// (count * 1000) for pieces, mg for g — so that quantity/1000 gives the
// amount in the ingredient's unit per serving.
const INGREDIENT_DEFINITIONS = [
  { name: 'Chicken', unit: 'kg', availableQty: 10 },
  { name: 'Basmati Rice', unit: 'kg', availableQty: 20 },
  { name: 'Urad Dal', unit: 'kg', availableQty: 10 },
  { name: 'Fenugreek Seeds', unit: 'g', availableQty: 500 },
  { name: 'Onion', unit: 'kg', availableQty: 8 },
  { name: 'Tomato', unit: 'kg', availableQty: 6 },
  { name: 'Spice Mix', unit: 'g', availableQty: 1000 },
  { name: 'Cooking Oil', unit: 'liter', availableQty: 10 },
  { name: 'Whole Wheat Bread', unit: 'pieces', availableQty: 100 },
  { name: 'Cheese Slice', unit: 'pieces', availableQty: 80 },
  { name: 'Lettuce', unit: 'kg', availableQty: 3 },
  { name: 'Cucumber', unit: 'kg', availableQty: 4 },
  { name: 'Semolina', unit: 'kg', availableQty: 5 },
  { name: 'Coconut Chutney', unit: 'kg', availableQty: 5 },
  { name: 'Sambar', unit: 'liter', availableQty: 8 },
  { name: 'Butter', unit: 'kg', availableQty: 2 },
] as const;

export async function seedIngredients(): Promise<IngredientsResult> {
  const created = await prisma.$transaction(
    INGREDIENT_DEFINITIONS.map((def) =>
      prisma.ingredient.create({ data: def }),
    ),
  );

  console.log(`  Created ${created.length} ingredients.`);

  return {
    chicken: created[0],
    rice: created[1],
    uradDal: created[2],
    fenugreekSeeds: created[3],
    onion: created[4],
    tomato: created[5],
    spiceMix: created[6],
    cookingOil: created[7],
    wheatBread: created[8],
    cheeseSlice: created[9],
    lettuce: created[10],
    cucumber: created[11],
    semolina: created[12],
    coconutChutney: created[13],
    sambar: created[14],
    butter: created[15],
  };
}
