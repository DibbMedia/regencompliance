import sharp from "sharp"
import { readFile, writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const svgPath = join(repoRoot, "app", "icon.svg")
const svg = await readFile(svgPath)

const targets = [
  { out: "app/icon.png", size: 512 },
  { out: "app/apple-icon.png", size: 180 },
  { out: "public/favicon.png", size: 64 },
  { out: "public/apple-touch-icon.png", size: 180 },
  { out: "public/icon-192.png", size: 192 },
  { out: "public/icon-512.png", size: 512 },
]

for (const { out, size } of targets) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  await writeFile(join(repoRoot, out), buf)
  console.log(`wrote ${out} (${size}x${size}, ${buf.length} bytes)`)
}

// favicon.ico — multi-resolution ICO with 16/32/48 sizes
const ico = await buildIco(svg, [16, 32, 48])
await writeFile(join(repoRoot, "app", "favicon.ico"), ico)
console.log(`wrote app/favicon.ico (16+32+48, ${ico.length} bytes)`)

async function buildIco(svgBuf, sizes) {
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(svgBuf, { density: 384 })
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
        .then((png) => ({ size, png })),
    ),
  )
  const headerSize = 6 + 16 * pngs.length
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  let offset = headerSize
  pngs.forEach(({ size, png }, i) => {
    const dim = size === 256 ? 0 : size
    const entry = 6 + i * 16
    header.writeUInt8(dim, entry + 0)
    header.writeUInt8(dim, entry + 1)
    header.writeUInt8(0, entry + 2)
    header.writeUInt8(0, entry + 3)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...pngs.map((p) => p.png)])
}
