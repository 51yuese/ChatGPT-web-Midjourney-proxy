<script setup lang='ts'>
import {  NCard, NSkeleton, NSpace } from 'naive-ui'
import {computed, onMounted, ref} from 'vue'
import { marked } from 'marked'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useGlobalStoreWithOut } from '@/store'
import { fetchGetGlobalPolicyAPI } from '@/api/global'

import type { ResData } from '@/api/types'

interface UserAgree {
	agreement: '',
	agreementTitle: '',
}

const notice = ref<UserAgree>({
	agreement: '',
	agreementTitle: '',
})

const appStore = useAppStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(true)

const darkMode = computed(() => appStore.theme === 'dark')
const { isSmallLg } = useBasicLayout()
const theme = computed(() => appStore.theme)

const html = computed(() => {
	if (!notice.value.agreement)
		return ''
	return marked(notice.value.agreement)
})


async function queryNotice() {
	const res: ResData = await fetchGetGlobalPolicyAPI({ keys: ['agreement', 'agreementTitle'] })
	const { success, data } = res
	loading.value = false;
	if (success)
		notice.value = data
}

onMounted(() => {
	queryNotice()
})


</script>

<template>

	<NSpace vertical :class="'max-w-screen-2xl m-auto'">
		<NCard :header-style="{'text-align': 'center'}" :content-style="{'text-align': 'justify'}">
			<template #header>
				<!-- 骨架 -->
				<div v-if="loading"  class="px-[20px]" >
					<NSkeleton text width="30%" />
				</div>
				<template v-else :class="'text-center'">
					<span class="text-xl">{{ notice.agreementTitle }}</span>
				</template>
			</template>
			<div v-if="loading" class="px-[20px]" >
				<NSkeleton  text :repeat="10" />
			</div>

			<template v-else>
				<div :class="[darkMode ? 'text-[#fff]' : 'text-[#000]', 'pb-5']" :style="{ background: theme === 'dark' ? '#2c2c32' : '#fff' }" class="p-[20px] markdown-body markdown-body-generate   overflow-y-auto overflow-x-hidden" v-html="html" />
			</template>

		</NCard>
	</NSpace>
</template>

<style scoped>
/deep/ .n-card__content{
	padding: 0 !important;
}
</style>
