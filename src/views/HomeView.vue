<script setup>
import { computed } from 'vue'
import { language, ui } from '../content/language.js'
import homeContent from '../content/home.js'
import { assets, externalLinks } from '../config/assets.js'
import ImageLightbox from '../components/ImageLightbox.vue'
import ContentBlocks from '../components/ContentBlocks.vue'
const content = computed(() => homeContent[language.value])
</script>
<template>
  <div class="page-heading"><span class="eyebrow">VPTA</span><h1>{{ content.title }}</h1><p v-if="language === 'en'" class="draft-note">{{ ui.draft }}</p></div>
  <div class="home-layout">
    <article class="reading-content">
      <section id="overview" aria-labelledby="overview-heading">
        <h2 id="overview-heading" class="visually-hidden">{{ ui.overview }}</h2>
        <ContentBlocks :blocks="content.intro" />
        <p class="tagline">{{ content.tagline }}</p>
      </section>
      <ImageLightbox :src="assets.production" :alt="ui.productionAlt" />
      <section id="about" aria-labelledby="about-heading">
        <h2 id="about-heading">About VPTA</h2>
        <section v-for="(section, i) in content.sections" :key="i" class="about-section">
          <h3>{{ section.title }}</h3><ContentBlocks :blocks="section.blocks" />
        </section>
      </section>
      <section id="publications" aria-labelledby="publications-heading" class="publications">
        <h2 id="publications-heading">Publications</h2>
        <div class="publication-record">
          <span class="publication-year">2026</span>
          <div><p v-for="citation in content.citations" :key="citation" class="citation">{{ citation }}</p>
          <p class="publication-meta">{{ ui.publicationNote }}</p>
          <div class="publication-links"><a :href="externalLinks.doi" target="_blank" rel="noopener noreferrer">DOI: 10.19657/j.geoscience.1000-8527.202511060144 <span aria-hidden="true">↗</span></a><a :href="externalLinks.article" target="_blank" rel="noopener noreferrer">{{ ui.article }} <span aria-hidden="true">↗</span></a></div>
          <p class="link-note">{{ ui.linkNote }}</p></div>
        </div>
      </section>
    </article>
  </div>
</template>
