<template>
    <div class=" w-10/12 mx-auto card bg-white/20 backdrop-blur-xl text-center gap-2 p-2">

    <!-- Category Progress -->
      <h3 class="text-sm lg:text-xl py-2  text-white">Tienes <span class="font-semibold text-blue-200 text-shadow-lg">{{ userStore.totalOwnedCards }} estampas </span> en tu álbum</h3>
      <div class="flex flex-wrap justify-center items-center gap-1 grow shrink">
        <div 
          v-for="category in categoryProgress" 
          :key="category.id"
          class="text-sm lg:text-base flex flex-row justify-center items-center card py-1 px-2 text-center"
        >
            <div class="text-blue-900">{{ category.name }}</div>
            <div class="bg-white/50 rounded  text-blue-800">{{ category.ownedCount }}/{{ category.totalCount }}</div>

          <!--
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: category.percentage + '%' }"
            ></div>
          </div>
          -->
        </div>
        </div>
      
    
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'


import { cardsDatabase } from '../data/cards'
import { categoriesDatabase } from '../data/categories'

const userStore = useUserStore()




const categoryProgress = computed(() => {
  return categoriesDatabase.map(category => {
    const categoryCards = cardsDatabase.filter(card => card.category === category.id)
    const ownedInCategory = categoryCards.filter(card => userStore.ownsCard(card.identifier))
    
    return {
      id: category.id,
      name: category.name,
      totalCount: categoryCards.length,
      ownedCount: ownedInCategory.length,
      percentage: categoryCards.length > 0 ? (ownedInCategory.length / categoryCards.length) * 100 : 0
    }
  })
})




</script>

<style scoped>
.btn {
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Buy Packs Button Styles */
.buy-packs-btn {
  position: relative;
  z-index: 1;
}

/* Animated gradient background */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Shine effect */
@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}

.animate-shine {
  animation: shine 3s ease-in-out infinite;
}

/* Pulse glow effect */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.buy-packs-btn:hover .blur-xl {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>