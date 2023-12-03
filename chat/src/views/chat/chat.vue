<script setup lang='ts'>
import { computed, watch } from 'vue'
import { NLayout } from 'naive-ui'
import Sider from './components/sider/index.vue'
import ChatBase from './chatBase.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStore, useChatStore } from '@/store'
import emptyChat from './components/emptyChat/index.vue'

const appStore = useAppStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { isMobile } = useBasicLayout()
const isLogin = computed(() => authStore.isLogin)
const collapsed = computed(() => appStore.siderCollapsed)
const dataSources = computed(() => chatStore.groupList)

watch(isLogin, async (newVal, oldVal) => {
  if (newVal && !oldVal)
    await chatStore.queryMyGroup()
})

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
    { 'pl-[260px]': !isMobile.value && !collapsed.value },
  ]
})
</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
        <Sider class="h-full" />
        <!-- <NLayoutContent class="h-full"> -->
        <div class="w-full flex-1">
          <ChatBase v-if="dataSources.length"/>
					<emptyChat v-if="!dataSources.length" />
        </div>
        <!-- </NLayoutContent> -->
      </NLayout>
    </div>
  </div>
</template>
