<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { ui } from '../content/language.js'
import catalog from '../config/downloads.generated.json'
import { downloadFile } from '../lib/download.js'

const active = ref(false)
const percent = ref(0)
const status = ref('')
let controller = null
async function start(file) {
  if (active.value) return
  active.value = true
  percent.value = 0
  status.value = 'loading'
  controller = new AbortController()
  try {
    await downloadFile(file, {
      signal: controller.signal,
      onProgress: (received, total) => { percent.value = Math.floor(received / total * 100) },
    })
    status.value = 'ready'
  } catch (error) {
    status.value = error.name === 'AbortError' ? 'cancelled' : 'failed'
  } finally {
    active.value = false
    controller = null
  }
}
function cancel() { controller?.abort() }
onBeforeUnmount(cancel)
</script>

<template>
  <section class="downloads-page">
    <div class="page-heading"><span class="eyebrow">DOWNLOAD</span><h1>Download</h1></div>
    <p>{{ ui.downloadIntro }}</p>
    <div v-for="file in catalog" :key="file.id" class="download-record">
      <div class="download-file-icon" aria-hidden="true">PPTX</div>
      <div class="download-file-details">
        <h2>{{ ui.downloadPresentation }}</h2>
        <p class="download-filename">{{ file.fileName }}</p>
        <p class="download-meta">PPTX · {{ (file.bytes / 1_000_000).toFixed(1) }} MB</p>
        <button class="download-button" :disabled="active" @click="start(file)">{{ active ? ui.downloadLoading : ui.downloadAction }}</button>
        <button v-if="active" class="download-cancel" @click="cancel">{{ ui.downloadCancel }}</button>
        <div v-if="active" class="download-progress"><progress :value="percent" max="100" :aria-label="ui.downloadProgress" /><span>{{ percent }}%</span></div>
        <p v-if="status" class="download-status" :class="{ 'is-error': status === 'failed' }" role="status" aria-live="polite">{{ ui[`downloadStatus_${status}`] }}</p>
      </div>
    </div>
  </section>
</template>
