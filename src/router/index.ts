import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/FormDesigner.vue'),
    meta: { title: '表单设计器' }
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/FormPreview.vue'),
    meta: { title: '表单预览' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'LowForm'
  next()
})

export default router
