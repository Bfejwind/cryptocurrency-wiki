import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const source = new URL('../images/icon.png', import.meta.url)
const output = new URL('../public/', import.meta.url)
await mkdir(output, { recursive: true })

// Encode the existing artwork at browser icon sizes; keep its proportions.
const resize = (size) => sharp(fileURLToPath(source))
  .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

for (const [name, size] of [['favicon-16.png', 16], ['favicon-32.png', 32], ['favicon.png', 48], ['apple-touch-icon.png', 180]]) {
  await resize(size).png().toFile(fileURLToPath(new URL(name, output)))
}

// ICO entries use uncompressed BGRA bitmaps for broad browser compatibility.
const sizes = [16, 32, 48]
const entries = []
const images = []
let offset = 6 + sizes.length * 16
for (const size of sizes) {
  const pixels = await resize(size).ensureAlpha().raw().toBuffer()
  const maskStride = Math.ceil(size / 32) * 4
  const bitmap = Buffer.alloc(40 + size * size * 4 + maskStride * size)
  bitmap.writeUInt32LE(40, 0)
  bitmap.writeInt32LE(size, 4)
  bitmap.writeInt32LE(size * 2, 8)
  bitmap.writeUInt16LE(1, 12)
  bitmap.writeUInt16LE(32, 14)
  bitmap.writeUInt32LE(size * size * 4, 20)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = 40 + ((size - 1 - y) * size + x) * 4
      bitmap[dst] = pixels[src + 2]
      bitmap[dst + 1] = pixels[src + 1]
      bitmap[dst + 2] = pixels[src]
      bitmap[dst + 3] = pixels[src + 3]
      if (pixels[src + 3] === 0) {
        bitmap[40 + size * size * 4 + (size - 1 - y) * maskStride + (x >> 3)] |= 0x80 >> (x % 8)
      }
    }
  }
  const entry = Buffer.alloc(16)
  entry[0] = size
  entry[1] = size
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(bitmap.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += bitmap.length
  entries.push(entry)
  images.push(bitmap)
}
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
await writeFile(new URL('favicon.ico', output), Buffer.concat([header, ...entries, ...images]))
console.log('Generated PNG, ICO, and Apple touch icons from images/icon.png.')
