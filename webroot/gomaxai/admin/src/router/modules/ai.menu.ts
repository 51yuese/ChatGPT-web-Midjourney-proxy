import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/ai',
  component: Layout,
  redirect: '/ai/model-pre',
  name: 'AiMenu',
  meta: {
    title: '对话系统',
    icon: 'sidebar-ai',
  },
  children: [

    // {
    //   path: 'model',
    //   name: 'AiMenuInterface',
    //   component: () => import('@/views/system/interface.vue'),
    //   meta: {
    //     title: '对话模型配置',
    //     icon: 'menu-model',
    //   },
    // },
    // {
    //   path: 'chat-key-list',
    //   name: 'AiMenuChatKeyList',
    //   component: () => import('@/views/keys/list.vue'),
    //   meta: {
    //     title: 'key列表[废弃]',
    //     icon: 'menu-key',
    //   },
    // },
    // {
    //   path: 'models',
    //   name: 'AiMenuModels',
    //   component: () => import('@/views/models/index.vue'),
    //   meta: { title: '模型池设置', icon: 'menu-key', },
    // },
    {
      path: 'model-pre',
      name: 'AiMenuModelPre',
      component: () => import('@/views/ai/globalPre.vue'),
      meta: { title: '头部预设', icon: 'menu-header', },
    },
    {
      path: 'guide',
      name: 'AiGuid',
      component: () => import('@/views/ai/guide.vue'),
      meta: { title: '引导语设置', icon: 'menu-header', },
    },
    {
      path: 'chat-history',
      name: 'ChatMenuHistory',
      component: () => import('@/views/chat/chat.vue'),
      meta: {
        title: 'GPT对话记录',
        icon: 'menu-chat',
      },
    },
  ],
}

export default routes
