# Album Page Distribution System

## Overview

The page distribution system automatically distributes cards across album pages in an optimal way. It takes all cards from your database and calculates the best way to distribute them into pages of 8-12 cards each, minimizing the difference between page sizes.

## Key Features

- ✅ **Dynamic Calculation**: Pages are calculated at runtime, so if you change the cards database, the distribution updates automatically
- ✅ **Optimal Distribution**: Algorithm minimizes variance between page sizes while respecting 8-12 cards per page limits
- ✅ **Category-Based**: Cards are grouped by category and distributed sequentially
- ✅ **Pinia Integration**: Fully integrated with your existing album store
- ✅ **Navigation Helpers**: Easy functions to find cards, navigate to categories, and get page information

## How It Works

### Algorithm

1. **Group by Category**: Cards are first grouped by their category ID
2. **Sort by Order**: Categories are processed in their defined order (Estadios, Sedes, Jugadas, etc.)
3. **Optimal Distribution**: For each category, calculate the best way to split cards into pages:
   - Try different numbers of pages (from minimum to maximum possible)
   - For each option, calculate how evenly cards can be distributed
   - Choose the distribution with the lowest variance
4. **Page Assignment**: Assign sequential page numbers across all categories

### Example Distributions

```
📁 Estadios (16 cards) → [8, 8] = 2 pages
📁 Sedes (16 cards) → [8, 8] = 2 pages  
📁 Jugadas (84 cards) → [12, 12, 12, 12, 12, 12, 12] = 7 pages
📁 Países (50 cards) → [10, 10, 10, 10, 10] = 5 pages
```

## Usage in Vue Components

### Basic Usage

```vue
<script setup>
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

// Get cards for current page
const currentPageCards = albumStore.getCardsForCurrentPage()

// Get page information
const pageInfo = albumStore.getCurrentPageInfo()

// Find a specific card
const cardLocation = albumStore.findCardLocation(25) // Card ID 25
if (cardLocation) {
  console.log(`Card is on page ${cardLocation.page}`)
}
</script>
```

### Template Usage

```vue
<template>
  <div>
    <!-- Display current page -->
    <h2>Page {{ albumStore.currentPage + 1 }} / {{ albumStore.totalPages }}</h2>
    
    <!-- Cards on current page -->
    <div class="cards-grid">
      <div v-for="card in albumStore.getCardsForCurrentPage()" :key="card.id">
        {{ card.desc }}
      </div>
    </div>
    
    <!-- Category navigation -->
    <button 
      v-for="category in albumStore.categoryDistribution" 
      :key="category.categoryId"
      @click="goToCategory(category.categoryId)"
    >
      {{ category.categoryName }} ({{ category.totalCards }} cards)
    </button>
  </div>
</template>
```

### Navigate to Category

```javascript
const goToCategory = (categoryId) => {
  const categoryPages = albumStore.getCategoryPages(categoryId)
  if (categoryPages) {
    // Go to first page of this category
    albumStore.goToPage(categoryPages.startPage - 1)
  }
}
```

## API Reference

### Store Properties

- `totalPages` - Total number of pages (computed dynamically)
- `pageDistribution` - Complete distribution data
- `categoryDistribution` - Array of category information with page ranges
- `allCardsWithPages` - All cards with their page assignments

### Store Methods

- `getCardsForCurrentPage()` - Returns cards for the currently selected page
- `getCurrentPageInfo()` - Returns information about the current page
- `findCardLocation(cardId)` - Finds which page and position a card is on
- `getCategoryPages(categoryId)` - Gets page range for a specific category

### Standalone Functions (in `utils/pageDistribution.ts`)

- `distributeCardsIntoPages()` - Main distribution function
- `getCardsForPage(pageNumber)` - Get cards for a specific page
- `getPageInfo(pageNumber)` - Get information about a specific page
- `findCardPage(cardId)` - Find page location of a card

## Data Types

### CardWithPage
```typescript
interface CardWithPage extends Card {
  page: number;           // Page number (1-indexed)
  positionInPage: number; // Position within the page (1-indexed)
}
```

### PageInfo
```typescript
interface PageInfo {
  pageNumber: number;
  categoryId: number;
  categoryName: string;
  cards: CardWithPage[];
  cardCount: number;
}
```

### CategoryDistribution
```typescript
interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  totalCards: number;
  pages: PageInfo[];
  startPage: number;  // First page of this category
  endPage: number;    // Last page of this category
}
```

## Configuration

The system uses these constants (adjustable in `pageDistribution.ts`):

```typescript
const MIN_CARDS_PER_PAGE = 8;  // Minimum cards per page
const MAX_CARDS_PER_PAGE = 12; // Maximum cards per page
```

## Integration Notes

1. **Runtime Calculation**: The distribution is calculated when accessed, ensuring it's always up-to-date with your cards database
2. **Zero-Indexed vs One-Indexed**: The store uses 0-indexed pages internally, but the distribution system uses 1-indexed pages. Helper methods handle the conversion automatically
3. **Performance**: The calculation is cached using Vue's computed properties, so it only recalculates when the cards database changes

## Example Output

Running the distribution on the current database produces:
- **Total Cards**: 500
- **Total Pages**: ~50-60 (depends on optimal distribution)
- **Categories**: 12 categories with varying numbers of pages each
- **Balance**: All pages have 8-12 cards with minimal variance

This ensures your album has a consistent, professional layout while accommodating any changes to your cards database.