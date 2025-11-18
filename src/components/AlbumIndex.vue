<template>
<div>
    
    <div class="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
        <button class="btn-outline grow" @click="navigateToPortada">Portada</button>
        <template v-for="category in categoryDistribution">
            <button class="btn-outline grow" @click="navigateToCategory(category.categoryId)">{{ category.categoryName }}</button>
        </template>
        <button class="btn-outline grow" @click="navigateToContraportada">Contraportada</button>
    </div>
    
</div>
</template>

<script setup lang="ts">
import { useAlbumStore } from '../stores/album';
import { computed } from 'vue';

const albumStore = useAlbumStore();
const emit = defineEmits<{
  navigate: []
}>()

// Get category distribution for the buttons
const categoryDistribution = computed(() => albumStore.categoryDistribution);



// Navigation function to go to a specific category
const navigateToCategory = (categoryId: number) => {
  const categoryPages = albumStore.getCategoryPages(categoryId);
  if (categoryPages && categoryPages.pages.length > 0) {
    // Navigate to the first page of this category
    // Add 2 to account for front cover (0) and index page (1)
    const firstPageOfCategory = categoryPages.startPage + 1; // startPage is 1-indexed, add 1 more for covers
    albumStore.goToPage(firstPageOfCategory);
    
    console.log(`Navigated to ${categoryPages.categoryName} (physical page ${firstPageOfCategory})`);
    
    // Emit navigate event to close dropdown
    emit('navigate')
  }
};

// Navigate to front cover (first page)
const navigateToPortada = () => {
  albumStore.goToPage(0);
  emit('navigate');
};

// Navigate to back cover (last page)
const navigateToContraportada = () => {
  albumStore.goToLastPage();
  emit('navigate');
};



</script>