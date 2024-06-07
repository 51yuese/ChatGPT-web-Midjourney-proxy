<script setup lang="ts">

import {computed} from 'vue'
import {useAuthStore} from "@/store";
const auth = useAuthStore()
import logo from '@/assets/logo.png'
const avatar = computed(() => auth.globalConfig.clientLogoPath || logo);
const sideName = computed(() => auth.globalConfig.siteRobotName || "GoMaxAi")
const isLogin = computed(() => auth.isLogin);


</script>

<template>
	<div class="flex justify-start">
		<img  class="w-auto h-8 px-0 mr-2 dark:border-[#ffffff17] border-#ebebeb-400"  :src="isLogin ? avatar : logo" alt="">
		<h1  class="text-[18px] ml-0.5 capitalize leading-none flex self-center pb-0 pt-1 ">{{sideName}}</h1>
	</div>
</template>

<style scoped lang="scss">

</style>
