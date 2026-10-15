import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = path.join(root, process.argv.includes('--dist') ? 'dist' : 'public')
const catalog = JSON.parse(await readFile(path.join(root, 'src/config/downloads.generated.json'), 'utf8'))
assert(catalog.length > 0)
for (const file of catalog) {
  const hash = createHash('sha256')
  let size = 0
  for (const part of file.parts) {
    const target = path.resolve(publicDirectory, part.path)
    assert(target.startsWith(publicDirectory + path.sep), 'Download paths must stay in the asset directory.')
    assert.equal((await stat(target)).size, part.bytes)
    assert(part.bytes < 25 * 1024 * 1024, 'Each hosting asset must be smaller than 25 MiB.')
    const data = await readFile(target)
    assert.equal(createHash('sha256').update(data).digest('hex'), part.sha256)
    hash.update(data)
    size += data.length
  }
  assert.equal(size, file.bytes)
  assert.equal(hash.digest('hex'), file.sha256, 'Reassembled file must match the authorized original.')
  console.log(`PASS: ${file.fileName} (${file.bytes} bytes), complete SHA-256 verified in ${path.basename(publicDirectory)}.`)
}
