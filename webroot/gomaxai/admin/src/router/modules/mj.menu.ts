import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/mj',
  component: Layout,
  redirect: '/mj/config',
  name: 'MjMenu',
  meta: {
    title: 'MJ绘画管理',
    icon: 'sidebar-mj',
  },
  children: [
    {
      path: 'draw',
      name: 'MjDrawManage',
      component: () => import('@/views/mjDraw/draw.vue'),
      meta: {
        title: '绘画记录',
        icon: 'menu-history',
      },
    },
    {
      path: 'config',
      name: 'MjManage',
      component: () => import('@/views/mjDraw/index.vue'),
      meta: {
        title: '绘画账号',
        icon: 'menu-params',
      },
    },
    {
      path: 'proxy',
      name: 'MjProxyManage',
      component: () => import('@/views/mjDraw/proxy.vue'),
      meta: {
        title: '全局设置',
        icon: 'menu-proxy',
      },
    },
    // {
    //   path: 'prompt',
    //   name: 'MjPromptManage',
    //   component: () => import('@/views/mjDraw/prompt.vue'),
    //   meta: {
    //     title: '功能预设',
    //     icon: 'menu-preset',
    //   },
    // },
    {
      path: 'prompts',
      name: 'MjPromptsManage',
      component: () => import('@/views/mjDraw/prompts.vue'),
      meta: {
        title: 'AI智能推荐',
        icon: 'menu-preset',
      },
    },
    {
      path: 'incantation',
      name: 'MjIncantation',
      component: () => import('@/views/mjDraw/incantation.vue'),
      meta: {
        title: 'AI咒语',
        icon: 'menu-preset',
      },
    },
    {
      path: 'incantation-classify',
      name: 'MjIncantationClassify',
      component: () => import('@/views/mjDraw/incantation-classify.vue'),
      meta: {
        title: '咒语分类',
        icon: 'menu-preset',
      },
    },
    {
      path: 'suggest-words',
      name: 'MjSuggestWords',
      component: () => import('@/views/mjDraw/suggest-words.vue'),
      meta: {
        title: '推荐关键词',
        icon: 'menu-preset',
      },
    },
    {
      path: 'inspire-classify',
      name: 'MjInspireClassify',
      component: () => import('@/views/mjDraw/inspire-classify.vue'),
      meta: {
        title: '灵感分类',
        icon: 'menu-preset',
      },
    },
  ],
}

export default routes
