<script setup lang="ts">
import {NDrawer, NDrawerContent, NInput, NButton} from "naive-ui";
import {ref, watch, computed} from "vue";
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useGptsStore} from "@/store";
import AiGptsCom from "./aiGptsCom.vue";
import {SvgIcon} from "@/components/common";

const gptStores = useGptsStore();
const {isMobile} = useBasicLayout()

const showDrawer = computed(() => gptStores.showGptsStore);
const gptsItemRef = ref();
const st = ref({showImg: false, query: ''});

// 搜索
const search = (type?: string) => {
	if (type === 'clear') {
		st.value.query = ""
	}

	gptsItemRef.value.search(st.value.query);
}

const toq = (d: any) => {
	st.value.query = d.q;
}

</script>
<template>
	<n-drawer v-model:show="showDrawer"
						:mask-closable="false"
						:placement="isMobile ? 'bottom':'right'"
						:class="isMobile ? ['!h-[90vh]']: ['!w-[80vw]']"
						style="--n-body-padding:0">
		<n-drawer-content class="mydrawer">
			<template #header>
				<div class="flex justify-between items-center w-full">
					<div class="flex justify-between items-center">
						<div class="pr-4">GPT store</div>
						<div class="max-w-[500px]">
							<n-input round placeholder="GPTs名字(enter搜索)" class="w-full" @clear="search('clear')" clearable
											 v-model:value="st.query" @keyup.enter="search()">
								<template #prefix>
									<SvgIcon icon="uil:search"/>
								</template>
								<template #suffix>
									<div class="cursor-pointer" @click="search()">搜索</div>
								</template>
							</n-input>
						</div>
					</div>
					<div>
						<button circle @click="gptStores.updateGptsStore(false)">
							<SvgIcon icon="ic:round-close" class="pr-2 text-[32px] cursor-pointer"></SvgIcon>
						</button>
					</div>
				</div>
			</template>

			<AiGptsCom ref="gptsItemRef" @close="gptStores.updateGptsStore(false)" :q="st.query" @toq="toq"/>

		</n-drawer-content>
	</n-drawer>
</template>

<style lang="less">
.mydrawer {
	width: 100%;
	.n-drawer-header__main {
		width: 100%;
	}
}
</style>
