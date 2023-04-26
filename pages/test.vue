<template>
  <textarea v-model="originalString" />
  <div class="pre">{{ originalString }}</div>
  <div class="pre">{{ morseCodeString }}</div>
  <div><button @click="go">Go</button></div>
</template>

<script setup lang="ts">
import type p5 from 'p5'
import { Oscillator } from 'p5'
import type p5Sound from 'p5/lib/addons/p5.sound'
import * as c from '~/assets/common'
const { $global } = useNuxtApp()

interface Note {
  frequency: number
  amplitude: number
  duration: number
}

useHead({
  script: [
    {
      src: './p5.js',
      type: 'text/javascript',
    },
    {
      src: './p5.sound.js',
      type: 'text/javascript',
    },
  ],
})

const originalString = ref(`When the last days come
We shall see visions
More vivid than sunsets
Brighter than stars
We will recognize each other
And see ourselves for the first time
The way we really are`)
const morseCodeString = computed(() => {
  return c.stringToMorseCode(originalString.value)
})

function morseCodeCharToFrequencyAmplitudeAndDuration(
  singlePartOfChar: '.' | '-' | ' ' | '/' | '\n',
  word?: string,
  originalChar?: string,
): Note {
  if (!word) word = 'test'
  if (!originalChar) originalChar = 't'

  const baseFrequency = 261.63
  // const cScaleFrequencies = [
  //   261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88,
  //   523.25,
  // ]
  const scaleIntervals = {
    major: [
      1, 1.12242, 1.25991, 1.33482, 1.4983, 1.68176, 1.8877,
      2,
    ],
    pentatonic: [1, 1.12242, 1.25991, 1.4983, 1.68176, 2],
    minor: [
      1, 1.05946, 1.18921, 1.33482, 1.4983, 1.68176, 1.8877,
      2,
    ],
  }
  const scaleType = $global.chordType.value
  const wordBaseNote =
    baseFrequency *
    scaleIntervals[scaleType][
      word.charCodeAt(0) % scaleIntervals[scaleType].length
    ]
  const octaveMultipliers = [0.5, 1, 2]
  const secondaryMultipliers = [
    1,
    // 1.33482,
    1.4983,
  ]
  const charMultiplier =
    secondaryMultipliers[
      originalChar.charCodeAt(0) %
        secondaryMultipliers.length
    ]
  // c.log(
  //   singlePartOfChar,
  //   word,
  //   originalChar,
  //   wordBaseNote,
  //   charMultiplier,
  // )
  let frequency = wordBaseNote * charMultiplier
  let amplitude = 0.5
  let duration = 0.5
  if (singlePartOfChar === '.') {
    amplitude = 0.5
    duration = 0.25
  } else if (singlePartOfChar === '-') {
    frequency *= 0.5
    amplitude = 0.5
    duration = 2
  } else if (singlePartOfChar === ' ') {
    amplitude = 0
    duration = 0.5
  } else if (singlePartOfChar === '/') {
    amplitude = 0
    duration = 1
  } else if (singlePartOfChar === '\n') {
    amplitude = 0
    duration = 2
  }
  return { frequency, amplitude, duration: duration * 2 }
}

const notesOfMorseCodeString = computed(() => {
  const output: Note[] = []
  const lines = originalString.value.split('\n')
  for (let line of lines) {
    const words = line.split(' ')
    for (let word of words) {
      for (let char of word) {
        const inMorseCode = c.stringToMorseCode(char)
        for (let i = 0; i < inMorseCode.length; i++) {
          output.push(
            morseCodeCharToFrequencyAmplitudeAndDuration(
              inMorseCode[i] as any,
              word,
              char as any,
            ),
          )
        }
        output.push(
          morseCodeCharToFrequencyAmplitudeAndDuration(' '),
        )
      }
      output.push(
        morseCodeCharToFrequencyAmplitudeAndDuration('/'),
      )
    }
    output.push(
      morseCodeCharToFrequencyAmplitudeAndDuration('\n'),
    )
  }
  return output //.slice(0, 9)
})

const oscillatorCount = ref(15)
const oscillators = ref<p5.Oscillator[]>([])
const envelopes = ref<p5.Envelope[]>([])
const fft = ref<p5.FFT | null>(null)
const waveform = ref<number[] | null>(null)
const attackTime = ref(0.01)
const decayTime = ref(0.05)
const susPercent = ref(0.2)
const releaseTime = ref(0.05)

const isPlaying = ref(false)
const oscillatorIndex = ref(0)
const notesToPlay = ref([...notesOfMorseCodeString.value])
const bpm = $global.bpm

// watch notesOfMorseCodeString
watch(
  notesOfMorseCodeString,
  (newVal, oldVal) => {
    c.log('notesOfMorseCodeString changed')
    notesToPlay.value = [...newVal]
  },
  {
    deep: true,
  },
)

