<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
const authStore = useAuthStore()
import logo from '@/assets/logo.png'
const logoPath = computed(() => authStore.globalConfig.clientLogoPath);
const sideName = computed(() => authStore.globalConfig.siteName);
const homePage = computed(() => authStore.globalConfig.clientHomePath || '/');

const { isMobile } = useBasicLayout()

const getMobileClass = computed(() => {
  if (isMobile.value)
    return ['py-2', 'w-8', 'ml-3']
  return ['py-1', 'px-1', 'w-14',]
})
</script>

<template>
  <RouterLink :to="homePage" class="mr-20">
		<div class="flex justify-start items-center ">
			<img style="width: 40px;height: 40px" :src="logoPath ? logoPath : logo" :class="getMobileClass"  class="cursor-pointer px-0 dark:border-[#ffffff17] border-#ebebeb-400" alt="">
			<h1 style="font-size: 20px;font-weight: 600;" class="text-[26px] line-clamp-1 ml-0.5 capitalize leading-none w-auto pb-0 pt-1 min-w-[120px] ">{{sideName || "GoMaxAi"}}</h1>
		</div>
  </RouterLink>
</template>
