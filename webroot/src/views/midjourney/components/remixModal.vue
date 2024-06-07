<script setup lang="ts">
import {NButton, NInput, NModal, useMessage} from 'naive-ui'
import {useAuthStore} from "@/store";
import {computed, reactive} from "vue";
import {fetchAddMjDrawTaskAPI, fetchGetDraw} from "@/api/mjDraw";
import {MidJourneyDrawEnum, MidjourneyActionEnum} from "@/constants";

const ms = useMessage();
const authStore = useAuthStore();
const showDialog = computed(() => authStore.openRemixModal);
const taskId = computed(() => authStore.taskId);
const remixModalData = computed(() => authStore.openRemixModalData)

const form = reactive({
  id: 0,
  zoom: ""
});



const handleSubmit = () => {
  // 提交二次数据的prompt
  fetchAddMjDrawTaskAPI({
        type: MidJourneyDrawEnum.REGION_ACTION,
        params: {
          prompt: form.zoom,
					taskId: remixModalData.value.taskId,
        }
      }
  ).then(res => {
		ms.success('操作成功、请等待绘制结束！')
		authStore.updateRemixModal(false);
	}).catch(error => {
    if (error.code === 402 || error?.message.includes('余额不足') || error?.message.includes('免费额度已经使用完毕')) {
  		authStore.updateRemixModal(false);
      useGlobalStore.updateVipDialog(true);
		} else {
			ms.error(error.message)
		}
  })
}

const handleSendSquire = async () => {
  const result = await fetchAddMjDrawTaskAPI({drawId: form.id, prompt: form.zoom, action: MidjourneyActionEnum.ZOOM, orderId: 3}).then(res => res.data)
  authStore.updateDrawId({id: result})
  ms.success('提交图片自定义缩放绘制任务成功、请等待绘制结束！')
  authStore.updateCustomZoom(false, '');
}

// 查询广场类型列表
const handleQueryList = async () => {
  // const result = await fetchGetDraw({jobId: taskId.value}).then(res => res.data)
  // form.id = result.id;
  // form.zoom = result.fullPrompt + " --zoom 2";
}

</script>

<template>

  <n-modal
      v-model:show="showDialog"
      :mask-closable="false"
      :show-icon="false"
      preset="dialog"
      title="Remix"
      @after-enter="handleQueryList"
      @close="authStore.updateRemixModal(false, 0)"
  >
    <div class="my-8">
      <div>输入新的绘图描述</div>
      <NInput  v-model:value="form.zoom" placeholder="输入新的绘图描述" type="textarea" :resizable="false" :rows="7" ></NInput>
    </div>

    <template #action>
      <NButton round @click="authStore.updateRemixModal(false, 0)">取消</NButton>
      <NButton round type="primary" @click="handleSubmit">确定</NButton>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">

</style>

