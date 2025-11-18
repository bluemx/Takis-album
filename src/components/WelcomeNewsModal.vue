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
          class="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
          
          <!-- Sticker Image -->
          <div class="relative mb-3">
            <img 
              :src="sticker.resource" 
              :alt="`Sticker ${sticker.identifier}`"
              class="w-full h-32 object-contain rounded-lg bg-white p-2">
            
            <!-- Identifier Badge -->
            <div class="absolute top-1 right-1 bg-pfblue text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              {{ sticker.identifier }}
            </div>
          </div>

          <!-- Sticker Info -->
          <div class="space-y-2">
            <!-- Status -->
            <div class="flex items-center gap-2 text-sm">
              <!--
              <Icon 
                :icon="getStatusIcon(sticker.customerStickerStatusID)" 
                class="w-4 h-4"
                :class="getStatusColor(sticker.customerStickerStatusID)" />
              <span class="text-xs font-medium text-gray-700">
                {{ sticker.customerStickerStatus }}
              </span>
              -->
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import type { StickerToView } from '../services/api'

const userStore = useUserStore()
const showModal = ref(false)
const stickers = ref<StickerToView[]>([])

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

function getStatusIcon(statusId: number): string {
  switch (statusId) {
    case 2: // Gift
      return 'mdi:gift'
    case 3: // Exchange
      return 'mdi:swap-horizontal'
    default:
      return 'mdi:star'
  }
}

function getStatusColor(statusId: number): string {
  switch (statusId) {
    case 2: // Gift
      return 'text-green-500'
    case 3: // Exchange
      return 'text-blue-500'
    default:
      return 'text-yellow-500'
  }
}

function close() {
  showModal.value = false
  // Clear the stickersToView from store
  userStore.stickersToView = []
}
</script>
