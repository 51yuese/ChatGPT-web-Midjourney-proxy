<script setup lang="ts">

import {
  NButton,
  NSelect,
  NSlider,
  NUpload,
  NInput,
  NTooltip,
  useMessage,
  NRadio
} from "naive-ui";
import {SvgIcon, SIcon} from "@/components/common";
import {
  mjModelKeyMap,
  modelOptions,
  qualityOptions, radioGroup, radioMobileGroup, similarityOptions,
  sizeList,
  imgMixImgSize,
  styleMjOptions,
  styleOptions
} from './mj-menu'
import {computed, reactive, ref} from "vue";
import {useAuthStore, useGlobalStoreWithOut} from "@/store";
import {fetchAddMjDrawTaskAPI, fetchUploadImage, fetchUploadImageDrawTaskAPI,} from '@/api/mjDraw'

const {updateDrawId,} = useAuthStore();
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {useRoute} from "vue-router";
import {MidjourneyActionEnum, MidJourneyDrawEnum} from "@/constants";
import {useUpload} from "@/views/chat/hooks/useUpload";

const ms = useMessage()
const authStore = useAuthStore();
const sumDrawMjCount = computed(() => authStore.userBalance.sumDrawMjCount);
const form = computed(() => authStore.mjDrawForm);
const {isMobile} = useBasicLayout();
const route = useRoute();
const useGlobalStore = useGlobalStoreWithOut()
const routerPath = computed(() => route.path)

const previewImage = ref("")

const imageForm = reactive<{
  files: File[],
  previewImages: string[]
}>({
  files: [],
  previewImages: []
})

const emit = defineEmits(['fresh'])
const loading = ref(false);

const currentPage = computed(() => {
  return routerPath.value.includes('text-to-image') ?
      MidJourneyDrawEnum.TEXT_TO_IMAGE : routerPath.value.includes('image-to-text') ?
          MidJourneyDrawEnum.IMAGE_TO_TEXT : routerPath.value.includes('image-mix-image') ?
              MidJourneyDrawEnum.IMAGE_MIX_IMAGE : MidJourneyDrawEnum.NONE;
})

const disabledSubmit = computed(() => {
  return currentPage.value === MidJourneyDrawEnum.IMAGE_MIX_IMAGE ? imageForm.files.length <= 1 :
      currentPage.value === MidJourneyDrawEnum.IMAGE_TO_TEXT ? imageForm.files.length <= 0 : false
})

const {selectFile} = useUpload();

const handleSelectImage = async () => {
  const file = await selectFile();

  previewImage.value = URL.createObjectURL(file);
  imageForm.files = [file]

}

const defaultPreviewList = computed(() => form.value.baseImage.map(item => {
  const ids = item.slice(item.lastIndexOf('/') + 1, item.length);
  return {
    url: item,
    id: ids.split('.')[0],
    name: ids,
    status: 'finished',
  }
}));

const refreshLoading = ref(false)
const activeAspect = computed(() => (item: string) => {
  return form.value.size === item
})


async function refreshUserInfo() {
  refreshLoading.value = true
  try {
    await authStore.getUserInfo()
    refreshLoading.value = false
  } catch (error) {
    refreshLoading.value = false
  }
}

const fileType = ['jpg', 'jpeg', 'png'];

const handleChangeImage = (ev: { file: { status: string; type: string; id: string; file: string | Blob; }; }) => {
  if (ev.file.status === "finished" || ev.file.status === "removed") return;
  const fileName = ev.file.type.split('/')[1];
  if (ev.file.status === "pending" && fileType.includes(fileName)) {
		const reader = new FileReader();
		reader.readAsDataURL(ev.file.file)
		reader.onload = function () {
			form.value.baseImage.push(reader.result);
			changeForm();
		}
  }

}

const handleChangeUploadMixImage = (ev: { file: { file: File, status: string; type: string; id: string; }; }) => {
  if (ev.file.status === 'pending') {
    imageForm.files.push(ev.file.file)
  }
  if (ev.file.status === "removed") {
    imageForm.files = imageForm.files.filter(item => item !== ev.file.file)
  }
}

