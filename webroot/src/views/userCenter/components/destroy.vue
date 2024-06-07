<script setup lang="ts">
import { NButton, NCard, useMessage, useDialog } from 'naive-ui'
import {fetchUserDestoryAPI} from "@/api/user";
import {useAuthStore} from "@/store";
import {useRouter} from "vue-router";
const ms = useMessage();
const dialog = useDialog();
const authStore = useAuthStore();
const router = useRouter();

const handleConfirmDestroy = async () => {
	await fetchUserDestoryAPI().then(res => {
		ms.success("注销成功，系统即将自动退出");
		setTimeout(() => {
			authStore.logOut()
			router.push('/')
		}, 2000)
	})
}

async function handleRemoveAccount() {
	const d = dialog.warning({
		title: '注销账号',
		content: '账号注销后所有数据将销毁并退出登录，确定注销？',
		positiveText: '确认',
		onPositiveClick: () => {
			d.loading = true
			handleConfirmDestroy();
		}
	})
}

</script>

<template>
  <div class="flex h-full flex-col">
    <NCard>
      <template #header>
        <div>注销账号</div>
      </template>

			<div>
				<p class="text-[#A0A0A0] mb-4">注销后账号所有数据将被销毁并不可能找回，请谨慎操作。</p>
			  <NButton round type="primary" @click="handleRemoveAccount">注销账号</NButton>
			</div>

    </NCard>

  </div>
</template>
