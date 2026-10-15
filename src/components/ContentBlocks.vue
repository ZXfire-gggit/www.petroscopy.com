<script setup>
defineProps({ blocks: { type: Array, required: true } })
// Plain text only: never inject HTML from content files.
function segments(block) {
  const text = block.text
  const phrase = block.emphasis
  if (!phrase || !text.includes(phrase)) return [{ text, strong: false }]
  const at = text.indexOf(phrase)
  return [{ text: text.slice(0, at) }, { text: phrase, strong: true }, { text: text.slice(at + phrase.length) }]
}
</script>
<template>
  <template v-for="(block, index) in blocks" :key="index">
    <p v-if="block.type === 'p'"><template v-for="(part, i) in segments(block)" :key="i"><strong v-if="part.strong">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template></p>
    <ol v-else-if="block.type === 'list'" class="content-list"><li v-for="(item, j) in block.items" :key="j"><template v-for="(part, i) in segments(item)" :key="i"><strong v-if="part.strong">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template></li></ol>
    <slot v-else-if="block.type === 'image'" name="image" :asset="block.asset" />
  </template>
</template>
