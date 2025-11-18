<template>
    <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:fixed top-2 left-2 z-10 right-2 bg-white p-2 rounded-lg shadow-md bg-pattern w-auto mx-auto max-w-6xl relative">
        <button @click="toggleIndex" class="btn shrink-0">
            <Icon icon="ph:list-bullets-duotone" />
            <span class="hidden md:inline">Índice</span>
        </button>
        
        <div class="flex flex-wrap md:flex-nowrap gap-2 md:ml-auto justify-center md:justify-end">
          <a 
            href="#" 
            target="_blank"
            rel="noopener noreferrer"
            class="btn shrink-0 btn-outline text-blue-900">
            <Icon icon="mdi:cash" class="w-4 h-4" />
            <span >Comprar sobres</span>
          </a>
          <FriendsWidget />
          <!--
            <ExchangeWidget />
          -->
          <PackOpener @openRepetidas="handleOpenRepetidas" />
          <RepetidasWidget ref="repetidasWidget" />
        </div>
    </div>

    <!-- Index Modal -->
    <div 
      v-if="showIndex" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      @click="closeIndex">
      
      <div 
        class="bg-white rounded-lg p-6 max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto shadow-xl"
        @click.stop>
        
        <!-- Header with Close Button -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-pfblue">Índice</h2>
          <button 
            @click="closeIndex"
            class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Index Content -->
        <AlbumIndex @navigate="closeIndex" />
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import RepetidasWidget from './RepetidasWidget.vue'
import FriendsWidget from './FriendsWidget.vue'
// import ExchangeWidget from './ExchangeWidget.vue'
import PackOpener from './PackOpener.vue'
import AlbumIndex from './AlbumIndex.vue'

const repetidasWidget = ref()
const showIndex = ref(false)

function toggleIndex() {
    showIndex.value = !showIndex.value
}

function closeIndex() {
    showIndex.value = false
}

function handleOpenRepetidas() {
  // Open the Repetidas modal
  if (repetidasWidget.value && repetidasWidget.value.openModal) {
    repetidasWidget.value.openModal()
  }
}
</script>