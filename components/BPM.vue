<template>
  <div class="bpm flex">
    <div class="padright">{{ $global.bpm }}</div>
    <button @click="tap">Tap to set BPM</button>
    <div class="padleft">
      <div
        class="metronome"
        :style="{
          '--bpm': $global.bpm.value,
          '--bpmInSeconds': 60 / $global.bpm.value + 's',
        }"
      >
        <div class="slider"></div>
        <!-- <div class="slider2"></div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/assets/common'
const { $global } = useNuxtApp()

let beatEventTimestamps: number[] = [],
  timestampsResetTimeout: NodeJS.Timeout | null = null
const resetAfterMs = 2000
function tap() {
  if (beatEventTimestamps.length) {
    let avgBpm = 0
    for (let i = 0; i < beatEventTimestamps.length; i++) {
      const intervalBetweenTaps =
        beatEventTimestamps[i] -
        (beatEventTimestamps[i - 1] || 0)
      if (intervalBetweenTaps > resetAfterMs) continue
      const tapBpm = 60000 / intervalBetweenTaps
      if (!avgBpm) avgBpm = tapBpm
      else avgBpm = (avgBpm + tapBpm) / 2
    }
    if (avgBpm)
      $global.bpm.value = c.r2(
        c.lerp($global.bpm.value, avgBpm, 0.5),
        0,
      )
  }

  beatEventTimestamps.push(Date.now())
  if (beatEventTimestamps.length > 10)
    beatEventTimestamps.shift()

  if (timestampsResetTimeout)
    clearTimeout(timestampsResetTimeout)
  timestampsResetTimeout = setTimeout(() => {
    beatEventTimestamps = []
  }, resetAfterMs)
}
</script>

<style scoped lang="scss">
.bpm {
  .metronome {
    position: relative;
    pointer-events: none;
    width: 100px;
    height: 100%;
    pointer-events: none;
    background: black;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 100%;
      background: white;
    }

    .slider {
      position: absolute;
      top: 0;
      height: 100%;
      width: 3px;
      background: greenyellow;
      animation: backandforth calc(var(--bpmInSeconds) * 2)
        cubic-bezier(0.85, 0, 0.15, 1) infinite;
      left: 0;
    }
    .slider2 {
      position: absolute;
      top: 0;
      height: 100%;
      width: 2px;
      background: yellow;
      opacity: 0.5;
      animation: backandforth
        calc(var(--bpmInSeconds) * 0.666666 * 2) infinite;
      left: 0;
    }
  }
  @keyframes backandforth {
    0% {
      left: 0;
    }
    50% {
      left: 100%;
    }
    100% {
      left: 0;
    }
  }
}
</style>
