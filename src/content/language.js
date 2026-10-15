import { ref, computed } from 'vue'
import messages from './ui.js'

function storedLanguage() {
  try { return localStorage.getItem('petroscopy-language') === 'en' ? 'en' : 'zh' }
  catch { return 'zh' }
}
export const language = ref(storedLanguage())
export const ui = computed(() => messages[language.value])
export function setLanguage(value) {
  language.value = value === 'en' ? 'en' : 'zh'
  try { localStorage.setItem('petroscopy-language', language.value) } catch { /* private browsing */ }
}
