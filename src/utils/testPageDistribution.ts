import { distributeCardsIntoPages, getCategoryDistribution, getTotalPages, findCardPage } from '../utils/pageDistribution';

// Example usage and testing
console.log('=== Album Page Distribution ===\n');

const { allCards, categoriesDistribution, totalPages } = distributeCardsIntoPages();

console.log(`Total cards: ${allCards.length}`);
console.log(`Total pages: ${totalPages}\n`);

// Show distribution by category
categoriesDistribution.forEach(category => {
  if (category.totalCards > 0) {
    console.log(`📁 ${category.categoryName} (ID: ${category.categoryId})`);
    console.log(`   Cards: ${category.totalCards}`);
    console.log(`   Pages: ${category.startPage}-${category.endPage} (${category.pages.length} pages)`);
    
    category.pages.forEach(page => {
      console.log(`   📄 Page ${page.pageNumber}: ${page.cardCount} cards`);
    });
    console.log('');
  }
});

// Test finding specific cards
console.log('=== Card Location Examples ===');
const testCardIds = [1, 17, 66, 149, 198]; // Cards from different categories

testCardIds.forEach(cardId => {
  const location = findCardPage(cardId);
  if (location) {
    const card = allCards.find(c => c.identifier === cardId);
    if (card) {
      console.log(`Card ${cardId} ("${card.desc}") -> Page ${location.page}, Position ${location.position}`);
    }
  }
});

export { distributeCardsIntoPages, getCategoryDistribution, getTotalPages, findCardPage };