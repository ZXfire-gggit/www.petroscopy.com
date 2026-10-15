async function readPart(response, expectedSize, onBytes) {
  if (!response.ok) throw new Error(`Download HTTP ${response.status}`)
  if (!response.body) {
    const data = new Uint8Array(await response.arrayBuffer())
    if (data.byteLength !== expectedSize) throw new Error('Unexpected download size')
    onBytes(data.byteLength)
    return data
  }
  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > expectedSize) throw new Error('Unexpected download size')
      chunks.push(value)
      onBytes(value.byteLength)
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
  if (received !== expectedSize) throw new Error('Incomplete download')
  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}

// One visitor action produces one intact original file, regardless of asset limits.
export async function downloadFile(file, { signal, onProgress }) {
  const parts = []
  let received = 0
  for (const part of file.parts) {
    signal.throwIfAborted()
    const response = await fetch(`${import.meta.env.BASE_URL}${part.path}`, { signal })
    const bytes = await readPart(response, part.bytes, count => {
      received += count
      onProgress(received, file.bytes)
    })
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    const actualHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
    if (actualHash !== part.sha256) throw new Error('Download integrity check failed')
    parts.push(bytes)
  }
  signal.throwIfAborted()
  if (received !== file.bytes) throw new Error('Incomplete download')
  const url = URL.createObjectURL(new Blob(parts, { type: file.mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = file.fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser time to accept the download before releasing its Blob URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
