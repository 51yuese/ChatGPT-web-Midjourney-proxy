<script setup lang="ts">
import {NButton, NInput, NModal, useMessage} from 'naive-ui'
import {useAuthStore} from "@/store";
import {computed, reactive} from "vue";
import {fetchAddMjDrawTaskAPI, fetchGetDraw} from "@/api/mjDraw";
import {MidjourneyActionEnum} from "@/constants";

const ms = useMessage();

const authStore = useAuthStore();
const showDialog = computed(() => authStore.customZoomDialog);
const taskId = computed(() => authStore.taskId)

const form = reactive({
  id: 0,
  zoom: ""
})

const handleSendSquire = async () => {
  const result = await fetchAddMjDrawTaskAPI({drawId: form.id, prompt: form.zoom, action: MidjourneyActionEnum.ZOOM, orderId: 3}).then(res => res.data)
  authStore.updateDrawId({id: result})
  ms.success('提交图片自定义缩放绘制任务成功、请等待绘制结束！')
  authStore.updateCustomZoom(false, '');
}

// 查询广场类型列表
const handleQueryList = async () => {
  const result = await fetchGetDraw({jobId: taskId.value}).then(res => res.data)
  form.id = result.id;
  form.zoom = result.fullPrompt + " --zoom 2";
}

</script>

<template>

  <n-modal
      v-model:show="showDialog"
      :mask-closable="false"
      :show-icon="false"
      preset="dialog"
      title="自定义缩放"
      @after-enter="handleQueryList"
      @close="authStore.updateCustomZoom(false, 0)"
  >
    <div class="my-8">
      <div>输入自定义缩放</div>
      <NInput  v-model:value="form.zoom" placeholder="输入描述的自定义缩放" type="textarea" :resizable="false" :rows="7" ></NInput>
    </div>

    <template #action>
      <NButton round @click="authStore.updateCustomZoom(false, 0)">取消</NButton>
      <NButton round type="primary" @click="handleSendSquire">确定</NButton>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">

</style>
