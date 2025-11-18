// Simple Node.js demo of the page distribution algorithm
// Run with: node demo-page-distribution.js

// Simulated cards data (first few cards from each category)
const cards = [
  // Category 0: Estadios (16 cards)
  {"id":1,"category":0,"desc":"Mexico City - Estadio Azteca"},
  {"id":2,"category":0,"desc":"Monterrey (Guadalupe) - Estadio BBVA"},
  {"id":3,"category":0,"desc":"Guadalajara (Zapopan) - Estadio Akron"},
  {"id":4,"category":0,"desc":"Toronto - BMO Field"},
  {"id":5,"category":0,"desc":"Vancouver - BC Place"},
  {"id":6,"category":0,"desc":"New York / New Jersey - MetLife Stadium"},
  {"id":7,"category":0,"desc":"Dallas (Arlington, Texas) - AT&T Stadium"},
  {"id":8,"category":0,"desc":"Kansas City - GEHA Field at Arrowhead Stadium"},
  {"id":9,"category":0,"desc":"Houston - NRG Stadium"},
  {"id":10,"category":0,"desc":"Atlanta - Mercedes-Benz Stadium"},
  {"id":11,"category":0,"desc":"Los Angeles (Inglewood, California) - SoFi Stadium"},
  {"id":12,"category":0,"desc":"Seattle - Lumen Field"},
  {"id":13,"category":0,"desc":"San Francisco Bay Area (Santa Clara) - Levi's Stadium"},
  {"id":14,"category":0,"desc":"Philadelphia - Lincoln Financial Field"},
  {"id":15,"category":0,"desc":"Miami (Miami Gardens, Florida) - Hard Rock Stadium"},
  {"id":16,"category":0,"desc":"Boston (Foxborough, Massachusetts) - Gillette Stadium"},
  
  // Category 1: Sedes (16 cards)
  {"id":17,"category":1,"desc":"Ciudad de México - Palacio de Bellas Artes"},
  {"id":18,"category":1,"desc":"Monterrey - Cerro de la Silla"},
  {"id":19,"category":1,"desc":"Guadalajara - Teatro Degollado"},
  {"id":20,"category":1,"desc":"Vancouver - Stanley Park"},
  {"id":21,"category":1,"desc":"Toronto - CN Tower"},
  {"id":22,"category":1,"desc":"Atlanta - Georgia Aquarium"},
  {"id":23,"category":1,"desc":"Boston (Foxborough) - Freedom Trail"},
  {"id":24,"category":1,"desc":"Dallas (Arlington) - Reunion Tower"},
  {"id":25,"category":1,"desc":"Houston - Space Center Houston"},
  {"id":26,"category":1,"desc":"Kansas City - Union Station"},
  {"id":27,"category":1,"desc":"Los Ángeles (Inglewood) - Hollywood Sign"},
  {"id":28,"category":1,"desc":"Seattle - Space Needle"},
  {"id":29,"category":1,"desc":"San Francisco Bay Area (Santa Clara) - Golden Gate Bridge"},
  {"id":30,"category":1,"desc":"Philadelphia - Liberty Bell"},
  {"id":31,"category":1,"desc":"Miami Gardens - South Beach (Art Deco District)"},
  {"id":32,"category":1,"desc":"East Rutherford (Nueva Jersey/NY) - Times Square"},
  
  // Category 2: Jugadas (84 cards - showing just first 10)
  {"id":66,"category":2,"desc":"Saque desde el círculo central"},
  {"id":67,"category":2,"desc":"Saque de meta"},
  {"id":68,"category":2,"desc":"Saque de esquina"},
  {"id":69,"category":2,"desc":"Saque de banda"},
  {"id":70,"category":2,"desc":"Balón a tierra"},
  {"id":71,"category":2,"desc":"Tiro libre directo"},
  {"id":72,"category":2,"desc":"Tiro libre indirecto"},
  {"id":73,"category":2,"desc":"Penalti"},
  {"id":74,"category":2,"desc":"Falta ensayada"},
  {"id":75,"category":2,"desc":"Pase corto en falta"}
  // ... (truncated for demo - in real system there are 84 cards in category 2)
];

