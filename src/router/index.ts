import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Editor from '../views/Editor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/editor',
      name: 'editor',
      component: Editor
    }
  ]
})

export default router