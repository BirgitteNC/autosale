const ingred = { navn: 'Tærtedej', enhed: 'stk', 'mængde': 1, raavare_id: 'ing_taertedej' };

const formatIngredient = (ingred, factor) => {
  const val = ingred.amount !== undefined ? ingred.amount : ingred.mængde;
  const unitStr = ingred.unit || ingred.enhed || '';
  
  console.log("val is:", val);
  
  if (val !== null && val !== undefined && !isNaN(val)) {
     const scaled = Number(val) * factor;
     const formattedAmount = parseFloat(scaled.toFixed(2)).toString().replace('.', ',');
     return `${formattedAmount} ${unitStr}`.trim();
  }
  
  return ingred.text || '';
};

console.log("Result:", formatIngredient(ingred, 1.5));
