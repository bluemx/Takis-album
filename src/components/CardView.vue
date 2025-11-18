<template>
  <div 
    ref="cardWrapper"
    class=" transform-gpu w-full"
    :class="{
      'cursor-pointer hover:-translate-y-1 hover:scale-105 transition-all shrink-0 grow-0 w-full ': !open,
      'absolute z-50 flex flex-col justify-center items-center w-auto! ': open,
    }"
    :style="open ? modalStyle : {}"
    @click="openCard">

    <div :class="{'relative':true, 'w-full max-w-sm': open}">
      
    
    <CardRenderer 
      :iscard="true" 
      :identifier="cardId" 
      :shouldFlip="shouldFlip"
      :shouldRotate="shouldRotate"
      v-if="ownedCard" 
      :base="ownedCard.resource"
      :disposition="cardDisposition" 
    />

    <!-- Card Description -->
    <!--
      <div 
      v-if="isInFinalPosition && cardDescription" 
      class="mt-1 text-center text-white text-lg font-semibold px-2 py-1 bg-black/50 rounded-lg backdrop-blur-sm">
      {{ cardDescription }}
    </div>
    -->

    <!-- Floating Close Button -->
    <button 
      v-if="isInFinalPosition" 
      @click.stop="closeCard"
      class="absolute cursor-pointer -top-4 -right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-60">
      <Icon icon="mdi:close" class="w-6 h-6" />
    </button>
    </div>

    
    
    <!-- Bottom Action Buttons -->
    <div v-if="isInFinalPosition" class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 flex-col w-2/3">
       <!-- Card Description -->
    <div  
      class="mt-1 text-center text-white text-sm px-2 py-1 bg-black/20 rounded-lg backdrop-blur-sm">
      {{ cardDescription }}
    </div>
      <!-- 3D Button -->
      <button 
        v-if="cardHas3D"
        @click.stop="open3DModel" 
        class="btn btn-primary"
        title="Ver modelo 3D">
        <Icon icon="mdi:cube-scan" class="w-5 h-5 mr-2" />
        Míralo en 3D
      </button>
      
      <button 
        @click.stop="removeFromAlbum" 
        :disabled="userStore.isLoading"
        class="btn btn-secondary"
        :class="{ 'opacity-50 cursor-not-allowed': userStore.isLoading }">
        {{ userStore.isLoading ? 'Quitando...' : 'Despegar del álbum' }}
      </button>
    </div>

    <div :style="isInFinalPosition?'opacity:1;':'opacity:0;'" class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-black/20 to-white/10 backdrop-blur-md transition-all duration-1000"></div>

  </div>

  <!-- 3D Model Viewer -->
  <ModelViewer3D 
    :is-open="show3DViewer"
    :card-id="cardId"
    @close="close3DViewer"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardRenderer from './CardRenderer.vue'
import ModelViewer3D from './ModelViewer3D.vue'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'
import { cardsDatabase } from '../data/cards'

interface Props {
  cardId: number
}

const props = defineProps<Props>()
const userStore = useUserStore()

const open = ref(false)
const isInFinalPosition = ref(false)
const showBackground = ref(false)
const shouldFlip = ref(false)
const shouldRotate = ref(false)
const cardWrapper = ref<HTMLElement>()
const modalStyle = ref({})
const storedPositions = ref<any>(null)
const show3DViewer = ref(false)

const ownedCard = computed(() => {
  return userStore.getOwnedCard(props.cardId)
})

const cardDisposition = computed(() => {
  const cardData = cardsDatabase.find(card => card.identifier === props.cardId)
  return cardData?.disposition || 'Vertical'
})

const cardHas3D = computed(() => {
  const cardData = cardsDatabase.find(card => card.identifier === props.cardId)
  return cardData?.has3d || false
})

const cardDescription = computed(() => {
  const cardData = cardsDatabase.find(card => card.identifier === props.cardId)
  return cardData?.desc || ''
})

function calculateModalPosition() {
  if (!cardWrapper.value) return {}
  
  // Get current position relative to .page-content
  const pageContent = cardWrapper.value.closest('.page-content') || document.body
  const pageContentRect = pageContent.getBoundingClientRect()
  const currentRect = cardWrapper.value.getBoundingClientRect()
  
  // Calculate position relative to page-content
  const leftOffset = currentRect.left - pageContentRect.left
  const topOffset = currentRect.top - pageContentRect.top
  const rightOffset = pageContentRect.right - currentRect.right
  const bottomOffset = pageContentRect.bottom - currentRect.bottom
  
  return {
    // Initial position (relative to page-content)
    initialPosition: {
      left: `${leftOffset}px`,
      top: `${topOffset}px`,
      right: `${rightOffset}px`,
      bottom: `${bottomOffset}px`
    },
    // Final position (covers entire page-content)
    finalPosition: {
      left: '0px',
      top: '0px',
      right: '0px',
      bottom: '0px'
    }
  }
}

function openCard() {
  if (open.value) return
  const positions = calculateModalPosition()
  if (!positions.initialPosition) return
  
  // Store positions for closing animation
  storedPositions.value = positions
  
  // Step 1: Set to current position (no transition yet)
  modalStyle.value = {
    'left': positions.initialPosition.left,
    'top': positions.initialPosition.top,
    'right': positions.initialPosition.right,
    'bottom': positions.initialPosition.bottom,
    'transition': 'none',
    'z-index': '50',
    'width': 'auto',
    'height': 'auto'
  }

  open.value = true
  shouldFlip.value = true
  shouldRotate.value = true

  // Step 2: Expand to cover entire page-content
  setTimeout(() => {
    modalStyle.value = {
      'left': positions.finalPosition.left,
      'top': positions.finalPosition.top,
      'right': positions.finalPosition.right,
      'bottom': positions.finalPosition.bottom,
      'transition': 'left 0.5s ease, top 0.5s ease, right 0.5s ease, bottom 0.5s ease, background 2.5s ease',
      'z-index': '50'
    }
  }, 10)

  // Step 3: Set final position state and show background/buttons
  setTimeout(() => {
    isInFinalPosition.value = true
    showBackground.value = true
  }, 520)
  
  // Reset animations after they complete
  setTimeout(() => {
    shouldFlip.value = false
    shouldRotate.value = false
  }, 1000)
}

function closeCard() {
  if (!storedPositions.value) return
  
  // Hide buttons and background first
  isInFinalPosition.value = false
  showBackground.value = false
  
  const positions = storedPositions.value
  
  // Contract back to original position
  modalStyle.value = {
    'left': positions.initialPosition.left,
    'top': positions.initialPosition.top,
    'right': positions.initialPosition.right,
    'bottom': positions.initialPosition.bottom,
    'transition': 'left 0.5s ease, top 0.5s ease, right 0.5s ease, bottom 0.5s ease, box-shadow 0.5s ease',
    'box-shadow': 'none',
    'z-index': '50'
  }
  
  // Close modal after animation
  setTimeout(() => {
    open.value = false
    modalStyle.value = {}
    storedPositions.value = null
  }, 520)
}

async function removeFromAlbum() {
  if (!ownedCard.value) return
  
  try {
    await userStore.updateInAlbum([{ cardId: ownedCard.value.id, inAlbum: false }])
    closeCard()
  } catch (error) {
    console.error('Failed to remove card from album:', error)
  }
}

function open3DModel() {
  show3DViewer.value = true
}

function close3DViewer() {
  show3DViewer.value = false
}

</script>
