import { createRouter, createWebHistory } from 'vue-router'
import { getSession } from '@shared/api/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@pages/LoginPage.vue'),
      meta: { title: 'Login', public: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@pages/DashboardPage.vue'),
      meta: { title: 'Dashboard' }
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@pages/ProjectDetailPage.vue'),
      meta: { title: 'Projekt' }
    },
    {
      path: '/project/new',
      name: 'project-new',
      component: () => import('@pages/ProjectNewPage.vue'),
      meta: { title: 'Neues Projekt' }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@pages/InventoryPage.vue'),
      meta: { title: 'Materialien' }
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: () => import('@pages/EquipmentPage.vue'),
      meta: { title: 'Ausrüstung' }
    },
    {
      path: '/storage',
      name: 'storage',
      component: () => import('@pages/StorageLocationsPage.vue'),
      meta: { title: 'Lagerorte' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@pages/SettingsPage.vue'),
      meta: { title: 'Einstellungen' }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Auth guard
router.beforeEach(async (to) => {
  if (to.meta.public) return

  const session = await getSession()
  if (!session) {
    return '/login'
  }
})

// Update document title on route change
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - Bushcraft Planer` : 'Bushcraft Planer'
})

export default router