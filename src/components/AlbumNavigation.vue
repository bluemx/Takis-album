<script setup lang="ts">
import { useAlbumStore } from '../stores/album';
import { Icon } from '@iconify/vue';
import { ref, onMounted, watch } from 'vue';

interface Props {
  currentPage?: number;
}

defineProps<Props>();
const albumStore = useAlbumStore();
const sliderRef = ref<HTMLInputElement>();

const updateSlider = (el: HTMLInputElement) => {
  const min = parseFloat(el.min || '0');
  const max = parseFloat(el.max || '100');
  const value = parseFloat(el.value);
  const percent = (max === min) ? 0 : ((value - min) / (max - min)) * 100;
  el.style.setProperty('--slider-value', `${percent}%`);
};

const onSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newPage = parseInt(target.value);
  albumStore.goToPage(newPage);
  updateSlider(target);
};

onMounted(() => {
  if (sliderRef.value) {
    updateSlider(sliderRef.value);
  }
});

// Watch for currentPage changes to update slider visual
watch(() => albumStore.currentPage, (newPage) => {
  if (sliderRef.value) {
    // First update the slider's actual value to match the store
    sliderRef.value.value = newPage.toString();
    // Then update the CSS custom property for visual styling
    updateSlider(sliderRef.value);
  }
});
</script>

<template>

  <div class="flex items-center gap-2 md:fixed bottom-2 left-1 right-1 bg-white p-2 rounded-lg shadow-md bg-pattern w-full md:w-auto max-w-6xl mx-auto">



    <button 
      @click="albumStore.previousPage()" 
      :disabled="!albumStore.canGoPrevious"
      class="btn"
    >
    <Icon icon="ph:arrow-fat-line-left-duotone" />
    </button>
    
    <div class="flex-1 flex flex-col items-center gap-1">
      <span class="badge -mt-8 mb-2">
        {{ albumStore.currentPage + 1 }} / {{ albumStore.totalPhysicalPages }}
      </span>

      <div class="w-full">
        
        <input 
          ref="sliderRef"
          type="range" 
          :min="0" 
          :max="albumStore.totalPhysicalPages - 1"
          :value="albumStore.currentPage"
          @input="onSliderChange"
          class="input w-full"
        />
      </div>
    </div>
    
    <button 
      @click="albumStore.nextPage()" 
      :disabled="!albumStore.canGoNext"
      class="btn"
    >
      <Icon icon="ph:arrow-fat-line-right-duotone" />
    </button>
  </div>
</template>

<style scoped>
/* Basecoat CSS handles most styling, minimal custom styles needed */
</style>