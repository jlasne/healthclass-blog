// Dr. Kivlin's fiber guide, the one she gives to every patient (her 7-page PDF: public/media/dana/fiber-guide.pdf).
// Her numbers, her notes. Fixed from the PDF: spelling; 3 notes pasted from another row (spinach had the banana note,
// pumpernickel the walnut note, barley "3x the fiber of oats"); watercress keeps its 0.1 g total but no split (her
// 0.1 soluble + 1.7 insoluble cannot add up to 0.1); psyllium seeds have no gram value, only their 20/80 split.

// grams: one value, a range [low, high], or "less than" ({ lt: 0.1 })
export type Grams = number | readonly [number, number] | { lt: number };

export type Food = {
  id: string;
  name: string;
  serving: string;
  total?: Grams; // grams of fiber per serving
  soluble?: Grams;
  insoluble?: Grams;
  note?: string;
};

export type FoodGroup = { id: string; label: string; foods: Food[] };

export const GOAL = { min: 25, max: 35 };

export const benefits = [
  { id: 'gut', icon: 'leaf', title: 'Digestive health', text: 'Regulates bowel movements. Lowers the risk of diverticulosis and pelvic floor disorders.' },
  { id: 'heart', icon: 'heart', title: 'Heart', text: 'Blocks cholesterol absorption, so LDL (bad cholesterol) goes down.' },
  { id: 'sugar', icon: 'timer', title: 'Blood sugar', text: 'Slows how fast glucose gets into your blood.' },
  { id: 'weight', icon: 'drop', title: 'Weight', text: 'Fiber foods hold water, so you feel fuller.' },
  { id: 'colon', icon: 'shield', title: 'Colon', text: 'Lowers the risk of colorectal cancer.' },
  { id: 'calm', icon: 'flame', title: 'Inflammation', text: 'Lowers chronic inflammation.' },
  { id: 'brain', icon: 'brain', title: 'Brain', text: 'Lowers the risk of dementia, through the gut-brain link.' },
] as const;

export const kinds = [
  {
    id: 'soluble',
    kind: 'Soluble fiber',
    name: 'The softener',
    tone: 'soluble',
    lines: [
      'Dissolves in water and forms a gel that feeds your gut microbiome.',
      'A thriving microbiome helps your immune system: 70% of your immune cells live in the gut.',
      'Blocks cholesterol, slows glucose absorption and keeps you full longer.',
      'Keeps moisture in your stool.',
    ],
  },
  {
    id: 'insoluble',
    kind: 'Insoluble fiber',
    name: 'The bulker',
    tone: 'insoluble',
    lines: [
      'Does not dissolve in water.',
      'Bulks up stool and keeps water in it. It stretches the bowel to trigger movement.',
      'Helps both loose stool and hard stool.',
      'Less constipation means a lower risk of pelvic floor problems: bladder leaks, vaginal prolapse and urinary retention.',
    ],
  },
  {
    id: 'water',
    kind: 'Water',
    name: 'The activator',
    tone: 'water',
    lines: [
      'Water makes fiber work.',
      'Drink more water each time you add fiber.',
      'More fiber without more water can make constipation and bloating worse.',
    ],
  },
] as const;

export const supplementServings = [
  { name: 'Benefiber', grams: [3, 6] as const },
  { name: 'Psyllium', grams: [4, 6] as const },
];

export const steps = [
  { title: 'Eat both kinds', text: 'Soluble fiber softens, insoluble fiber bulks. Together they give the best bowel movements.' },
  { title: 'Drink more water as you add fiber', text: 'Water is the activator. Without it, constipation and bloating can get worse.' },
  { title: 'Go slow', text: 'Add only a few grams a week. Your body adjusts and bloating stays low.' },
  { title: 'Food first', text: 'The best health data is on fiber from food. Supplements alone are not enough.' },
];

