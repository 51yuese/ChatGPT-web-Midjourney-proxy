import type {App} from 'vue'
import type {RouteRecordRaw} from 'vue-router'
import {
	createRouter,
	createWebHistory,
	// createWebHashHistory
} from 'vue-router'
import {setupPageGuard} from './permission'
import {Layout} from '@/layout'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Layout',
		component: Layout,
		redirect: '/chat',
		children: [
			{
				path: '/chat/:id?',
				name: 'Chat',
				component: () => import('@/views/chat/chat.vue'),
			},
			// {
			//     path: '/midjourney/:id',
			//     name: 'Midjourney',
			//     component: () => import('@/views/midjourney/index.vue'),
			// },
			{
				path: '/midjourney/:id?',
				name: 'Midjourney',
				component: () => import('@/views/midjourney/index.vue'),
				children: [
					{
						path: 'inspiration',
						name: 'Inspiration',
						component: () => import('@/views/midjourney/inspiration.vue'),
					},
					{
						path: 'paint-task',
						name: 'PainTask',
						component: () => import('@/views/midjourney/task.vue'),
					},
					{
						path: 'image-to-text/:jobId?',
						name: 'ImageToText',
						component: () => import('@/views/midjourney/image2text.vue'),
					},
					{
						path: 'image-mix-image/:jobId?',
						name: 'ImageMixImage',
						component: () => import('@/views/midjourney/imageMiximage.vue'),
					},
					{
						path: 'text-to-image/:jobId?',
						name: 'TextToImage',
						component: () => import('@/views/midjourney/text2image.vue'),
					},
					{
						path: 'AI-change-face/:jobId?',
						name: 'AIChangeFace',
						component: () => import('@/views/midjourney/AIChangeFace.vue'),
					},
				]
			},
			{
				path:"/music",
				name:"music",
				redirect: '/music/musicSquare',
				children:[
					{
						path:'/music/musicSquare',
						name:"musicSquare",
						component: () => import('@/views/music/musicSquare.vue'),
					},
					{
						path:'/music/creativeCenter',
						name:"creativeCenter",
						component: () => import('@/views/music/creativeCenter.vue'),
					},
					{
						path:'/music/myCenter',
						name:"myCenter",
						component: () => import('@/views/music/myCenter.vue'),
					}
				]
			},
			{
				path: '/market',
				name: 'Market',
				component: () => import('@/views/market/index.vue'),
			},
			{
				path: '/draw',
				name: 'Draw',
				component: () => import('@/views/draw/index.vue'),
			},

			{
				path: 'role',
				name: 'Role',
				component: () => import('@/views/chat/role.vue'),
			},
			{
				path: 'user-center',
				name: 'UserCenter',
				component: () => import('@/views/userCenter/index.vue'),
			},
			{
				path: 'app-store',
				name: 'AppStore',
				component: () => import('@/views/appStore/index.vue'),
			},
			{
				path: 'pay',
				name: 'Pay',
				component: () => import('@/views/pay/index.vue'),
			},
			{
				path: 'mind',
				name: 'Mind',
				component: () => import('@/views/mind/index.vue'),
			}, {
				path: 'gpts',
				name: 'Gpts',
				component: () => import('@/views/gpts/index.vue'),
			},
			{
				path: 'share',
				name: 'Share',
				component: () => import('@/views/share/index.vue'),
			},
			{
				path: 'extend',
				name: 'Extend',
				component: () => import('@/views/extend/index.vue'),
			},
			{
				path: '/userCenter',
				name: 'UserCenter',
				component: () => import('@/views/userCenter/userCenter.vue')
			},
		],
	},
	{
		path: '/welcome',
		name: 'Welcome',
		component: () => import('@/views/welcome/index.vue'),
	},
	{
		path: '/serviceAgreement',
		name: 'ServiceAgreement',
		component: () => import('@/views/user/serviceAgreement.vue'),
	}, {
		path: '/agreement',
		name: 'Agreement',
		component: () => import('@/views/user/agreement.vue'),
	}, {
		path: '/policy',
		name: 'Policy',
		component: () => import('@/views/user/policy.vue'),
	},
	{
		path: '/member',
		name: 'Member',
		component: () => import('@/views/user/member.vue')
	},
	{
		path: '/unlawful',
		name: 'unlawful',
		component: () => import('@/views/user/unlawful.vue'),
	},
	{
		path: '/404',
		name: '404',
		component: () => import('@/views/exception/404/index.vue'),
	},
	{
		path: '/500',
		name: '500',
		component: () => import('@/views/exception/500/index.vue'),
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'notFound',
		redirect: '/404',
	},
]

export const router = createRouter({
	history: createWebHistory(),
	// history: createWebHashHistory(),
	routes,
	scrollBehavior: () => ({left: 0, top: 0}),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
	app.use(router)
	await router.isReady()
}
