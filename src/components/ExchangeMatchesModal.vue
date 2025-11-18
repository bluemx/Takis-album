<template>
  <div 
    v-if="showModal && matches.length > 0" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
    @click="close">
    
    <div 
      class="bg-white rounded-lg p-6 max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl w-[90vw]"
      @click.stop>
      
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:swap-horizontal-bold" class="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 class="text-2xl font-bold text-pfblue mb-2">¡Hay Intercambios Disponibles!</h2>
        <p class="text-gray-600">Encontramos {{ matches.length }} intercambio{{ matches.length !== 1 ? 's' : '' }} que coincide{{ matches.length !== 1 ? 'n' : '' }} con tus estampas</p>
      </div>

      <!-- Matches List -->
      <div class="space-y-4 mb-6">
        <div 
          v-for="match in matches"
          :key="match.exchange.exchangeId"
          class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          
          <!-- User Info -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-pfblue shrink-0">
              <img 
                v-if="match.exchange.avatarImage" 
                :src="match.exchange.avatarImage" 
                :alt="match.exchange.nickname"
                class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-white font-bold">
                {{ getInitials(match.exchange.nickname) }}
              </div>
            </div>
            <div class="flex-1">
              <p class="font-bold text-pfblue">{{ match.exchange.nickname }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(match.exchange.exchangeAddedDate) }}</p>
            </div>
          </div>

          <!-- Exchange Details -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <!-- What they offer -->
            <div>
              <p class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Icon icon="mdi:hand-coin" class="w-4 h-4" />
                Te ofrecen:
              </p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="identifier in parseNumbers(match.exchange.stickersOffered)"
                  :key="identifier"
                  class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold flex items-center gap-1">
                  {{ identifier }}
                  <Icon 
                    v-if="userOwnsCard(identifier)"
                    icon="mdi:star" 
                    class="w-4 h-4 text-yellow-500" />
                </span>
              </div>
            </div>

            <!-- What they want -->
            <div>
              <p class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Icon icon="mdi:cards-heart" class="w-4 h-4" />
                Buscan:
              </p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="identifier in parseNumbers(match.exchange.stickersWanted)"
                  :key="identifier"
                  class="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-bold">
                  {{ identifier }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button 
            @click="completeExchange(match.exchange.exchangeId)"
            :disabled="isCompleting === match.exchange.exchangeId"
            class="btn w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon 
              :icon="isCompleting === match.exchange.exchangeId ? 'mdi:loading' : 'mdi:swap-horizontal'" 
              :class="{ 'animate-spin': isCompleting === match.exchange.exchangeId }"
              class="w-5 h-5 mr-2" />
            {{ isCompleting === match.exchange.exchangeId ? 'Procesando...' : 'Realizar Intercambio' }}
          </button>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        @click="close"
        class="btn w-full btn-secondary">
        Cerrar
      </button>

      <!-- Error Message -->
      <div 
        v-if="error"
        class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
        <Icon icon="mdi:alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Success Modal -->
    <div 
      v-if="showSuccessModal" 
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="closeSuccess">
      
      <div 
        class="bg-white rounded-lg p-8 max-w-md shadow-xl"
        @click.stop>
        
        <!-- Success Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:check-circle" class="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <!-- Message -->
        <h3 class="text-2xl font-bold text-center text-pfblue mb-4">¡Intercambio Completado!</h3>
        <p class="text-center text-gray-600 mb-6">
          {{ successMessage }}
        </p>
        
        <!-- Close Button -->
        <button 
          @click="closeSuccess"
          class="btn w-full bg-green-500 hover:bg-green-600 text-white">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'
import { apiService, type CurrentExchange } from '../services/api'

interface ExchangeMatchWithData {
  exchange: CurrentExchange
  matchedWantedCards: number[]
}

const userStore = useUserStore()
const showModal = ref(false)
const showSuccessModal = ref(false)
const matches = ref<ExchangeMatchWithData[]>([])
const isCompleting = ref<number | null>(null)
const error = ref<string | null>(null)
const successMessage = ref('')

// Check for exchanges after user data is loaded
watch(() => userStore.customerId, async (customerId) => {
  if (customerId && userStore.ownedCards.length > 0) {
    // Wait 3 seconds before checking
    setTimeout(async () => {
      await checkForExchanges()
    }, 3000)
  }
}, { immediate: true })

async function checkForExchanges() {
  try {
    const response = await apiService.getCurrentExchanges(userStore.customerId)
    
    if (!response.success || !response.data || response.data.length === 0) {
      return
    }

    // Filter out exchanges created by the current user
    const otherUsersExchanges = response.data.filter(
      ex => ex.customerIdOffers !== Number(userStore.customerId)
    )

    // Find matches where user has the wanted stickers in their duplicates
    const matchedExchanges: ExchangeMatchWithData[] = []
    
    for (const exchange of otherUsersExchanges) {
      const wantedIdentifiers = parseNumbers(exchange.stickersWanted)
      const matchedCards: number[] = []
      
      // Check if user has these cards as duplicates (inAlbum: false)
      for (const identifier of wantedIdentifiers) {
        const hasAsDuplicate = userStore.ownedCards.some(
          card => !card.inAlbum && Number(card.identifier) === identifier
        )
        if (hasAsDuplicate) {
          matchedCards.push(identifier)
        }
      }
      
      // If user has at least one of the wanted cards as duplicate, it's a match
      if (matchedCards.length > 0) {
        matchedExchanges.push({
          exchange,
          matchedWantedCards: matchedCards
        })
      }
    }
    
    if (matchedExchanges.length > 0) {
      matches.value = matchedExchanges
      showModal.value = true
    }
  } catch (err) {
    console.error('Error checking exchanges:', err)
  }
}

function parseNumbers(str: string): number[] {
  if (!str) return []
  return str.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
}

function userOwnsCard(identifier: number): boolean {
  return userStore.ownedCards.some(
    card => Number(card.identifier) === identifier
  )
}

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function completeExchange(exchangeId: number) {
  isCompleting.value = exchangeId
  error.value = null
  
  try {
    const response = await apiService.completeExchange(
      Number(userStore.customerId),
      exchangeId
    )
    
    if (response.success) {
      successMessage.value = response.data.message || 'El intercambio se ha completado exitosamente'
      
      // Remove this exchange from the list
      matches.value = matches.value.filter(m => m.exchange.exchangeId !== exchangeId)
      
      // Show success modal
      showSuccessModal.value = true
      
      // Reload user data to update cards
      await userStore.loadUserData(userStore.customerId)
    } else {
      error.value = response.errorDescription || 'Error al completar el intercambio'
    }
  } catch (err) {
    console.error('Error completing exchange:', err)
    error.value = 'Error al completar el intercambio. Intenta de nuevo.'
  } finally {
    isCompleting.value = null
  }
}

function close() {
  showModal.value = false
}

function closeSuccess() {
  showSuccessModal.value = false
  // If no more matches, close the main modal too
  if (matches.value.length === 0) {
    close()
  }
}
</script>
