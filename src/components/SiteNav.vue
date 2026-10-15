<script setup>
import { navigation } from '../router.js'
import { ui } from '../content/language.js'
</script>
<template>
  <nav class="site-nav" :aria-label="ui.nav">
    <RouterLink v-for="item in navigation" :key="item.name" :to="item.path" active-class="" exact-active-class="selected">{{ item.label }}</RouterLink>
  </nav>
</template>
