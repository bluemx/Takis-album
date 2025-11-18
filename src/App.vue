
<template>
  <div class="min-h-screen w-full">

    <!-- Loading/Setup Phase -->
    <UserLoader v-if="!isReady" @ready="handleUserReady" />
    
    <!-- Main Album Interface -->
    <div v-else class="min-h-screen w-full flex flex-col overflow-auto gap-2 p-2 md:p-0 items-center justify-center bg-center bg-cover" :style="{ backgroundImage: `url(${mainbg})` }">
      
      <AlbumTopbar />
      <!-- Album Components -->
      <AlbumPages />
      <AlbumNavigation />
      
      <!-- Welcome News Modal -->
      <WelcomeNewsModal />
      
      <!-- Exchange Matches Modal -->
      <!--
        <ExchangeMatchesModal />
        -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlbumPages from './components/AlbumPages.vue'
import AlbumNavigation from './components/AlbumNavigation.vue'
import AlbumTopbar from './components/AlbumTopbar.vue'
import UserLoader from './components/UserLoader.vue'
import WelcomeNewsModal from './components/WelcomeNewsModal.vue'
// import ExchangeMatchesModal from './components/ExchangeMatchesModal.vue'
import mainbg from '../public/mainbg.webp'

// State
const isReady = ref(false)

// Methods
const handleUserReady = () => {
  console.log('✅ User data loaded, showing album interface')
  isReady.value = true
}
</script>

<style scoped>
/* Basecoat CSS and Tailwind handle all styling */
</style>