function go() {
  const p5 = (window as any)?.p5
  const p5Instance = new p5((p: p5) => {
    p.setup = () => {
      p.createCanvas(710, 200)
      //Options: 'sine' (default), 'triangle', 'sawtooth', 'square'
      for (let i = 0; i < oscillatorCount.value; i++) {
        const envelope = new p5.Envelope()
        envelopes.value.push(envelope)

        const oscillator = new p5.Oscillator(
          'sine',
        ) as Oscillator
        oscillators.value.push(oscillator)
        oscillator.start()
        oscillator.amp(envelope.value || 0)
      }

      // for drawing the waveform
      fft.value = new p5.FFT()
      waveform.value = fft.value!.waveform()
    }

    p.draw = () => {
      p.background(255)

      const waveform = fft.value!.waveform()
      p.beginShape()
      p.strokeWeight(5)
      for (let i = 0; i < waveform.length; i++) {
        const x = p.map(i, 0, waveform.length, 0, p.width)
        const y = p.map(waveform[i], -1, 1, 0, p.height)
        p.vertex(x, y)
      }
      p.endShape()
    }

    const playNote = async (note: Note) => {
      return new Promise<void>((resolve) => {
        const durationAtBpm =
          (note.duration * 60) / bpm.value
        setTimeout(() => {
          resolve()
        }, durationAtBpm * 1000)

        const oscillator =
          oscillators.value![oscillatorIndex.value]
        const envelope =
          envelopes.value![oscillatorIndex.value]

        if (!note.amplitude) return
        oscillator.freq(note.frequency)
        envelope.setRange(
          note.amplitude * $global.volume.value,
          0,
        )
        releaseTime.value = durationAtBpm * durationAtBpm
        envelope.setADSR(
          attackTime.value,
          decayTime.value,
          susPercent.value,
          releaseTime.value,
        )
        envelope.play(oscillator)

        oscillatorIndex.value =
          (oscillatorIndex.value + 1) %
          oscillatorCount.value
      })
    }

    const playNotesInOrder = async (
      remainingNotes: Note[],
    ) => {
      // const notesToPlayAtOnce: Note[] = []
      let note = remainingNotes.shift()
      if (!note) {
        return
      }
      // while (true) {
      //   if (!note?.amplitude && (note?.duration || 0) >= 1)
      //     break
      //     if (!note) break
      //   notesToPlayAtOnce.push(note)
      //   note = remainingNotes.shift()
      // }
      // if (!notesToPlayAtOnce.length) {
      //   isPlaying.value = false
      //   remainingNotes = [
      //     ...notesOfMorseCodeString.value,
      //   ]
      //   return
      // }
      // c.log(notesToPlayAtOnce)

      // const promises = notesToPlayAtOnce.map((note) =>
      await playNote(note)
      // )
      // await Promise.all(promises)
      playNotesInOrder(remainingNotes)
    }

    const splitIntoWords = (notes: Note[]) => {
      c.log(notes.length, 'notes in words')
      let words: Note[][] = []
      let word: Note[] = []
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        if (
          !note?.amplitude &&
          (note?.duration || 0) >= 1
        ) {
          words.push(word)
          word = []
        } else {
          word.push(note)
        }
      }
      words.push(word)
      words = words.filter((w) => w.length)
      c.log(words.length, 'words')
      return words
    }

    const playWord = async (word: Note[]) => {
      let letters: Note[][] = []
      for (let i = 0; i < word.length; i++) {
        const letter: Note[] = []
        let note = word[i]
        while (true) {
          if (!note?.amplitude) break
          if (!note) break
          letter.push(note)
          note = word[++i]
        }
        letters.push(letter)
      }
      letters = letters.filter(
        (l) => l.length && l[0].amplitude,
      )
      c.log(
        letters.length,
        'letters',
        letters.map((l) => l.length),
      )
      // const promises = letters.map((notes) =>
      //   playNotesInOrder(notes),
      // )
      for (let letter of letters) {
        await playNotesInOrder(letter)
      }
      // await Promise.all(promises)
    }

    p.mousePressed = async () => {
      if (isPlaying.value) {
        if (
          p.mouseX > 0 &&
          p.mouseX < p.width &&
          p.mouseY > 0
        ) {
          attackTime.value = p.map(
            p.mouseX,
            0,
            p.width,
            0.001,
            0.3,
          )
          susPercent.value = p.map(
            p.mouseY,
            0,
            p.height,
            0.01,
            0.8,
          )
        }
        return
      }
      // envelope.value!.play(oscillator.value!)

      isPlaying.value = true

      const play = async () => {
        for (let word of splitIntoWords(notesToPlay.value))
          await playWord(word)
      }

      await play()
      while ($global.loop.value) {
        await play()
      }

      isPlaying.value = false
    }
  }, 'sketch')
}
</script>

<style lang="scss" scoped>
div {
  color: red;
}
</style>
