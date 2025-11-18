<template>
  <div 
    class="min-w-10 w-1/5 aspect-square text-center font-bold flex justify-center items-center text-xs text-pfblue"
    :class="additionalClasses"
  >
    <span class="relative z-10">{{ formattedIdentifier }}</span>
    <img :src="idBg" class="absolute w-full object-cover z-0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import idBg from '../assets/cards/idbg.svg'

interface Props {
  identifier: number | string
  class?: string
}

const props = defineProps<Props>()

const formattedIdentifier = computed(() => {
  return props.identifier
})

const additionalClasses = computed(() => {
  return props.class || ''
})
</script>
