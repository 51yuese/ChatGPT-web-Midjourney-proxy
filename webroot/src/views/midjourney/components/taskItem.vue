<script setup lang="ts">
import { computed, ref } from 'vue'
import Loading from '@/components/base/Loading.vue'
import { NButton, NTooltip, NImage, useDialog, useMessage, NSpin } from 'naive-ui';
import { SvgIcon } from '@/components/common';
import clipboard3 from "vue-clipboard3"
import {
  fetchRemoveMjDraw,
  fetchSetImageFavor,
  fetchAddMjDrawTaskAPI,
  imgSeed
} from "@/api/mjDraw";
import axios from "axios";
import { copyText } from "@/utils/format";
import { utcToShanghaiTime } from "@/utils/date";
import { useAuthStore } from "@/store";

const { updateSendSquire, updateDrawId, updatePreview } = useAuthStore();
const downloadUrl = `${import.meta.env.VITE_GLOB_API_URL}/midjourney/download`;
const dialog = useDialog();
const ms = useMessage();
import drawFail from '@/assets/images/draw-fail.png'
import { MidjourneyActionEnum, MidjourneyActionMap, MidJourneyDrawEnum } from "@/constants";
import { useMidjourneyStore } from "@/store/modules/midjourney";
import EventBus from '@/hooks/eventBus';

const { toClipboard } = clipboard3();
const midjourneyStore = useMidjourneyStore();
const authStore = useAuthStore()
const props = defineProps({
  task: {
    type: Object as any,
    default: () => ({
      prompt: "",
      image: "",
      time: "",
      updatedAt: "",
    })
  },
  chat: {
    type: String,
    default: "task"
  },
})
const emit = defineEmits(['fresh'])
const calcTips = computed(() => (item: any) => {
  const { progress, status } = item

  if (status === 1)
    return '正在排队中...'
  else if (status === 3)
    return '成功'
  else if (status === 2 && progress !== 100)
    return '正在绘制中...'
  else if (status === 2 && progress === 100)
    return '正在存储图片中...'
  else if (status === 4)
    return '绘图失败'
  else if (status === 5)
    return '绘图取消'
  else if (status === 6)
    return '窗口等待'
  else
    return '绘图失败'
})

const calcStatusMsg = computed(() => (status: number) => {
  return status === 1 ? '排队中' : (status === 2 ? '绘制中' : (status === 3 ? '成功' : (status === 4 ? '失败' : (status === 5 ? '超时' : '-'))))
})

const calcTimeMsg = computed(() => (time: number) => {

  if (!time) return ""

  const m = parseInt((time / 60) + '');
  const second = parseInt(String(time % 60));

  return m + '分' + second + '秒'
})

const calcActionMsg = computed(() => (action: number) => {
  return MidjourneyActionMap[action]
})

const scaleIcons = computed(() => {
  const buttons = props.task?.buttons || [];
  const arrU = []; // 放大
  const arrV = []; // 变化
  const arrUV = []; // Upscale Vary
  const arrZCM = []; // Zoom Custom Make
  const arr = [];

  buttons.forEach(item => {
    // 放大
    if (["U1", "U2", "U3", "U4"].includes(item.label)) {
      arrU.push(item);
    }
    // 变换
    else if (["V1", "V2", "V3", "V4"].includes(item.label)) {
      arrV.push(item);
    }
    else if (item.label.startsWith('Upscale') || item.label.startsWith('Vary')) {
      arrUV.push(item);
    }
    else if (item.label) {
      arrZCM.push(item);
    }
    else {
      arr.push(item)
    }
  })
  return [arrU, arrV, arrUV, arrZCM, arr].filter(item => item.length)
})


// 收藏
const handleFavorite = async (item: { id: number; favorite: number; }) => {
  const { id, favorite } = item;
  const result = await fetchSetImageFavor({ id, favorite: favorite === 1 ? 0 : 1 }).then(res => res.data)
  result && ms.success(`${favorite === 0 ? '收藏' : "取消收藏"} 成功`);
  emit('fresh')
}


/* 提交放大绘制任务 */
async function handleAddDrawTask(params: any) {

  const result = await fetchAddMjDrawTaskAPI({ type: MidJourneyDrawEnum.IMAGE_ACTION, params }).then(res => res).catch(res => res)
  if (result.code != 200) {
    ms.error('提交任务失败！')
    return
  }
  updateDrawId({ id: result.data });
  result && ms.success('提交任务成功！');
  emit("fresh",result.data)
}

