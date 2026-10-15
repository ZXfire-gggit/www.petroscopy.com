<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { assets } from '../config/assets.js'
import { ui } from '../content/language.js'
const entry = ref(null)
const opened = ref(false)
const failed = ref(false)
const size = 64
const margin = 14
const position = ref(null)
const edge = ref('right')
const dragging = ref(false)
const expanded = computed(() => opened.value && !dragging.value)
const positionStyle = computed(() => position.value ? { left: `${position.value.x}px`, top: `${position.value.y}px` } : {})
const panelBelow = computed(() => position.value && position.value.y < 240)
let gesture = null
let ignoreClick = false

function bounds() {
  return { right: Math.max(margin, document.documentElement.clientWidth - size - margin), bottom: Math.max(margin, window.innerHeight - size - margin) }
}
function clamp(value, maximum) { return Math.min(Math.max(value, margin), maximum) }
function snap() {
  if (!position.value) return
  const limits = bounds()
  edge.value = position.value.x + size / 2 < (limits.right + size + margin) / 2 ? 'left' : 'right'
  position.value = { x: edge.value === 'left' ? margin : limits.right, y: clamp(position.value.y, limits.bottom) }
}
function beginDrag(event) {
  if (event.button !== 0) return
  ignoreClick = false
  const rectangle = event.currentTarget.getBoundingClientRect()
  gesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rectangle.left, y: rectangle.top, moved: false }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function moveDrag(event) {
  if (!gesture || gesture.id !== event.pointerId) return
  const dx = event.clientX - gesture.startX
  const dy = event.clientY - gesture.startY
  if (!gesture.moved && Math.hypot(dx, dy) < 5) return
  gesture.moved = true
  dragging.value = true
  opened.value = false
  const limits = bounds()
  position.value = { x: clamp(gesture.x + dx, limits.right), y: clamp(gesture.y + dy, limits.bottom) }
}
function finishDrag(event) {
  if (!gesture || gesture.id !== event.pointerId) return
  if (gesture.moved) {
    ignoreClick = true
    snap()
  }
  gesture = null
  dragging.value = false
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
}
function activate(event) {
  // Pointer release generates a click; dragging must not reopen the QR panel.
  if (ignoreClick) {
    ignoreClick = false
    if (event.detail !== 0) return
  }
  opened.value = !opened.value
}
function moveWithKeyboard(event) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  opened.value = false
  const limits = bounds()
  if (event.key === 'ArrowLeft') { edge.value = 'left'; position.value.x = margin }
  else if (event.key === 'ArrowRight') { edge.value = 'right'; position.value.x = limits.right }
  else position.value.y = clamp(position.value.y + (event.key === 'ArrowUp' ? -20 : 20), limits.bottom)
}
function resize() {
  if (!position.value) return
  const limits = bounds()
  position.value = { x: edge.value === 'left' ? margin : limits.right, y: clamp(position.value.y, limits.bottom) }
}
function closeOutside(event) {
  if (!entry.value?.contains(event.target)) opened.value = false
}
onMounted(() => {
  const limits = bounds()
  position.value = { x: limits.right, y: Math.max(margin, window.innerHeight - size - 28) }
  window.addEventListener('resize', resize)
  document.addEventListener('pointerdown', closeOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  document.removeEventListener('pointerdown', closeOutside)
})
</script>
<template>
  <aside ref="entry" class="wechat-entry" :class="{ 'is-dragging': dragging, 'on-left': edge === 'left', 'panel-below': panelBelow }" :style="positionStyle" @keydown.esc="opened = false">
    <button class="wechat-trigger" :aria-label="ui.qr" :aria-expanded="expanded" aria-controls="wechat-panel" aria-describedby="wechat-move-help" :title="ui.dragHint" @click="activate" @keydown="moveWithKeyboard" @pointerdown="beginDrag" @pointermove="moveDrag" @pointerup="finishDrag" @pointercancel="finishDrag" @lostpointercapture="finishDrag">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M18 7C11 3 3 7 3 13c0 3 2 5 4 6l-1 4 4-2c2 1 4 1 6 0" stroke="currentColor" stroke-width="1.6"/><path d="M29 20c0-4-4-7-9-7s-9 3-9 7 4 7 9 7l4-1 3 2-1-4c2-1 3-2 3-4Z" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="19" r="1" fill="currentColor"/><circle cx="23" cy="19" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></svg>
      <span>{{ ui.wechat }}</span>
    </button>
    <span id="wechat-move-help" class="visually-hidden">{{ ui.dragHint }}</span>
    <div v-show="expanded" id="wechat-panel" class="wechat-panel" role="region" :aria-label="ui.qr">
      <img v-if="assets.wechatQr && !failed" :src="assets.wechatQr" :alt="ui.qr" @error="failed = true" />
      <div v-else class="qr-placeholder"><span>{{ ui.qrPending }}</span></div>
      <p>{{ ui.qrHelp }}</p>
    </div>
  </aside>
</template>
