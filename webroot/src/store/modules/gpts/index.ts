import {defineStore} from 'pinia'
import {getLocalState, setLocalState} from './helper'
import {fetchDelChatLogAPI, fetchDelChatLogByGroupIdAPI} from '@/api/chatLog'
import {fetchModelBaseConfigAPI} from '@/api/models'
import {
    fetchDelAllGptsAPI,
    fetchDelGptsAPI, fetchGetGptGroupAPI,
    fetchQueryGptsAPI,
    fetchUpdateGptsAPI,

} from "@/api/gpts";
import {fetchUpdateGroupAPI} from "@/api/group";
import {fetchCreateGptChatGroupAPI, fetchQueryAppChatListAPI, fetchQueryChatLogListAPI, fetchQueryMineAppsAPI} from "@/api/appStore";

export const useGptsStore = defineStore('gpts-store', {
    state: (): Gpts.ChatState => getLocalState(),

    getters: {

        /* 当前选用模型的配置 */
        activeConfig: (state) => {
            const uuid = state.active
            if (!uuid) return {}
            const config = state.groupList.find(item => item.uuid === uuid)?.config

            return config ? JSON.parse(config) : state.baseConfig
        },

        // 获取能否上传
        canUpload: (state) => {
            const uuid = state.active
            if (!uuid) return null
            const config = state.groupList.find(item => item.uuid === uuid)?.config
            return config ? JSON.parse(config).modelInfo.canUpload : false
        },

        // 获取能否获取语音
        canAudio: (state) => {
            const uuid = state.active
            if (!uuid) return null
            const config = state.groupList.find(item => item.uuid === uuid)?.config
            return config ? JSON.parse(config).modelInfo.canAudio : false
        },

        activeGroupAppId: (state) => {
            const uuid = state.active
            if (!uuid) return null
            return state.groupList.find(item => item.uuid === uuid)?.appId
        },

        /* 当前选用模型的扣费类型 */
        activeModelKeyDeductType(state) {
            return this.activeConfig?.modelInfo?.deductType
        },

        /* 当前选用模型的扣费类型 */
        activeModelName(state) {
            return this.activeConfig?.modelInfo?.model
        },

        /* 当前选用模型的模型类型 */
        activeModelKeyType(state) {
            return this.activeConfig?.modelInfo?.keyType
        },

        /* 当前选用模型的调用价格 */
        activeModelKeyPrice(state) {
            return this.activeConfig?.modelInfo?.deduct
        }

    },

    actions: {

				/* 缓存收藏的所有的应用 */
				async refreshCollect() {
					const res = await fetchQueryMineAppsAPI();
					// @ts-ignore 如果使用ts应该写完整的类型
					if (res.code !== 200) return;
					// @ts-ignore 如果使用ts应该写完整的类型
					this.collectApps = res.data.rows.map(item=>item.id);
				},
				setSiderCollapsed(collapsed: boolean) {
					this.siderCollapsed = collapsed
					this.recordState()
				},

        /* 对话组过滤 */
        updateGptsStore(show: boolean) {
            this.showGptsStore = show
        },

        /* 对话组过滤 */
        setGroupKeyWord(keyWord: string) {
            this.groupKeyWord = keyWord
        },

        /* 计算拿到当前选择的对话组信息 */
        getChatByGroupInfo() {
            if (this.active)
                return this.groupList.find(item => item.uuid === this.active) || {};
						return {demoData: []}
        },

        /*  */
        getConfigFromUuid(uuid: any) {
            return this.groupList.find(item => item.uuid === uuid)?.config
        },

        // /* 新增新的对话组 */
        // async addNewChatGroup(gptId: number) {
				// 	fetchCreateGptChatGroupAPI();
        //     const res: any = await fetchCreateGptChatGroupAPI({groupId: gptId})
        //     const {id: uuid} = res.data
        //     await this.setActiveGroup(uuid)
        //     this.recordState()
        // },

			/* 新增新的对话组 */
			async addNewChatGroup(gptId: number) {
				const res: any = await fetchCreateGptChatGroupAPI({appId: gptId})
				const {id: uuid} = res.data
				console.log(res)
				await this.setActiveGroup(uuid)
				this.recordState()
			},

        /* 查询基础模型配置 兼容老的chatgroup  */
        async getBaseModelConfig() {
            const res = await fetchModelBaseConfigAPI()
            this.baseConfig = res?.data;

        },

        /* 查询我的对话组 */
        async queryMyGroup() {
            // const res: any = await fetchQueryGptsAPI()
            const res: any = await fetchQueryAppChatListAPI()

            if (res.data.length === 0) {
                this.groupList = [];
                return;
            }

            this.groupList = [...res.data.map((item: any) => {
                const {id: uuid, title, demoData, desc, isSticky, createdAt, updatedAt, appId, logo, config, gptsApp} = item
                return {uuid, title, isEdit: false, demoData: demoData !== "" ? demoData.split("\n") : [], desc, appId, config, isSticky, logo, createdAt, updatedAt: new Date(updatedAt).getTime(), gptsApp}
            })]

            if (!this.active)
                this.groupList.length && this.setActiveGroup(this.groupList[0].uuid);
        },

        /* 修改对话组信息 */
        async updateGroupInfo(params: { groupId: number; isSticky?: boolean }) {
            await fetchUpdateGptsAPI(params)
        },

        /* 变更对话组 */
        async setActiveGroup(uuid: number) {
            this.active = uuid
            if (this.active)
                await this.queryActiveChatLogList()

            else
                this.chatList = [];

            this.groupList.forEach(item => (item.isEdit = false))
            this.recordState()
        },


        /* 删除对话组 */
        async deleteGroup(params: Gpts.History) {
            const curIndex = this.groupList.findIndex(item => item.uuid === params.uuid)
            const {uuid: groupId} = params
            await fetchDelGptsAPI({groupId})
            await this.queryMyGroup()

            if (this.groupList.length === 0)
                await this.setActiveGroup(0)

            if (curIndex > 0 && curIndex < this.groupList.length)
                await this.setActiveGroup(this.groupList[curIndex].uuid)

            if (curIndex === 0 && this.groupList.length > 0)
                await this.setActiveGroup(this.groupList[0].uuid)

            if (curIndex > this.groupList.length || (curIndex === 0 && this.groupList.length === 0))
                await this.setActiveGroup(0)

            if (curIndex > 0 && curIndex === this.groupList.length)
                await this.setActiveGroup(this.groupList[curIndex - 1].uuid)

            this.recordState()
        },

        /* 删除全部非置顶对话组 */
        async delAllGroup() {
            if (!this.active || !this.groupList.length)
                return
            await fetchDelAllGptsAPI()
            await this.queryMyGroup()
            if (this.groupList.length === 0)
                await this.setActiveGroup(0)
            else
                await this.setActiveGroup(this.groupList[0].uuid)
        },

        /* 查询当前对话组的聊天记录 */
        // async queryActiveChatLogList() {
				// 		// gpts日志类型2
        //     this.chatList = await fetchQueryChatLogListAPI({groupId: this.active, logType: 2}).then(res => res.data)
        // },

			/* 查询当前对话组的聊天记录 */
				async queryActiveChatLogList() {
					// gpts日志类型2
					this.chatList = await fetchQueryChatLogListAPI({groupId: this.active}).then(res => res.data)
				},

        /* 添加一条虚拟的对话记录 */
        addGroupChat(data: Gpts.Chat) {
            this.chatList = [...this.chatList, data]
        },

        /* 动态修改对话记录 */
        updateGroupChat(index: number, data: Gpts.Chat) {
            this.chatList[index] = {...this.chatList[index], ...data}
        },

        /* 修改其中部分内容 */
        updateGroupChatSome(index: number, data: Partial<Gpts.Chat>) {
            this.chatList[index] = {...this.chatList[index], ...data}
        },

        /* 删除一条对话记录 */
        async deleteChatById(chatId: number | undefined) {
            if (!chatId)
                return
            await fetchDelChatLogAPI({id: chatId})
            await this.queryActiveChatLogList()
        },

        /* 设置使用上下文 */
        setUsingContext(context: boolean) {
            this.usingContext = context
            this.recordState()
        },

        /* 设置使用联网 */
        setUsingNetwork(context: boolean) {
            this.usingNetwork = context
            this.recordState()
        },

        /* 删除当前对话组的全部内容 */
        async clearChatByGroupId() {
            if (!this.active)
                return

            await fetchDelChatLogByGroupIdAPI({groupId: this.active, type: "gpts"})
            await this.queryActiveChatLogList()
        },

				// 判断当前应用是否已经开启对话
				async isSession(appid){
					const res = await fetchQueryAppChatListAPI()
					for (var i in res.data) {
						if (res.data[i].modelId == appid){
							// 表示当前应用已经开启了会话，返回会话id
							return res.data[i].id
						}
					}
					// 如果没有开启会话返回false
					return false;
				},

        recordState() {
            setLocalState(this.$state)
        },

        async addNewChat(id: number) {
            await this.addNewChatGroup(id)
            await this.queryMyGroup()
        },

        async upgradeModelConfig(param: { groupId: number, canAudio: boolean, canUpload: boolean, modelName: string, modelId: string }) {

            const {groupId, canAudio, canUpload, modelName, modelId} = param;

            const response = await fetchGetGptGroupAPI({groupId}).then(res => res.data)

            if (!response) return false;

            const {maxModelTokens, maxResponseTokens, systemMessage, deductType, deduct, maxRounds, rounds, topN} = response;

            /* 修改对话组模型配置 */
            // {
            // "modelInfo":{
            // "canAudio":false,
            // "canUpload":false,"keyType":"1",
            // "modelName":"专业AI模型（GoMaxAI）",
            // "model":"gpt-4-1106-preview",
            // "maxModelTokens":8096,
            // "maxResponseTokens":4000,
            // "systemMessage":"","topN":0.8,
            // "deductType":2,
            // "deduct":1,
            // "maxRounds":12,
            // "rounds":8},
            // "modelTypeInfo":{"label":"系统内置大模型","val":"1"}}

            const config = {
                modelInfo: {
                    canAudio,
                    canUpload,
                    keyType: 1,
                    modelName,
                    model: modelId,
                    maxModelTokens: maxModelTokens || 8096,
                    maxResponseTokens: maxResponseTokens || 4000,
                    systemMessage: systemMessage || "",
                    topN: topN || 0.8,
                    deductType: deductType || 2,
                    deduct: deduct || 1,
                    maxRounds: maxRounds || 12,
                    rounds: rounds || 8
                },
                modelTypeInfo: {
                    label: "自定义Gpt",
                    value: 5
                }
            }

            const params = {
                groupId,
                config: JSON.stringify(config)
            }

            return await fetchUpdateGroupAPI(params).then(res => !!res.data);

            // await this.addNewChatGroup(id)
            // await this.queryMyGroup()
        },

        clearChat() {
            this.chatList = []
            this.groupList = []
            this.active = 0
            this.recordState()
        },
    },
})
