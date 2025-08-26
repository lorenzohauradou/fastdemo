export interface MeshGradientConfig {
  colors: string[]
  seed: number
}

const MESH_COLOR_PALETTES = [
  ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140', '#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef', '#fecfef', '#ff9a9e'],
  ['#a8edea', '#fed6e3', '#d299c2', '#fef9d7'],
  ['#667eea', '#764ba2', '#6B73FF', '#9A9CFF'],
  ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
  ['#54a0ff', '#5f27cd', '#00d2d3', '#ff9ff3'],
  ['#ff6348', '#ffb142', '#7bed9f', '#70a1ff'],
  ['#2c2c54', '#40407a', '#706fd3', '#f7f1e3']
]

export function generateRandomMeshGradient(baseColor?: string): MeshGradientConfig {
  const seed = Math.floor(Math.random() * 10000)
  
  if (baseColor) {
    // Se abbiamo un colore base, generiamo variazioni di quel colore
    const colors = generateColorVariations(baseColor)
    return { colors, seed }
  } else {
    // Altrimenti scegliamo una palette casuale
    const palette = MESH_COLOR_PALETTES[Math.floor(Math.random() * MESH_COLOR_PALETTES.length)]
    return { colors: [...palette], seed }
  }
}

function generateColorVariations(baseColor: string): string[] {
  // Converte hex in HSL per generare variazioni
  const hsl = hexToHsl(baseColor)
  
  const variations = []
  for (let i = 0; i < 4; i++) {
    const hue = (hsl.h + (i * 30)) % 360 // Varia la tonalità
    const saturation = Math.max(0.3, Math.min(1, hsl.s + (Math.random() - 0.5) * 0.4)) // Varia la saturazione
    const lightness = Math.max(0.2, Math.min(0.8, hsl.l + (Math.random() - 0.5) * 0.3)) // Varia la luminosità
    
    variations.push(hslToHex(hue, saturation, lightness))
  }
  
  return variations
}

function hexToHsl(hex: string): { h: number, s: number, l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function generateMeshGradientCSS(config: MeshGradientConfig): string {
  const { colors } = config
  
  // Genera un mesh gradient complesso usando multiple radial-gradient
  const gradients = [
    `radial-gradient(at 40% 20%, ${colors[0]} 0px, transparent 50%)`,
    `radial-gradient(at 80% 0%, ${colors[1]} 0px, transparent 50%)`,
    `radial-gradient(at 0% 50%, ${colors[2]} 0px, transparent 50%)`,
    `radial-gradient(at 80% 50%, ${colors[3]} 0px, transparent 50%)`,
    `radial-gradient(at 0% 100%, ${colors[0]} 0px, transparent 50%)`,
    `radial-gradient(at 80% 100%, ${colors[1]} 0px, transparent 50%)`,
    `radial-gradient(at 40% 100%, ${colors[2]} 0px, transparent 50%)`
  ]
  
  return gradients.join(', ')
}

export function generateLinearGradientCSS(colors: string[], angle: number): string {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`
}
