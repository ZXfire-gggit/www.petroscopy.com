// Explicit one-time import of a user-authorized download; never run automatically.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = process.argv[2]
if (!sourcePath || path.extname(sourcePath).toLowerCase() !== '.pptx') {
  throw new Error('Usage: node scripts/prepare-download.mjs <authorized-source.pptx>')
}
const source = await readFile(sourcePath)
if (source.subarray(0, 2).toString() !== 'PK') throw new Error('The source must be an original PPTX ZIP document.')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const sha256 = hash(source)
const directory = `downloads/vpta-introduction/${sha256.slice(0, 16)}`
await mkdir(path.join(root, 'public', directory), { recursive: true })
const parts = []
const partSize = 16 * 1024 * 1024 // Below the hosting platform's 25 MiB asset limit.
for (let offset = 0; offset < source.length; offset += partSize) {
  const data = source.subarray(offset, Math.min(offset + partSize, source.length))
  const relativePath = `${directory}/part-${parts.length + 1}.bin`
  await writeFile(path.join(root, 'public', relativePath), data)
  parts.push({ path: relativePath, bytes: data.length, sha256: hash(data) })
}
const catalog = [{
  id: 'vpta-introduction-20261006',
  fileName: path.basename(sourcePath),
  bytes: source.length,
  sha256,
  mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  parts,
}]
await writeFile(path.join(root, 'src/config/downloads.generated.json'), JSON.stringify(catalog, null, 2) + '\n')
console.log(JSON.stringify({ fileName: catalog[0].fileName, bytes: source.length, sha256, parts: parts.length }))
