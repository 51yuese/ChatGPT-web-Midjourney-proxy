import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/client',
  component: Layout,
  redirect: '/client/classify',
  name: 'ClientMenu',
  meta: {
    title: '用户端设置',
    icon: 'sidebar-client',
  },
  children: [
    {
      path: 'base',
      name: 'ClientBaseConfig',
      component: () => import('@/views/client/base.vue'),
      meta: {
        title: '基础配置',
        icon: 'menu-baseconfig',
      },
    },
    {
      path: 'agreement',
      name: 'ClientAgreement',
      component: () => import('@/views/client/agreement.vue'),
      meta: {
        title: '用户协议',
        icon: 'menu-agreement',
      },
    },
    {
      path: 'agreement4member',
      name: 'ClientAgreement4Member',
      component: () => import('@/views/client/agreement4member.vue'),
      meta: {
        title: '会员协议',
        icon: 'menu-agreement4member',
      },
    },
    {
      path: 'agreement4service',
      name: 'ClientAgreement4service',
      component: () => import('@/views/client/agreement4service.vue'),
      meta: {
        title: 'AI服务协议',
        icon: 'menu-agreement4service',
      },
    },
    {
      path: 'policy',
      name: 'ClientPolicy',
      component: () => import('@/views/client/policy.vue'),
      meta: {
        title: '隐私政策',
        icon: 'menu-policy',
      },
    },
    {
      path: 'copyRight',
      name: 'ClientCopyRightConfig',
      component: () => import('@/views/client/logo.vue'),
      meta: {
        title: '用户端logo',
        icon: 'menu-logo',
      },
    },
    {
      path: 'menu',
      name: 'ClientMenuConfig',
      component: () => import('@/views/client/menu.vue'),
      meta: {
        title: '动态菜单',
        icon: 'menu-menu',
      },
    },
    {
      path: 'notice',
      name: 'SystemMenuNotice',
      component: () => import('@/views/client/notice.vue'),
      meta: {
        title: '公告设置',
        icon: 'menu-notice',
      },
    },
    {
      path: 'mind',
      name: 'SystemMenuMind',
      component: () => import('@/views/client/mind.vue'),
      meta: {
        title: '思维导图',
        icon: 'menu-mind',
      },
    },
    // {
    //   path: 'visitor',
    //   name: 'SystemMenuVisitor',
    //   component: () => import('@/views/client/visitor.vue'),
    //   meta: {
    //     title: '访客设置',
    //     icon: 'menu-visitor',
    //   },
    // },
    {
      path: 'signIn',
      name: 'SignInMenu',
      component: () => import('@/views/users/signIn.vue'),
      meta: {
        title: '签到奖励赠送',
        icon: 'menu-signIn',
      },
    },
    // {
    //   path: 'visible',
    //   name: 'VisibleMenu',
    //   component: () => import('@/views/client/visible.vue'),
    //   meta: {
    //     title: 'UI显示设置',
    //     icon: 'menu-visible',
    //   },
    // },
    {
      path: 'tail',
      name: 'TailSet',
      component: () => import('@/views/client/tail.vue'),
      meta: {
        title: '对话小尾巴',
        icon: 'menu-chat-msg',
      },
    },
  ],
}

export default routes
