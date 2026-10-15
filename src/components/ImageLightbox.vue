<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { ui } from '../content/language.js'
defineProps({ src: { type: String, default: null }, alt: { type: String, required: true } })
const failed = ref(false)
const dialog = ref(null)
const trigger = ref(null)
function open() { dialog.value?.showModal() }
function close() { dialog.value?.close() }
function restoreFocus() { trigger.value?.focus({ preventScroll: true }) }
function keepFocusInside() { dialog.value?.querySelector('button')?.focus() }
function backdrop(event) { if (event.target === dialog.value) close() }
onBeforeUnmount(close)
</script>
<template>
  <figure class="scientific-figure">
    <button v-if="src && !failed" ref="trigger" class="figure-trigger" :aria-label="`${ui.zoom}：${alt}`" @click="open">
      <img :src="src" :alt="alt" @error="failed = true" />
      <span class="zoom-badge" aria-hidden="true">↗</span>
    </button>
    <div v-else class="image-placeholder"><strong>{{ ui.imageMissing }}</strong><span>{{ alt }}</span></div>
    <figcaption><span>{{ alt }}</span><span v-if="src && !failed">{{ ui.imageHelp }}</span></figcaption>
  </figure>
  <Teleport to="body">
    <dialog ref="dialog" class="image-dialog" :aria-label="alt" @click="backdrop" @close="restoreFocus" @keydown.tab.prevent="keepFocusInside">
      <div class="dialog-inner">
        <header class="dialog-toolbar"><span>{{ ui.modalHelp }}</span><button autofocus @click="close">{{ ui.close }} ×</button></header>
        <div class="original-image-scroll"><img :src="src" :alt="alt" /></div>
      </div>
    </dialog>
  </Teleport>
</template>
