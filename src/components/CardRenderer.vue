<template>

  <div 
    ref="cardElement"
    class="cardview card-3d w-full relative overflow-hidden  rounded-[6%]" 
    v-if="props.base" 
    :class="ifCardClasses"
    @imageLoaded="handleImageLoaded"
  >

    <!-- 3D inner wrapper with aspect ratio -->
    <div class="card-inner relative preserve-3d" :class="[aspectClass, { 'rotate-360': shouldRotate }]">
      
      <!-- Front side of card -->
      <div class="card-face card-front">
        <!-- Loading placeholder (back cover) -->
        <img 
          v-if="!imageLoaded" 
          :src="backCover" 
          alt="Loading..." 
          class="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-300" 
        />
        
        <!-- Base content (video or image) - using template instead of v-html -->
        <div class="z-0 transition-opacity duration-300" :class="{ 'opacity-0': !imageLoaded }">
          <img 
            v-if="isImageContent" 
            :src="props.base" 
            alt="Base Image" 
            class="absolute top-0 left-0 w-full h-full object-cover"
            @load="handleImageLoaded"
            @error="handleImageLoaded"
          />
          <video 
            v-else-if="isVideoContent"
            autoplay loop muted playsinline 
            class="absolute top-0 left-0 w-full h-full object-cover"
            @loadeddata="handleImageLoaded"
            @error="handleImageLoaded"
          >
            <source :src="props.base" type="video/mp4">
          </video>
          <div v-else class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200">
            Unsupported format
          </div>
        </div>

        <!-- Overlay image revealed through a moving circular mask (reflection spot) -->
        <img
          v-if="overlayImg"
          class="overlay-image"
          :src="overlayImg"
          alt="Overlay"
        />
        <img
          v-if="overlayImg"
          class="overlay-image2"
          :src="overlayImg"
          alt="Overlay"
        />

        <!-- frame when isCard -->
        <div v-if="iscard" class="relative z-20 w-full h-full ">
            

            <img :src="borderTop" class="cardRenderer-borders absolute left-0 top-0 w-full">
            <img :src="borderBottom" class="cardRenderer-borders absolute left-0 bottom-0 w-full">
            <img :src="pfIcon" class="absolute top-1 right-1 aspect-square w-1/5" />
            
            <IdentifierBadge 
              v-if="identifier" 
              :identifier="identifier" 
              class="absolute left-1 bottom-1" 
            />

        </div>
      </div>

      <!-- Back side of card -->
      <div class="card-face card-back">
        <img :src="backCover" alt="Card Back" class="absolute top-0 left-0 w-full h-full object-cover" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import defaultOverlay from '../assets/cards/overlay.webp';
import backCover from '../assets/cards/back.webp';
import borderTop from '../assets/cards/borderT.svg';
import borderBottom from '../assets/cards/borderB.svg';
import pfIcon from '../assets/cards/pficon.svg';
import IdentifierBadge from './IdentifierBadge.vue';

const imageLoaded = ref(false)
const cardElement = ref<HTMLElement>()





interface Props {
  iscard: boolean;
  base: string;
  overlay?: string;
  identifier?: number;
  shouldRotate?: boolean;
  disposition?: string;
}

const ifCardClasses = computed(() => {
  return props.iscard ? ' overflow-hidden  ' : '';
});



const overlayImg = computed(() => {
  return props.overlay ? props.overlay : defaultOverlay;
});

const props = defineProps<Props>();

// Determine orientation from disposition prop
const orientation = computed<'vertical' | 'horizontal'>(() => {
  if (!props.disposition) return 'vertical' // Default fallback
  const disp = props.disposition.toLowerCase()
  // Check if disposition starts with 'horizontal'
  return disp.startsWith('horizontal') ? 'horizontal' : 'vertical'
})

const aspectClass = computed(() =>
  orientation.value === 'vertical' ? 'aspect-4/5' : 'aspect-5/4'
)

// Public orientation helpers
const isVertical = computed(() => orientation.value === 'vertical')
const isHorizontal = computed(() => orientation.value === 'horizontal')

// Content type detection
const isImageContent = computed(() => {
  const url = props.base
  if (url.startsWith('data:')) {
    return /data:image\/(png|jpeg|jpg|webp|gif)/i.test(url)
  }
  let path = typeof url === 'string' ? url : ''
  const qIndex = path.indexOf('?')
  if (qIndex >= 0) path = path.substring(0, qIndex)
  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) path = path.substring(0, hashIndex)
  const dotIndex = path.lastIndexOf('.')
  const extension = dotIndex >= 0 ? path.substring(dotIndex + 1).toLowerCase() : undefined
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')
})

const isVideoContent = computed(() => {
  const url = props.base
  if (url.startsWith('data:')) {
    return /data:video\/mp4/i.test(url)
  }
  let path = typeof url === 'string' ? url : ''
  const qIndex = path.indexOf('?')
  if (qIndex >= 0) path = path.substring(0, qIndex)
  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) path = path.substring(0, hashIndex)
  const dotIndex = path.lastIndexOf('.')
  const extension = dotIndex >= 0 ? path.substring(dotIndex + 1).toLowerCase() : undefined
  return extension === 'mp4'
})




// Handle image loaded event
function handleImageLoaded() {
  imageLoaded.value = true
}

// Reset loading state when base URL changes
watch(() => props.base, () => {
  imageLoaded.value = false
}, { immediate: true })

// Expose to parent via template ref if needed
defineExpose({ orientation, isVertical, isHorizontal })







</script>

<style scoped>




.overlay-image, .overlay-image2{
position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.overlay-image {
  

  mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 50%;
  mask-size: 100% 50%;
  -webkit-mask-position: 0% 0%;
  mask-position: 0% 0%;
  animation: overlaySweep 5.5s ease-in-out infinite;
}
.overlay-image2 {

  mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 1%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0) 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 70%;
  mask-size: 100% 70%;
  -webkit-mask-position: 0% 0%;
  mask-position: 0% 0%;
  animation: overlaySweep 6.5s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes overlaySweep {
  0%   { -webkit-mask-position: 0% -40%;    mask-position: 0% -40%; }
  50%  { -webkit-mask-position: 100% 140%;  mask-position: 100% 140%;  }

  100% { -webkit-mask-position: 0% -40%;    mask-position: 0% -40%; }
}

/* 3D card flip setup */
.preserve-3d {
  transform-style: preserve-3d;
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: inherit;
  overflow: hidden;
}

.card-front {
  z-index: 2;
}

.card-back {
  z-index: 1;
  transform: rotateY(180deg);
}

/* 360 degree rotation animation */
.rotate-360 {
  animation: rotate360 0.8s ease-in-out;
}

@keyframes rotate360 {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

</style>
