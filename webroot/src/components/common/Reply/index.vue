<script setup lang="ts">
import {NButton, NPopover, useMessage} from 'naive-ui'
import {SvgIcon} from "@/components/common";
import {useAuthStore, useGlobalStoreWithOut} from "@/store";
import {reactive, onMounted} from "vue";
import {fetchGetQrCode} from "@/api/global";
const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const ms = useMessage();

// 显示
const handleOpenNotice = () => {

	if(!authStore.token) {
		ms.info("请先登录")
		authStore.setLoginDialog(true);
		return;
	}
	useGlobalStore.updateNoticeDialog(true)
}

//  提交反馈
const handleReply = () => {
  useGlobalStore.updateFeedbackDialog(true)
}

//  在线客服
const handleChatOnline = () => {
  if (!qrCode.chatOnline) {
    ms.info("请先前往后台管理系统【关注我们】页面配置在线客服系统地址后再使用！")
    return
  }
  window.open(qrCode.chatOnline, "_blank");
}

const qrCode = reactive({
  wechatImage: "",
  weMiniProgramImage: "",
  chatOnline: "",
})

const queryQrCode = async () => {
  const res = await fetchGetQrCode({ keys: ['wechatImage', 'weMiniProgramImage', 'chatOnline'] })
  Object.assign(qrCode, res.data)
}

onMounted(() => {
  queryQrCode();
})


</script>

<template>
   <div class="w-full">
		 	<div class="m-auto text-center p-2 flex cursor-pointer rounded-xl justify-center transition-all duration-300 dark:bg-[#262642] bg-[#f0f0f0]" @click="handleOpenNotice">
				<SvgIcon  icon="pepicons-pencil:bulletin-notice" class="text-2xl flex text-[#555] dark:text-[#fff]   self-center  mr-2 text-center" />
				<n-button text class="mt-1.5 ml-2 text-xl select-none" >公告栏</n-button>
			</div>
		 <div class="flex justify-between mt-8">
			 <n-button text @click="handleReply">提交反馈</n-button>
			 <n-button text @click="handleChatOnline">在线客服</n-button>

       <n-popover :overlap="false" style="width: 340px; height: 160px;" placement="right-end" trigger="hover">
         <template #trigger>
           <n-button text >关注我们</n-button>
         </template>
         <div class="large-text flex justify-between items-center">
            <div class="w-auto h-[144px] border">
              <img :src="qrCode.wechatImage" class="w-full h-full" alt="">
            </div>
           <div class="w-auto h-[144px] border">
             <img :src="qrCode.weMiniProgramImage" loading="eager" class="w-full h-full" alt="">
           </div>
         </div>
       </n-popover>

		 </div>
		 <div class="flex justify-around mt-10">
			 <router-link to="/agreement" target="_blank">
			 <n-button text>用户协议</n-button>
			 </router-link>
			 <router-link to="/policy" target="_blank">
			 <n-button text>隐私政策</n-button>
			 </router-link>
		 </div>

	 </div>
</template>

<style scoped lang="scss">

</style>
