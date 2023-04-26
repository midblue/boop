<template>
  test
  <div>{{ count }}</div>
  {{ double }}
</template>

<script setup lang="ts">
const count = ref(1)
const double = computed(() => count.value * 2)
</script>
