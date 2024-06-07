<script setup lang='ts'>
import {NIcon, NModal} from 'naive-ui'
import HotApps from '@/views/appStore/components/main/apps.vue'
import {computed,  ref} from 'vue'
import {useAppCatStoreWithOut, useAppStore} from '@/store'
import {CloseOutline} from "@vicons/ionicons5";
defineProps<Props>()

const loading = ref(false)
const appCatStore = useAppCatStoreWithOut()
const appStore = useAppStore();
const theme = computed(() => appStore.theme)
interface Props {
  visible: boolean,
}

const handleClose = () => {
  appCatStore.updateAppCenterDialog(false)
  loading.value = false;
}

</script>

<template>

  <NModal :show="visible"
          style="width: 90%; max-width: 1240px; height: 70vh;"
          :mask-closable="false"
          :on-after-leave="handleClose">
    <div class="px-4 bg-white rounded dark:bg-[#3E3E64]">

      <div class="absolute top-3 right-3 cursor-pointer z-30" @click="handleClose">
        <NIcon size="26" :color="theme === 'dark' ? '#fff' : '#333'">
          <CloseOutline/>
        </NIcon>
      </div>
      <div style="height: 540px" class="pt-5 mt-6">
           <HotApps></HotApps>
      </div>
    </div>
  </NModal>
</template>
