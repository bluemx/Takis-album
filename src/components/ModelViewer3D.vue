<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white rounded-lg p-6 md:max-w-lg w-full relative"
      @click.stop
    >
      <!-- Close Button -->
      <button 
        @click="close"
        class="absolute top-3 right-3 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        ✕
      </button>

      <!-- Title -->
      <h3 class="text-xl font-bold mb-1 text-center text-gray-800">
        Visor 3D
      </h3>

      <!-- Subtitle -->
      <p class="text-sm text-gray-600 mb-2 text-center">
        Gíralo y muévele!
      </p>

      

      <!-- Model Viewer Container -->
      <div 
        v-if="!hasError"
        ref="modelContainer" 
        class="max-w-48 aspect-square mx-auto w-full bg-gray-100 rounded-lg overflow-hidden"
      >
        <!-- Model viewer will be inserted here -->
      </div>
      
      <!-- AR Button (mobile only) -->
      <button 
        v-if="isMobile"
        @click="activateAR"
        class="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-1"
      >
        👓 Activar AR
      </button>

      <!-- Error State -->
      <div 
        v-if="hasError"
        class="text-red-500 text-center p-4"
      >
        Error al cargar el modelo 3D
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import '@google/model-viewer'

interface Props {
  isOpen: boolean
  cardId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const modelContainer = ref<HTMLElement>()
const hasError = ref(false)
const modelViewer = ref<any>(null)

const isMobile = computed(() => {
  // More strict mobile detection for AR functionality
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Check for AR support specifically
  const hasARSupport = 'xr' in navigator || 'getVRDisplays' in navigator
  // Check screen size as additional indicator
  const isSmallScreen = window.innerWidth < 768
  
  return isMobileDevice && (hasARSupport || isSmallScreen)
})

const modelPath = computed(() => {
  try {
    return new URL(`../assets/3ds/${props.cardId}.glb`, import.meta.url).href
  } catch (error) {
    console.error('Error generating model path:', error)
    return ''
  }
})

function close() {
  emit('close')
}

function handleBackdropClick(e: Event) {
  if (e.target === e.currentTarget) {
    close()
  }
}

function activateAR() {
  try {
    if (modelViewer.value) {
      modelViewer.value.activateAR()
    }
  } catch (error) {
    console.error('AR activation error:', error)
    alert('AR no disponible en este dispositivo')
  }
}

function createModelViewer() {
  if (!modelContainer.value || !modelPath.value) return

  try {
    // Clear previous viewer
    if (modelViewer.value) {
      modelViewer.value.remove()
    }

    // Create new model-viewer element
    const viewer = document.createElement('model-viewer') as any
    viewer.setAttribute('src', modelPath.value)
    viewer.setAttribute('ar', '')
    viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look')
    viewer.setAttribute('camera-controls', '')
    viewer.setAttribute('environment-image', 'neutral')
    viewer.setAttribute('shadow-intensity', '1')
    viewer.setAttribute('auto-rotate', '')
    viewer.setAttribute('loading', 'eager')
    viewer.style.width = '100%'
    viewer.style.height = '100%'
    viewer.style.backgroundColor = '#f5f5f5'

    // Handle loading errors
    viewer.addEventListener('error', () => {
      hasError.value = true
    })

    // Handle successful load
    viewer.addEventListener('load', () => {
      hasError.value = false
    })

    modelContainer.value.appendChild(viewer)
    modelViewer.value = viewer
  } catch (error) {
    console.error('Error creating 3D model viewer:', error)
    hasError.value = true
  }
}

// Watch for open state changes
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    hasError.value = false
    await nextTick()
    createModelViewer()
  } else {
    // Clean up when closing
    if (modelViewer.value) {
      modelViewer.value.remove()
      modelViewer.value = null
    }
  }
})
</script>