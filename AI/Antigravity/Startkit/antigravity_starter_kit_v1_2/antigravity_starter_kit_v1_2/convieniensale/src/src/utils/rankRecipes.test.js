import { describe, it, expect } from 'vitest';
import { rankRecipes, validateBundle } from './rankRecipes';

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
    expect(kyllingOpskrift.matchCount).toBe(2);
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
});
