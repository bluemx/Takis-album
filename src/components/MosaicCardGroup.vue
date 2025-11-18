<template>
  <div 
    class="mosaic-card-group w-full h-full"
    :class="mosaicGridClass"
  >
    <template v-for="cardId in cardIds" :key="cardId">
      <!-- Show CardView if user owns the card -->
      <div 
        v-if="userStore.ownsCard(cardId)"
        class="mosaic-card w-full h-full"
      >
        <CardView :cardId="cardId" />
      </div>
      
      <!-- Placeholder for unowned cards -->
      <div 
        v-else
        class="mosaic-card relative card card-slot border w-full h-full bg-white/80 p-1 rounded-[3%] flex flex-col justify-center items-center text-center text-white"
      >
        <IdentifierBadge :identifier="cardId" class="relative scale-75" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import CardView from './CardView.vue'
import IdentifierBadge from './IdentifierBadge.vue'

interface Props {
  cardIds: number[]
  mosaicType: 'Horizontal2' | 'Horizontal4' | 'Vertical4'
}

const props = defineProps<Props>()
const userStore = useUserStore()

// Determine grid layout based on mosaic type
const mosaicGridClass = computed(() => {
  switch (props.mosaicType) {
    case 'Horizontal2':
      return 'grid grid-cols-2 grid-rows-1 gap-0' // 2x1 grid
    case 'Horizontal4':
      return 'grid grid-cols-2 grid-rows-2 gap-0' // 2x2 grid
    case 'Vertical4':
      return 'grid grid-cols-2 grid-rows-2 gap-0' // 2x2 grid
    default:
      return 'grid grid-cols-2 gap-0'
  }
})
</script>

<style scoped>
.mosaic-card-group {
  display: grid;
}

.mosaic-card {
  min-width: 0;
  min-height: 0;
}
</style>
