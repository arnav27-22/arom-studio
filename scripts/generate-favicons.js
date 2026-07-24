import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const svgPath = path.resolve('public/favicon.svg')
const svgBuffer = fs.readFileSync(svgPath)

async function generateFavicons() {
  console.log('Generating high-res PNG favicons from public/favicon.svg...')

  // 180x180 apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png')

  // 96x96 favicon
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile('public/favicon-96x96.png')

  // 192x192 web app manifest
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/web-app-manifest-192x192.png')

  // 512x512 web app manifest
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/web-app-manifest-512x512.png')

  // 48x48 favicon.ico replacement
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile('public/favicon.ico')

  console.log('All favicons updated successfully!')
}

generateFavicons().catch(console.error)
