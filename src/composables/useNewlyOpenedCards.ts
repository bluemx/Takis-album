import { ref } from 'vue'

// Global state for newly opened cards
const newlyOpenedCardIds = ref<Set<number>>(new Set())

export function useNewlyOpenedCards() {
  
  function addNewlyOpenedCards(cardIds: number[]) {
    cardIds.forEach(id => newlyOpenedCardIds.value.add(id))
  }
  
  function isNewlyOpened(cardId: number): boolean {
    return newlyOpenedCardIds.value.has(cardId)
  }
  
  function clearNewlyOpenedCards() {
    newlyOpenedCardIds.value.clear()
  }
  
  return {
    addNewlyOpenedCards,
    isNewlyOpened,
    clearNewlyOpenedCards
  }
}