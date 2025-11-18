import { cardsDatabase, type Card } from '../data/cards';
import { categoriesDatabase } from '../data/categories';

export interface CardWithPage extends Card {
  page: number;
  positionInPage: number;
}

export interface PageInfo {
  pageNumber: number;
  categoryId: number;
  categoryName: string;
  cards: CardWithPage[];
  cardCount: number;
}

export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  totalCards: number;
  pages: PageInfo[];
  startPage: number;
  endPage: number;
}

const MIN_CARDS_PER_PAGE = 8;
const MAX_CARDS_PER_PAGE = 12;

/**
 * Calculates the optimal distribution of cards across pages for a given number of cards
 * Tries to minimize the difference between page sizes while staying within MIN and MAX limits
 */
function calculateOptimalDistribution(totalCards: number): number[] {
  if (totalCards === 0) return [];
  
  // If cards fit in one page, return single page
  if (totalCards <= MAX_CARDS_PER_PAGE) {
    return [totalCards];
  }
  
  let bestDistribution: number[] = [];
  let minVariance = Infinity;
  
  // Try different numbers of pages
  const minPages = Math.ceil(totalCards / MAX_CARDS_PER_PAGE);
  const maxPages = Math.floor(totalCards / MIN_CARDS_PER_PAGE);
  
  for (let numPages = minPages; numPages <= maxPages; numPages++) {
    const baseCardsPerPage = Math.floor(totalCards / numPages);
    const extraCards = totalCards % numPages;
    
    // Create distribution: some pages get baseCardsPerPage + 1, others get baseCardsPerPage
    const distribution: number[] = [];
    for (let i = 0; i < numPages; i++) {
      if (i < extraCards) {
        distribution.push(baseCardsPerPage + 1);
      } else {
        distribution.push(baseCardsPerPage);
      }
    }
    
    // Check if all pages are within limits
    const validDistribution = distribution.every(
      cards => cards >= MIN_CARDS_PER_PAGE && cards <= MAX_CARDS_PER_PAGE
    );
    
    if (validDistribution) {
      // Calculate variance to find the most balanced distribution
      const mean = totalCards / numPages;
      const variance = distribution.reduce((sum, cards) => sum + Math.pow(cards - mean, 2), 0) / numPages;
      
      if (variance < minVariance) {
        minVariance = variance;
        bestDistribution = [...distribution];
      }
    }
  }
  
  // If no valid distribution found, fallback to simple division
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

/**
 * Groups cards by category and sorts them by ID within each category
 */
function groupCardsByCategory(): Map<number, Card[]> {
  const cardsByCategory = new Map<number, Card[]>();
  
  // Initialize all categories
  categoriesDatabase.forEach(category => {
    cardsByCategory.set(category.id, []);
  });
  
  // Group cards by category
  cardsDatabase.forEach(card => {
    const categoryCards = cardsByCategory.get(card.category) || [];
    categoryCards.push(card);
    cardsByCategory.set(card.category, categoryCards);
  });
  
  // Sort cards within each category by identifier
  cardsByCategory.forEach(cards => {
    cards.sort((a, b) => a.identifier - b.identifier);
  });
  
  return cardsByCategory;
}

/**
 * Distributes all cards across pages optimally
 */
export function distributeCardsIntoPages(): {
  allCards: CardWithPage[];
  categoriesDistribution: CategoryDistribution[];
  totalPages: number;
} {
  const cardsByCategory = groupCardsByCategory();
  const categoriesDistribution: CategoryDistribution[] = [];
  const allCards: CardWithPage[] = [];
  let currentPageNumber = 1;
  
  // Process categories in order
  const sortedCategories = [...categoriesDatabase].sort((a, b) => a.order - b.order);
  
  for (const category of sortedCategories) {
    const categoryCards = cardsByCategory.get(category.id) || [];
    const totalCards = categoryCards.length;
    
    if (totalCards === 0) {
      // Category with no cards
      categoriesDistribution.push({
        categoryId: category.id,
        categoryName: category.name,
        totalCards: 0,
        pages: [],
        startPage: currentPageNumber,
        endPage: currentPageNumber - 1
      });
      continue;
    }
    
    const distribution = calculateOptimalDistribution(totalCards);
    const pages: PageInfo[] = [];
    const startPage = currentPageNumber;
    let cardIndex = 0;
    
    // Create pages for this category
    for (let i = 0; i < distribution.length; i++) {
      const cardsInThisPage = distribution[i] || 0;
      const pageCards: CardWithPage[] = [];
      
      // Assign cards to this page
      for (let j = 0; j < cardsInThisPage && cardIndex < categoryCards.length; j++) {
        const card = categoryCards[cardIndex];
        if (card) {
          const cardWithPage: CardWithPage = {
            acRegId: card.acRegId,
            identifier: card.identifier,
            category: card.category,
            desc: card.desc,
            disposition: card.disposition,
            metal: card.metal,
            anim: card.anim,
            has3d: card.has3d,
            page: currentPageNumber,
            positionInPage: j + 1
          };
          pageCards.push(cardWithPage);
          allCards.push(cardWithPage);
        }
        cardIndex++;
      }
      
      pages.push({
        pageNumber: currentPageNumber,
        categoryId: category.id,
        categoryName: category.name,
        cards: pageCards,
        cardCount: pageCards.length
      });
      
      currentPageNumber++;
    }
    
    const endPage = currentPageNumber - 1;
    
    categoriesDistribution.push({
      categoryId: category.id,
      categoryName: category.name,
      totalCards,
      pages,
      startPage,
      endPage
    });
  }
  
  return {
    allCards,
    categoriesDistribution,
    totalPages: currentPageNumber - 1
  };
}

/**
 * Gets all cards for a specific page
 */
export function getCardsForPage(pageNumber: number): CardWithPage[] {
  const { allCards } = distributeCardsIntoPages();
  return allCards.filter(card => card.page === pageNumber);
}

/**
 * Gets page information for a specific page
 */
export function getPageInfo(pageNumber: number): PageInfo | null {
  const { categoriesDistribution } = distributeCardsIntoPages();
  
  for (const category of categoriesDistribution) {
    const page = category.pages.find(p => p.pageNumber === pageNumber);
    if (page) {
      return page;
    }
  }
  
  return null;
}

/**
 * Gets the category distribution summary
 */
export function getCategoryDistribution(): CategoryDistribution[] {
  const { categoriesDistribution } = distributeCardsIntoPages();
  return categoriesDistribution;
}

/**
 * Gets total number of pages needed
 */
export function getTotalPages(): number {
  const { totalPages } = distributeCardsIntoPages();
  return totalPages;
}

/**
 * Finds which page a specific card is on
 */
export function findCardPage(cardId: number): { page: number; position: number } | null {
  const { allCards } = distributeCardsIntoPages();
  const card = allCards.find(c => c.identifier === cardId);
  return card ? { page: card.page, position: card.positionInPage } : null;
}