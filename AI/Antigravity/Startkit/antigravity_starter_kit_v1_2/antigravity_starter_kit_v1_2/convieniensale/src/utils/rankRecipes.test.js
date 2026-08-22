import { describe, it, expect } from 'vitest';
import { rankRecipes, validateBundle, datovareWeight } from './rankRecipes';

describe('rankRecipes', () => {
  const mockIngredients = [
    { id: 'ing_kylling', kategori: 'Slagter' },
    { id: 'ing_okse', kategori: 'Slagter' },
    { id: 'ing_gulerod', kategori: 'Grønt' }
  ];

  const mockRecipes = [
    {
      id: 'rec_kylling',
      titel: 'Kylling i karry',
      ingredienser: [
        { raavare_id: 'ing_kylling' },
        { raavare_id: 'ing_gulerod' }
      ]
    },
    {
      id: 'rec_okse',
      titel: 'Oksegryde',
      ingredienser: [
        { raavare_id: 'ing_okse' },
        { raavare_id: 'ing_gulerod' }
      ]
    }
  ];

  it('bør identificere en kødkonflikt, når bruger vælger oksekød, men opskriften er med kylling', () => {
    const result = rankRecipes({
      selectedIngredientIds: ['ing_okse'],
      foodWasteIngredientIds: [],
      recipes: mockRecipes,
      ingredients: mockIngredients
    });

    const kyllingOpskrift = result.find(r => r.id === 'rec_kylling');
    const okseOpskrift = result.find(r => r.id === 'rec_okse');

    expect(kyllingOpskrift.hasMeatConflict).toBe(true);
    expect(okseOpskrift.hasMeatConflict).toBe(false);
  });

  it('bør udregne matchCount korrekt ud fra valgte ingredienser', () => {
    const result = rankRecipes({
      selectedIngredientIds: ['ing_kylling', 'ing_gulerod'],
      foodWasteIngredientIds: [],
      recipes: mockRecipes,
      ingredients: mockIngredients
    });

    const kyllingOpskrift = result.find(r => r.id === 'rec_kylling');
    // Slagter (1.5) + Grønt (1.5) = 3.0 (vægtet score, ikke rå tælling)
    expect(kyllingOpskrift.matchCount).toBe(3);
  });
});

describe('datovareWeight', () => {
  it('skal give dobbelt forgængelighed (1.5 × 2 = 3.0) for boost-kategorier (Grønt, Slagter, Fisk)', () => {
    expect(datovareWeight('Grønt')).toBe(3.0);
    expect(datovareWeight('Slagter')).toBe(3.0);
    expect(datovareWeight('Fisk')).toBe(3.0);
  });

  it('skal give mindst 1.5 for ikke-boost-kategorier (f.eks. Mejeri og Kolonial)', () => {
    expect(datovareWeight('Mejeri')).toBe(1.5);   // max(1.2, 1.5)
    expect(datovareWeight('Kolonial')).toBe(1.5); // max(1.0, 1.5)
  });
});

describe('validateBundle', () => {
  const mockRecipes = [
    {
      id: 'rec_1',
      ingredienser: [
        { raavare_id: 'ing_a' },
        { raavare_id: 'ing_b' }
      ]
    }
  ];

  it('skal afvise et bundt (3 varer), hvis de ikke har fælles opskrifter', () => {
    // 3 varer kræver mindst 2 matches ifølge vores dommer
    const valid = validateBundle(['ing_x', 'ing_y', 'ing_z'], mockRecipes);
    expect(valid).toBe(false);
  });

  it('skal godkende et bundt (2 varer), hvor mindst én findes i opskriften', () => {
    // 2 varer kræver mindst 1 match
    const valid = validateBundle(['ing_a', 'ing_x'], mockRecipes);
    expect(valid).toBe(true);
  });

  it('skal altid godkende et bundt med kun 1 vare (ingen tærskel)', () => {
    const valid = validateBundle(['ing_x'], mockRecipes);
    expect(valid).toBe(true);
  });

  it('skal kræve mindst 3 matches ved 4+ varer', () => {
    const recipesWithMany = [
      {
        id: 'rec_many',
        ingredienser: [
          { raavare_id: 'ing_a' },
          { raavare_id: 'ing_b' },
          { raavare_id: 'ing_c' }
        ]
      }
    ];
    // 4 varer valgt, men kun 3 er i opskriften — det er præcis 3, skal godkendes
    const validExact = validateBundle(['ing_a', 'ing_b', 'ing_c', 'ing_x'], recipesWithMany);
    expect(validExact).toBe(true);

    // 4 varer valgt, kun 2 i opskriften — skal afvises
    const recipesWithTwo = [
      { id: 'rec_two', ingredienser: [{ raavare_id: 'ing_a' }, { raavare_id: 'ing_b' }] }
    ];
    const validInsufficient = validateBundle(['ing_a', 'ing_b', 'ing_c', 'ing_d'], recipesWithTwo);
    expect(validInsufficient).toBe(false);
  });
});
