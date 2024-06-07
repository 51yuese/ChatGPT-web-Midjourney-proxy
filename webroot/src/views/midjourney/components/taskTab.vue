<script setup lang="ts">

import {taskList, taskMap} from "@/views/midjourney/components/mj-menu";
import {NTabPane, NTabs} from "naive-ui";
import {computed, ref} from "vue";
import {useBasicLayout} from "@/hooks/useBasicLayout";
const {isMobile} = useBasicLayout();
const prop = defineProps({active: {type: Number, required: true, default: 0}})
const mode = computed(() => prop.active);

const emit = defineEmits(["change"])
const handleChange = (ev: string) => {
	emit('change', taskMap[ev])
}

const tabStyle = computed(() => {
  return isMobile ? 'width: auto; text-align: center;' : 'min-width: 90px; text-align: center;'
})

</script>

<template>
	<n-tabs
    :size="isMobile ? 'small' : 'large'"
		v-model="mode"
		type="card"
		animated
		trigger="click"
		:tab-style="tabStyle"
		@update:value="handleChange"
	>
		<n-tab-pane v-for="panel in taskList" :key="panel.label" :name="panel.label"></n-tab-pane>
	</n-tabs>

</template>

<style scoped lang="scss">

</style>
