<script setup>
import { ref } from 'vue'
import { assets } from '../config/assets.js'
import { language, ui, setLanguage } from '../content/language.js'
const leftFailed = ref(false)
const rightFailed = ref(false)
</script>

<template>
  <header class="brand-header">
    <RouterLink class="left-brand" to="/" :aria-label="ui.homeLink">
      <img v-if="assets.leftBrand && !leftFailed" :src="assets.leftBrand" alt="生产试井分析（VPTA）" @error="leftFailed = true" />
      <span v-else class="brand-placeholder">VPTA · {{ ui.imageMissing }}</span>
    </RouterLink>
    <div class="brand-right">
      <div class="language-switch" role="group" :aria-label="ui.language">
        <button :aria-pressed="language === 'zh'" @click="setLanguage('zh')">中文</button>
        <span aria-hidden="true">/</span>
        <button :aria-pressed="language === 'en'" @click="setLanguage('en')">English</button>
      </div>
      <img v-if="assets.rightBrand && !rightFailed" class="right-brand" :src="assets.rightBrand" alt="PETROSCOPY" @error="rightFailed = true" />
      <span v-else class="brand-placeholder">PETROSCOPY · {{ ui.imageMissing }}</span>
    </div>
  </header>
</template>
