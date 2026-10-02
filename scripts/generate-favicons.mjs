import { copyFile, mkdir } from 'node:fs/promises'

// Preserve the supplied ICO exactly; Vite fingerprints the HTML reference.
// Also serve it at the conventional URL for browsers requesting /favicon.ico.
const source = new URL('../images/favicon.ico', import.meta.url)
const output = new URL('../public/', import.meta.url)
await mkdir(output, { recursive: true })
await copyFile(source, new URL('favicon.ico', output))
console.log('Copied images/favicon.ico to public/favicon.ico without modification.')
