<template>
  <div>
    <!-- Trigger Button -->
    <button 
      @click="openExchange"
      class="btn w-full">
      <Icon icon="mdi:swap-horizontal" class="w-4 h-4 mr-2" />
      Intercambios
    </button>

    <!-- Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="close">
      
      <div 
        class="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl w-[95vw]"
        @click.stop>
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-pfblue">Intercambios de Estampas</h2>
          <button 
            @click="close"
            class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- My Exchanges Section -->
        <div v-if="myExchanges.length > 0" class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 class="text-lg font-bold text-pfblue mb-3 flex items-center gap-2">
            <Icon icon="mdi:clipboard-list" class="w-5 h-5" />
            Mis Intercambios Activos ({{ myExchanges.length }})
          </h3>
          
          <div class="space-y-3">
            <div 
              v-for="exchange in myExchanges"
              :key="exchange.exchangeId"
              class="bg-white rounded-lg p-3 border border-blue-200 flex items-center justify-between">
              
              <div class="flex-1">
                <div class="flex gap-4 text-sm">
                  <div>
                    <span class="font-semibold text-gray-700">Ofreces:</span>
                    <span class="ml-1 text-blue-600">{{ exchange.stickersOffered }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700">Buscas:</span>
                    <span class="ml-1 text-green-600">{{ exchange.stickersWanted }}</span>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(exchange.exchangeAddedDate) }}</p>
              </div>

              <button 
                @click="cancelExchange(exchange.exchangeId)"
                :disabled="isCancelling === exchange.exchangeId"
                class="btn btn-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                <Icon 
                  :icon="isCancelling === exchange.exchangeId ? 'mdi:loading' : 'mdi:close-circle'" 
                  :class="{ 'animate-spin': isCancelling === exchange.exchangeId }"
                  class="w-4 h-4 mr-1" />
                {{ isCancelling === exchange.exchangeId ? 'Cancelando...' : 'Cancelar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Offer Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-pfblue mb-3 flex items-center gap-2">
            <Icon icon="mdi:hand-coin" class="w-6 h-6" />
            Tu Oferta ({{ selectedOffer.length }} seleccionados)
          </h3>
          <p class="text-sm text-gray-600 mb-4">Selecciona las estampas que quieres ofrecer (estampas repetidas)</p>
          
          <!-- Search Filter -->
          <div class="mb-4">
            <div class="relative">
              <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                v-model="offerSearchQuery"
                type="text"
                placeholder="Buscar por número o descripción..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pfblue focus:border-transparent">
            </div>
          </div>
          
          <div 
            v-if="availableStickers.length === 0"
            class="text-center py-8 text-gray-500">
            <Icon icon="mdi:alert-circle" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No tienes estampas repetidas disponibles para intercambiar</p>
          </div>

          <div 
            v-else-if="filteredAvailableStickers.length === 0"
            class="text-center py-8 text-gray-500">
            <Icon icon="mdi:magnify" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No se encontraron estampas con "{{ offerSearchQuery }}"</p>
          </div>
          
          <div v-else class="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
            <div 
              v-for="card in filteredAvailableStickers" 
              :key="card.id"
              class="relative shrink-0 snap-start cursor-pointer flex flex-col items-center"
              :class="{ 'ring-4 ring-pfblue': isInOffer(card.id) }"
              @click="toggleOffer(card)">
              
              <div class="w-32 h-40 relative">
                <CardRenderer
                  :iscard="true"
                  :identifier="card.identifier ? Number(card.identifier) : 0"
                  :base="card.resource"
                />
                
                <!-- Selection Indicator -->
                <div 
                  v-if="isInOffer(card.id)"
                  class="absolute top-2 right-2 w-8 h-8 bg-pfblue rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:check" class="w-6 h-6 text-white" />
                </div>

                <!-- Already in Album Indicator -->
                <div v-if="hasCardInAlbum(card.identifier)" class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  Repetida
                </div>
              </div>

              <!-- Card Info -->
              <div class="text-center text-xs text-gray-600 max-w-32 mt-2">
                <div class="font-semibold truncate">{{ getCardDescription(card.identifier) }}</div>
                <div class="text-gray-500">{{ getCategoryName(card.identifier) }}</div>
                <div class="text-gray-400">{{ getCardType(card.identifier) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wanted Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-green-600 mb-3 flex items-center gap-2">
            <Icon icon="mdi:cards-heart" class="w-6 h-6" />
            Estampas Buscadas ({{ selectedWanted.length }} seleccionados)
          </h3>
          <p class="text-sm text-gray-600 mb-4">Selecciona las estampas por las que quieres intercambiar</p>
          
          <!-- Search Box -->
          <div class="mb-4">
            <div class="relative">
              <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por número..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pfblue">
            </div>
          </div>

          <!-- Cards List (Simple Grid) -->
          <div class="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            <button
              v-for="card in filteredCards"
              :key="card.identifier"
              @click="toggleWanted(card.identifier)"
              class="aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200"
              :class="{
                'bg-pfblue text-white shadow-lg scale-110': isInWanted(card.identifier),
                'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200': !isInWanted(card.identifier),
                'opacity-50 !bg-teal-500 !text-white !alert': userStore.ownsCard(card.identifier)
              }">
              {{ card.identifier }}
            </button>
          </div>
          <div class="mt-4">
            <p class="text-xs  alert bg-teal-300 w-fit">
                <Icon icon="mdi:information" class="inline w-4 h-4" />
                Estampas que ya tienes
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex gap-3 md:flex-row flex-col">
          <button 
            @click="startExchange"
            :disabled="selectedOffer.length === 0 || selectedWanted.length === 0 || isLoading"
            class="btn flex-1 bg-pfblue hover:bg-pfblue/90 text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon 
              :icon="isLoading ? 'mdi:loading' : 'mdi:swap-horizontal'" 
              :class="{ 'animate-spin': isLoading }"
              class="w-5 h-5 mr-2" />
            {{ isLoading ? 'Buscando...' : 'Comenzar Intercambio' }}
          </button>
          <button 
            @click="close"
            class="btn btn-secondary">
            Cancelar
          </button>
        </div>

        <!-- Error Message -->
        <div 
          v-if="error"
          class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
          <Icon icon="mdi:alert-circle" class="w-5 h-5 shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div 
      v-if="showSuccessModal" 
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="closeSuccess">
      
      <div 
        class="bg-white rounded-lg p-8 max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto"
        @click.stop>
        
        <!-- Success Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:check-circle" class="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <!-- Message -->
        <h3 class="text-2xl font-bold text-center text-pfblue mb-4">¡Intercambio Iniciado!</h3>
        <p class="text-center text-gray-600 mb-6">
          Se encontraron {{ exchangeMatches.length }} socios(s) Puntos Futbol con las estampas que buscas.
          <br>
          Espera a que alguien de la comunidad acepte tu intercambio.
        </p>

        <!-- Matches List -->
        <!--
        <div class="space-y-3 mb-6">
          <div 
            v-for="match in exchangeMatches"
            :key="match.customerId"
            class="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p class="font-bold text-pfblue">{{ match.firstName }}</p>
              <p class="text-sm text-gray-600">{{ match.email }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-green-600">{{ match.stickers }}</p>
              <p class="text-xs text-gray-500">estampas</p>
            </div>
          </div>
        </div>
        -->
        
        <!-- Close Button -->
        <button 
          @click="closeSuccess"
          class="btn w-full bg-green-500 hover:bg-green-600 text-white">
          Entendido
        </button>
      </div>
    </div>

    <!-- No Matches Modal -->
    <div 
      v-if="showNoMatchesModal" 
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="closeNoMatches">
      
      <div 
        class="bg-white rounded-lg p-8 max-w-md shadow-xl"
        @click.stop>
        
        <!-- Warning Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:alert" class="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        
        <!-- Message -->
        <h3 class="text-2xl font-bold text-center text-pfblue mb-4">Sin Coincidencias</h3>
        <p class="text-center text-gray-600 mb-6">
          No hay socios Puntos Futbol con las estampas que buscas en este momento.
          <br><br>
          Intenta con un intercambio diferente o vuelve más tarde.
        </p>
        
        <!-- Close Button -->
        <button 
          @click="closeNoMatches"
          class="btn w-full bg-pfblue hover:bg-pfblue/90 text-white">
          Intentar de Nuevo
        </button>
      </div>
    </div>

    <!-- Cancel Success Modal -->
    <div 
      v-if="showCancelSuccessModal" 
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="closeCancelSuccess">
      
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
        <h3 class="text-2xl font-bold text-center text-pfblue mb-4">Intercambio Cancelado</h3>
        
        <!-- Close Button -->
        <button 
          @click="closeCancelSuccess"
          class="btn w-full bg-green-500 hover:bg-green-600 text-white">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'
import { apiService, type ExchangeMatch, type CurrentExchange } from '../services/api'
import CardRenderer from './CardRenderer.vue'
import { cardsDatabase, type Card } from '../data/cards'
import { categoriesDatabase } from '../data/categories'
import type { UserCard } from '../stores/user'

const userStore = useUserStore()
const showModal = ref(false)
const showSuccessModal = ref(false)
const showNoMatchesModal = ref(false)
const showCancelSuccessModal = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const offerSearchQuery = ref('')

// Selection state
const selectedOffer = ref<number[]>([])
const selectedWanted = ref<number[]>([])
const exchangeMatches = ref<ExchangeMatch[]>([])

// My exchanges state
const myExchanges = ref<CurrentExchange[]>([])
const isCancelling = ref<number | null>(null)

// Available stickers for offer (not in album)
const availableStickers = computed(() => {
  return userStore.ownedCards
    .filter(card => !card.inAlbum)
    .sort((a, b) => {
      const idA = a.identifier ? Number(a.identifier) : 0
      const idB = b.identifier ? Number(b.identifier) : 0
      return idA - idB
    })
})

// Filter available stickers based on search query
const filteredAvailableStickers = computed(() => {
  if (!offerSearchQuery.value.trim()) {
    return availableStickers.value
  }

  const query = offerSearchQuery.value.toLowerCase().trim()
  
  return availableStickers.value.filter(card => {
    // Search by identifier
    const identifier = card.identifier?.toString() || ''
    if (identifier.includes(query)) {
      return true
    }

    // Search by description from cardsDatabase
    const cardData = cardsDatabase.find(c => c.identifier === Number(card.identifier))
    if (cardData && cardData.desc.toLowerCase().includes(query)) {
      return true
    }

    return false
  })
})

// Check if a card with the same identifier is already in album
const hasCardInAlbum = (identifier: string | number | null) => {
  if (identifier === null) return false
  return userStore.ownedCards.some(card => 
    card.inAlbum && card.identifier && Number(card.identifier) === Number(identifier)
  )
}

// Get card description from database
const getCardDescription = (identifier: string | number | null) => {
  if (identifier === null) return ''
  const cardData = cardsDatabase.find(c => c.identifier === Number(identifier))
  return cardData?.desc || `Estampa #${identifier}`
}

// Get category name from database
const getCategoryName = (identifier: string | number | null) => {
  if (identifier === null) return ''
  const cardData = cardsDatabase.find(c => c.identifier === Number(identifier))
  if (!cardData) return ''
  const category = categoriesDatabase.find(cat => cat.id === cardData.category)
  return category?.name || ''
}

// Get card type (Normal, Metal, or Animada)
const getCardType = (identifier: string | number | null) => {
  if (identifier === null) return 'Normal'
  const cardData = cardsDatabase.find(c => c.identifier === Number(identifier))
  if (!cardData) return 'Normal'
  if (cardData.metal) return 'Metal'
  if (cardData.anim) return 'Animada'
  return 'Normal'
}

// Filter cards for wanted section
const filteredCards = computed(() => {
  if (!searchQuery.value) return cardsDatabase
  
  const query = searchQuery.value.toLowerCase()
  return cardsDatabase.filter((card: Card) => 
    card.identifier.toString().includes(query)
  )
})

function openExchange() {
  showModal.value = true
  selectedOffer.value = []
  selectedWanted.value = []
  error.value = null
  offerSearchQuery.value = ''
  searchQuery.value = ''
  loadMyExchanges()
}

async function loadMyExchanges() {
  try {
    const response = await apiService.getCurrentExchanges(userStore.customerId)
    if (response.success && response.data) {
      // Filter to only show exchanges created by the current user
      myExchanges.value = response.data.filter(
        ex => ex.customerIdOffers === Number(userStore.customerId)
      )
    }
  } catch (err) {
    console.error('Error loading my exchanges:', err)
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return dateStr
  }
}

async function cancelExchange(exchangeId: number) {
  if (!userStore.customerId) return
  
  isCancelling.value = exchangeId
  
  try {
    const response = await apiService.cancelExchange(userStore.customerId, exchangeId)
    
    if (response.success) {
      // Remove from local list
      myExchanges.value = myExchanges.value.filter(ex => ex.exchangeId !== exchangeId)
      // Show success message
      showCancelSuccessModal.value = true
    } else {
      error.value = response.data?.message || 'Error al cancelar el intercambio'
    }
  } catch (err) {
    console.error('Error cancelling exchange:', err)
    error.value = 'Error al cancelar el intercambio'
  } finally {
    isCancelling.value = null
  }
}

function close() {
  showModal.value = false
}

function closeSuccess() {
  showSuccessModal.value = false
  close()
}

function closeNoMatches() {
  showNoMatchesModal.value = false
}

function closeCancelSuccess() {
  showCancelSuccessModal.value = false
}

function isInOffer(cardId: number): boolean {
  return selectedOffer.value.includes(cardId)
}

function isInWanted(cardId: number): boolean {
  return selectedWanted.value.includes(cardId)
}

function toggleOffer(card: UserCard) {
  const index = selectedOffer.value.indexOf(card.id)
  if (index === -1) {
    selectedOffer.value.push(card.id)
  } else {
    selectedOffer.value.splice(index, 1)
  }
}

function toggleWanted(cardId: number) {
  const index = selectedWanted.value.indexOf(cardId)
  if (index === -1) {
    selectedWanted.value.push(cardId)
  } else {
    selectedWanted.value.splice(index, 1)
  }
}

async function startExchange() {
  if (selectedOffer.value.length === 0 || selectedWanted.value.length === 0) return
  
  isLoading.value = true
  error.value = null
  
  try {
    // Build offer array with customerStickerId and ACRegId
    const offerItems = availableStickers.value
      .filter(card => selectedOffer.value.includes(card.id))
      .map(card => ({
        customerStickerId: card.id,
        ACRegId: card.acRegId
      }))
    
    // Build wanted array with just ACRegId (using card.id as the identifier)
    const wantedItems = selectedWanted.value.map(cardId => ({
      ACRegId: cardId
    }))
    
    const response = await apiService.tryExchange(
      Number(userStore.customerId),
      offerItems,
      wantedItems
    )
    
    // Check if response is successful and has data
    if (response.success && response.data.length > 0) {
      // Check the resultId of the first item
      const firstResult = response.data[0]
      
      if (firstResult && firstResult.resultId === 1) {
        // Success - found matches!
        exchangeMatches.value = response.data
        showSuccessModal.value = true
        // Refresh my exchanges list
        await loadMyExchanges()
      } else {
        // Error or no matches (resultId === -1)
        showNoMatchesModal.value = true
        // Still refresh in case the exchange was created
        await loadMyExchanges()
      }
    } else {
      // No data returned
      showNoMatchesModal.value = true
    }
    
  } catch (err) {
    console.error('Error trying exchange:', err)
    error.value = 'Error al buscar intercambios. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>
