import {defineStore} from 'pinia'
import type {GlobalState, OrderInfo} from './helper'
import {store} from '@/store'
import {ss} from '@/utils/storage'

export const useGlobalStore = defineStore('global-store', {

    state: (): GlobalState => ({
        uploadingDialog: false, // 上传弹窗
        uploadProgress: 0, // 上传进度
        recordDialog: false, // 是否录音弹窗
        payDialog: false, // 支付弹窗
        goodsDialog: false, // 商品弹窗
        noticeDialog: false, // 温馨提示弹窗
        bindWxDialog: false, // 绑定微信弹窗
        signInDialog: false, // 注册弹窗
        modelDialog: false, //  选择模型弹窗
        isChatIn: false, // 是否在对话
        fingerprint: 0, // 是否录音弹窗
        model: ss.get('model') || 3,
        orderInfo: {} as OrderInfo,
        iframeUrl: '',
    }),

    actions: {

        updateFingerprint(str: number) {
            let id = str
            /* 超过mysql最大值进行截取 */
            if (id > 2147483647) {
                id = Number(id.toString().slice(-9))
                id = Number(String(Number(id)))
            }
            ss.set('fingerprint', id)
            this.fingerprint = id
        },

        updateIframeUrl(iframeUrl: string) {
            this.iframeUrl = iframeUrl
        },

        updatePayDialog(payDialog: boolean) {
            this.payDialog = payDialog
        },

        updateUploadDialog(uploading: boolean) {
            this.uploadingDialog = uploading
        },
        updateRecordDialog(show: boolean) {
            this.recordDialog = show
        },

        updateUploadProgress(progress: number) {
            this.uploadProgress = progress
        },

        //
        updateModelDialog(modelDialog: boolean) {
            this.modelDialog = modelDialog
        },

        updateIsChatIn(isChatIn: boolean) {
            this.isChatIn = isChatIn
        },

        updateGoodsDialog(goodsDialog: boolean) {
            this.goodsDialog = goodsDialog
        },

        updateBindwxDialog(bindWxDialog: boolean) {
            this.bindWxDialog = bindWxDialog
        },

        updateSignInDialog(signInDialog: boolean) {
            this.signInDialog = signInDialog
        },

        updateNoticeDialog(noticeDialog: boolean) {
            this.noticeDialog = noticeDialog
        },

        updateOrderInfo(orderInfo: OrderInfo) {
            this.orderInfo = orderInfo
        },

        updateModel(model: number) {
            ss.set('model', model)
            this.model = model
        },

    },
})

export function useGlobalStoreWithOut() {
    return useGlobalStore(store)
}
