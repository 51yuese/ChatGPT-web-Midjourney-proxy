import {defineStore} from "pinia";
import {getLocalState} from "@/store/modules/midjourney/helper";

export const useMidjourneyStore = defineStore('midjourney-store', {

    state: () => getLocalState(),

    getters: {

        /* 当前选用模型的配置 */
        activeConfig: (state) => {

        },

    },

    actions: {

        // 打开弹窗
        async openRegionModal(show: boolean, data: {
            customId: string,
            taskId: number,
            mode: number,
        }) {
            this.openRegionDialog = show;
            this.varyRegionInfo = {
               varyRegionCustomId: data.customId,
               varyRegionPrompt: '',
               taskId: data.taskId,
               mode: data.mode
           };
        },

        async updateRegionPrompt(text: string) {
            this.varyRegionInfo.varyRegionPrompt = text
        },

        async closeRegionModal(show: boolean) {
            this.openRegionDialog = show
        },
    }
})