// 获取动作
const getAction = (item: { label: string, customId: string, emoji: string }): MidjourneyActionEnum => {

  // 放大
  if (["U1", "U2", "U3", "U4"].includes(item.label)) {
    return MidjourneyActionEnum.U_SCALE;
  }

  // 变换
  if (["V1", "V2", "V3", "V4"].includes(item.label)) {
    return MidjourneyActionEnum.V_EXPAND;
  }

  // 重新生成no
  if (!item.label && item.emoji) {

    if (item.emoji === '🔄') {
      return MidjourneyActionEnum.REGENERATE;
    }

    if (['⬅️', '➡️', '⬆️', '⬇️'].includes(item.emoji)) {
      return MidjourneyActionEnum.STRETCH;
    }

    // 图生文
    if (["1️⃣", "2️⃣", "3️⃣", "4️⃣"].includes(item.emoji)) {
      return MidjourneyActionEnum.IMAGE_TO_TEXT_ACTION;
    }
  }

  if (item.label.includes('Upscale (4x)')) {
    return MidjourneyActionEnum.UPSCALE_4X
  }

  if (item.label.includes('Upscale (2x)')) {
    return MidjourneyActionEnum.UPSCALE_2X
  }

  if (item.label.includes('Vary (Subtle)')) {
    return MidjourneyActionEnum.VARY_SUBTLE
  }
  if (item.label.includes('Vary (Strong)')) {
    return MidjourneyActionEnum.VARY_STRONG
  }

  if (item.label.includes('Vary (Region)')) {
    return MidjourneyActionEnum.VARY_REGION
  }

  if (item.label.includes('Make Square')) {
    return MidjourneyActionEnum.SQUARE
  }

  if (item.label.includes('Zoom Out 2x')) {
    return MidjourneyActionEnum.ZOOM2X
  }

  if (item.label.includes('Zoom Out 1.5x')) {
    return MidjourneyActionEnum.ZOOM1_5X
  }

  if (item.label.includes('Custom Zoom')) {
    return MidjourneyActionEnum.ZOOM_CUSTOM
  }

  if (item.label.includes('Redo Upscale (Subtle)')) {
    return MidjourneyActionEnum.REDO_UPSCALE_SUBTLE
  }

  if (item.label.includes('Redo Upscale (Creative)')) {
    return MidjourneyActionEnum.REDO_UPSCALE_CREATIVE
  }

  return MidjourneyActionEnum.NONE

}

// 按钮操作
// const handleClick = async (task: { prompt: string, mode: number, id: number, imageUrl:string }, subItem: { label: string, customId: string, emoji: string },) => {
const handleClick = async (item, task) => {
  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }
  task.isSuccse = true
  const action = getAction(task);
  await handleAddDrawTask({
    action,
    taskId: item.id,
    customId: task.customId,
    messageFlags: item.messageFlags || 0
  })
  task.isSuccse = false
  emit("fresh")

}

const openRemixModal = (task: any) => {
  // 局部重绘 modal
  if (task.action === 9) {
    midjourneyStore.openRegionModal(true, {
      customId: task.customId,
      taskId: task.id,
      mode: task.mode
    });
  }
  // remix modal
  else {
    authStore.updateRemixModal(true, {
      prompt: '',
      taskId: task.id,
      customId: task.customId,
    });
  }
}


/* 复制 */
const handleCopyPrompt = (item: { fullPrompt: string }) => {
  const { fullPrompt } = item
  copyText({ text: fullPrompt })
  ms.success('复制prompt完成！')
}

/**
 * 直接从 imageUrl 下载图片
 */
