<script setup lang="ts">
import {computed} from 'vue'
import {useAuthStore} from "@/store";
const auth = useAuthStore()
const nickname = computed(() => auth.userInfo.username);

</script>

<template>
  <div class="w-full">
		<h1 class="text-[26px]">用户昵称-{{nickname}}</h1>
	</div>
</template>

<style scoped lang="scss">

</style>