const handleBeforeUploadMj = (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {
  const fileName = ev.file.type.split('/')[1];

  if (ev.fileList.length > 4) {
    ms.warning("最多只能上传5张图片")
    return false;
  }
  return fileType.includes(fileName) && ev.fileList.length <= 5;
}


const handleBeforeUpload = (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {
  const fileName = ev.file.type.split('/')[1];

  if (ev.fileList.length > 2) {
    ms.warning("最多只能上传3张图片")
    return false;
  }
  return fileType.includes(fileName) && ev.fileList.length <= 2;
}

const handleRemove = (ev: { file: { id: string; status: string; type: string; url: string; }; }) => {

  if (ev.file.status === "finished") {
    form.value.baseImage = form.value.baseImage.filter(item => item.search(ev.file.url) === -1);
    changeForm();
    return;
  }
  const id = ev.file.id;
  const fileName = ev.file.type.split('/')[1];
  const name = id + '.' + fileName;
  form.value.baseImage = form.value.baseImage.filter(item => item.search(name) === -1);
  changeForm();
}

const handleRemoveImageToText = (ev: { file: { name: string; id: string; status: string; type: string; url: string; }; }) => {

  const name = ev.file.name;

  form.value.extendParam = form.value.extendParam.filter(item => !item.filename.includes(name));

  changeForm();
}

const handleSelect = (item: { value: string; }) => {
  form.value.size = item.value;
  changeForm();
}

const changeForm = async () => {
  authStore.updateMjDrawForm(form.value)
}

const changeModel = (model: string) => {
  if (model.includes('NIJI')) {
    form.value.style = ""
  }

  if (model.includes('MJ')) {
    form.value.style = 'raw'
  }
  changeForm();
}

const handleChangeMode = (ev: { value: number; }) => {
  form.value.mode = ev.value;
  changeForm()
}

/* 格式化绘画参数 */
const formatParams = () => {

  let formatPropmpt = ''

  /* 不需要的内容 */
  form.value.sensitiveWords && (formatPropmpt += ` --no ${form.value.sensitiveWords}`)

  // /* 图片 */
  // mjDrawForm.baseImage.length > 0 && (formatPropmpt += ` ${mjDrawForm.baseImage.join(" ")} `)

  /* 模型+版本 */
  const models = form.value.model.split("-");
  if (models[0].includes('MJ')) {
    formatPropmpt += ` --v ${models[1]}`
    formatPropmpt += ` --s ${form.value.stylize}`
  }

  if (models[0].includes('NIJI')) {
    formatPropmpt += ` --niji ${models[1]}`

    /* niji5 拥有的风格 */
    form.value.style && models[1] === "5" && (formatPropmpt += ` --style ${form.value.style}`)
  }

  /* 尺寸 */
  formatPropmpt += ` --ar ${form.value.size}`

  /* chaos (混乱) */
  formatPropmpt += ` --c ${form.value.diversity}`

  /* quality */
  formatPropmpt += ` --q ${form.value.quality}`

  /* 模式 */
  formatPropmpt += ` --${mjModelKeyMap[form.value.mode]}`

  /* 相似度 */
  form.value.baseImage.length > 0 && (formatPropmpt += ` --iw ${form.value.similarity}`)

  return formatPropmpt
}

const hasParameters = (str: string) => {
  const regex = /--\w+\s\S+/g
  return regex.test(str)
}

const handleSubmitTextToImage = async () => {

  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }

  // 创建绘画任务
  if (!form.value.prompt) return;

  const imgUrl = form.value.baseImage.length ? form.value.baseImage.join(" ") : undefined;

  let promptWords = form.value.prompt;

  let originParam = "" // 原始参数

  if (hasParameters(promptWords)) {
    originParam = promptWords.slice(promptWords.indexOf("--"), promptWords.length)
  }

  let extraParam = originParam || formatParams()


  // 文生图
  const drawId = await fetchAddMjDrawTaskAPI({
        type: MidJourneyDrawEnum.TEXT_TO_IMAGE,
        params: {
          action: MidjourneyActionEnum.TEXT_TO_IMAGE,
          extend: extraParam,
          prompt: promptWords,
          imageUrl: imgUrl,
          mode: form.value.mode,
          translate: form.value.translate
        }
      }
  ).then(res => res.data).catch(error => {

    if (error.code === 402 || error?.message.includes('余额不足') || error?.message.includes('免费额度已经使用完毕'))
      useGlobalStore.updateVipDialog(true);

  })

  drawId && ms.success("创建文生图任务成功");

  form.value.prompt = "";
  updateDrawId({id: drawId});
  emit("fresh");
}

// 提交任务
const handleAddTask = async () => {

  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }

  if (currentPage.value === MidJourneyDrawEnum.NONE) {
    ms.error("操作类型错误")
    return;
  }

  // 文生图
  if (currentPage.value === MidJourneyDrawEnum.TEXT_TO_IMAGE) {
    await handleSubmitTextToImage();
  } else {

    const formdata = new FormData();

    if (currentPage.value === MidJourneyDrawEnum.IMAGE_TO_TEXT) {
      formdata.append("type", currentPage.value + '')
      formdata.append("action", MidJourneyDrawEnum.IMAGE_TO_TEXT + '')
      formdata.append("mode", form.value.mode + '')
      formdata.append("files", imageForm.files[0]);
    }

    if (currentPage.value === MidJourneyDrawEnum.IMAGE_MIX_IMAGE) {
      formdata.append("type", currentPage.value + '')
      formdata.append("action", MidJourneyDrawEnum.IMAGE_MIX_IMAGE + '')
      formdata.append("mode", form.value.mode + '')
      formdata.append("size", form.value.size + '');

      imageForm.files.forEach((item, index) => {
        formdata.append('files', item);
      })

    }

    // 文生图
    const drawId = await fetchUploadImageDrawTaskAPI(formdata).then(res => res.data).catch(error => {

      if (error.code === 402 || error?.message.includes('余额不足') || error?.message.includes('免费额度已经使用完毕'))
        useGlobalStore.updateVipDialog(true);
    })

    drawId && ms.success(currentPage.value === MidJourneyDrawEnum.TEXT_TO_IMAGE ? "创建文生图任务成功" :
        currentPage.value === MidJourneyDrawEnum.IMAGE_TO_TEXT ? "创建图生文任务成功" : currentPage.value === MidJourneyDrawEnum.IMAGE_MIX_IMAGE ? '创建图混图任务成功' : '失败');

    drawId && updateDrawId({id: drawId});
    drawId && emit("fresh");
  }


  imageForm.files = [];

}

