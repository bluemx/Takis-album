<template>
  <div 
    v-if="showModal && stickers.length > 0" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    @click="close">
    
    <div 
      class="bg-white rounded-2xl p-8 max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl w-[90vw]"
      @click.stop>
      
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex justify-center mb-4">
          <div class="w-20 h-20 bg-pfblue rounded-full flex items-center justify-center">
            <Icon icon="mdi:gift" class="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 class="text-3xl font-bold text-pfblue mb-2">¡Novedades en tu Álbum!</h2>
        <p class="text-gray-600">Tienes {{ stickers.length }} estampa{{ stickers.length !== 1 ? 's' : '' }} nueva{{ stickers.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Stickers Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div 
          v-for="sticker in stickers" 
          :key="sticker.stickerId"
          @click="openCardDetail(sticker)"
          class="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
          
          <!-- Sticker Image -->
          <div class="relative mb-3">
            <CardRenderer
              :iscard="true" 
              :identifier="sticker.identifier"  
              :base="sticker.resource"
            />
            
            <!-- Type Badge -->
            <div class="absolute top-1 right-1 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg"
              :class="{
                'bg-yellow-500': getCardType(sticker.identifier) === 'Metal',
                'bg-purple-500': getCardType(sticker.identifier) === 'Animada',
                'bg-gray-500': getCardType(sticker.identifier) === 'Normal'
              }">
              {{ getCardType(sticker.identifier) }}
            </div>
          </div>

          <!-- Card Description -->
          <div class="mb-2">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ getCardDescription(sticker.identifier) }}</p>
          </div>

          <!-- Giver Info (if it's a gift) -->
          <div 
            v-if="sticker.nickNameGave" 
            class="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            
            <!-- Avatar or Initials -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-pfblue text-white text-xs font-bold shrink-0">
              <img 
                v-if="sticker.avatarImage" 
                :src="sticker.avatarImage" 
                :alt="sticker.nickNameGave"
                class="w-full h-full object-cover">
              <span v-else>{{ getInitials(sticker.nickNameGave) }}</span>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">De:</p>
              <p class="text-xs font-bold text-pfblue truncate">{{ sticker.nickNameGave }}</p>
            </div>
          </div>
          
          <!-- New Card Badge (if not a gift) -->
          <div v-else class="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold text-center">
            ¡Nueva!
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        @click="close"
        class="btn w-full bg-pfblue hover:bg-pfblue/90 text-white text-lg py-3">
        ¡Entendido!
      </button>
    </div>
  </div>

  <!-- Card Detail Modal -->
  <div 
    v-if="selectedCard" 
    class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
    @click="closeCardDetail">
    
    <div 
      class="bg-white rounded-lg p-8 max-w-2xl w-full shadow-xl flex flex-col items-center relative"
      @click.stop>
      
      <!-- Close Button -->
      <button 
        @click="closeCardDetail"
        class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 z-10">
        <Icon icon="mdi:close" class="w-6 h-6" />
      </button>

      <!-- Card Display -->
      <div class="w-full max-w-sm mb-6">
        <CardRenderer
          :iscard="true" 
          :identifier="selectedCard.identifier"  
          :base="selectedCard.resource"
        />
      </div>

      <!-- Card Info -->
      <div class="text-center mb-4">
        <h3 class="text-2xl font-bold text-pfblue mb-2">{{ getCardDescription(selectedCard.identifier) }}</h3>
        <p class="text-lg text-gray-600">{{ getCardType(selectedCard.identifier) }}</p>
        <p class="text-sm text-gray-500 mt-1">Estampa #{{ selectedCard.identifier }}</p>
      </div>

      <!-- Giver Info (if it's a gift) -->
      <div 
        v-if="selectedCard.nickNameGave" 
        class="flex items-center gap-3 bg-gray-50 rounded-lg p-4 shadow-sm w-full max-w-sm">
        
        <!-- Avatar or Initials -->
        <div class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-pfblue text-white text-sm font-bold shrink-0">
          <img 
            v-if="selectedCard.avatarImage" 
            :src="selectedCard.avatarImage" 
            :alt="selectedCard.nickNameGave"
            class="w-full h-full object-cover">
          <span v-else>{{ getInitials(selectedCard.nickNameGave) }}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-500">Regalo de:</p>
          <p class="text-lg font-bold text-pfblue truncate">{{ selectedCard.nickNameGave }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import type { StickerToView } from '../services/api'
import CardRenderer from './CardRenderer.vue'
import { cardsDatabase } from '../data/cards'

const userStore = useUserStore()
const showModal = ref(false)
const stickers = ref<StickerToView[]>([])
const selectedCard = ref<StickerToView | null>(null)

// Watch for stickersToView changes
watch(() => userStore.stickersToView, (newStickers) => {
  if (newStickers && newStickers.length > 0) {
    stickers.value = newStickers
    showModal.value = true
  }
}, { immediate: true })

function getInitials(name: string): string {
  if (!name) return '?'
  const words = name.trim().split(' ').filter(w => w.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  if (words.length > 0 && words[0]) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return '?'
}

// Get card description from database
function getCardDescription(identifier: number): string {
  const cardData = cardsDatabase.find(c => c.identifier === identifier)
  return cardData?.desc || `Estampa #${identifier}`
}

// Get card type (Normal, Metal, or Animada)
function getCardType(identifier: number): string {
  const cardData = cardsDatabase.find(c => c.identifier === identifier)
  if (!cardData) return 'Normal'
  if (cardData.metal) return 'Metal'
  if (cardData.anim) return 'Animada'
  return 'Normal'
}

// Open card detail modal
function openCardDetail(sticker: StickerToView) {
  selectedCard.value = sticker
}

// Close card detail modal
function closeCardDetail() {
  selectedCard.value = null
}

function close() {
  showModal.value = false
  // Clear the stickersToView from store
  userStore.stickersToView = []
}
</script>
