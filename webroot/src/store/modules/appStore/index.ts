import {defineStore} from 'pinia'
import type {AppStoreState} from './helper'
import {fetchQueryMineAppsAPI} from '@/api/appStore'
import {store} from '@/store'

export const useAppCatStore = defineStore('app-cat-store', {
    state: (): AppStoreState => ({
        catId: 0,
        mineApps: [],
        appDialog: false, // 添加应用
        appCenterDialog: false, // 应用中心
        runApp: {}, // 应用中心
    }),

    actions: {
        setCatId(catId: number) {
            this.catId = catId
        },

        async queryMineApps() {
            const res = await fetchQueryMineAppsAPI()
            this.mineApps = res?.data?.rows || [];

					console.log(res?.data?.rows);
					return res?.data?.rows
        },

        async updateAppDialog(show: boolean) {
            this.appDialog = show
        },

        async updateAppCenterDialog(show: boolean) {
            this.appCenterDialog = show
        },

        async updateAppRun(show: any) {
            this.runApp = show
        },

    },
})

export function useAppCatStoreWithOut() {
    return useAppCatStore(store)
}