export const foodGroups: FoodGroup[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    foods: [
      { id: 'apple', name: 'Apple, with skin', serving: '1 medium', total: [4.5, 5], soluble: [0.4, 1.2], insoluble: 3.9 },
      { id: 'raspberries', name: 'Raspberries', serving: '½ cup', total: 8, soluble: [0.9, 1.8], insoluble: [2.4, 3.2], note: 'One of the best high fiber, low calorie fruits.' },
      { id: 'strawberries', name: 'Strawberries', serving: '1 cup', total: 4.3, soluble: 1.7, insoluble: 2.6 },
      { id: 'blueberries', name: 'Blueberries', serving: '1 cup', total: 4, soluble: 1.5, insoluble: 2.5, note: 'High in antioxidants.' },
      { id: 'blackberries', name: 'Blackberries', serving: '1 cup', total: 7.6, soluble: 1.6, insoluble: 6, note: 'Low glycemic index.' },
      { id: 'pear', name: 'Pear', serving: '1 medium', total: 5.5, soluble: 1.7, insoluble: 3.8 },
      { id: 'plums', name: 'Plums', serving: '2 medium', total: 2.2, soluble: 1.1, insoluble: 1.1 },
      { id: 'orange', name: 'Orange', serving: '1 medium', total: [3, 4], soluble: 2.1, insoluble: 1.3 },
      { id: 'cantaloupe', name: 'Cantaloupe', serving: '1 cup', total: 1.4, soluble: 0.4, insoluble: 1 },
      { id: 'kiwi', name: 'Kiwi', serving: '1 large', total: 3, soluble: 0.7, insoluble: 2.3, note: 'Eating the skin boosts the fiber. Kiwi also has actinidin, an enzyme that helps constipation.' },
      { id: 'banana', name: 'Banana', serving: '1 medium', total: 3, soluble: 0.6, insoluble: 2.4, note: 'Green, less ripe bananas can cause constipation. Yellow ones relieve it.' },
      { id: 'figs', name: 'Dried figs', serving: '3 medium', total: 5, soluble: 0.75, insoluble: 4.25 },
      { id: 'prunes', name: 'Prunes', serving: '3 medium', total: 1.7, soluble: 1, insoluble: 0.7, note: 'Also has sorbitol, which has a laxative effect.' },
      { id: 'grapefruit', name: 'Grapefruit', serving: '½ large', total: 3.1, soluble: 2.4, insoluble: 0.7, note: 'Most of the fiber is in the chewy walls between the segments.' },
      { id: 'apricots', name: 'Dried apricots', serving: '4 medium', total: 3.5, soluble: 1.8, insoluble: 1.7 },
      { id: 'cranberries', name: 'Cranberries', serving: '1 cup', total: 4, soluble: 0.8, insoluble: 3.2, note: 'Protects against UTIs.' },
    ],
  },
  {
    id: 'vegetables',
    label: 'Vegetables',
    foods: [
      { id: 'broccoli', name: 'Broccoli', serving: '½ cup', total: 2.4, soluble: 1.2, insoluble: 1.2, note: 'Has sulforaphane, which may detoxify carcinogens and protect against cancer.' },
      { id: 'green-beans', name: 'Green beans', serving: '½ cup', total: [2, 4], soluble: [0.5, 0.8], insoluble: [1.2, 1.5] },
      { id: 'brussels-sprouts', name: 'Brussels sprouts', serving: '1 cup', total: 4, soluble: 2, insoluble: 2 },
      { id: 'carrots', name: 'Carrots', serving: '1 cup, raw', total: 4.6, soluble: 2.4, insoluble: 2.2, note: 'Cooking does not change the nutrients much.' },
      { id: 'tomato', name: 'Tomato', serving: '1 medium', total: 1.5, soluble: 0.2, insoluble: 1.3 },
      { id: 'asparagus', name: 'Asparagus', serving: '½ cup, cooked', total: 3, soluble: 1.3, insoluble: 1.7, note: 'Roughly 60% insoluble, 40% soluble.' },
      { id: 'sweet-potato', name: 'Sweet potato', serving: '1 medium', total: 4, soluble: 2, insoluble: 2, note: 'More fiber with the skin.' },
      { id: 'potato', name: 'Potato', serving: '1 medium', total: 4.4, soluble: 2.4, insoluble: 2.4, note: 'The skin is insoluble fiber. The inner flesh is soluble fiber.' },
      { id: 'zucchini', name: 'Zucchini', serving: '1 medium', total: 2, soluble: 0.1, insoluble: 1.9, note: 'Mostly from the skin.' },
      { id: 'pepper', name: 'Pepper', serving: '1 cup', total: 1.7, soluble: 0.6, insoluble: 1.1, note: 'Mostly from the skin.' },
      { id: 'spinach', name: 'Spinach', serving: '1 cup', total: 6, soluble: 1, insoluble: 5 },
      { id: 'kale', name: 'Kale', serving: '1 cup, cooked', total: 7.2, soluble: 2.1, insoluble: 5.1 },
      { id: 'artichokes', name: 'Artichokes', serving: '3 medium', total: 6.5, soluble: 4.7, insoluble: 1.8, note: 'A high source of soluble fiber.' },
      { id: 'watercress', name: 'Watercress', serving: '1 cup', total: 0.1, note: 'Ranked the #1 healthiest vegetable by the CDC. Has natural enzymes that help digestion.' },
      { id: 'avocado', name: 'Avocado', serving: '1 medium', total: [10, 13], soluble: 3, insoluble: 7 },
    ],
  },
  {
    id: 'nuts',
    label: 'Nuts, seeds & legumes',
    foods: [
      { id: 'almonds', name: 'Almonds', serving: '1 oz (23 nuts), raw', total: 4.2, soluble: 0.7, insoluble: 3.5, note: 'Also has healthy fats and 6 g of protein.' },
      { id: 'flaxseeds', name: 'Flaxseeds', serving: '1 Tbsp', total: 2.8, soluble: 0.7, insoluble: 2.1 },
      { id: 'chia', name: 'Chia seeds', serving: '1 oz', total: 9.8, soluble: 1.5, insoluble: 8.3 },
      { id: 'peanuts', name: 'Peanuts', serving: '1 oz (10 large)', total: 3, soluble: 0.2, insoluble: 2.8 },
      { id: 'walnuts', name: 'Walnuts', serving: '1 oz', total: 2, soluble: 0.45, insoluble: 1.35, note: 'A great source of omega-3 fatty acids, antioxidants and polyphenols.' },
      { id: 'sunflower', name: 'Sunflower seeds', serving: '¼ cup', total: 3, soluble: 1.1, insoluble: 1.9 },
      { id: 'black-beans', name: 'Black beans', serving: '1 cup, cooked', total: 15, soluble: 7.3, insoluble: 7.7 },
      { id: 'lentils', name: 'Lentils', serving: '½ cup, cooked', total: 6.6, soluble: 2.8, insoluble: 3.8 },
      { id: 'kidney-beans', name: 'Kidney beans', serving: '½ cup, cooked', total: 5.8, soluble: 2.9, insoluble: 2.9 },
      { id: 'pinto-beans', name: 'Pinto beans', serving: '½ cup, cooked', total: 6.1, soluble: 1.4, insoluble: 4.7 },
      { id: 'garbanzo', name: 'Garbanzo beans', serving: '1 cup, cooked', total: [8, 12], soluble: 2.6, insoluble: 5.6, note: 'More soluble fiber than other legumes.' },
      { id: 'psyllium-seeds', name: 'Psyllium seeds', serving: 'No gram value in my chart', note: '20% soluble, 80% insoluble.' },
      { id: 'split-peas', name: 'Split peas', serving: '1 cup, cooked', total: 16, soluble: 2, insoluble: 14 },
      { id: 'popcorn', name: 'Popcorn', serving: '3 cups', total: 3.6, soluble: 0.4, insoluble: 3.2 },
    ],
  },
  {
    id: 'grains',
    label: 'Whole grains',
    foods: [
      { id: 'barley', name: 'Barley', serving: '½ cup, cooked', total: 3, soluble: 0.8, insoluble: 2.2 },
      { id: 'brown-rice', name: 'Brown rice', serving: '½ cup, cooked', total: 4, soluble: { lt: 0.1 }, insoluble: 4, note: 'Almost all insoluble fiber.' },
      { id: 'oat-bran', name: 'Oat bran', serving: '1 cup, cooked', total: 14.5, soluble: 7.25, insoluble: 7.25 },
      { id: 'oatmeal', name: 'Oatmeal', serving: '1 cup, cooked', total: 3, soluble: 0.2, insoluble: 2.8 },
      { id: 'pumpernickel', name: 'Pumpernickel bread', serving: '1 slice', total: 2, soluble: 0.45, insoluble: 1.35 },
      { id: 'quinoa', name: 'Quinoa', serving: '1 cup, cooked', total: 5, soluble: 0.5, insoluble: 4.5 },
      { id: 'wheat-bran', name: 'Wheat bran', serving: '½ cup', total: 12, soluble: 1, insoluble: 11 },
      { id: 'whole-grain-bread', name: 'Whole grain bread', serving: '1 slice', total: 2, soluble: 0.3, insoluble: 1.7 },
      { id: 'whole-wheat-bread', name: 'Whole wheat bread', serving: '1 slice', total: 2, soluble: 0.5, insoluble: 2.5 },
      { id: 'pasta', name: 'Whole grain pasta', serving: '1 cup', total: 6.3, soluble: 2.2, insoluble: 4.1 },
      { id: 'wheat-germ', name: 'Wheat germ', serving: '3 Tbsp', total: 3.9, soluble: 0.7, insoluble: 3.2 },
    ],
  },
];

