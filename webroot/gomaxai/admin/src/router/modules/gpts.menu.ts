import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/gpts',
  component: Layout,
  redirect: '/gpts/models',
  name: 'GptsMenu',
  meta: {
    title: '应用管理',
    icon: 'sidebar-chat',
  },
  children: [
    {
      path: 'models',
      name: 'AiMenuModels',
      component: () => import('@/views/models/index.vue'),
      meta: { title: '模型池设置', icon: 'menu-key', },
    },
    {
      path: 'group',
      name: 'GptsGrouplList',
      component: () => import('@/views/gpts/group.vue'),
      meta: {
        title: '分类列表',
        icon: 'menu-draw',
      },
    },
    {
      path: 'model',
      name: 'GptsModelList',
      component: () => import('@/views/gpts/model.vue'),
      meta: {
        title: '应用列表',
        icon: 'menu-chat',
      },
    },
  ],
}

export default routes
