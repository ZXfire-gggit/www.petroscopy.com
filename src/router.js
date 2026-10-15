import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import FaqView from './views/FaqView.vue'
import EmptyView from './views/EmptyView.vue'
import DownloadView from './views/DownloadView.vue'

export const navigation = [
  { name: 'home', path: '/', label: 'VPTA', component: HomeView },
  { name: 'faq', path: '/faq', label: 'FAQ', component: FaqView },
  { name: 'cases', path: '/cases', label: 'Cases', component: EmptyView },
  { name: 'download', path: '/download', label: 'Download', component: DownloadView },
  { name: 'contact', path: '/contact', label: 'Contact', component: EmptyView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    ...navigation.map(({ name, path, component }) => ({ name, path, component })),
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 24 }
    return { top: 0 }
  },
})
