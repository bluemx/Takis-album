<template>
<div  class="md:absolute top-0 bottom-0 right-1/2 left-0 w-full md:w-1/2 h-full p-0 flex flex-col items-center justify-center gap-8 mb-4 lg:mb-0">
    <div>
        <div class="card rounded-full aspect-square p-0 h-fit w-fit mx-auto flex justify-center items-center max-w-32 lg:max-w-60">
            <img class="size-32 lg:size-60 aspect-square  shrink-0 object-cover rounded-full  mx-auto" alt="@hunvreus" :src="userStore.avatar">
        </div>
        <div class="card py-2 px-5 mt-2 text-white w-full bg-white/20 backdrop-blur-xl text-shadow-lg">
            <strong>{{ userStore.name }}</strong>
        </div>
    </div>

    <UserCollection  />
</div>

</template>


<script setup lang="ts">
import { useUserStore } from '../stores/user'

import UserCollection from './UserCollection.vue';

const userStore = useUserStore();


</script>