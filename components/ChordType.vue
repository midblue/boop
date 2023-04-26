<template>
  <div class="chordtype">
    {{ $global.chordType }}

    <select v-model="selectedChordType">
      <option
        v-for="chordType in $global.possibleChordTypes"
        :value="chordType"
      >
        {{ chordType }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/assets/common'
const { $global } = useNuxtApp()

const selectedChordType = ref($global.chordType.value)
watch(selectedChordType, (newVal) => {
  $global.chordType.value = newVal
})
</script>
