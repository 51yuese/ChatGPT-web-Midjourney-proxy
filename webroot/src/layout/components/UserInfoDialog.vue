<script setup lang='ts'>
import {
	NButton,
	NModal,
	useDialog,
	useMessage,
	NTabs,
	NAvatar,
	NTabPane, NIcon, NInput, NGrid, NSpace, NGi, NCard, NSkeleton
} from 'naive-ui'

import {computed, watch, ref} from 'vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAppStore, useAuthStore, useGlobalStoreWithOut} from '@/store'
import {CloseOutline} from "@vicons/ionicons5";
import Invite from "@/views/userCenter/components/invite.vue";
import Destroy from "@/views/userCenter/components/destroy.vue";
import Password from "@/views/userCenter/components/password.vue";
import Wallet from "@/views/userCenter/components/wallet.vue";
import defaultAvatar from "@/assets/avatar.png";
import {ResData} from "@/api/types";
import {fetchUpdateInfoAPI} from "@/api";
import {fetchUploadImage} from "@/api/mjDraw";
import {useUpload} from "@/views/chat/hooks/useUpload";

const appStore = useAppStore();
const ms = useMessage()
const theme = computed(() => appStore.theme)
const closeColor = computed(() => {
	return theme.value === 'light' ? '#555' : '#fff'
})
defineProps<Props>()

const authStore = useAuthStore();
const useGlobalStore = useGlobalStoreWithOut();
const loading = ref(false);
const {isSmallMd} = useBasicLayout();

const userinfo = computed(() => useGlobalStore.userInfo);
const isLogin = computed(() => authStore.isLogin);


const isBindWx = computed(() => authStore.userInfo.isBindWx);
const avatar = computed(() => authStore.userInfo.avatar);
const username = ref(authStore.userInfo.username ?? '未登录');
const sign = ref(authStore.userInfo.sign ?? '我是一台基于深度学习和自然语言处理技术的 AI 机器人，旨在为用户提供高效、精准、个性化的智能服务。');
const btnDisabled = ref(false);

const {selectFile} = useUpload();
const { isSmallLg, isMobile } = useBasicLayout();
const activeTab = ref(userinfo.value);

watch( () => userinfo.value , (newValue) => {
	activeTab.value = newValue;
}, {immediate: true, deep: true})


interface Props {
	visible: boolean,
}

function handleCloseDialog() {
	loading.value = false;
}

const handleClose = () => {
	useGlobalStore.updateUserInfoDialog(false)
	loading.value = false;
}

const handleChangeTab = () => {
	useGlobalStore.updateUserInfoTab(activeTab.value)
	loading.value = false;

}

// 上传图片
const handleUpdateAvatar = async () => {
	 const file = await selectFile()
	 const url = await submitAva(file);
	 await updateUserInfo({avatar: url});
}

async function updateUserInfo(options: { avatar?: string; username?: string; sign?: string }) {
	try {
		btnDisabled.value = true
		const res: ResData = await fetchUpdateInfoAPI(options)
		btnDisabled.value = false
		if (!res.success)
			return ms.error(res.message)
		ms.success("更新成功")
		await authStore.getUserInfo();
	}
	catch (error) {
		btnDisabled.value = false
	}
}


const submitAva = async (file: File) => {

	const formData = new FormData()
	formData.append('filename',  file.name)
	formData.append('file', file)
	formData.append('dir', 'user-upload');
	return  await fetchUploadImage(formData).then(res => res.data)
}

</script>

<template>

	<NModal :show="visible"
					:close-on-esc="false"
					:mask-closable="false"
					:show-icon="false"
					:style="{ maxWidth: `1000px`, minWidth: isSmallMd ? '100%' : '1000px' }"
					:on-after-leave="handleCloseDialog">

		<div>

			<div class="absolute top-3 right-3 cursor-pointer z-30" @click="handleClose">
				<NIcon size="20" :color="closeColor">
					<CloseOutline/>
				</NIcon>
			</div>

			<div class="p-4 bg-white rounded dark:bg-[#3E3E64] max-h-4/5">
				<NTabs type="line" animated v-model:value="activeTab" @click="handleChangeTab">
					<NTabPane name="baseInfo" tab="基础信息">
						<NCard>

							<NSpace v-if="loading || !isLogin" vertical>
								<NSkeleton height="40px" size="medium" />
								<NSkeleton height="40px" size="medium" />
								<NSkeleton height="80px" size="medium" />
							</NSpace>
							<template v-else>
								<NGrid x-gap="12" :cols="1">
									<NGi>
										<div class="flex flex-start mb-6">
											<div class="flex flex-col items-center">
												<NAvatar :size="70"
																 :src="avatar"
																 round
																 bordered
																 :fallback-src="defaultAvatar"
																 class="cursor-pointer"></NAvatar>
												<div class="mt-2" >
													<NButton round size="tiny" type="primary" @click="handleUpdateAvatar">上传头像</NButton>
												</div>
											</div>

											<div class="flex flex-col ml-20">
												<div class="flex flex-row items-center w-full">
													<span class="w-24">用户昵称:</span>
													<div class="w-full mr-2">
														<NInput v-model:value="username" placeholder="请编辑您的用户昵称" maxlength="12" show-count clearable />
													</div>
													<NButton type="primary"  @click="updateUserInfo({avatar, username})">
														提交
													</NButton>
												</div>

												<div  class="flex items-center flex-start mt-8">
													<span class=" w-24">绑定微信:</span>
													<div class="w-[200px]">
														<NButton v-if="!isBindWx"   type="primary" @click="useGlobalStore.updateBindwxDialog(true)">
															去绑定
														</NButton>
														<span v-else>已绑定微信</span>
													</div>
												</div>
											</div>
										</div>

										<div class="flex items-center space-x-4">
											<Password></Password>
										</div>
									</NGi>
								</NGrid>
							</template>
						</NCard>
					</NTabPane>

					<NTabPane name="exchange" tab="我的钱包">
						<Wallet ref="walletRef" />
					</NTabPane>

					<NTabPane name="invite" tab="邀请好友">
						<Invite />
					</NTabPane>

					<NTabPane name="destroy" tab="账号注销">
						<Destroy></Destroy>
					</NTabPane>
				</NTabs>

			</div>
		</div>
	</NModal>
</template>