</script>

<template>
  <div :class="[isMobile ? 'p-2 h-auto' : 'overflow-y-auto w-full h-[90vh] p-4 ']"
       class="sm:pt-6 bg-[#fff] dark:bg-[#1F1F38] sm:w-[20rem]  shrink-0 ">

    <!-- 文生图 -->
    <div v-if="routerPath.includes('text-to-image')">
      <!-- 模型设置 -->
      <div class="mt-4 p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl']">
        <div class=" text-sm flex items-center">
          <div class="text-[18px] mr-1">
            <h1>模型设置</h1>
          </div>
          <div data-tool-target="tooltip-default">
            <NTooltip placement="right-end" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ri:error-warning-line" class="text-base"/>
              </template>
              <div style="width: 240px">
                <p>MJ: 偏真实通用模型</p>
                <p>NIJI: 偏动漫风格、适用于二次元模型</p>
              </div>
            </NTooltip>
          </div>
        </div>

        <div class="flex items-center mt-2">
          <p class="w-1/2">绘画模型</p>
          <NSelect v-model:value="form.model" @update:value="changeModel(form.model)" size="small"
                   :options="modelOptions"/>
        </div>

        <div class="flex items-center mt-2">
          <p class="w-1/2">--q 质量</p>
          <NSelect v-model:value="form.quality" @update:value="changeForm" size="small" :options="qualityOptions"/>
        </div>

        <div class="flex items-center mt-2" v-if="form.model.includes('5')">
          <p class="w-1/2">--style风格</p>
          <NSelect v-model:value="form.style" v-if="form.model.includes('NIJI-5')" @update:value="changeForm"
                   size="small" :options="styleOptions"/>
          <NSelect v-model:value="form.style" v-if="form.model.includes('MJ-5')" @update:value="changeForm" size="small"
                   :options="styleMjOptions"/>
        </div>

        <div class="flex items-center mt-2" v-if="form.model.includes('MJ')">
          <div class="w-1/2 flex items-center">
            <p>--s 风格化</p>
            <NTooltip placement="right-end" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ri:error-warning-line" class="text-[14px]"/>
              </template>
              <p>数值越高，画面表现也会更具丰富性和艺术性</p>
            </NTooltip>
          </div>
          <n-slider v-model:value="form.stylize" @update:value="changeForm" :max="1000" :min="0" :step="1"/>
        </div>

        <div class="flex items-center mt-2">
          <div class="w-1/2 flex items-center">
            <p>--c 多样性</p>
            <NTooltip placement="right-end" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ri:error-warning-line" class="text-[14px]"/>
              </template>
              <p>值越小生成的四张图风格越相似，反之差异越大</p>
            </NTooltip>
          </div>
          <n-slider v-model:value="form.diversity" @update:value="changeForm" :max="100" :min="1" :step="1"/>
        </div>
      </div>

      <div class="mt-4 p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl']">
        <div class="text-sm flex items-center ">
          <div class="mr-1">
            <h1 class="text-[18px] ">垫图图片（0-3张）</h1>
            <p class="text-[14px] mt-2 text-[#999]">如需垫图请至少上传一张图片</p>
          </div>
        </div>

        <div class="flex items-center mt-2">
          <n-upload
              accept=".jpg,.jpeg,.png"
              action=""
              :default-file-list="defaultPreviewList"
              :default-upload="false"
              :on-change="handleChangeImage"
              :on-before-upload="handleBeforeUpload"
              :on-remove="handleRemove"
              list-type="image-card"
          />
        </div>


        <div class="flex items-center mt-2">
          <p class="w-1/3">图片相似度</p>
          <div class="w-2/3">
            <NSelect v-model:value="form.similarity" @update:value="changeForm" size="small"
                     :options="similarityOptions"/>
          </div>

        </div>

      </div>

      <div class="mt-4 p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl']">
        <div class="text-sm flex items-center ">
          <div class="mr-1">
            <h1 class="text-[18px] ">不想出现的词</h1>
          </div>
        </div>

        <div class="flex items-center mt-2">
          <n-input v-model:value="form.sensitiveWords" @change="changeForm"
                   placeholder="多个词用逗号隔开 如 漂亮，帅哥"/>
        </div>

      </div>

      <div class="mt-4 p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl']">
        <div class="text-sm flex items-center ">
          <div class="mr-1">
            <h1 class="text-[18px] ">图片尺寸</h1>
          </div>
        </div>

        <div class="flex-col mt-2">
          <div v-for="(item) in sizeList" class="flex justify-between">
            <button
                v-for="(subItem) in item"
                :key="subItem.aspect"
                class="flex-1 p-[2px] mx-0.5 rounded-md"
                @click="handleSelect(subItem)"
            >
              <div class="border-2 border-gray-500 box-border rounded-md dark:bg-transparent flex flex-col items-center"
                   :class="[activeAspect(subItem.value) ? 'dark:bg-[#52546D] bg-[#DDDDDD] border-[#3342C8] dark:border-[#3342C8]' : '',  'py-2']">
                <div class="flex items-center justify-center w-6 h-6">
                  <div class="border-gray-400 border-dashed border-2 "
                       :class="[activeAspect(subItem.value) ? 'border-dashed dark:bg-[#4756E1] bg-[#3342C8]' : '']"
                       :style="{ width: subItem.width, height: subItem.height }"/>
                </div>

                <div class="mt-2 text-center text-xs leading-none text-current">
                  <p>{{ subItem.aspect }} </p>
                  <p class="text-[12px] scale-90">{{ subItem.label }} </p>
                </div>
              </div>

            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 p-4 rounded-xl dark:bg-[#262643] bg-[#F7F7F7] flex-1" v-if="!isMobile">
        <div class="flex justify-between">
          <span class="text-base py-1">钱包余额( <b class="text-[#3076fd]">{{ sumDrawMjCount || 0 }}</b> 积分)</span>
          <span class="flex items-center">
              <NButton text size="tiny" type="primary" :loading="refreshLoading" @click="refreshUserInfo">刷新</NButton>
              <NTooltip placement="right-end" trigger="hover">
                <template #trigger>
                  <SvgIcon icon="ri:error-warning-line" class="text-base ml-2"/>
                </template>
                绘画账户信息
              </NTooltip>
            </span>
        </div>
        <div class="mt-3  space-y-1 items-center text-[#3076fd] ">
          <div class="flex justify-between">
            <span class="w-[120px] block text-sm  dark:text-[#ccc]">绘画单次消耗：</span>
            <span class="text-sm pr-2  dark:text-[#ccc]">
                4积分
              </span>
          </div>
          <div class="flex justify-between">
            <span class="w-[120px] block text-sm  dark:text-[#ccc]">图生图单次消耗：</span>
            <span class="text-sm pr-2  dark:text-[#ccc]">
                4积分
              </span>
          </div>
          <div class="flex justify-between">
            <span class="w-[120px] block text-sm  dark:text-[#ccc]">放大单次消耗：</span>
            <span class="text-sm pr-2 dark:text-[#ccc]">
                1积分
              </span>
          </div>
        </div>
      </div>

    </div>

    <div class="flex justify-between flex-col "
         :class="[isMobile ? '' : 'h-full']"
         v-if="routerPath.includes('image-to-text')  || routerPath.includes('image-mix-image')">

      <!-- 图生文 -->
      <div v-if="routerPath.includes('image-to-text')">
        <template v-if="!isMobile">
          <h1 class="text-[18px] my-2">图片解读</h1>
          <div class="w-full h-[1px] bg-gray-200 dark:bg-[#313155]"></div>
        </template>

        <div class=" p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl mt-4']">
          <div class="text-sm flex items-center ">
            <div class="mr-1">
              <h1 class="text-[18px] ">上传图片（只能1张）</h1>
            </div>
          </div>

          <div class="flex items-center mt-2">
            <div class="w-[96px] overflow-hidden object-contain h-[96px] flex justify-center items-center rounded hover:dark:border-gray-500
             hover:border-gray-400 border-dashed border border-gray-300 cursor-pointer dark:border-gray-600"
                 @click="handleSelectImage">
              <img :src="previewImage" class="object-contain w-full h-full" alt="" v-if="previewImage">
              <SvgIcon icon="octicon:plus-16" class="text-[20px]" v-else></SvgIcon>
            </div>

          </div>

        </div>

        <div class="mt-4 p-4 rounded-xl dark:bg-[#262643] bg-[#F7F7F7] flex-1" v-if="!isMobile">
          <div class="text-sm flex items-center ">
            <div class="mr-1">
              <h1 class="text-[18px] ">提示</h1>
              <p class="text-[14px] mt-2 text-[#999]">同官方的 /describe 命令</p>
            </div>
          </div>

          <div class="flex items-center mt-2">
            系统将根据您上传的图片，解读处多个相关的提示词， 您可以根据解读出提示词重新绘制图像
          </div>
        </div>
      </div>

      <!-- 图混图 -->
      <div v-if="routerPath.includes('image-mix-image')">
        <template v-if="!isMobile">
          <h1 class="text-[20px] my-2">图混图</h1>
          <div class="w-full h-[1px] bg-gray-200 dark:bg-[#313155]"></div>
        </template>

        <div class=" p-4 dark:bg-[#262643] bg-[#F7F7F7] flex-1" :class="[isMobile ? 'rounded' : 'rounded-xl mt-4']">
          <div class="text-sm flex items-center ">
            <div class="mr-1">

              <h1 class="text-[18px] ">上传图片（2-5张）</h1>
              <!--            <p class="text-[14px] mt-2 text-[#999]">如需垫图请至少上传一张图片</p>-->
            </div>
          </div>

          <div class="flex items-center mt-2">
            <n-upload
                accept=".jpg,.jpeg,.png"
                action=""
                :disabled="imageForm.files.length >= 5"
                :default-file-list="imageForm.files"
                :default-upload="false"
                :on-change="handleChangeUploadMixImage"
                :on-before-upload="handleBeforeUploadMj"
                :on-remove="handleRemoveImageToText"
                list-type="image-card"
            />
          </div>

        </div>

        <div class="mt-4 p-4 rounded-xl dark:bg-[#262643] bg-[#F7F7F7] flex-1">
          <div class="text-sm flex items-center ">
            <div class="mr-1">
              <h1 class="text-[18px] ">图片尺寸</h1>
            </div>
          </div>

          <div class="flex-col mt-2">
            <div v-for="(item) in imgMixImgSize" class="flex justify-between">
              <button
                  v-for="(subItem) in item"
                  :key="subItem.aspect"
                  class="flex-1 p-[2px] mx-0.5 rounded-md"
                  @click="handleSelect(subItem)"
              >
                <div
                    class="border-2 border-gray-500 box-border rounded-md dark:bg-transparent flex flex-col items-center"
                    :class="[activeAspect(subItem.value) ? 'dark:bg-[#52546D] bg-[#DDDDDD] border-[#3342C8] dark:border-[#3342C8]' : '',  'py-2']">
                  <div class="flex items-center justify-center w-6 h-6">
                    <div class="border-gray-400 border-dashed border-2 "
                         :class="[activeAspect(subItem.value) ? 'border-dashed dark:bg-[#4756E1] bg-[#3342C8]' : '']"
                         :style="{ width: subItem.width, height: subItem.height }"/>
                  </div>

                  <div class="mt-2 text-center text-xs leading-none text-current">
                    <p>{{ subItem.aspect }} </p>
                    <p class="text-[12px] scale-90">{{ subItem.label }} </p>
                  </div>
                </div>

              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 rounded-xl dark:bg-[#262643] bg-[#F7F7F7] flex-1 select-none" v-if="!isMobile">
          <div class="text-sm flex items-center ">
            <div class="mr-1">
              <h1 class="text-[18px] ">提示</h1>
              <p class="text-[14px] mt-2 text-[#999]">同官方的 /describe 命令</p>
            </div>
          </div>

          <div class="flex items-center mt-2">
            系统将根据您上传的图片，解读处多个相关的提示词， 您可以根据解读出提示词重新绘制图像
          </div>
        </div>

      </div>

      <div class="flex flex-col" v-if="!isMobile">
        <ul class="flex justify-between mb-2">
          <li v-for="item in radioGroup" class="flex justify-start  cursor-pointer" @click="handleChangeMode(item)">
            <n-radio
                size="small"
                :checked="form.mode === item.value"
                :value="item.value"
                @change="handleChangeMode(item)"
            >
            </n-radio>
            <p class="ml-1  select-none"> {{ item.label }}</p>
          </li>
        </ul>

        <button class=" w-full flex justify-center
			 	  items-center h-10 rounded-full  text-center" :class="[disabledSubmit ? 'dark:bg-[#313155] bg-[#dedede] cursor-not-allowed ' :
			 	  'bg-gradient-to-l  cursor-pointer from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-l']"
                :disabled="disabledSubmit" @click="handleAddTask">
          <SvgIcon icon="eos-icons:bubble-loading" v-if="loading" class="mr-1"></SvgIcon>
          <p class="select-none"
             :class="[disabledSubmit ? ' text-[#333] dark:text-[#ccc]' : ' text-[#fff] dark:text-[#fff]']"
             v-if="!loading">提交任务(<span class="inline"><SIcon style="margin-right: 0; margin-left: 0;"
                                                                  class="inline" name="lightling"></SIcon></span>4)
          </p>

        </button>
      </div>
    </div>

    <div class="mt-4 p-4 rounded-xl dark:bg-[#262643] bg-[#F7F7F7] flex-1" v-if="isMobile">
      <div class="text-sm flex items-center ">
        <div class="mr-1">
          <h1 class="text-[16px] ">生成模式</h1>
        </div>
      </div>

      <ul class="mb-2">
        <li v-for="item in radioMobileGroup" class="w-full my-2 p-2 dark:bg-[#42425F] bg-[#F7F7F7] cursor-pointer"
            :class="[isMobile ? 'rounded' : '']" @click="handleChangeMode(item)">
          <div class="flex flex-row justify-between">
            <p class=" select-none" :class="[form.mode === item.value ? 'text-[#3076ED]' : '']"> {{ item.label }}</p>
            <n-radio
                size="small"
                :checked="form.mode === item.value"
                :value="item.value"
                @change="handleChangeMode(item)"
            >
            </n-radio>
          </div>
        </li>
      </ul>
    </div>

    <div class="flex flex-col mt-4" v-if="isMobile">
      <button class=" w-full flex justify-center
			 	  items-center h-10 rounded-full  text-center"
              :class="[disabledSubmit ? 'dark:bg-[#313155] bg-[#dedede] cursor-not-allowed' :
			 	      'bg-gradient-to-l  cursor-pointer from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-l']"
              :disabled="disabledSubmit"
              @click="handleAddTask">
        <p class="select-none text-white">提交任务(<span class="inline"><SIcon style="margin-right: 0; margin-left: 0;"
                                                                               class="inline" name="lightling"></SIcon></span>4)
        </p>
      </button>
    </div>

  </div>
</template>

<style scoped lang="scss">

.aspect-active-inner {
  border: 2px dashed #aaa;
  background: #4756E1;
}

.aspect-active-out {
  border: 2px solid #3074F8FF;
  background: #52546D;
}

</style>
