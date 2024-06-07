<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
import RightSider from './components/sider/index.vue'
import Role from './roleRepository/index.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore } from '@/store'
const appStore = useAppStore()

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['rounded-none', 'shadow-none']
  return ['rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
  ]
})
</script>

<template>
  <div class="h-full dark:bg-[#131323] transition-all">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider  >
        <NLayoutContent class="h-full">
          <Role />
        </NLayoutContent>
        <RightSider />
      </NLayout>
    </div>
  </div>
</template>
