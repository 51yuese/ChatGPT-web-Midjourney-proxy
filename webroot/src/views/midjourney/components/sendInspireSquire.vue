<script setup lang="ts">
import {NButton, NSelect, NModal, useMessage} from 'naive-ui'
import {useAuthStore} from "@/store";
import {computed, ref, reactive} from "vue";
import {fetchQuerySpireClassify, fetchRecDraw} from "@/api/mjDraw";

const ms = useMessage();

const authStore = useAuthStore();
const showDialog = computed(() => authStore.sendSquareDialog)
const sendSquareTaskId = computed(() => authStore.sendSquareTaskId)

const form = reactive({
  id: sendSquareTaskId.value,
  squareType: ''
})

const squareList = ref<{name: string, value: string}[]>([]);

const handleSendSquire = async () => {
  const res = await fetchRecDraw({id: sendSquareTaskId.value, squareType: form.squareType});
  res && ms.success("发布到广场成功");
  authStore.updateSendSquire(false, 0);
}

// 查询广场类型列表
const handleQueryList = async () => {
  squareList.value = await fetchQuerySpireClassify({page: 1, size: 20}).then(res => res.data.rows);

	if (squareList.value.length) {
		form.squareType = squareList.value[0].value;
	}
}

</script>

<template>

  <n-modal
      v-model:show="showDialog"
      :mask-closable="false"
      :show-icon="false"
      preset="dialog"
      title="发布到广场"
      @after-enter="handleQueryList"
      @close="authStore.updateSendSquire(false, 0)"
  >
    <div class="my-8">
      <div>选择广场类型</div>
      <div>
        <n-select class="dark:bg-[#010102] " v-model:value="form.squareType" placeholder="选择广场类型" label-field="name" :options="squareList"/>
      </div>
    </div>

    <template #action>
      <NButton round @click="authStore.updateSendSquire(false, 0)">取消</NButton>
      <NButton round type="primary" @click="handleSendSquire">发布</NButton>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">

</style>
