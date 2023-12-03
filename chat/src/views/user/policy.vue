<script setup lang='ts'>
import { NButton, NCard, NModal, NSkeleton, NSpace } from 'naive-ui'
import {computed, onMounted, ref} from 'vue'
import { marked } from 'marked'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useGlobalStoreWithOut } from '@/store'
import { fetchGetGlobalPolicyAPI } from '@/api/global'

import type { ResData } from '@/api/types'
import { ss } from '@/utils/storage'

interface Policy {
	policyContent: '',
	policyTitle: '',
}

const notice = ref<Policy>({
	policyContent: '',
	policyTitle: '',
})

const appStore = useAppStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(true)

const darkMode = computed(() => appStore.theme === 'dark')
const { isSmallLg } = useBasicLayout()
const theme = computed(() => appStore.theme)

const html = computed(() => {
	if (!notice.value.policyContent)
		return ''
	return marked(notice.value.policyContent)
})


async function queryNotice() {
	const res: ResData = await fetchGetGlobalPolicyAPI({ keys: ['policyTitle', 'policyContent'] })
	const { success, data } = res
	loading.value = false;
	if (success)
		notice.value = data
}

onMounted(() => {
	  queryNotice()
})


function handleReminder() {
	useGlobalStore.updateNoticeDialog(false)
	ss.set('showNotice', Date.now() + 24 * 60 * 60 * 1000)
}

</script>

<template>
	<NSpace vertical  :class="'max-w-screen-2xl m-auto'">
		<NCard  :header-style="{'text-align': 'center'}"  :content-style="{'text-align': 'justify'}">
			<template #header>
			<!-- 骨架 -->
				<div v-if="loading"   class="px-[20px]" >
					<NSkeleton text width="30%" />
				</div>
				<template v-else :class="'m-auto text-center'">
					<span class="text-xl">{{ notice.policyTitle }}</span>
				</template>
			</template>
			<div v-if="loading" class="px-[20px]" >
				<NSkeleton  text :repeat="10" />
			</div>

			<template v-else>
				<div :class="[darkMode ? 'text-[#fff]' : 'text-[#000]', 'pb-5']" :style="{ background: theme === 'dark' ? '#2c2c32' : '#fff' }" class="p-[20px] markdown-body markdown-body-generate  overflow-y-auto overflow-x-hidden" v-html="html" />
			</template>

<!--			<div class="flex justify-end py-3 px-5">-->
<!--				<NButton type="primary"  @click="handleReminder">-->
<!--					24小时不再提示-->
<!--				</NButton>-->
<!--			</div>-->
		</NCard>
	</NSpace>
</template>

<style scoped>
/deep/ .n-card__content{
	padding: 0 !important;
}
</style>
