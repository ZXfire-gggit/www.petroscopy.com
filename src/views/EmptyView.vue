<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigation } from '../router.js'
import { ui } from '../content/language.js'
const route = useRoute()
const title = computed(() => navigation.find((item) => item.name === route.name)?.label)
</script>
<template><div class="empty-page"><h1>{{ title }}</h1><p>{{ ui.soon }}</p></div></template>
