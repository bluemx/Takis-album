/**
 * Page Distribution System Usage Examples
 * 
 * This file demonstrates how to use the page distribution system
 * in your Vue components with the Pinia store.
 */

import { useAlbumStore } from '../stores/album'

// Example 1: Basic usage in a Vue component
export function exampleBasicUsage() {
  const albumStore = useAlbumStore()
  
  // Get total pages (calculated dynamically)
  console.log('Total pages:', albumStore.totalPages)
  
  // Get current page cards
  const currentPageCards = albumStore.getCardsForCurrentPage()
  console.log('Cards on current page:', currentPageCards.length)
  
  // Get current page info
  const pageInfo = albumStore.getCurrentPageInfo()
  console.log('Page info:', pageInfo)
  
  // Navigate to a specific card
  const cardLocation = albumStore.findCardLocation(25) // Find card with ID 25
  if (cardLocation) {
    console.log(`Card 25 is on page ${cardLocation.page}, position ${cardLocation.position}`)
    albumStore.goToPage(cardLocation.page - 1) // -1 because store uses 0-indexed pages
  }
}

// Example 2: Display category information
export function exampleCategoryInfo() {
  const albumStore = useAlbumStore()
  
  // Get all categories with their page distributions
  albumStore.categoryDistribution.forEach(category => {
    console.log(`📁 ${category.categoryName}:`)
    console.log(`   Total cards: ${category.totalCards}`)
    console.log(`   Pages: ${category.startPage} to ${category.endPage}`)
    console.log(`   Page count: ${category.pages.length}`)
    
    category.pages.forEach(page => {
      console.log(`   📄 Page ${page.pageNumber}: ${page.cardCount} cards`)
    })
  })
}

// Example 3: Navigate to a specific category
export function exampleNavigateToCategory(categoryId: number) {
  const albumStore = useAlbumStore()
  
  const categoryPages = albumStore.getCategoryPages(categoryId)
  if (categoryPages && categoryPages.pages.length > 0) {
    // Go to the first page of this category
    const firstPageOfCategory = categoryPages.startPage
    albumStore.goToPage(firstPageOfCategory - 1) // -1 for 0-indexed store
    
    console.log(`Navigated to ${categoryPages.categoryName} (first page: ${firstPageOfCategory})`)
    return true
  }
  
  console.log(`Category ${categoryId} not found or has no pages`)
  return false
}

// Example 4: Get page statistics
export function examplePageStatistics() {
  const albumStore = useAlbumStore()
  
  const stats = {
    totalCards: albumStore.allCardsWithPages.length,
    totalPages: albumStore.totalPages,
    totalCategories: albumStore.categoryDistribution.length,
    averageCardsPerPage: 0,
    minCardsPerPage: Infinity,
    maxCardsPerPage: 0
  }
  
  // Calculate page statistics
  const pageSizes: number[] = []
  albumStore.categoryDistribution.forEach(category => {
    category.pages.forEach(page => {
      pageSizes.push(page.cardCount)
      stats.minCardsPerPage = Math.min(stats.minCardsPerPage, page.cardCount)
      stats.maxCardsPerPage = Math.max(stats.maxCardsPerPage, page.cardCount)
    })
  })
  
  stats.averageCardsPerPage = pageSizes.reduce((sum, size) => sum + size, 0) / pageSizes.length
  
  console.log('📊 Album Statistics:', stats)
  return stats
}

// Example 5: Vue component template usage
export const templateExamples = `
<!-- Display current page cards -->
<template>
  <div>
    <h2>Current Page: {{ albumStore.currentPage + 1 }} / {{ albumStore.totalPages }}</h2>
    
    <!-- Cards on current page -->
    <div class="cards-grid">
      <div 
        v-for="card in albumStore.getCardsForCurrentPage()" 
        :key="card.id"
        class="card"
      >
        <h3>{{ card.desc }}</h3>
        <p>Page: {{ card.page }}, Position: {{ card.positionInPage }}</p>
      </div>
    </div>
    
    <!-- Category navigation -->
    <div class="category-nav">
      <button 
        v-for="category in albumStore.categoryDistribution" 
        :key="category.categoryId"
        @click="goToCategory(category.categoryId)"
        class="category-btn"
      >
        {{ category.categoryName }} 
        ({{ category.totalCards }} cards, {{ category.pages.length }} pages)
      </button>
    </div>
    
    <!-- Page info -->
    <div v-if="albumStore.getCurrentPageInfo()" class="page-info">
      <h3>{{ albumStore.getCurrentPageInfo().categoryName }}</h3>
      <p>{{ albumStore.getCurrentPageInfo().cardCount }} cards on this page</p>
    </div>
  </div>
</template>

<script setup>
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

const goToCategory = (categoryId) => {
  const categoryPages = albumStore.getCategoryPages(categoryId)
  if (categoryPages) {
    albumStore.goToPage(categoryPages.startPage - 1)
  }
}
</script>
`

// Example distribution results for reference:
export const expectedDistribution = {
  "Estadios": { cards: 16, pages: [8, 8] },           // 2 pages
  "Sedes": { cards: 16, pages: [8, 8] },              // 2 pages  
  "Jugadas": { cards: 84, pages: [12, 12, 12, 12, 12, 12, 12] }, // 7 pages
  "Países": { cards: 50, pages: [10, 10, 10, 10, 10] }, // 5 pages
  "Mascotas": { cards: 49, pages: [9, 8, 8, 8, 8, 8] }, // 6 pages
  "Fanáticos": { cards: 49, pages: [9, 8, 8, 8, 8, 8] }, // 6 pages
  "Mundiales pasados": { cards: 22, pages: [11, 11] }, // 2 pages
  "Hechos históricos": { cards: 45, pages: [9, 9, 9, 9, 9] }, // 5 pages
  "Balones": { cards: 22, pages: [11, 11] },          // 2 pages
  "Trofeos": { cards: 23, pages: [8, 8, 7] },         // 3 pages (23 doesn't divide evenly)
  "Murales urbanos": { cards: 49, pages: [9, 8, 8, 8, 8, 8] }, // 6 pages
  "Eliminatorias": { cards: 43, pages: [9, 8, 8, 9, 9] }  // 5 pages
}

console.log('📖 Page Distribution System Ready!')
console.log('Use the functions above to integrate with your Vue components.')
console.log('Expected total pages:', Object.values(expectedDistribution).reduce((sum, cat) => sum + cat.pages.length, 0))