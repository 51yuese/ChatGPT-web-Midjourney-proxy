<script setup lang='ts'>
import { computed, ref,  } from 'vue'
import { NLayout  } from 'naive-ui'

import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useChatStore } from '@/store'
import HotApps from "@/views/appStore/components/main/apps.vue";
const appStore = useAppStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { isMobile } = useBasicLayout()
const isLogin = computed(() => authStore.isLogin)
const collapsed = computed(() => appStore.siderCollapsed)
const grid = ref<any>(null)
const theme = computed(() => appStore.theme)

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['rounded-md', 'shadow-md', 'dark:border-neutral-800']
})


</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all">
    <div class="h-full overflow-hidden flex flex-col" :class="getMobileClass">
      <NLayout class="transition flex-1 h-full w-full">
        <div class="flex flex-col w-full ">
          <HotApps></HotApps>
        </div>
      </NLayout>
    </div>
  </div>
</template>

