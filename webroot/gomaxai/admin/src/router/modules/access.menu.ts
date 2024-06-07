import type { RouteRecordRaw } from 'vue-router'

function Layout() {
    return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
    path: '/access',
    component: Layout,
    redirect: '/access/list',
    name: 'AccessMenu',
    meta: {
        title: '权限管理',
        icon: 'sidebar-ai',
    },
    children: [
        {
            path: 'list',
            name: 'AccessList',
            component: () => import('@/views/access/user-access.vue'),
            meta: {
                title: '权限分配',
                icon: 'menu-model',
            },
        },
    ],
}

export default routes
