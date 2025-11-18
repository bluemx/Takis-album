<template>
    <div class="card w-full max-h-96 overflow-scroll">
        <pre>
            <code>
                {{ JSON.stringify(mod , null, 2) }}
            </code>
        </pre>
    </div>
</template>
<script setup lang="ts">
import { useAlbumStore } from '../stores/album';

const albumStore = useAlbumStore();


const cardWithId = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,148,149,150,151,152,153,154,155,156,157,158,159,160,161,163,164,165,166,167,168,169,170,171,172,173,174,175,177,178,179,180,181,182,184,186,187,188,189,190,191,192,193,195,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262]

const filtered = albumStore.listOfCards.filter(card => cardWithId.includes(card.identifier));

const mod = filtered.map(card => ({
    identifier: card.identifier,
    description: card.desc,
    resource: card.identifier+'.webp',
    type: 'normal',
    token: '5'
}));

</script>