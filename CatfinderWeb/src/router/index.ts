import { createRouter, createWebHistory } from 'vue-router'
import CatHome from '@/views/CatHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CatHome
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/CatListView',
      name: "CatListView",
      component: () => import('../views/CatListView.vue')
    },
    {
      path: '/MapUpdate',
      name: "MapUpdate",
      component: () => import('../mapUpdate/views/MapUpdate.vue')
    }
  ]
})

export default router
