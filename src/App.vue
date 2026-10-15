<script setup>
import { watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { language, ui } from './content/language.js'
import BrandHeader from './components/BrandHeader.vue'
import SiteNav from './components/SiteNav.vue'
import SiteFooter from './components/SiteFooter.vue'
import WechatEntry from './components/WechatEntry.vue'

const route = useRoute()
function skipToContent() { document.querySelector('#main-content')?.focus() }
watch([language, () => route.name], () => {
  const titles = { home: ui.value.homeTitle, faq: ui.value.faqTitle, cases: 'Cases', download: 'Download', contact: 'Contact' }
  document.documentElement.lang = language.value === 'zh' ? 'zh-CN' : 'en'
  document.title = `${titles[route.name] || 'VPTA'} | PETROSCOPY`
}, { immediate: true })
watch(() => route.path, async (path, previous) => {
  if (!previous || previous === path) return
  await nextTick()
  document.querySelector('#main-content')?.focus({ preventScroll: true })
})
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="skipToContent">{{ ui.skip }}</a>
  <div class="site-shell">
    <BrandHeader />
    <SiteNav />
    <main id="main-content" tabindex="-1"><RouterView /></main>
    <SiteFooter />
  </div>
  <WechatEntry />
</template>