export const allFoods = foodGroups.flatMap((g) => g.foods);

// --- the numbers: the low end counts in "Build your day", the middle sorts, the high end draws the range
export const low = (g?: Grams) => (g == null ? 0 : typeof g === 'number' ? g : 'lt' in g ? g.lt / 2 : g[0]);
export const high = (g?: Grams) => (g == null ? 0 : typeof g === 'number' ? g : 'lt' in g ? g.lt : g[1]);
export const mid = (g?: Grams) => (low(g) + high(g)) / 2;
const n = (x: number) => String(Math.round(x * 100) / 100);
export const fmt = (g: Grams) => (typeof g === 'number' ? n(g) : 'lt' in g ? `<${n(g.lt)}` : `${n(g[0])}–${n(g[1])}`);
export const isRange = (g?: Grams) => Array.isArray(g);
export const MAX_GRAMS = Math.max(...allFoods.map((f) => high(f.total)));

// the 3 foods richest in each kind, read from the chart
export const topBy = (key: 'soluble' | 'insoluble', count = 3) =>
  [...allFoods].filter((f) => f[key] != null).sort((a, b) => mid(b[key]) - mid(a[key])).slice(0, count);

export const lookAt = [
  { title: 'Solubility', text: 'Soluble or insoluble, as above. Each kind does a different job.' },
  { title: 'Gel formation', text: 'A gel blocks the absorption of cholesterol and sugar.', good: 'Big health benefits.', watch: 'Can bother a sensitive gut.' },
  { title: 'Viscosity', text: 'How thick fiber gets in your gut: water-like (low) or honey-like (high).', good: 'Viscous fiber that does not gel still slows cholesterol and sugar, and is gentler on a sensitive gut.' },
  { title: 'Fermentation', text: 'Gut bacteria eat the fiber and make butyrate.', good: 'Butyrate lowers inflammation, strengthens the gut lining and regulates metabolism.', watch: 'Fermentation also makes gas, which means bloating.' },
];

