<template>
  <div class="loop">
    Loop: <input type="checkbox" v-model="selectedLoop" />
  </div>
</template>

<script setup lang="ts">
import * as c from '~/assets/common'
const { $global } = useNuxtApp()

const selectedLoop = ref($global.loop.value)
watch(selectedLoop, (newVal) => {
  $global.loop.value = newVal
})
</script>
