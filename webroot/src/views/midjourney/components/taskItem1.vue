<script setup lang="ts">
import { computed, ref } from 'vue'
import Loading from '@/components/base/Loading.vue'
import { NButton, NTooltip, NImage, useDialog, useMessage, NSpin } from 'naive-ui';
import { SvgIcon } from '@/components/common';
import {
  fetchRemoveMjDraw,
  fetchSetImageFavor,
  fetchAddMjDrawTaskAPI,
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

  const result = await fetchAddMjDrawTaskAPI({ type: MidJourneyDrawEnum.IMAGE_ACTION, params }).then(res => res.data)
  updateDrawId({ id: result });
  result && ms.success('提交任务成功！');
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
const handleClick = async (task: { prompt: string, mode: number, id: number, imageUrl }, subItem: { label: string, customId: string, emoji: string },) => {
  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }

  const action = getAction(subItem);
  await handleAddDrawTask({
    action,
    taskId: task.id,
    customId: subItem.customId,
    messageFlags: task.messageFlags || 0
  })

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
const handleRemove = (item: { id: number; favorite: number }) => {

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
</script>

<template>
  <div class="border  box-border border-[#eaeaef] dark:border-[#444456] rounded-xl  min-h-fit flex-1">
    <div class="pt-2 px-1 pb-1">

      <div class="flex justify-between items-center">

        <!-- <p class="border pt-0.5 px-1 text-[12px] scale-95 rounded dark:text-[#00FFC0] dark:border-[#00FFC0] text-[#001EEF] border-[#001EEF]">
          {{ calcActionMsg(task.action) }} - {{ calcStatusMsg(task.status) }} - {{
            calcTimeMsg(task.durationSpent) || ""
          }}
        </p> -->
        <p
          class="border pt-0.5 px-1 text-[12px] scale-95 rounded dark:text-[#00FFC0] dark:border-[#00FFC0] text-[#001EEF] border-[#001EEF]">
          {{ calcActionMsg(task.action) }} - {{ calcStatusMsg(task.status) }}
        </p>
        <div class="flex justify-between ">
          <NTooltip placement="top-start" trigger="hover" v-if="task.status === 3">
            <template #trigger>
              <SvgIcon icon="material-symbols:published-with-changes-rounded" @click="handlePublishSquare(task)"
                class="text-[14px] cursor-pointer" style="margin: 0 5px;" />
            </template>
            <div>
              发布到广场
            </div>
          </NTooltip>

          <!--          <NTooltip placement="top-start" trigger="hover" v-if="task.action === 1 && task.status === 3">-->
          <!--            <template #trigger>-->
          <!--              <SvgIcon icon="mingcute:scissors-line" class="text-[14px] mx-1 cursor-pointer"/>-->
          <!--            </template>-->
          <!--            <div>-->
          <!--              拆分图片-->
          <!--            </div>-->
          <!--          </NTooltip>-->

          <NTooltip placement="top-start" trigger="hover">
            <template #trigger>
              <SvgIcon icon="uil:file-copy-alt" @click="handleCopyPrompt(task)" class="text-[14px] cursor-pointer"
                style="margin: 0 5px;" />
            </template>
            <div>
              复制最终执行提示词
            </div>
          </NTooltip>

          <NTooltip placement="top-start" trigger="hover" v-if="task.status === 3">
            <template #trigger>
              <SvgIcon icon="basil:download-outline" @click="handleDownload(task)" class="text-[15px] cursor-pointer"
                style="margin: 0 5px;" />
            </template>
            <div>
              下载图片
            </div>
          </NTooltip>


          <NTooltip placement="top-start" trigger="hover">
            <template #trigger>
              <SvgIcon @click="handleRemove(task)" icon="material-symbols:delete-outline"
                class="text-[15px] cursor-pointer" style="margin: 0 5px;" />
            </template>
            <div>
              删除任务
            </div>
          </NTooltip>

          <NTooltip placement="top-start" trigger="hover">
            <template #trigger>
              <SvgIcon @click="handleFavorite(task)"
                :icon="task.favorite === 0 ? 'icon-park-outline:collection-files' : 'icon-park-solid:collection-files'"
                class="text-[13px] cursor-pointer" style="margin: 2px 5px 0 5px;" />
            </template>
            <div>
              收藏此任务
            </div>
          </NTooltip>

        </div>
      </div>

      <div class="my-2">
        <NTooltip placement="top" trigger="hover" :width="320">
          <template #trigger>
            <h3 v-if="task.prompt" class="whitespace-nowrap overflow-hidden text-ellipsis">{{ task.prompt }}</h3>
            <div v-else class="" style="height: 23px;"></div>
          </template>
          <div>
            {{ task.prompt }}
          </div>
        </NTooltip>
      </div>

      <div class="relative z-0 w-auto flex align-center min-h-[260px] overflow-hidden contain"
        style="justify-content: center;" :class="[chat === 'chat-history' ? 'h-[320px]' : 'h-[260px] ']">
        <div v-if="task.status === 4"
          class=" bg-[#FFFFFF] dark:bg-[#15171A] h-full w-full flex flex-col justify-center items-center">
          <img class="w-auto object-contain px-24 " :src="drawFail" alt="">
        </div>
        <div v-else-if="task.status === 5"
          class=" bg-[#FFFFFF] dark:bg-[#15171A] h-full w-full flex flex-col justify-center items-center">
          <img class="w-auto object-contain px-24 " :src="drawFail" alt="">
        </div>
        <div v-else-if="task.status === 6"
          class=" bg-[#FFFFFF] dark:bg-[#15171A] h-full w-full flex flex-col justify-center items-center">
          <img class="w-auto object-contain px-24 " :src="drawFail" alt="">
        </div>
        <!-- <Loading :progress="task.progress" v-else-if="!task.imageUrl && !task.progress"></Loading> -->
        <div v-else-if="!task.imageUrl && !task.progress" style="padding-top: 30%;">
          <div class="loader"></div>
        </div>
        <div v-else class="flex items-center justify-center flex-col">
          <NImage class="w-full cursor-pointer bg-[#f9f9f9] dark:bg-[transparent] h-full flex justify-center"
            :preview-src="task.imageUrl" object-fit="contain" :src="task.imageUrl || ''">
          </NImage>
        </div>
      </div>
    </div>

    <div class=" px-2 py-2 rounded-br-xl  rounded-bl-xl h-[130px]">

      <div v-if="!task.imageUrl && task.progress === null" class="flex justify-center h-[80px]">

        <div v-if="calcTips(task)" class="progress">
          <span>
            {{ calcTips(task) }}
          </span>
          <template v-if="task.status === 4">
            <span>：</span>
            <span style="color: red;">{{ task.failReason }}</span>
          </template>

          <n-button type="primary" v-if="task.status === 6" style="margin-left: 12px;" @click="openRemixModal(task)">
            补充描述词
          </n-button>
        </div>
      </div>

      <div class="flex items-center justify-center h-[80px]"
        v-if="task.progress !== null && task.progress >= 0 && task.progress < 100">
        <p class="text-center flex items-center">
          <SvgIcon icon="eos-icons:bubble-loading" class="mr-1">
          </SvgIcon>
          进度：{{ task.progress + '%' }}
        </p>
      </div>

      <div style="display: flex;">
        <div v-if="task.progress === 100" class="h-[80px]" style="padding-left:0;">
          <!-- <div v-for="(item) in scaleIcons" class="flex justify-start items-center py-0.5 mb-1">
          <div class="flex justify-start">
            <template v-for="_item in item">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button :disabled="task.status !== 3" :class="[task.status !== 3 ? 'cursor-not-allowed' : '']" class="text-[14px]  border border-gray-300
                       dark:border-gray-600 hover:text-white
                       hover:bg-gradient-to-l  from-[#2F73EC] to-[#5AA8F7]
                       px-1 flex items-center justify-center rounded"
                          style="margin: 0 4px"
                          @click="handleClick(task, _item)">
                    <p v-if="_item.label" class="text-[12px] pt-[2px] line-clamp-1 text-left">{{ _item.label }}</p>
                    <p v-else>{{ _item.emoji }}</p>
                  </button>
                </template>
                <p>{{ _item.label || _item.emoji }}</p>
              </n-tooltip>
            </template>
            
          </div>
        </div> -->
          <div class="flex justify-start btnBox" v-if="(task.action == 4) && task.status == 3">
            <div style="display: flex;align-items: center;">
              <p style="margin-top: 4px;margin-right: 4px;">调整: </p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 4px;" src="../img/Help.png" alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="_item.label.indexOf('Vary') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <div v-if="_item.label" style="width: 60px;">
                          <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{
                            _item.ZnLabel }}</p>
                        </div>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="task.action == 4 && task.status == 3" class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p style="margin-right: 4px;">扩图:</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-right: 4px;" src="../img/Help.png" alt="" />
                </template>
                <div style="width: 280px;">参数释义：ZoomOut ，对当前图片按照倍数进行扩大，周围自动AI填充，可无限重复无限扩大</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="_item.label.indexOf('Z') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <div v-if="_item.label" style="width: 60px;">
                          <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{
                            _item.ZnLabel }}</p>
                        </div>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="task.action == 4 && task.status == 3" class="flex justify-start btnBox">
            <div style="display: flex;align-items: center;">
              <p style="margin-right: 4px;">拉伸:</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-right: 4px;" src="../img/Help.png" alt="" />
                </template>
                <div style="width: 280px;">参数释义：对当前图片进行各个方向的拓展</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="!_item.label">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <div v-if="_item.label" style="width: 60px;">
                          <p class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label }}</p>
                        </div>
                        <p v-else class="buttonText1 bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="(task.action != 4 && task.action != 2 && task.action != 22 && task.action != 0&& task.action != 19&& task.action != 14) && task.status == 3"
            class="flex justify-start btnBox">
            <div style="display: flex;align-items: center;">
              <p style="margin-top: 4px;margin-right: 10px;">编辑: </p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：选中并放大某张图片，放大后可进行下一步的绘画操作，局部重绘、平移、扩图等。</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="changeList.indexOf(_item.label) == -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.ZnLabel }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="(task.action != 4 && task.action != 2 && task.action != 22 && task.action != 0&& task.action != 19&& task.action != 14) && task.status == 3"
            class="flex justify-start btnBox">
            <div style="display: flex;">
              <p style="margin-top: 4px;margin-right: 10px;">变化: </p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：以某张图片为基准重新生成 如 V1 则变换第一张图片，以此类推</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="changeList.indexOf(_item.label) != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.ZnLabel }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="task.action == 2 && task.status == 3" class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>描述：</p>
              <!-- <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" /> -->
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="!_item.label">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label }}</p>
                        <p v-else class="buttonText1 bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="(task.action == 0||task.action == 19) && task.status == 3" class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>变换：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="_item.label.indexOf('Vary') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.ZnLabel }}</p>
                        <p v-else class="buttonText1 bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div v-if="task.action == 0||task.action == 19 && task.status == 3" class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>重绘：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="_item.label.indexOf('Redo') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(task, _item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.ZnLabel }}</p>
                        <p v-else class="buttonText1 bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <!-- 重绘2X 4x -->
        <div v-if="(task.action == 14)&&task.status==3">
          <div class="flex justify-start btnBox">
            <div style="display: flex;align-items: center;">
              <p style="margin-top: 4px;margin-right: 10px;">重绘: </p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in task.buttons">
              <div v-if="_item.label.indexOf('Redo') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="Redo Upscale (2x)"?"重绘（2x）":_item.label=="Redo Upscale (4x)"?"重绘（4x）":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label=="Redo Upscale (2x)"?"重绘（2x）":_item.label=="Redo Upscale (4x)"?"重绘（4x）":"" || _item.emoji }}</p>
                </n-tooltip>
              </div>

            </template>
          </div>
        </div>
        </div>
      </div>
      <div class="flex justify-between text-[12px] mt-4 select-none">
        <div>
          <p class="text-[#3144F1] dark:text-[#fff]" style="color: #3144F1;">时间：{{ utcToShanghaiTime(task.createdAt) }}
          </p>
        </div>
        <div>
          <p
            :style="{ 'color': task.mode === 1 ? '#F1A231' : task.mode === 2 ? '#fff' : task.mode === 3 ? '#23DCB5' : 'red' }">
            {{ task.mode === 1 ? '快速模式' : task.mode === 2 ? '慢速模式' : task.mode === 3 ? 'Turbo模式' : '模式错误' }}</p>
        </div>
      </div>
    </div>

  </div>
</template>
<style lang="scss" scoped>
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
}

.buttonBox {
  .buttonText {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    padding: 1px;
    border-radius: 4px;
    font-size: 12px;
  }

  .buttonText1 {
    width: 30px;
    border-radius: 4px;
  }
}
</style>












