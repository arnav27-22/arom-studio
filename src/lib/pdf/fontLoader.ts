import jsPDF from 'jspdf'

let fontsLoaded = false
let fontsLoading = false
let fontLoadPromise: Promise<boolean> | null = null

export async function ensureFontsLoaded(): Promise<boolean> {
  if (fontsLoaded) return true
  if (fontLoadPromise) return fontLoadPromise

  fontLoadPromise = loadFonts()
  return fontLoadPromise
}

async function loadFonts(): Promise<boolean> {
  if (fontsLoading) return false
  fontsLoading = true

  try {
    const fontFiles = [
      { path: '/fonts/NotoSans-Regular.ttf', name: 'NotoSans', style: 'normal', weight: '400' },
      { path: '/fonts/NotoSansDevanagari-Regular.ttf', name: 'NotoSansDevanagari', style: 'normal', weight: '400' },
    ]

    const loaded = await Promise.all(
      fontFiles.map(async (f) => {
        try {
          const resp = await fetch(f.path)
          if (!resp.ok) return false
          const buffer = await resp.arrayBuffer()
          const base64 = arrayBufferToBase64(buffer)
          const doc = new jsPDF({ unit: 'mm', format: 'a4' })
          doc.addFileToVFS(f.name + '.ttf', base64)
          doc.addFont(f.name + '.ttf', f.name, f.style, f.weight)
          fontsLoaded = true
          return true
        } catch {
          return false
        }
      })
    )

    fontsLoading = false
    return loaded.some(Boolean)
  } catch {
    fontsLoading = false
    return false
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function applyFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal') {
  doc.setFont('helvetica', style)
}
