import { log } from './log'

const skipWords = [
  `a`,
  `an`,
  `the`,
  `of`,
  `in`,
  `to`,
  `per`,
]
export function capitalize(string = ``, firstOnly = false) {
  return (string || ``)
    .toLowerCase()
    .split(` `)
    .map((s, index) => {
      if (skipWords.includes(s) && index > 0) return s
      if (firstOnly && index > 0) return s
      return (
        s.substring(0, 1).toUpperCase() +
        s.substring(1).toLowerCase()
      )
    })
    .join(` `)
}

export function slugify(s: string) {
  return encodeURIComponent(s.replace(/ /g, `_`))
}
export function unSlugify(s: string) {
  return decodeURIComponent(s.replace(/_/g, ` `))
}

export function clamp(
  lowerBound: number = 0,
  n: number = 0,
  upperBound: number = 1,
) {
  return Math.min(Math.max(lowerBound, n), upperBound)
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function lerp(
  a: number = 0,
  b: number = 0,
  t: number = 0,
  clamp = true,
) {
  if (clamp) t = Math.min(Math.max(t, 0), 1)
  return a + (b - a) * t
}

export function sum(...args: number[]): number {
  args = args.filter((a) => typeof a === `number`)
  return args.reduce((a, b) => a + b, 0)
}

// roundTo:
// @param number (number) Initial number
// @param decimalPlaces (number) Number of decimal places to round to
// @param floor? (boolean) If true, uses floor instead of round.
//
export function r2( // "round to"
  number: number = 0,
  decimalPlaces: number = 2,
  floor?: boolean | `ceil`,
): number {
  if (floor === true)
    return (
      Math.floor(number * 10 ** decimalPlaces) /
      10 ** decimalPlaces
    )
  if (floor === `ceil`)
    return (
      Math.ceil(number * 10 ** decimalPlaces) /
      10 ** decimalPlaces
    )
  return (
    Math.round(number * 10 ** decimalPlaces) /
    10 ** decimalPlaces
  )
}

export function parse(json: string) {
  try {
    return JSON.parse(json)
  } catch (e) {
    log(e, json)
    return false
  }
}

export function printList(
  list: string[],
  separator = `and`,
): string {
  if (!list || !list.length) return ``
  if (list.length === 1) return list[0]
  if (list.length === 2)
    return `${list[0]} ${separator} ${list[1]}`
  return (
    list.slice(0, list.length - 1).join(`, `) +
    `, ${separator} ` +
    list[list.length - 1]
  )
}

const morseCode = {
  a: `.-`,
  b: `-...`,
  c: `-.-.`,
  d: `-..`,
  e: `.`,
  f: `..-.`,
  g: `--.`,
  h: `....`,
  i: `..`,
  j: `.---`,
  k: `-.-`,
  l: `.-..`,
  m: `--`,
  n: `-.`,
  o: `---`,
  p: `.--.`,
  q: `--.-`,
  r: `.-.`,
  s: `...`,
  t: `-`,
  u: `..-`,
  v: `...-`,
  w: `.--`,
  x: `-..-`,
  y: `-.--`,
  z: `--..`,
  0: `-----`,
  1: `.----`,
  2: `..---`,
  3: `...--`,
  4: `....-`,
  5: `.....`,
  6: `-....`,
  7: `--...`,
  8: `---..`,
  9: `----.`,
  '.': `.-.-.-`,
  ',': `--..--`,
  '?': `..--..`,
  "'": `.----.`,
  '/': `-..-.`,
  '(': `-.--.`,
  ')': `-.--.-`,
  '&': `.-...`,
  ':': `---...`,
  ';': `-.-.-.`,
  '=': `-...-`,
  '+': `.-.-.`,
  '-': `-....-`,
  _: `..--.-`,
  '"': `.-..-.`,
  $: `...-..-`,
  '!': `-.-.--`,
  '@': `.--.-.`,
  ' ': `/`,
  '\n': `\n`,
}
export function stringToMorseCode(s: string) {
  return s
    .toLowerCase()
    .split(``)
    .map((c) => morseCode[c as keyof typeof morseCode] || c)
    .join(` `)
}