async function handleDownload({ imageUrl }: { imageUrl: string }) {

  if (!imageUrl) {
    ms.warning('图片未生成完成暂不能下载')
    return
  }

  dialog.info({
    title: '下载图片',
    content: '是否确认下载当前图片',
    positiveText: '下载',
    negativeText: '取消',
    onPositiveClick: async () => {
      const filename = imageUrl.split('/');
      const response = await axios.post(downloadUrl, { url: imageUrl }, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const urlObject = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlObject
      link.download = filename[filename.length - 1]
      link.click()
    }
  })
}

// 删除
const handleRemove = (item) => {
  console.log(item)
  const { favorite } = item;

  dialog.create({
    type: "info",
    title: '确认删除',
    content: `${favorite === 1 ? '当前任务已被收藏，删除绘画任务会导致收藏失效且不可找回，确定删除' : '删除绘画任务不可找回，确定删除'}？`,
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    onPositiveClick: async () => {
      const result = await fetchRemoveMjDraw({ id: item.id }).then(res => res.data)
      result && ms.success("删除成功")
      emit("fresh")
    },
    onNegativeClick: () => {

    }

  })

}


// 发布到广场
const handlePublishSquare = async (param: { id: number }) => {
  updateSendSquire(true, param.id)
}

const imageProp = {
  referrerPolicy: "https://cdn.discordapp.com",
}

// 发布到广场
const handlePreview = async (param: { id: number }) => {
  updatePreview(true, param.id)
}

const changeList = ref(["V1", "V2", "V3", "V4"])
const seedValue = ref()
function handleSeed() {
  let data = {
    jobId: props.task.jobId
  }
  imgSeed(data).then(res => {
    seedValue.value = res.data
  })
}


async function copy(text) {
  try {
    await toClipboard(text);
    ms.success("复制成功")
  } catch (error) {
    ms.error("复制失败!!")
  }
}
</script>

<template>
  <div class="drawListBox dark:bg-[#010102] bg-[#f4f4f4]" v-for="item in props.task" :key="item.id">
    <div>
      <div class="topBox">
        <div class="drawAvatar">
          <img class="drawAvatarImg" src="../img/drawLogo.png" alt="">
        </div>
        <div style="width: 100%;">
          <div style=" width: 100%; " class="border-b-[2px] dark:border-[#58586E] borde-[#E2E2E2]">
            <div style="display: flex;align-items: center;justify-content: space-between;">
              <div style="display: flex;">
                <div class="drawContentTitle">
                  <p class="Title1">Midjourney Bot</p>
                  <p class="Title2" style="margin-right: 26px;">AI机器人</p>
                  <p class="Title3 text-[#808080] dark:text-[#d6d6d6]" v-if="item.createdAt">{{ item.createdAt.split("T")[0] }} {{ item.createdAt.split("T")[1].split(".")[0] }}</p>
                  <div v-if="item.status == 3">
                    <p v-if="seedValue">seed值: {{ seedValue }}</p>
                    <p v-if="item.status == 3 && !seedValue" class="Title4" @click="handleSeed">获取seed值</p>
                  </div>
                  <div v-else>
                    <p>生成中：{{ item.progress ? item.progress + '%' : "正在排队中" }}</p>
                  </div>
                </div>
                <!-- <div style="display: flex;align-items: center;margin-right: 24px;">
              <p class="text-[#3144F1] dark:text-[#fff]">{{ utcToShanghaiTime(task.createdAt) }}</p>
            </div> -->
                <!-- <div class="flex" style="align-items: center;">
              <NTooltip placement="top-start" trigger="hover" v-if="task.status === 3">
                <template #trigger>
                  <SvgIcon icon="bi:send" @click="handlePublishSquare(task)" class="text-[14px] mx-1 cursor-pointer" />
                </template>
                <div>
                  发布到广场
                </div>
              </NTooltip>
              <NTooltip placement="top-start" trigger="hover">
                <template #trigger>
                  <SvgIcon icon="ph:copy-light" @click="handleCopyPrompt(task)" class="text-[14px] mx-1 cursor-pointer" />
                </template>
                <div>
                  复制最终执行提示词
                </div>
              </NTooltip>

              <NTooltip placement="top-start" trigger="hover" v-if="task.status === 3">
                <template #trigger>
                  <SvgIcon icon="icons8:down-round" @click="handleDownload(task)"
                    class="text-[14px] mx-1 cursor-pointer" />
                </template>
                <div>
                  下载图片
                </div>
              </NTooltip>
              <NTooltip placement="top-start" trigger="hover">
                <template #trigger>
                  <SvgIcon @click="handleFavorite(task)" :icon="task.favorite === 0 ? 'uit:favorite' : 'uis:favorite'"
                    class="text-[14px] mx-1 cursor-pointer" />
                </template>
                <div>
                  收藏此任务
                </div>
              </NTooltip>
            </div> -->
              </div>
              <div class="twoBtnBox">
                <div class="publishBox bg-[#3378ED] dark:bg-[#2960BE]" @click="handlePublishSquare(item)"
                  v-if="item.status === 3">
                  <SvgIcon icon="mdi:forward-outline" style="font-size: 17px;"></SvgIcon>
                  <div style="margin-left: 4px;">发布</div>
                </div>
                <div class="twoBtnBoxDel bg-[#FF1D00] dark:bg-[#FF5E55]" @click="handleRemove(item)"
                  v-if="item.status === 3">
                  <SvgIcon icon="fluent:delete-12-regular" style="font-size: 17px;"></SvgIcon>
                  <div style="margin-left: 4px;">删除</div>
                </div>
              </div>
            </div>
            <p @click="copy(item.originPrompt)">{{ item.originPrompt }}</p>

          </div>
          <p style="margin-top: 10px;" @click="copy(item.originPrompt)">{{ item.originPrompt }}</p>
          <div class="relative z-0 w-auto flex align-center overflow-hidden contain"
            :class="[chat === 'chat-history' ? 'h-[280px]' : 'h-[280px] ']">

            <div v-if="item.status === 4" class="">
              <img class="w-auto object-contain" :src="drawFail" alt="" style="margin-top: 10px;">
              <div style="display: flex;align-items: center;margin-top: 10px;">
                <p style="color: #fff;margin-top: 10px;">绘图失败:</p>
                <p style="color: red;margin-top: 10px;">{{ item.failReason }}</p>
              </div>
            </div>

            <div v-else-if="item.status === 5" class="">
              <img class="w-auto object-contain" :src="drawFail" alt="">
            </div>

            <div v-else-if="item.status === 6" class="">
              <img class="w-auto object-contain " :src="drawFail" alt="">
            </div>

            <!-- <Loading :progress="task.progress" v-else-if="!task.imageUrl && !task.progress"></Loading> -->

            <div v-else class="flex items-center justify-center flex-col" style="margin-top: 20px;">
              <div v-if="item.imageUrl == null || item.imageUrl == ''" class="progressBox dark:bg-[#15171A] bg-[#f9f9f9]"></div>
              <div class="progressTetx" v-if="item.progress != 100">
                <div>
                  <div class="loader"></div>
                </div>
                <p style="margin-top: 10px;">{{ item.progress ? item.progress + '%' : "排队中" }} </p>
              </div>
              <NImage style="width: 280px;"
                class="w-full cursor-pointer bg-[#f9f9f9] dark:bg-[transparent] h-full flex justify-center"
                :preview-src="item.imageUrl" object-fit="contain" :src="item.imageUrl || ''"></NImage>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="flex justify-start btnBox" v-if="(item.action == 0&&item.status==3)">
          <div style="display: flex;align-items: center;">
            <p style="margin-top: 4px;margin-right: 10px;">变化: </p>
            <NTooltip trigger="hover" placement="top">
              <template #trigger>
                <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png" alt="" />
              </template>
              <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
            </NTooltip>
          </div>
          <template v-for="_item in item.buttons">
            <div v-if="_item.label.indexOf('Vary') != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Vary (Subtle)"?"变化（弱）":_item.label=="Vary (Strong)"?"变化（强）":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label=="Vary (Subtle)"?"变化（弱）":_item.label=="Vary (Strong)"?"变化（强）":"" || _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div class="flex justify-start btnBox" v-if="(item.action == 0&&item.status==3)">
          <div style="display: flex;align-items: center;">
            <p style="margin-top: 4px;margin-right: 10px;">重绘: </p>
            <NTooltip trigger="hover" placement="top">
              <template #trigger>
                <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png" alt="" />
              </template>
              <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
            </NTooltip>
          </div>
          <template v-for="_item in item.buttons">
            <div v-if="_item.label.indexOf('Redo') != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="Redo Upscale (Subtle)"?"重绘（强）":_item.label=="Redo Upscale (Creative)"?"重绘（弱）":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{  _item.label=="Redo Upscale (Subtle)"?"重绘（强）":_item.label=="Redo Upscale (Creative)"?"重绘（弱）":""|| _item.emoji }}</p>
              </n-tooltip>
            </div>

          </template>
        </div>
        <div v-if="(item.action != 4 && item.action != 2&& item.action != 22&& item.action != 0) && item.status == 3"
          class="flex justify-start btnBox" style="margin-top:10px;">
          <div style="display: flex;align-items: center;">
            <p style="margin-top: 4px;margin-right: 10px;">编辑: </p>
            <NTooltip trigger="hover" placement="top">
              <template #trigger>
                <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
              </template>
              <div style="width: 280px;">参数释义：选中并放大某张图片，放大后可进行下一步的绘画操作，局部重绘、平移、扩图等。</div>
            </NTooltip>
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="changeList.indexOf(_item.label) == -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="U1"?"选中1":_item.label=="U2"?"选中2":_item.label=="U3"?"选中3":"选中4" }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label=="U1"?"选中1":_item.label=="U2"?"选中2":_item.label=="U3"?"选中3":"选中4"  || _item.emoji }}</p>
              </n-tooltip>
            </div>

          </template>
        </div>
        <div v-if="(item.action != 4 && item.action != 2&& item.action != 22&& item.action != 0) && item.status == 3"
          class="flex justify-start btnBox">
          <div style="display: flex;">
            <p style="margin-top: 4px;margin-right: 10px;">变化: </p>
            <NTooltip trigger="hover" placement="top">
              <template #trigger>
                <img style="width: 14px;height: 14px;margin-top: 8px;margin-right: 10px;" src="../img/Help.png" alt="" />
              </template>
              <div style="width: 280px;">参数释义：以某张图片为基准重新生成 如 V1 则变换第一张图片，以此类推</div>
            </NTooltip>
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="changeList.indexOf(_item.label) != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{_item.label=="V1"?"变换1":_item.label=="V2"?"变换2":_item.label=="V3"?"变换3":"变换4"  }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label=="V1"?"变换1":_item.label=="V2"?"变换2":_item.label=="V3"?"变换3":"变换4" || _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div v-if="item.action == 4 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>放大：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="_item.label.indexOf('U') != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="Upscale (Subtle)"?"放大（弱）":_item.label=="Upscale (Creative)"?"放大（强）":""}}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{_item.label=="Upscale (Subtle)"?"放大（弱）":_item.label=="Upscale (Creative)"?"放大（强）":""|| _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div v-if="item.action == 4 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>变化：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="_item.label.indexOf('V') != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Vary (Subtle)"?"微调（弱）":_item.label=="Vary (Strong)"?"微调（强）":_item.label=="Vary (Region)"?"局部重绘":"" }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label=="Vary (Subtle)"?"微调（弱）":_item.label=="Vary (Strong)"?"微调（强）":_item.label=="Vary (Region)"?"局部重绘":""|| _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div v-if="item.action == 4 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>扩图：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="_item.label.indexOf('Z') != -1">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Zoom Out 2x"?"扩2倍":_item.label=="Zoom Out 1.5x"?"扩1.5倍":"" }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label=="Zoom Out 2x"?"扩2倍":_item.label=="Zoom Out 1.5x"?"扩1.5倍":""  || _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div v-if="item.action == 4 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>拉伸：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="(_item, index) in item.buttons">
            <div v-if="!_item.label">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label || _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
        <div v-if="item.action == 2 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>描述：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="_item in item.buttons">
            <div v-if="!_item.label">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(item, _item)">
                    <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                    <div v-else>
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </div>
                  </button>
                </template>
                <p class="buttonText">{{ _item.label || _item.emoji }}</p>
              </n-tooltip>
            </div>
          </template>
        </div>
      </div>


    </div>
  </div>
