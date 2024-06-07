<script setup lang="ts">
import Recommend from './recommend.vue'
import {NButton, NInput, useMessage} from "naive-ui";
import {SvgIcon} from "@/components/common";
import {computed, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {t} from "@/locales";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {fetchAddMjDrawTaskAPI} from "@/api/mjDraw";
import {useAuthStore, useGlobalStoreWithOut} from "@/store";
import {MidjourneyActionEnum, MidJourneyDrawEnum} from "@/constants";
import {mjModelKeyMap} from "@/views/midjourney/components/mj-menu";

const {isMobile} = useBasicLayout();
const recommendRef = ref();
const translateLoading = ref(false);
const ms = useMessage();
const route = useRoute();
const useGlobalStore = useGlobalStoreWithOut()
const emit = defineEmits(["fresh"])
const authStore = useAuthStore()
const {updatePromptWords, mjDrawForm, updateDrawId} = useAuthStore();

watch(() => mjDrawForm.prompt, (newValue) => {
  prompt.value = newValue;
  // handleEnter();
})

const prompt = ref(mjDrawForm.prompt);

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

/* 格式化绘画参数 */
const formatParams = () => {

  let formatPropmpt = ''

  /* 不需要的内容 */
  mjDrawForm.sensitiveWords && (formatPropmpt += ` --no ${mjDrawForm.sensitiveWords}`)

  // /* 图片 */
  // mjDrawForm.baseImage.length > 0 && (formatPropmpt += ` ${mjDrawForm.baseImage.join(" ")} `)

  /* 模型+版本 */
  const models = mjDrawForm.model.split("-");
  if (models[0].includes('MJ')) {
    formatPropmpt += ` --v ${models[1]}`
    formatPropmpt += ` --s ${mjDrawForm.stylize}`
  }

  if (models[0].includes('NIJI')) {
    formatPropmpt += ` --niji ${models[1]}`

    /* niji5 拥有的风格 */
    mjDrawForm.style && models[1] === "5" && (formatPropmpt += ` --style ${mjDrawForm.style}`)
  }

  /* 尺寸 */
  formatPropmpt += ` --ar ${mjDrawForm.size}`

  /* chaos (混乱) */
  formatPropmpt += ` --c ${mjDrawForm.diversity}`

  /* quality */
  formatPropmpt += ` --q ${mjDrawForm.quality}`

  /* 模式 */
  formatPropmpt += ` --${mjModelKeyMap[mjDrawForm.mode]}`

  /* 相似度 */
  mjDrawForm.baseImage.length > 0 && (formatPropmpt += ` --iw ${mjDrawForm.similarity}`)

  return formatPropmpt
}

const taskId = ref(0)

const path = computed(() => route.path)

const currentPage = computed(() => {
	return path.value.includes('text-to-image') ?
      MidJourneyDrawEnum.IMAGE_TO_TEXT : path.value.includes('image-to-text') ?
          MidJourneyDrawEnum.IMAGE_TO_TEXT : path.value.includes('image-mix-image') ?
              MidJourneyDrawEnum.IMAGE_MIX_IMAGE : MidJourneyDrawEnum.NONE;
})


// 创建绘画任务
const handleEnter = async () => {

  if (!prompt.value) return;

  let promptWords = prompt.value;

  let originParam = "" // 原始参数

  if (hasParameters(promptWords)) {
     originParam = promptWords.slice(promptWords.indexOf("--"), promptWords.length)
  }

  let extraParam = ''

  let  translatedWord = ''

	extraParam = originParam ? originParam : formatParams()
	translatedWord = promptWords

  if (path.value.includes('image-to-text')) {
     extraParam = JSON.stringify(mjDrawForm.extendParam)
     translatedWord = promptWords
  }

  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }

  // 文生图
  const drawId = await fetchAddMjDrawTaskAPI({
    type: MidJourneyDrawEnum.TEXT_TO_IMAGE,
    params: {
      action: MidjourneyActionEnum.TEXT_TO_IMAGE,
      extend: extraParam,
      prompt: translatedWord,
			base64Array: mjDrawForm.baseImage,
      mode: mjDrawForm.mode,
      translate: mjDrawForm.translate
    }}
  ).then(res => res.data).catch(error => {

		if (error.code === 402 || error?.message.includes('余额不足') || error?.message.includes('免费额度已经使用完毕'))
			useGlobalStore.updateVipDialog(true);

	})

  drawId && ms.success(
      currentPage.value === MidJourneyDrawEnum.TEXT_TO_IMAGE ? "创建文生图任务成功" :
          currentPage.value === MidJourneyDrawEnum.IMAGE_TO_TEXT ? "创建图生文任务成功" :  currentPage.value === MidJourneyDrawEnum.IMAGE_MIX_IMAGE ? '创建图混图任务成功' : '失败');

  prompt.value = "";
  taskId.value = drawId;
  updateDrawId({id: drawId});
  updatePromptWords({prompt: prompt.value});
  emit("fresh");

}

// 提交
const submitDisabled = computed(() => {
  return !prompt.value || translateLoading.value

})

const handleSelectCommend = (data: { label: string, value: string }) => {
  prompt.value = data.label;
  updatePromptWords({prompt: prompt.value})
}


const handleShowRecommend = () => {
  if (prompt.value) return;

  recommendRef.value.open()
}

/* 移除用户自己的指令 */
function hasParameters(str: string) {
  const regex = /--\w+\s\S+/g
  return regex.test(str)
}

const handleInput = () => {
	recommendRef.value.close();
}

</script>

<template>
  <footer class="input-message">
    <div :class="['m-auto', isMobile ? 'px-2 py-1' : 'mt-4']">
      <div class="flex items-stretch space-x-2">
        <div class="relative flex-1 mj-input">

          <Recommend ref="recommendRef" @select="handleSelectCommend"></Recommend>

          <NInput
              ref="inputRef"
              v-model:value="prompt"
              type="textarea"
              round
              class="pb-10"
              clearable
							@input="handleInput"
              :placeholder="placeholder"
              :rows="isMobile ? 1 : 2"
              @keyup.enter.prevent="handleEnter"
              @click="handleShowRecommend"
          >
          </NInput>

          <div class="absolute bottom-2  right-2">
            <div class="flex items-center justify-between">
              <div class="flex justify-between items-center">
                <NButton text size="small" :disabled="submitDisabled" round @click="handleEnter">
                  <template #icon>
														<span class="dark:text-white">
															<SvgIcon icon="icon-park-outline:send"/>
														</span>
                  </template>
                  发送
                </NButton>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">

</style>
