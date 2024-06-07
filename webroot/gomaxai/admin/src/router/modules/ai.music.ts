import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/ai-music',
  component: Layout,
  redirect: '/ai-music/recommendDict',
  name: 'ChatMenu',
  meta: {
    title: 'AI 音乐',
    icon: 'sidebar-chat',
  },
  children: [
    {
      path: 'recommendDict',
      name: 'aiMusicRecommendDict',
      component: () => import('@/views/ai-music/recommendDict.vue'),
      meta: {
        title: '字典管理',
        icon: 'menu-chat',
      },
    },    {
      path: 'useLog',
      name: 'aiMusicUseLog',
      component: () => import('@/views/ai-music/useLog.vue'),
      meta: {
        title: '使用记录',
        icon: 'menu-chat',
      },
    },



























    // {
    //   path: 'draw',
    //   name: 'DrawMenuList',
    //   component: () => import('@/views/chat/draw.vue'),
    //   meta: {
    //     title: 'Dall-E2绘画管理',
    //     icon: 'menu-draw',
    //   },
    // },
    // {
    //   path: 'midjourney',
    //   name: 'MjMenuList',
    //   component: () => import('@/views/chat/midjourney.vue'),
    //   meta: {
    //     title: 'MJ绘画管理',
    //     icon: 'menu-midjourney',
    //   },
    // },
  ],
}

export default routes
