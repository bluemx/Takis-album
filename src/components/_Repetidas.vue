<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
    @click="close">
    
    <div 
      class="bg-white/50 backdrop-blur-md rounded-lg p-6 w-full max-w-6xl max-h-[85vh] flex flex-col shadow-xl"
      @click.stop>
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-pfblue">Mis stickers</h2>
        <button 
          @click="close"
          class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Horizontal Carousel -->
      <div v-if="extraCards.length > 0" class="flex-1 overflow-hidden">
        <div class="h-full overflow-x-auto overflow-y-hidden pb-4">
          <div class="flex gap-6 h-full items-center px-4 min-w-max">
            <div 
              v-for="card in extraCards" 
              :key="card.id"
              class="shrink-0 flex flex-col items-center">
              
              <div class="relative group mb-3">
                <CardRenderer
                  :iscard="true" 
                  :identifier="card.identifier ? Number(card.identifier) : 0"  
                  :base="card.resource" 
                />

                <!-- Already in Album Indicator -->
                <div v-if="hasCardInAlbum(card.identifier)" class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  Repetida
                </div>
              </div>

              <!-- Add to Album Button -->
              <button 
                @click="addToAlbum(card)"
                :disabled="userStore.isLoading"
                class="w-full max-w-[200px] btn text-sm"
                :class="[
                  { 'opacity-50 cursor-not-allowed': userStore.isLoading },
                  hasCardInAlbum(card.identifier) ? 'btn-secondary' : 'btn-primary'
                ]">
                {{ 
                  userStore.isLoading ? 'Procesando...' : 
                  hasCardInAlbum(card.identifier) ? 'Reemplazar' : 'Pegar en álbum' 
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <Icon icon="mdi:cards-outline" class="w-16 h-16 mx-auto" />
        </div>
        <p class="text-gray-600">No tienes stickers fuera del álbum</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'
import CardRenderer from './CardRenderer.vue';

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()

// Get all cards where inAlbum is false, ordered by identifier ascending
const extraCards = computed(() => {
  return userStore.ownedCards
    .filter(card => !card.inAlbum)
    .sort((a, b) => {
      const idA = a.identifier ? Number(a.identifier) : 0
      const idB = b.identifier ? Number(b.identifier) : 0
      return idA - idB
    })
})

// Check if a card with the same identifier is already in album
const hasCardInAlbum = (identifier: string | number | null) => {
  if (identifier === null) return false
  return userStore.ownedCards.some(card => 
    card.inAlbum && card.identifier && Number(card.identifier) === Number(identifier)
  )
}

async function addToAlbum(card: any) {
  try {
    const updates = []
    
    // If there's already a card in album with same identifier, remove it first
    if (hasCardInAlbum(card.identifier)) {
      const existingCard = userStore.ownedCards.find(c => 
        c.inAlbum && c.identifier && Number(c.identifier) === Number(card.identifier)
      )
      if (existingCard) {
        updates.push({ cardId: existingCard.id, inAlbum: false })
      }
    }
    
    // Add the new card to album
    updates.push({ cardId: card.id, inAlbum: true })
    
    // Execute both updates in a single API call
    await userStore.updateInAlbum(updates)
  } catch (error) {
    console.error('Failed to add card to album:', error)
  }
}

function close() {
  emit('close')
}
</script>