import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type StickerToView } from '../services/api'

// Keep the full UserCard structure from API
export interface UserCard {
  id: number
  identifier: string | number | null
  resource: string
  token: number
  type: string
  inAlbum: boolean
  acRegId: number
}

export interface PackToOpen {
  packTypeId: number
  packs: number
}

export const useUserStore = defineStore('user', () => {
  // State
  const customerId = ref<string>('')
  const name = ref<string>('')
  const avatar = ref<string>('')
  const packsToOpen = ref<PackToOpen[]>([])
  const ownedCards = ref<UserCard[]>([])
  const stickersToView = ref<StickerToView[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  

  // Getters
  const isLoggedIn = computed(() => customerId.value !== '')
  const totalOwnedCards = computed(() => 
    ownedCards.value.filter(card => card.inAlbum).length
  )
  
  // Get total packs count (all pack types)
  const totalPacks = computed(() => 
    packsToOpen.value.reduce((sum, pack) => sum + pack.packs, 0)
  )
  
  // Get count of default packs (packTypeId: 1)
  const defaultPacks = computed(() => {
    const pack = packsToOpen.value.find(p => p.packTypeId === 1)
    return pack ? pack.packs : 0
  })
  
  // Get count of golden packs (packTypeId: 2)
  const goldenPacks = computed(() => {
    const pack = packsToOpen.value.find(p => p.packTypeId === 2)
    return pack ? pack.packs : 0
  })
  

  // Check whether the user has placed this album card into their album.
  // Mapping rule: page card id (number) -> userCard.identifier (number or string).
  function ownsCard(cardId: number) {
    const match = ownedCards.value.find(card => {
      if (card.identifier === null) return false
      return Number(card.identifier) === cardId
    })
    
    if (match) {
      console.log(`Card ${cardId}: found userCard with identifier ${match.identifier}, inAlbum: ${match.inAlbum}`)
    }
    
    return ownedCards.value.some(card => {
      if (card.identifier === null) return false
      // Handle both number and string identifiers
      return (Number(card.identifier) === cardId) && !!card.inAlbum
    })
  }

  // Return the actual UserCard that occupies this album position (by identifier)
  // and is currently in the album. Returns null when not present.
  function getOwnedCard(cardId: number) {
    return ownedCards.value.find(card => {
      if (card.identifier === null) return false
      // Handle both number and string identifiers
      return (Number(card.identifier) === cardId) && !!card.inAlbum
    }) || null
  }
  
  const getCardQuantity = computed(() => (cardIdentifier: number) => {
    // Count how many times this card identifier appears in the album (inAlbum: true)
    return ownedCards.value.filter(card => 
      card.identifier && Number(card.identifier) === cardIdentifier && card.inAlbum
    ).length
  })

  // Actions
  const loadUserData = async (userId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.getCustomerStickers(userId)
      if (!response.success) {
        throw new Error(response.errorDescription || 'API responded with an error')
      }
      console.log(response.data)
      customerId.value = String(response.data.id)
        name.value = String(response.data.name)
        avatar.value = String(response.data.avatar)
        packsToOpen.value = response.data.packsToOpen || []
      // Keep the entire UserCard structure intact
      ownedCards.value = response.data.userCards || []
      stickersToView.value = response.data.stickersToView || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user data'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateInAlbum = async (updates: Array<{ cardId: number; inAlbum: boolean }>) => {
    if (!customerId.value) return
    try {
      isLoading.value = true
      const payload = updates.map(u => ({ StickerId: u.cardId, InAlbum: u.inAlbum ? 1 : 0 }))
      const resp = await apiService.updateCustomerStickers(customerId.value, payload)
      if (!resp.success) {
        throw new Error(resp.errorDescription || 'Failed to update stickers')
      }
      // sync local state
      for (const u of updates) {
        const card = ownedCards.value.find(c => c.id === u.cardId)
        if (card) card.inAlbum = u.inAlbum
      }
    } finally {
      isLoading.value = false
    }
  }

  const addCard = (card: UserCard) => {
    // Add the full UserCard to the collection
    ownedCards.value.push(card)
  }

  const removeCard = (cardId: number) => {
    // Remove the first occurrence of this card
    const cardIndex = ownedCards.value.findIndex(card => card.id === cardId)
    if (cardIndex !== -1) {
      ownedCards.value.splice(cardIndex, 1)
    }
  }

  const openPack = async (packTypeId: number = 1) => {
    if (!customerId.value || totalPacks.value <= 0) return null
    
    // Check if the specific pack type is available
    const packIndex = packsToOpen.value.findIndex(p => p.packTypeId === packTypeId)
    const pack = packIndex !== -1 ? packsToOpen.value[packIndex] : null
    if (!pack || pack.packs <= 0) {
      // If requested pack type not available, try default pack
      const defaultPackIndex = packsToOpen.value.findIndex(p => p.packTypeId === 1)
      const defaultPack = defaultPackIndex !== -1 ? packsToOpen.value[defaultPackIndex] : null
      if (!defaultPack || defaultPack.packs <= 0) {
        return null
      }
    }
    
    try {
      isLoading.value = true
      const response = await apiService.openPack(customerId.value, packTypeId)
      if (!response.success) {
        throw new Error(response.errorDescription || 'Failed to open pack')
      }
      
      // Add new cards to ownedCards
      const newCards = response.data.userCards || []
      ownedCards.value.push(...newCards)
      
      // Decrease pack count for the specific pack type
      const packToUpdate = packsToOpen.value.find(p => p.packTypeId === packTypeId)
      if (packToUpdate) {
        packToUpdate.packs = Math.max(0, packToUpdate.packs - 1)
      }
      
      return newCards
    } catch (error) {
      console.error('Failed to open pack:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    customerId.value = ''
    packsToOpen.value = []
    ownedCards.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    customerId,
    name,
    avatar,
    packsToOpen,
    ownedCards,
    stickersToView,
    isLoading,
    error,
    // Getters
    isLoggedIn,
    totalOwnedCards,
    totalPacks,
    defaultPacks,
    goldenPacks,
    ownsCard,
    getOwnedCard,
    getCardQuantity,
    // Actions
    loadUserData,
    updateInAlbum,
    addCard,
    removeCard,
    openPack,
    reset
  }
})