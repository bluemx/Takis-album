<template>
  <div>
    <!-- Trigger Button -->
    <button 
      @click="showModal = true"
      :disabled="userStore.totalPacks <= 0"
      class="btn btn-primary w-full"
      :class="{ 'opacity-50 cursor-not-allowed': userStore.totalPacks <= 0 }">
      <Icon icon="mdi:mirror-rectangle" class="w-4 h-4 mr-2" />
      Abrir Sobres
      <div class="flex gap-0.5">
      <div v-if="userStore.defaultPacks > 0" class="badge bg-gray-400 text-white ml-0.5">
        {{ userStore.defaultPacks }}
      </div>
      <div v-if="userStore.goldenPacks > 0" class="badge bg-yellow-500 text-white ">
        {{ userStore.goldenPacks }}
      </div>
      </div>
    </button>

    <!-- Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="close">
      
      <div 
        class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
        @click.stop>
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-pfblue">Abrir Sobres</h2>
            <div class="flex gap-3 mt-2">
              <p v-if="userStore.defaultPacks > 0" class="text-sm text-gray-600 flex items-center gap-1">
                <span class="font-semibold">Sobres:</span>
                <span class="badge bg-gray-400 text-white">{{ userStore.defaultPacks }}</span>
              </p>
              <p v-if="userStore.goldenPacks > 0" class="text-sm text-gray-600 flex items-center gap-1">
                <span class="font-semibold">Dorados:</span>
                <span class="badge bg-yellow-500 text-white">{{ userStore.goldenPacks }}</span>
              </p>
            </div>
          </div>
          <button 
            @click="close"
            class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Cinematic Opening Overlay -->
        <div 
          v-if="showOpeningAnimation" 
          class="fixed inset-0 z-60 flex items-center justify-center bg-black/40 overflow-hidden"
          @click.stop>
          
          <!-- Opening Phase: Pack with Burst -->
          <div v-if="isOpening" class="relative w-full h-full flex items-center justify-center">
            <!-- Radial Burst Background -->
            <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img 
                :src="currentBurstImage"
                alt="Burst"
                class="min-w-[300vw] min-h-[300vh] object-contain animate-spin-slow"
              />
            </div>
            
            <!-- Pack Image -->
            <img 
              :src="currentPackImage"
              alt="Opening Pack"
              class="relative z-10 w-64 h-96 object-contain animate-pack-bounce"
            />
          </div>
          
          <!-- Card Reveal Phase -->
          <div v-if="!isOpening && revealingCards" class="relative w-full h-full flex items-center justify-center">
            <!-- Keep Radial Burst Background -->
            <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img 
                :src="currentBurstImage"
                alt="Burst"
                class="min-w-[300vw] min-h-[300vh] object-contain animate-spin-slow"
              />
            </div>
            
            <div 
              v-for="(card, index) in openedCards" 
              :key="card.id"
              class="absolute"
              :class="{ 
                'card-reveal-active': index === currentRevealIndex,
                'card-reveal-hidden': index !== currentRevealIndex 
              }"
              :style="{ '--card-rotation': `${getCardRotation(index)}deg` }"
            >
              <div class="w-72 max-w-md">
                <CardRenderer
                  :iscard="true" 
                  :identifier="getCardIdentifier(card.resource)"  
                  :base="card.resource"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Pack Selection Carousel -->
        <div v-if="!openedCards.length && userStore.totalPacks > 0" class="py-8">
          <!-- Carousel Container -->
          <div class="overflow-x-auto pb-4 px-4">
            <div class="flex gap-6 justify-start min-w-max py-10">
              <!-- Normal Packs -->
              <div
                v-for="(_pack, index) in normalPacksArray"
                :key="`normal-${index}`"
                class="pack-item cursor-pointer transition-all duration-300"
                :class="{ 'selected': selectedPack?.type === 1 && selectedPack?.index === index }"
                
                @click="selectPack(1, index)"
              >
                <img 
                  :src="normalPackImg" 
                  alt="Sobre Común"
                  class="w-40 h-56 object-contain drop-shadow-2xl hover:scale-110 transition-transform"
                />
              </div>
              
              <!-- Golden Packs -->
              <div
                v-for="(_pack, index) in goldenPacksArray"
                :key="`golden-${index}`"
                class="pack-item cursor-pointer transition-all duration-300"
                :class="{ 'selected': selectedPack?.type === 2 && selectedPack?.index === index }"

                @click="selectPack(2, index)"
              >
                <img 
                  :src="goldenPackImg" 
                  alt="Sobre Dorado"
                  class="w-40 h-56 object-contain drop-shadow-2xl hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>
          
          <!-- Open Pack Button -->
          <div v-if="selectedPack" class="text-center mt-6">
            <button 
              @click="handleOpenPack(selectedPack.type)"
              :disabled="isOpening"
              class="btn btn-lg"
              :class="selectedPack.type === 2 ? 'bg-linear-to-r from-yellow-400 to-yellow-600 text-white' : 'btn-primary'"
            >
              <Icon v-if="isOpening" icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
              <Icon v-else icon="mdi:mirror-rectangle" class="w-5 h-5 mr-2" />
              
              {{ isOpening ? 'Abriendo...' : 'Abrir Sobre' }}
            </button>
          </div>
          
          <!-- Instruction Text -->
          <p v-else class="text-center text-sm text-gray-500 mt-6">
            Selecciona un sobre para abrirlo
          </p>
        </div>

        <!-- Opened Cards Display -->
        <div v-if="openedCards.length > 0 && !showOpeningAnimation" class="text-center">
          <h3 class="text-xl font-bold text-pfblue mb-4">¡Cartas obtenidas!</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div 
              v-for="card in openedCards" 
              :key="card.id"
              class="relative group animate-fadeIn cursor-pointer hover:scale-105 transition-transform"
              @click="openCardDetail(card)">
              
              <CardRenderer
               :iscard="true" 
                :identifier="getCardIdentifier(card.resource)"  
                :base="card.resource" 
                ></CardRenderer>

              <!-- New Card Badge -->
              <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                ¡Nueva!
              </div>

              <!-- Card Info -->
              <div class="mt-2 text-center text-xs text-gray-600">
                <div class="font-semibold truncate">{{ getCardDescription(card) }}</div>
                <div class="text-gray-400">{{ getCardType(card) }}</div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 justify-center">
            <button 
              @click="addAllToAlbum"
              :disabled="isAddingToAlbum"
              class="btn btn-success"
              :class="{ 'opacity-50 cursor-not-allowed': isAddingToAlbum }">
              <Icon v-if="isAddingToAlbum" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else icon="mdi:star-plus" class="w-4 h-4 mr-2" />
              {{ isAddingToAlbum ? 'Agregando...' : 'Pegar en Álbum' }}
            </button>
            <button 
              @click="goToRepetidas"
              class="btn btn-primary">
              <Icon icon="mdi:cards-outline" class="w-4 h-4 mr-2" />
              Ver todas mis estampas
            </button>
            <button 
              v-if="userStore.totalPacks > 0"
              @click="resetAndOpenAnother"
              class="btn btn-primary">
              <Icon icon="mdi:mirror-rectangle" class="w-4 h-4 mr-2" />
              Abrir Otro ({{ userStore.totalPacks }})
            </button>
            <button 
              @click="close"
              class="btn btn-secondary">
              Cerrar
            </button>
          </div>
        </div>

        <!-- No Envelopes State -->
        <div v-if="userStore.totalPacks <= 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <Icon icon="mdi:mirror-rectangle-remove" class="w-16 h-16 mx-auto" />
          </div>
          <p class="text-gray-600">No tienes sobres disponibles</p>
        </div>
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
            :identifier="getCardIdentifier(selectedCard.resource)"  
            :base="selectedCard.resource"
          />
        </div>

        <!-- Card Info -->
        <div class="text-center">
          <h3 class="text-2xl font-bold text-pfblue mb-2">{{ getCardDescription(selectedCard) }}</h3>
          <p class="text-lg text-gray-600">{{ getCardType(selectedCard) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'
import CardRenderer from './CardRenderer.vue'
import type { UserCard } from '../stores/user'
import { useNewlyOpenedCards } from '../composables/useNewlyOpenedCards'
import { cardsDatabase } from '../data/cards'
import normalPackImg from '../assets/pack/normal.webp'
import goldenPackImg from '../assets/pack/golden.webp'
import normalBurstSvg from '../assets/pack/normal-burst.svg'
import goldenBurstSvg from '../assets/pack/golden-burst.svg'

const emit = defineEmits<{
  openRepetidas: []
}>()

const userStore = useUserStore()
const showModal = ref(false)
const isOpening = ref(false)
const isAddingToAlbum = ref(false)
const openedCards = ref<UserCard[]>([])
const selectedCard = ref<UserCard | null>(null)
const selectedPack = ref<{ type: number; index: number } | null>(null)
const openingPackType = ref<number>(1) // Store the pack type being opened
const showOpeningAnimation = ref(false)
const revealingCards = ref(false)
const currentRevealIndex = ref(0)
const cardRotations = ref<number[]>([])
const { addNewlyOpenedCards } = useNewlyOpenedCards()

// Computed values for burst images based on opening pack type
const currentBurstImage = computed(() => 
  openingPackType.value === 2 ? goldenBurstSvg : normalBurstSvg
)
const currentPackImage = computed(() => 
  openingPackType.value === 2 ? goldenPackImg : normalPackImg
)

// Generate random rotation for each pack (-10 to 10 degrees)
function getRandomRotation() {
  return Math.random() * 20 - 10
}

// Get card rotation (stored for each card)
function getCardRotation(index: number): number {
  return cardRotations.value[index] || 0
}

// Create arrays with packs and their rotations
const normalPacksArray = computed(() => {
  return Array.from({ length: userStore.defaultPacks }, () => ({
    rotation: getRandomRotation()
  }))
})

const goldenPacksArray = computed(() => {
  return Array.from({ length: userStore.goldenPacks }, () => ({
    rotation: getRandomRotation()
  }))
})

// Select a pack
function selectPack(type: number, index: number) {
  selectedPack.value = { type, index }
}

// Extract identifier from resource URL (get the number from filename)
function getCardIdentifier(resourceUrl: string): number {
  const match = resourceUrl.match(/(\d+)\.webp$/)
  return match && match[1] ? parseInt(match[1]) : 0
}

// Get card description from database
function getCardDescription(card: UserCard): string {
  const identifier = getCardIdentifier(card.resource)
  const cardData = cardsDatabase.find(c => c.identifier === identifier)
  return cardData?.desc || `Estampa #${identifier}`
}

// Get card type (Normal, Metal, or Animada)
function getCardType(card: UserCard): string {
  const identifier = getCardIdentifier(card.resource)
  const cardData = cardsDatabase.find(c => c.identifier === identifier)
  if (!cardData) return 'Normal'
  if (cardData.metal) return 'Metal'
  if (cardData.anim) return 'Animada'
  return 'Normal'
}

// Open card detail modal
function openCardDetail(card: UserCard) {
  selectedCard.value = card
}

// Close card detail modal
function closeCardDetail() {
  selectedCard.value = null
}

async function handleOpenPack(packTypeId: number = 1) {
  if (isOpening.value || userStore.totalPacks <= 0) return
  
  try {
    isOpening.value = true
    showOpeningAnimation.value = true
    openingPackType.value = packTypeId // Store the pack type being opened
    
    const newCards = await userStore.openPack(packTypeId)
    
    // Always start card reveal sequence, even if API fails
    openedCards.value = newCards && newCards.length > 0 ? newCards : []
    
    // Generate random rotations for each card
    cardRotations.value = openedCards.value.map(() => getRandomRotation())
    
    if (newCards && newCards.length > 0) {
      // Track the newly opened cards
      const cardIds = newCards.map(card => card.id)
      addNewlyOpenedCards(cardIds)
      // Reset selected pack
      selectedPack.value = null
    }
    
    // Wait 3 seconds to show the pack animation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Start card reveal sequence
    isOpening.value = false
    
    if (openedCards.value.length > 0) {
      revealingCards.value = true
      currentRevealIndex.value = 0
      
      // Reveal cards one by one
      const revealInterval = setInterval(() => {
        currentRevealIndex.value++
        if (currentRevealIndex.value >= openedCards.value.length) {
          clearInterval(revealInterval)
          // After all revealed, hide animation and show results
          setTimeout(() => {
            showOpeningAnimation.value = false
            revealingCards.value = false
            currentRevealIndex.value = 0
          }, 1000)
        }
      }, 1000)
    } else {
      // If no cards (error case), just hide animation after a moment
      setTimeout(() => {
        showOpeningAnimation.value = false
        revealingCards.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('Failed to open pack:', error)
    isOpening.value = false
    
    // Still show animation for a moment even on error
    setTimeout(() => {
      showOpeningAnimation.value = false
      revealingCards.value = false
    }, 2000)
  }
}

function resetAndOpenAnother() {
  openedCards.value = []
  selectedPack.value = null
  showOpeningAnimation.value = false
  revealingCards.value = false
  currentRevealIndex.value = 0
  cardRotations.value = []
  openingPackType.value = 1
}

async function addAllToAlbum() {
  if (openedCards.value.length === 0) return
  
  try {
    isAddingToAlbum.value = true
    
    const updates = []
    
    // For each opened card, check if there's already a card with same identifier in album
    for (const card of openedCards.value) {
      if (card.identifier) {
        // Find if there's already a card in album with same identifier
        const existingCard = userStore.ownedCards.find(c => 
          c.inAlbum && c.identifier && Number(c.identifier) === Number(card.identifier)
        )
        
        // If there's an existing card, remove it from album first
        if (existingCard) {
          updates.push({ cardId: existingCard.id, inAlbum: false })
        }
        
        // Add the new card to album
        updates.push({ cardId: card.id, inAlbum: true })
      }
    }
    
    // Execute all updates in a single API call
    if (updates.length > 0) {
      await userStore.updateInAlbum(updates)
    }
    
    // Close the modal after successfully adding all cards
    close()
  } catch (error) {
    console.error('Failed to add cards to album:', error)
  } finally {
    isAddingToAlbum.value = false
  }
}

function goToRepetidas() {
  close()
  emit('openRepetidas')
}

function close() {
  showModal.value = false
  openedCards.value = []
  selectedPack.value = null
  showOpeningAnimation.value = false
  revealingCards.value = false
  currentRevealIndex.value = 0
  cardRotations.value = []
  openingPackType.value = 1
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rotateRadial {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes packBounce {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.15); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-pack-bounce {
  animation: packBounce 0.6s ease-in-out infinite;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.pack-item {
  position: relative;
  transition: all 0.3s ease;
}

.pack-item.selected {
  transform: scale(1.1) translateY(-10px) !important;
}

.pack-item.selected::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 3px solid #3b82f6;
  border-radius: 8px;
  pointer-events: none;
  animation: pulse 2s infinite;
}

/* Burst spinning animation */
.animate-spin-slow {
  animation: rotateRadial 8s linear infinite;
}

/* Card reveal animations */
.card-reveal-active {
  z-index: 10;
  opacity: 1;
  transform: scale(1.3) rotate(var(--card-rotation));
  transition: all 0.5s ease;
}

.card-reveal-hidden {
  z-index: 5;
  opacity: 0.7;
  transform: scale(0.9) translateY(10px) rotate(var(--card-rotation));
  transition: all 0.5s ease;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>