export type Supplement = { id: string; name: string; what?: string; traits: string[]; good?: string[]; watch?: string[]; badge?: string };

export const supplements: Supplement[] = [
  { id: 'psyllium', name: 'Psyllium husk', what: 'Powder or capsule', badge: 'Best studied', traits: ['Soluble', 'Viscous', 'Gel-forming'], good: ['Slows the absorption of cholesterol and glucose.', 'Adds water to stool, which helps constipation.'] },
  { id: 'metamucil', name: 'Metamucil', what: 'A brand of psyllium', traits: ['Psyllium'], watch: ['Can have added sugar and artificial flavor.'] },
  { id: 'benefiber', name: 'Benefiber', what: 'Wheat dextrin', traits: ['Soluble', 'Highly fermentable'], good: ['Mainly feeds your gut microbiome.'], watch: ['Not as helpful for bowel movements. Does not improve cholesterol.', 'Made from wheat. Under 20 ppm gluten, so gluten-free by FDA rules, but use caution with celiac disease or a severe wheat allergy.'] },
  { id: 'guar', name: 'Guar gum', traits: ['Soluble', 'Viscous', 'Gel-forming'], good: ['Shown to help lower cholesterol.'] },
  { id: 'sunfiber', name: 'Sunfiber', what: 'Partially hydrolyzed guar gum', traits: ['Soluble', 'Low viscosity'], good: ['Gentler on a sensitive gut.'] },
  { id: 'loam', name: 'Loam Fiber', what: 'A mix, with partially hydrolyzed guar gum and soluble wheat fiber', traits: ['Mixed'], watch: ['Use caution with a wheat sensitivity or allergy.'] },
  { id: 'inulin', name: 'Inulin', traits: ['Nonviscous'], watch: ['Does not improve cholesterol.'] },
  { id: 'fiberchoice', name: 'Fiber Choice', what: 'Mostly inulin', traits: ['Nonviscous'], watch: ['Like inulin, it does not improve cholesterol.'] },
  { id: 'metamucil-clear', name: 'Metamucil Clear', what: 'Corn fiber and inulin', traits: ['Nonviscous'], watch: ['Does not improve cholesterol.'] },
  { id: 'citrucel', name: 'Citrucel', traits: ['Viscous', 'Not gel-forming'], watch: ['Does not significantly lower cholesterol.'] },
];

