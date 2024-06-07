import Message from './Message/index.vue'

export { Message }

export const chatMenu = [
	{
		menuName: '自由聊天',
		key: 'chat',
		menuIcon: 'bxs:chat',
		menuPath: '/chat/chat-app',
	},
	{
		menuName: '热门应用',
		key: 'hot-app',
		menuIcon: 'ri:app-store-fill',
		menuPath: '/chat/hot-app',
	},
	{
		menuName: '我的应用',
		key: 'my-app',
		menuIcon: 'fluent:app-recent-20-filled',
		menuPath: '/chat/my-app',
	}
]
