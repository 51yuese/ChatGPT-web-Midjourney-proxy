<script setup lang="ts">
import {NModal, NInput, NButton, useMessage} from 'naive-ui'
import {ref,computed} from 'vue'
import {fetchGetMjPromptAssociateApi} from "@/api/mjDraw";
import {useAuthStore} from "@/store";
import EventBus from '@/hooks/eventBus';
const show = ref(false) // 显示弹窗
const thinking = ref(false) // 思考中
const thinked = ref(false) // 思考完成
const thinks = ref(''); // 内容
const tempThinks = ref("") // 缓存，用户再次联想
const ms = useMessage();

const authStore = useAuthStore();

const disabledCreate = computed(() => thinking.value || !thinks.value)

const open = () => {
  show.value = true;
}

// 重新联想
const handleRethink = () => {
    thinks.value = tempThinks.value;
    handleCreate();
}

const handleCreate = async () => {
  thinked.value = false;
  tempThinks.value = thinks.value;

  if (!thinks.value) {
    ms.info("请输入简单的描述!")
		thinking.value = false;
		thinked.value = false;
    return;
  }

  thinking.value = true;
  const result = await fetchGetMjPromptAssociateApi({prompt: thinks.value}).then(res => res.data || "").catch(() => {
    thinking.value = false;
    thinked.value = false;
  })
  thinking.value = false;
  thinks.value = result;
  thinked.value = true;
}

const handleDeal = () => {
  authStore.updatePromptWords({prompt: thinks.value});
  show.value = false;
  EventBus.emit("think",thinks.value)
}

defineExpose({
  open
})

</script>

<template>
  <n-modal v-model:show="show"
           preset="dialog"
           title="AI帮我想"
           :close-on-esc="false"
           :mask-closable="false"
           :show-icon="false"
  >
    <NInput v-model:value="thinks"
            clearable
            type="textarea"
            :loading="thinking"
            bordered
            :disabled="thinking"
            placeholder="请输入简单的描述，AI将智能完善创意描述"
            show-count
            :rows="7" maxlength="3000"
            class="dark:bg-[#010102] bg-[#f4f4f4]"
            ></NInput>
    <template #action>
      <NButton round v-if="thinked" @click="handleRethink">重新联想</NButton>
      <NButton round v-if="thinked" @click="handleDeal">使用此描述</NButton>
      <NButton round v-if="!thinked" @click="handleCreate" :disabled="disabledCreate">生成此描述</NButton>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">

</style>
