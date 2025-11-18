import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cardsDatabase, type Card } from '../data/cards'
import { categoriesDatabase, type Category } from '../data/categories'
import { 
  distributeCardsIntoPages, 
  getCardsForPage, 
  getPageInfo,
  findCardPage
} from '../utils/pageDistribution'

export const useAlbumStore = defineStore('album', () => {
  // State
  const currentPage = ref(0)
  const listOfCards = ref<Card[]>(cardsDatabase)
  const listOfCategories = ref<Category[]>(categoriesDatabase)
  
  // Page distribution computed values (calculated on runtime)
  const pageDistribution = computed(() => distributeCardsIntoPages())
  const totalPages = computed(() => pageDistribution.value.totalPages)
  const categoryDistribution = computed(() => pageDistribution.value.categoriesDistribution)
  const allCardsWithPages = computed(() => pageDistribution.value.allCards)
  
  // Physical page structure: Front Cover (0) + Index (1) + Content Pages (2..n) + Back Cover (n+1)
  const totalPhysicalPages = computed(() => totalPages.value + 3) // +2 front covers, +1 back cover

  // User-aware computed properties (requires user store)
  const getCardWithOwnership = (userStore: any) => computed(() => (cardId: number) => {
    const card = listOfCards.value.find(c => c.identifier === cardId)
    if (!card) return null
    
    return {
      ...card,
      owned: userStore?.ownsCard(cardId) || false,
      quantity: userStore?.getCardQuantity(cardId) || 0
    }
  })

  const getCardsWithOwnership = (userStore: any) => computed(() => {
    return listOfCards.value.map(card => ({
      ...card,
      owned: userStore?.ownsCard(card.identifier) || false,
      quantity: userStore?.getCardQuantity(card.identifier) || 0
    }))
  })

  // Getters
  const isFirstPage = computed(() => currentPage.value === 0)
  const isLastPage = computed(() => currentPage.value === totalPhysicalPages.value - 1)
  const canGoNext = computed(() => !isLastPage.value)
  const canGoPrevious = computed(() => !isFirstPage.value)
  const pageProgress = computed(() => ((currentPage.value + 1) / totalPhysicalPages.value) * 100)

  // State for orientation tracking
  const isLandscape = ref(false)

  // Actions - Simplified to always step 1 page at a time
  const nextPage = () => {
    if (currentPage.value < totalPhysicalPages.value - 1) {
      currentPage.value += 1
    }
  }

  const previousPage = () => {
    if (currentPage.value > 0) {
      currentPage.value -= 1
    }
  }

  // Function to set orientation from external components
  const setOrientation = (landscape: boolean) => {
    isLandscape.value = landscape
  }

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPhysicalPages.value) {
      currentPage.value = pageIndex
    }
  }

  const resetToFirstPage = () => {
    currentPage.value = 0
  }

  const goToLastPage = () => {
    currentPage.value = totalPhysicalPages.value - 1
  }

  // Page distribution helper methods
  const getCardsForCurrentPage = () => {
    return getCardsForPage(currentPage.value + 1) // +1 because pages are 1-indexed in distribution
  }

  const getCurrentPageInfo = () => {
    return getPageInfo(currentPage.value + 1) // +1 because pages are 1-indexed in distribution
  }

  const findCardLocation = (cardId: number) => {
    return findCardPage(cardId)
  }

  const getCategoryPages = (categoryId: number) => {
    const category = categoryDistribution.value.find(c => c.categoryId === categoryId)
    return category || null
  }

  return {
    // State
    currentPage,
    totalPages,
    totalPhysicalPages,
    isLandscape,
    listOfCards,
    listOfCategories,
    // Page distribution data
    pageDistribution,
    categoryDistribution,
    allCardsWithPages,
    // Getters
    isFirstPage,
    isLastPage,
    canGoNext,
    canGoPrevious,
    pageProgress,
    // Actions
    nextPage,
    previousPage,
    goToPage,
    resetToFirstPage,
    goToLastPage,
    setOrientation,
    // Page distribution helpers
    getCardsForCurrentPage,
    getCurrentPageInfo,
    findCardLocation,
    getCategoryPages,
    // User integration helpers
    getCardWithOwnership,
    getCardsWithOwnership
  }
})