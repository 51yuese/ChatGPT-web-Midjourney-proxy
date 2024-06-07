<script setup lang='ts'>
import { NButton, NCard, NGrid, NGridItem, useThemeVars, NProgress, NIcon, NModal, NSkeleton, NSpace, useDialog, useMessage } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import { computed, ref } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore, useGlobalStoreWithOut } from '@/store'

defineProps<Props>()

const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(true)
const { isSmallMd } = useBasicLayout()

const message = useMessage()
const dialog = useDialog()

interface Props {
  visible: boolean,
	progress: number
}


const themeVars = ref(useThemeVars())

function handleCloseDialog() {
  loading.value = true
}


function openDialog() {

}


</script>

<template>
  <NModal :show="visible" :style="{ maxWidth: `1200px`, minWidth: isSmallMd ? '100%' : '1000px' }" :on-after-enter="openDialog" :on-after-leave="handleCloseDialog">
    <div class="p-4 bg-white rounded dark:bg-[#3E3E64] max-h-4/5">
      <div class=" flex cursor-pointer justify-between ">

        <span class="text-xl">上传文件进度</span>
<!--        <NIcon size="20" color="#0e7a0d" @click="useGlobalStore.updateGoodsDialog(false)">-->
<!--          <CloseOutline />-->
<!--        </NIcon>-->
      </div>

			<div>
        <n-progress
            :percentage="progress"
            indicator-placement="inside"
            :processing="progress !== 100 && progress > 0"
            :indicator-text-color="progress !== 0 ? '#fff' : '#333'"
            :height="12"
            type="line"
            :color="progress <= 50 ? themeVars.infoColor : themeVars.successColor"
        />
			</div>

    </div>
  </NModal>
</template>