</template>

<style lang="less" scoped>
.topBox {
  display: flex;
  // align-items: center;
}

.drawContentTitle {
  display: flex;
  align-items: center;

  .Title1 {
    font-size: 16px;
    margin-right: 20px;
  }

  .Title2 {
    font-size: 14px;
    background: #34C759;
    color: #fff;
    width: 67px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    border-radius: 4px;
    margin-right: 26px;
  }

  .Title3 {
    font-size: 12px;
    margin-right: 24px;
  }

  .drawIcon {
    width: 15px;
    height: 15px;
    margin-right: 26px;
  }
}

.drawAvatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 30px;

  .drawAvatarImg {
    width: 100%;
    height: 100%;
  }
}

.btnBox {
  margin-left: 80px;
}

.buttonBox {
  .buttonText {
    height: 20px;
    border-radius: 3px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    padding: 0 5px;
  }
}

.drawListBox {
  padding: 24px;
  margin-top: 13px;
  padding-left: 40px;
}

.twoBtnBox {
  display: flex;
  align-items: center;
  color: #fff;

  .twoBtnBoxDel {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    border-radius: 8px;
    cursor: pointer;
  }

  .publishBox {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    border-radius: 8px;
    margin-right: 12px;
    cursor: pointer;
  }
}

.Title4 {
  font-size: 14px;
  background: #2960BE;
  color: #fff;
  padding: 0 4px;
  text-align: center;
  border-radius: 4px;
  margin-right: 26px;
  cursor: pointer;
}

.progressBox {
  width: 280px;
  height: 280px;
  position: absolute;
}

.progressTetx {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loader {
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #438FEF;
  --_m:
    conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}

@keyframes l3 {
  to {
    transform: rotate(1turn)
  }
}</style>
