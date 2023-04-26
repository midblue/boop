<template>
  <div class="volume flex">
    <div class="slider padright">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        v-model="selectedVolume"
      />
    </div>
    <div class="value">{{ $global.volume }}</div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/assets/common'
const { $global } = useNuxtApp()

const selectedVolume = ref($global.volume.value)
watch(selectedVolume, (newVal) => {
  $global.volume.value = c.r2(parseFloat(`${newVal}`), 2)
})
</script>