export const goals = [
  { id: 'constipation', label: 'Constipation', picks: ['psyllium'], line: 'Psyllium husk. It adds water to stool. Metamucil is a brand of psyllium.' },
  { id: 'cholesterol', label: 'Cholesterol', picks: ['psyllium', 'guar'], line: 'Psyllium husk or guar gum. Both form a gel that slows cholesterol absorption.' },
  { id: 'sensitive', label: 'Sensitive gut', picks: ['sunfiber'], line: 'Sunfiber, a partially hydrolyzed guar gum. It is low viscosity and gentler.' },
  { id: 'microbiome', label: 'Feed gut bacteria', picks: ['benefiber'], line: 'Benefiber, a wheat dextrin. It is highly fermentable, so it feeds your microbiome.' },
  { id: 'wheat', label: 'Wheat allergy or celiac', picks: ['benefiber', 'loam'], caution: true, line: 'Use caution with Benefiber and Loam Fiber. Both are made with wheat.' },
] as const;

export const bestForConstipation = [
  { name: 'Raspberries and blackberries', foods: ['raspberries', 'blackberries'] },
  { name: 'Kiwi', foods: ['kiwi'], why: 'Has actinidin, an enzyme that helps constipation.' },
  { name: 'Oatmeal', foods: ['oatmeal'] },
  { name: 'Pears, apples and prunes', foods: ['pear', 'apple', 'prunes'], why: 'Prunes add sorbitol, a natural laxative.' },
  { name: 'Chia and flax seeds', foods: ['chia', 'flaxseeds'] },
  { name: 'Beans and legumes', foods: ['split-peas', 'black-beans', 'lentils'] },
  { name: 'Leafy greens like broccoli and Brussels sprouts', foods: ['broccoli', 'brussels-sprouts'] },
];

export const foodById = (id: string) => allFoods.find((f) => f.id === id);
