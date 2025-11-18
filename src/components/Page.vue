<template>
    <div class="page relative innerpage card p-0 overflow-hidden bg-pfblue" >
        <div class="page-content flex flex-col h-full relative ">
            <div class="absolute inset-0  z-0 bg-linear-to-b from-blue-900 to-black/0" ></div>
            <div class="absolute inset-0  opacity-50 mix-blend-multiply" :style="bgStyle(getPageImageUrl())"></div>


            
            <h2 
                v-if="categoryName" 
                class="text-3xl font-black text-white py-3 px-6 mx-auto mt-1 z-10 rounded-lg uppercase tracking-wider"
                style="text-shadow: 3px 3px 0px #1e40af;">
                {{ categoryName }}
            </h2>
            
            <div class="flex flex-wrap justify-evenly gap-2 sm:gap-3 grow px-2 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10" >
                <template v-for="(item, index) in groupedCards" :key="getItemKey(item, index)">
                    <!-- Mosaic Card Group -->
                    <div 
                        v-if="item.type === 'mosaic'"
                        class="card-wrapper"
                        :class="getMosaicWrapperClass(item.mosaicType)"
                    >
                        <MosaicCardGroup 
                            :cardIds="item.cardIds"
                            :mosaicType="item.mosaicType"
                        />
                    </div>
                    
                    <!-- Single Card -->
                    <div 
                        v-else
                        class="card-wrapper"  
                        :class="getSingleCardWrapperClass(item.card.disposition)"
                    >
                        <!-- Show CardView if user owns the card, otherwise show placeholder -->
                        <CardView 
                            v-if="userStore.ownsCard(item.card.identifier)" 
                            :cardId="item.card.identifier" 
                        />
                        
                        <!-- Placeholder for unowned cards -->
                        <div 
                            v-else
                            class="relative card card-slot border w-full h-full bg-white/80 p-1 sm:p-2 rounded-[6%] gap-0.5 sm:gap-1 flex flex-col justify-center items-center text-center text-white"
                        >
                            <IdentifierBadge :identifier="item.card.identifier" class="relative" />
                            <div class="text-[0.65rem] sm:text-xs text-gray-600 px-0.5 leading-tight">
                                {{ getCardDescription(item.card.identifier).slice(0, 10) }}{{ getCardDescription(item.card.identifier).length > 12 ? '...' : '' }}
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            
            <!-- Page Number -->
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div 
                    class="px-3 py-1 rounded-full text-sm font-bold transition-all duration-300"
                    :class="isCurrentPage ? 'bg-amber-500 animate-bounce text-white shadow-lg scale-110' : 'bg-white/80 text-gray-600'">
                    {{ (thisPage ?? 0) + 2 }}
                </div>
            </div>
            
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPageInfo } from '../utils/pageDistribution'
import { useUserStore } from '../stores/user'
import { useAlbumStore } from '../stores/album'
import CardView from './CardView.vue'
import IdentifierBadge from './IdentifierBadge.vue'
import MosaicCardGroup from './MosaicCardGroup.vue'
import type { CardWithPage } from '../utils/pageDistribution'
import { cardsDatabase } from '../data/cards'

interface Props {
  thisPage?: number;
}

const props = defineProps<Props>();
const userStore = useUserStore()
const albumStore = useAlbumStore()

const isCurrentPage = computed(() => {
  // Account for the physical page structure: covers + index + content pages
  // thisPage starts at 1 for first content page
  // currentPage: 0=front cover, 1=index, 2+=content pages
  return albumStore.currentPage === (props.thisPage ?? 0) + 1
})

const categoryName = computed(() => {
  if (!props.thisPage) return null
  const info = getPageInfo(props.thisPage)
  return info?.categoryName || null
})

const pageCards = computed(() => {
  if (!props.thisPage) return []
  const info = getPageInfo(props.thisPage)
  return info?.cards || []
})

// Group cards: detect mosaics and group them together
const groupedCards = computed(() => {
  const cards = pageCards.value
  const result: Array<{ type: 'single', card: CardWithPage } | { type: 'mosaic', mosaicType: 'Horizontal2' | 'Horizontal4' | 'Vertical4', cardIds: number[] }> = []
  let i = 0
  
  while (i < cards.length) {
    const card = cards[i]
    if (!card) {
      i++
      continue
    }
    
    const disposition = card.disposition
    
    // Check if this is a mosaic card type
    if (disposition === 'Horizontal2' || disposition === 'Horizontal4' || disposition === 'Vertical4') {
      const mosaicSize = disposition === 'Horizontal2' ? 2 : 4
      const cardIds: number[] = []
      
      // Collect the next mosaicSize cards with the same disposition
      for (let j = 0; j < mosaicSize && (i + j) < cards.length; j++) {
        const mosaicCard = cards[i + j]
        if (mosaicCard && mosaicCard.disposition === disposition) {
          cardIds.push(mosaicCard.identifier)
        } else {
          break
        }
      }
      
      // Only create mosaic group if we have the complete set
      if (cardIds.length === mosaicSize) {
        result.push({
          type: 'mosaic',
          mosaicType: disposition,
          cardIds
        })
        i += mosaicSize
      } else {
        // If incomplete, treat as single cards
        result.push({ type: 'single', card })
        i++
      }
    } else {
      // Regular single card
      result.push({ type: 'single', card })
      i++
    }
  }
  
  return result
})

// Helper function to get wrapper class for single cards
function getSingleCardWrapperClass(disposition?: string) {
  if (disposition === 'Horizontal') {
    return 'w-[80px] h-[64px] sm:w-[100px] sm:h-[80px] md:w-[120px] md:h-[96px]' // 5:4 aspect ratio, horizontal, responsive
  }
  return 'w-[64px] h-[80px] sm:w-[80px] sm:h-[100px] md:w-[96px] md:h-[120px]' // 4:5 aspect ratio, vertical (default), responsive
}

// Helper function to get wrapper class for mosaic groups
function getMosaicWrapperClass(mosaicType: 'Horizontal2' | 'Horizontal4' | 'Vertical4') {
  if (mosaicType === 'Horizontal2') {
    return 'w-[160px] h-[64px] sm:w-[200px] sm:h-[80px] md:w-[240px] md:h-[96px]' // 2 horizontal cards side by side, responsive
  } else if (mosaicType === 'Horizontal4') {
    return 'w-[160px] h-[128px] sm:w-[200px] sm:h-[160px] md:w-[240px] md:h-[192px]' // 2x2 grid of horizontal cards, responsive
  } else if (mosaicType === 'Vertical4') {
    return 'w-[128px] h-[160px] sm:w-[160px] sm:h-[200px] md:w-[192px] md:h-[240px]' // 2x2 grid of vertical cards, responsive
  }
  return ''
}

// Generate unique key for each item in the grouped cards
function getItemKey(item: any, index: number): string {
  if (item.type === 'mosaic') {
    return `mosaic-${item.mosaicType}-${item.cardIds.join('-')}`
  } else {
    return `single-${item.card.identifier}-${index}`
  }
}

const getPageImageUrl = () => {
  if (!props.thisPage) return ''
  // Use import.meta.env.BASE_URL to handle the base path correctly
  const basePath = import.meta.env.BASE_URL
  return `${basePath}pages/page${props.thisPage}.webp`
}

function bgStyle(url: string) {
    return url ? {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {};
}

// Get card description from database
function getCardDescription(identifier: number) {
  const cardData = cardsDatabase.find(c => c.identifier === identifier)
  return cardData?.desc || ''
}

</script>

<style scoped>
.card-wrapper {
  flex-shrink: 0;
  flex-grow: 0;
}
</style>