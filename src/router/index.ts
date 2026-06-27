/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'

const Gym = () => import('@/pages/gym.vue')
const GymIntegrationHelper = () => import('@/pages/gym-integration-helper.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index,
    },
    {
      path: '/gyms/:id/:name',
      component: Gym,
    },
    {
      path: '/gyms/:id/:name/integration-helper',
      component: GymIntegrationHelper,
    },
  ],
})

export default router
