<template>
  <div class="min-h-screen flex items-center justify-center bg-red-800 text-white">
    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
      <h2 class="text-2xl font-bold mb-2">Cargando tu álbum...</h2>
      <p class="text-blue-200">Obteniendo tu colección de estampas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="userStore.error" class="text-center max-w-md">
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-2xl font-bold mb-2">Ocurrió un error al cargar el contenido</h2>
      <p class="text-red-200 mb-6">{{ userStore.error }}</p>
      <button
        @click="retryLoad"
        class="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>

    <!-- Success State -->
    <div v-else-if="userStore.isLoggedIn" class="text-center">
      <h2 class="text-3xl font-bold mb-4">Bienvenido a tu álbum</h2>
      <img src="/logow-anim.svg" class="w-40 mx-auto" />
      
      <div class="bg-white/10 rounded-lg p-6 mb-6 backdrop-blur-sm mt-10">
        <div class="text-xl text-blue-200">Cuentas con {{ userStore.totalOwnedCards }} de {{ cardsDatabase.length }} estampas</div>
      </div>

      <button
        @click="continueToAlbum"
        class="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
      >
        Abrir Álbum
      </button>
    </div>

    <!-- Initial State -->
    <div v-else class="text-center">
      <div class="text-6xl mb-4">📱</div>
      <p class="text-blue-200 mb-6">Cargando...</p>
      
      <button
        @click="loadUserData"
        class="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        🚀 Cargando
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { cardsDatabase } from '../data/cards'

const emit = defineEmits<{
  ready: []
}>()

const userStore = useUserStore()

let customerId = 'DEMO_USER_001' // Demo mode customer ID

const loadUserData = async () => {
  try {
    await userStore.loadUserData(customerId)
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

const retryLoad = () => {
  loadUserData()
}

const continueToAlbum = () => {
  emit('ready')
}

// Handle postMessage from parent window
const handleMessage = (event: MessageEvent) => {
  if (event.data && event.data.type === 'USER_ID') {
    customerId = event.data.userId
    console.log('Received user ID from parent:', customerId)
    loadUserData()
  }
}

onMounted(() => {
  // Listen for postMessage from parent
  window.addEventListener('message', handleMessage)
  
  // Auto-load with development ID
  loadUserData()
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.btn {
  transition: all 0.2s;
  transform: scale(1);
}

.btn:hover {
  transform: scale(1.05);
}

.btn:active {
  transform: scale(0.95);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>