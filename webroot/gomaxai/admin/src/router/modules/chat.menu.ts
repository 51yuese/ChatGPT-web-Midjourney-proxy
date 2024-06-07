import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/chat',
  component: Layout,
  redirect: '/chat/chat',
  name: 'ChatMenu',
  meta: {
    title: '数据管理',
    icon: 'sidebar-chat',
  },
  children: [
    {
      path: 'list',
      name: 'ChatMenuList',
      component: () => import('@/views/chat/chat.vue'),
      meta: {
        title: 'GPT对话记录',
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
