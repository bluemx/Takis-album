<template>
<div class="w-full max-w-6xl mx-auto p-0.5 md:p-4 rounded-xl relative my-20 select-none">

    <UserProfile />

    <div id="album" ref="albumRef" class="w-full">
        <div class="page page-cover page-cover-top" data-density="hard">
            <div class="page-content h-full card rounded-l-none" :style="bgStyle(coverImage)">

            </div>
        </div>

        <div class="page page-cover page-cover-top relative bg-purple-900" >
            <div class="page-content h-full bg-purple-900 flex flex-col justify-evenly items-center card rounded-r-none"  >
                <div class="absolute inset-0  z-0 bg-linear-to-b from-purple-900 to-black/0" ></div>
                <div class="absolute inset-0  opacity-50 mix-blend-multiply" :style="bgStyle(coverBackImage)"></div>

                <div class="max-w-md mx-auto card bg-white/20 backdrop-blur-xl px-8 relative z-10">
                    <div class="text-center font-bold text-2xl mb-4 text-white">Índice</div>
                    <AlbumIndex /> 
                </div>
            </div>
        </div>
        <!-- PAGES # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # -->
        <template v-for="page in albumStore.totalPages" :key="`page-${page}`">
            <Page :this-page="page" />
        </template>
        <!-- PAGES # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # -->
        
        <div class="page page-cover page-cover-bottom"  data-density="hard">
            <div class="page-content h-full bg-amber-600 bg-cover bg-center card rounded-l-none"  :style="bgStyle(backImage)" >
            </div>
        </div>
    </div>
</div>
</template>
<script setup lang="ts">
// @ts-ignore - pageflip utility doesn't have types
import { startFlip as startFlipUtil, goToPageFromHash as goToPageFromHashUtil } from '../utils/pageflip.js';
import { ref, onMounted, watch } from 'vue';
import { useAlbumStore } from '../stores/album';
import Page from './Page.vue';
import UserProfile from './UserProfile.vue';
import AlbumIndex from './AlbumIndex.vue';

// Use proper asset paths for public folder assets
const coverImage = `${import.meta.env.BASE_URL}pages/cover.webp`;
const coverBackImage = `${import.meta.env.BASE_URL}pages/cover_back.webp`;
const backImage = `${import.meta.env.BASE_URL}pages/back.webp`;


const albumStore = useAlbumStore();
const albumRef = ref<HTMLElement | null>(null);
const albumLandscape = ref<boolean>(false);
const pageFlipInstance = ref<any>(null);
const isUpdatingFromStore = ref(false);

const toPage = (pageNumber: number) => {
    if (pageFlipInstance.value) {
        pageFlipInstance.value.flip(pageNumber);
    }
};

function goToPageFromHash() {
    if(pageFlipInstance.value) {
        goToPageFromHashUtil(pageFlipInstance.value);
    }
}

// Expose the function to parent components
defineExpose({
    toPage,
    albumLandscape
});

const startFlip = async () => {
    try {
        pageFlipInstance.value = await startFlipUtil(albumRef, (e: any) => {
            const pageNum = (e.data || 0);
            window.location.hash = `p${pageNum}`;
            
            // Update AlbumStore when pageFlip changes (avoid circular updates)
            if (!isUpdatingFromStore.value) {
                albumStore.goToPage(pageNum);
            }
        });
        
        if (pageFlipInstance.value) {
            albumLandscape.value = pageFlipInstance.value.getOrientation() === 'landscape';
            // Update store orientation
            albumStore.setOrientation(albumLandscape.value);
            
            pageFlipInstance.value.on('changeOrientation', (_e: any) => {
                if (pageFlipInstance.value) {
                    albumLandscape.value = pageFlipInstance.value.getOrientation() === 'landscape';
                    // Update store orientation when pageFlip orientation changes
                    albumStore.setOrientation(albumLandscape.value);
                }
            });
            
            // Sync initial page with store
            pageFlipInstance.value.flip(albumStore.currentPage);
        }
        goToPageFromHash();
        window.addEventListener('hashchange', goToPageFromHash);
    } catch (error) {
        console.error('Failed to initialize page flip:', error);
    }
};

// Watch for AlbumStore changes and sync to pageFlip
watch(() => albumStore.currentPage, (newPage) => {
    if (pageFlipInstance.value && !isUpdatingFromStore.value) {
        isUpdatingFromStore.value = true;
        pageFlipInstance.value.flip(newPage);
        // Reset flag after a short delay to allow pageFlip to complete
        setTimeout(() => {
            isUpdatingFromStore.value = false;
        }, 100);
    }
});



function bgStyle(url: string) {
    return url ? {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : {};
}


onMounted(async () => {
    await startFlip();
});

</script>

<style scoped>
.innerpage:nth-child(odd) {
 border-top-left-radius: 0;
 border-bottom-left-radius: 0;
}
.innerpage:nth-child(even) {
 border-top-right-radius: 0;
 border-bottom-right-radius: 0;
}
</style>