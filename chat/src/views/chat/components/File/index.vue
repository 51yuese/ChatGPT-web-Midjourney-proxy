<script setup lang="ts">
  const prop = defineProps({
		files: {
		   type: Array,
		}
	})

</script>

<template>
    <div class="files-container">
			<ul>
				<li class=" bg-[#f4f6f8] dark:text-[#000] dark:bg-[#1e1e20] px-1 ml-1" v-for="item in files">{{item.name}}</li>
			</ul>
		</div>
</template>

<style scoped lang="less">
   .files-container {
		 ul {
			 li {

			 }
		 }
	 }
</style>
