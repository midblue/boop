const globalData = {
  bpm: ref(100),
  waveType: ref('sine') as Ref<
    'sine' | 'square' | 'sawtooth' | 'triangle'
  >,
  chordType: ref('major') as Ref<
    'major' | 'minor' | 'pentatonic'
  >,
  possibleChordTypes: ['major', 'minor', 'pentatonic'],
  volume: ref(0.5),
  loop: ref(false),
}

export default defineNuxtPlugin((nuxt) => {
  nuxt.provide('global', globalData)
})

declare module '#app' {
  interface NuxtApp {
    $global: typeof globalData
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $global: typeof globalData
  }
}
