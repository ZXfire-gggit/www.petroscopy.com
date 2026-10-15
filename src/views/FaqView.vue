<script setup>
import { computed } from 'vue'
import { language, ui } from '../content/language.js'
import faqContent from '../content/faq.js'
import { assets } from '../config/assets.js'
import ImageLightbox from '../components/ImageLightbox.vue'
import ContentBlocks from '../components/ContentBlocks.vue'
const questions = computed(() => faqContent[language.value])
</script>
<template>
  <div class="page-heading"><span class="eyebrow">FAQ</span><h1>{{ ui.faqTitle }}</h1><p v-if="language === 'en'" class="draft-note">{{ ui.draft }}</p></div>
  <div class="reading-layout">
    <article class="reading-content faq-content">
      <section v-for="(question, index) in questions" :id="`question-${index + 1}`" :key="index" class="faq-question" :aria-labelledby="`question-heading-${index + 1}`">
        <h2 :id="`question-heading-${index + 1}`" tabindex="-1"><span class="question-number">{{ String(index + 1).padStart(2, '0') }}</span>{{ question.title }}</h2>
        <ContentBlocks :blocks="question.blocks"><template #image><ImageLightbox :src="assets.theory" :alt="ui.theoryAlt" /></template></ContentBlocks>
      </section>
    </article>
    <aside class="page-index faq-index"><nav :aria-label="ui.questions"><span class="index-title">{{ ui.questions }}</span><RouterLink v-for="(question, i) in questions" :key="i" :to="{ path: '/faq', hash: `#question-${i + 1}` }"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ question.shortTitle }}</RouterLink></nav></aside>
  </div>
</template>