const categories = [
  { id: 0, name: "Estadios", order: 1, cardCount: 16 },
  { id: 1, name: "Sedes", order: 2, cardCount: 16 },
  { id: 2, name: "Jugadas", order: 3, cardCount: 84 },
  { id: 3, name: "Países", order: 4, cardCount: 50 },
  { id: 4, name: "Mascotas", order: 5, cardCount: 49 },
  { id: 5, name: "Fanáticos", order: 6, cardCount: 49 }
];

const MIN_CARDS_PER_PAGE = 8;
const MAX_CARDS_PER_PAGE = 12;

function calculateOptimalDistribution(totalCards) {
  if (totalCards === 0) return [];
  if (totalCards <= MAX_CARDS_PER_PAGE) return [totalCards];
  
  let bestDistribution = [];
  let minVariance = Infinity;
  
  const minPages = Math.ceil(totalCards / MAX_CARDS_PER_PAGE);
  const maxPages = Math.floor(totalCards / MIN_CARDS_PER_PAGE);
  
  for (let numPages = minPages; numPages <= maxPages; numPages++) {
    const baseCardsPerPage = Math.floor(totalCards / numPages);
    const extraCards = totalCards % numPages;
    
    const distribution = [];
    for (let i = 0; i < numPages; i++) {
      if (i < extraCards) {
        distribution.push(baseCardsPerPage + 1);
      } else {
        distribution.push(baseCardsPerPage);
      }
    }
    
    const validDistribution = distribution.every(
      cards => cards >= MIN_CARDS_PER_PAGE && cards <= MAX_CARDS_PER_PAGE
    );
    
    if (validDistribution) {
      const mean = totalCards / numPages;
      const variance = distribution.reduce((sum, cards) => sum + Math.pow(cards - mean, 2), 0) / numPages;
      
      if (variance < minVariance) {
        minVariance = variance;
        bestDistribution = [...distribution];
      }
    }
  }
  
  if (bestDistribution.length === 0) {
    const numPages = Math.ceil(totalCards / MAX_CARDS_PER_PAGE);
    for (let i = 0; i < numPages; i++) {
      const startCard = i * MAX_CARDS_PER_PAGE;
      const cardsInPage = Math.min(MAX_CARDS_PER_PAGE, totalCards - startCard);
      bestDistribution.push(cardsInPage);
    }
  }
  
  return bestDistribution;
}

console.log('=== Album Page Distribution Algorithm Demo ===\n');

categories.forEach(category => {
  console.log(`📁 ${category.name} (${category.cardCount} cards)`);
  
  const distribution = calculateOptimalDistribution(category.cardCount);
  console.log(`   Optimal distribution: [${distribution.join(', ')}] → ${distribution.length} pages`);
  
  distribution.forEach((cardsInPage, index) => {
    console.log(`   📄 Page ${index + 1}: ${cardsInPage} cards`);
  });
  
  console.log('');
});

console.log('\n=== Example: Category 0 (Estadios) Distribution ===');
console.log('16 cards distributed as: [8, 8] = 2 pages of 8 cards each');
console.log('✓ Balanced - each page has the same number of cards');
console.log('✓ Optimal - minimizes variance between pages');
console.log('✓ Within limits - each page has 8-12 cards');

console.log('\n=== Example: Category 2 (Jugadas) Distribution ===');
const jugadasDistribution = calculateOptimalDistribution(84);
console.log(`84 cards distributed as: [${jugadasDistribution.join(', ')}] = ${jugadasDistribution.length} pages`);
console.log('✓ Balanced - page sizes differ by at most 1 card');
console.log('✓ Optimal - minimizes total variance');
console.log('✓ Within limits - each page has 8-12 cards');