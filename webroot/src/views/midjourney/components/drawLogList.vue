<script lang="ts" setup>
import { ref } from 'vue';
import { NTooltip, useMessage, NButton, useDialog, NImage, NSpin } from 'naive-ui';
import { useAuthStore } from "@/store";
import { MidjourneyActionEnum, MidjourneyActionMap, MidJourneyDrawEnum } from "@/constants";
import { copyText } from "@/utils/format";
import axios from "axios";
import clipboard3 from "vue-clipboard3"
import {
  fetchRemoveMjDraw,
  fetchSetImageFavor,
  fetchAddMjDrawTaskAPI,
  imgSeed
} from "@/api/mjDraw";
import { fetchMidjourneyDrawList ,fetchGetDrawMany} from "@/api/mjDraw";
import { SvgIcon } from '@/components/common';
import drawFail from '@/assets/images/draw-fail.png'
import { useMidjourneyStore } from "@/store/modules/midjourney";
import EventBus from '@/hooks/eventBus';
import { router } from '@/router';
const dialog = useDialog();
const midjourneyStore = useMidjourneyStore();
const { updateSendSquire, updateDrawId, updatePreview } = useAuthStore();
const authStore = useAuthStore()
const ms = useMessage();
const props = defineProps({
  drawLogList: { type: Array }
})
const selectBtn = ref([//选中按钮
  { ZnLabel: "选中1", id: 0, label: "U1" },
  { ZnLabel: "选中2", id: 1, label: "U2" },
  { ZnLabel: "选中3", id: 2, label: "U3" },
  { ZnLabel: "选中4", id: 3, label: "U4" },
])
const changeBtn = ref([//变化按钮
  { ZnLabel: "变换1", id: 0, label: "V1" },
  { ZnLabel: "变换2", id: 1, label: "V2" },
  { ZnLabel: "变换3", id: 2, label: "V3" },
  { ZnLabel: "变换4", id: 3, label: "V4" },
])
const adjust = ref([//调整按钮
  { ZnLabel: "微调（弱）", id: 0, label: "Vary (Subtle)" },
  { ZnLabel: "微调（强）", id: 1, label: "Vary (Strong)" },
  { ZnLabel: "局部重绘", id: 2, label: "Vary (Region)" },
])
const expansion = ref([//扩图按钮
  { ZnLabel: "扩2倍", id: 0, label: "Zoom Out 2x" },
  { ZnLabel: "扩1.5倍", id: 1, label: "Zoom Out 1.5x" },
])
const zoomBtn = ref([//放大按钮
  { ZnLabel: "放大（弱）", id: 0, label: "Upscale (Subtle)" },
  { ZnLabel: "放大（强）", id: 1, label: "Upscale (Creative)" },
])
const transformBtn=ref([
{ ZnLabel: "变换（弱）", id: 0, label: "Vary (Subtle)" },
{ ZnLabel: "变换（强）", id: 0, label: "Vary (Strong)" },
])
const reUpscaleBtn=ref([
{ ZnLabel: "重绘（强）", id: 0, label: "Redo Upscale (Subtle)" },
{ ZnLabel: "重绘（弱）", id: 0, label: "Redo Upscale (Creative)" },
])


const drawLog = ref(props.drawLogList)//绘画记录数组
EnToZn(drawLog.value)
function EnToZn(dataList) {
  dataList.forEach((item, index) => {
    let { buttons } = item
    if (buttons) {
      let Ubtn = buttons.filter(item => item.label.indexOf("U") != -1)
      let Vbtn = buttons.filter(item => item.label.indexOf("V") != -1)
      let VaryBtn = buttons.filter(item => item.label.indexOf("Vary") != -1)
      let ZoomBtn = buttons.filter(item => item.label.indexOf("Zoom") != -1)
      let UpscaleBtn = buttons.filter(item => item.label.indexOf("Upscale") != -1)
      let transformVaryBtn = buttons.filter(item => item.label.indexOf("Vary（") != -1)
      let RedoUpscaleBtn = buttons.filter(item => item.label.indexOf("Redo") != -1)
      if (Ubtn.length == 4) {
        Ubtn.forEach((item, index) => {
          item.ZnLabel = selectBtn.value[index].ZnLabel
        })
      }
      if (Vbtn.length == 4) {
        Vbtn.forEach((item, index) => {
          item.ZnLabel = changeBtn.value[index].ZnLabel
        })
      }
      if (VaryBtn.length != 0) {
        VaryBtn.forEach((item, index) => {
          item.ZnLabel = adjust.value[index].ZnLabel
        })
      }
      if (ZoomBtn.length != 0) {
        ZoomBtn.forEach((item, index) => {
          item.ZnLabel = expansion.value[index].ZnLabel
        })
      }
      if (UpscaleBtn.length != 0) {
        UpscaleBtn.forEach((item, index) => {
          item.ZnLabel = zoomBtn.value[index].ZnLabel
        })
      }
      if(transformVaryBtn.length!=0){
        transformVaryBtn.forEach((item, index) => {
          item.ZnLabel = transformBtn.value[index].ZnLabel
        })
      }
      if(RedoUpscaleBtn.length!=0){
        RedoUpscaleBtn.forEach((item, index) => {
          item.ZnLabel = reUpscaleBtn.value[index].ZnLabel
        })
      }
    }
  })
}

const incompleteList = drawLog.value?.filter(item => item.status == 1 || item.status == 2)
const timer = ref()
if (incompleteList.length != 0) {
  timer.value = setInterval(() => {
    fetchMidjourneyDrawList({ page: 1, size: 20 }).then(res => {
      drawLog.value = res.data.rows.reverse()
      let dataValue = res.data.rows
      EnToZn(drawLog.value)
      localStorage.setItem("drawLogList", JSON.stringify(dataValue))
      let incompleteList2 = drawLog.value?.filter(item => item.status == 1 || item.status == 2)
      if (incompleteList2.length == 0) {
        clearInterval(timer.value)
      }
    })
  }, 3000)
}


const emit = defineEmits(['fresh1', 'newJobId'])
const downloadUrl = `${import.meta.env.VITE_GLOB_API_URL}/midjourney/download`;
const { toClipboard } = clipboard3();
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

/* 提交放大绘制任务 */
async function handleAddDrawTask(params: any) {

  const result = await fetchAddMjDrawTaskAPI({ type: MidJourneyDrawEnum.IMAGE_ACTION, params }).then(res => res).catch(res => res)
  if (result.code != 200) {
    ms.error('提交任务失败！')
    return
  }
  updateDrawId({ id: result.data });
  emit("newJobId", result.data)
  result && ms.success('提交任务成功！');
}

// 按钮操作
// const handleClick = async (index: { prompt: string, mode: number, id: number, imageUrl }, subItem: { label: string, customId: string, emoji: string }) => {
const handleClick = async (_item, index) => {
  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }
  _item.isSuccse = true
  const action = getAction(_item);
  await handleAddDrawTask({
    action,
    taskId: drawLog.value[index].id,
    customId: _item.customId,
    messageFlags: drawLog.value[index].messageFlags || 0
  })
  _item.isSuccse = false
  emit("fresh1")
}
EventBus.on("newDrawLogList", data => {
  drawLog.value = data
  EnToZn(drawLog.value)
})
// 发布到广场
const handlePublishSquare = async (param: { id: number }) => {
  updateSendSquire(true, param.id)
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
const handleRemove = (item) => {
  dialog.create({
    type: "info",
    title: '确认删除',
    content: `${item.favorite === 1 ? '当前任务已被收藏，删除绘画任务会导致收藏失效且不可找回，确定删除' : '删除绘画任务不可找回，确定删除'}？`,
    positiveText: '确定',
    negativeText: '取消',
    maskClosable: false,
    onPositiveClick: () => {
      fetchRemoveMjDraw({ id: item.id }).then(res => {
        if (res.code == 200) {
          ms.success("删除成功")
          for (let i = 0; i < drawLog.value.length; i++) {
            if (drawLog.value[i].id == item.id) {
              drawLog.value.splice(i, 1)
              fetchMidjourneyDrawList({ page: 1, size: 20 }).then((res: any) => {
                localStorage.setItem("drawLogList", JSON.stringify(res.data.rows))
              })
            }
          }
        }
      })
    },
    onNegativeClick: () => {

    }

  })
}
// 收藏
const handleFavorite = (item: { id: number; favorite: number; }) => {
  const { id, favorite } = item;
  fetchSetImageFavor({ id, favorite: favorite === 1 ? 0 : 1 }).then(res => {
    if (res.code == 200) {
      ms.success(`${favorite === 0 ? '收藏' : "取消收藏"} 成功`);
      item.favorite === 0 ? item.favorite = 1 : item.favorite = 0
    }
  })
}
const openRemixModal = (task: any) => {
  // router.push("/midjourney/paint-task")
  // EventBus.emit("openRemixModal", task)
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
const changeList = ref(["V1", "V2", "V3", "V4"])
const changeBtnList = ref([
  { name: "编辑", btnItem: ["U1", "U2", "U3", "U4"] },
  { name: "变化", btnItem: ["V1", "V2", "V3", "V4"] },
  { name: "变化", btnItem: ["Vary (Subtle)", "Vary (Strong)"] },
  { name: "放大", btnItem: ["Upscale (Subtle)", "Upscale (Creative)"] },
  { name: "变化", btnItem: ["Vary (Subtle)", "Vary (Strong)", "Vary (Region)"] },
  { name: "缩小", btnItem: ["Zoom Out 2x", "Zoom Out 1.5x"] },
  { name: "拉伸", btnItem: [] },
  { name: "重绘", btnItem: ["Redo Upscale (Subtle)", "Redo Upscale (Creative)"] },
])
function handleSeed(item) {
  let data = {
    jobId: item.jobId
  }
  imgSeed(data).then(res => {
    console.log(res)
    item.seed = res.data
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
const btnBox1 = ref([1, 3, 21, 7, 8, 12, 11, 9, 17, 5])







</script>
<template>
  <!-- <div class="w-[1200px] rounded bg-[#F7F7F7] dark:bg-[#313155] h-auto flex-1" style="width: 100%;"> -->
  <div class="drawListBox dark:bg-[#010102] bg-[#F4F4F4]" v-for="(item, index) in drawLog" :key="item.jobId">
    <!-- <div class="drawListBox"> -->
    <div class="drawAvatar">
      <img class="drawAvatarImg" src="../img/drawLogo.png" alt="">
    </div>
    <div class="drawContent">
      <div style="display: flex;align-items: center;justify-content: space-between;">
        <div class="drawContentTitle">
          <p class="Title1">Midjourney Bot</p>
          <p class="Title2">AI机器人</p>
          <p class="Title3 text-[#808080] dark:text-[#d6d6d6]">{{ item.createdAt }}</p>
          <p v-if="item.seed">seed值: {{ item.seed }}</p>
          <p v-if="item.status == 3 && !item.seed" class="Title4" @click="handleSeed(item)">获取seed值</p>
          <!-- <div class="flex" style="align-items: center;">
            <NTooltip placement="top-start" trigger="hover" v-if="item.status === 3">
              <template #trigger>
                <SvgIcon icon="bi:send" @click="handlePublishSquare(item)" class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                发布到广场
              </div>
            </NTooltip>
            <NTooltip placement="top-start" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ph:copy-light" @click="handleCopyPrompt(item)" class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                复制最终执行提示词
              </div>
            </NTooltip>
            <NTooltip placement="top-start" trigger="hover" v-if="item.status === 3">
              <template #trigger>
                <SvgIcon icon="icons8:down-round" @click="handleDownload(item)" class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                下载图片
              </div>
            </NTooltip>
            <NTooltip placement="top-start" trigger="hover">
              <template #trigger>
                <SvgIcon @click="handleFavorite(item)" :icon="item.favorite === 0 ? 'uit:favorite' : 'uis:favorite'"
                  class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                收藏此任务
              </div>
            </NTooltip>
          </div> -->
        </div>
        <div class="twoBtnBox">
          <div class="publishBox bg-[#3378ED] dark:bg-[#2960BE]" @click="handlePublishSquare(item)">
            <SvgIcon icon="mdi:forward-outline" style="font-size: 17px;"></SvgIcon>
            <div style="margin-left: 4px;">发布</div>
          </div>
          <div class="twoBtnBoxDel bg-[#FF1D00] dark:bg-[#FF5E55]" @click="handleRemove(item)">
            <SvgIcon icon="fluent:delete-12-regular" style="font-size: 17px;"></SvgIcon>
            <div style="margin-left: 4px;">删除</div>
          </div>
        </div>
      </div>
      <div class="drawContentTitle1 border-b-[2px] dark:border-[#58586E] borde-[#E2E2E2]">
        <p v-if="item.action == 21" class="Title4" @click="copy(item.prompt)">{{ item.prompt }}</p>
        <p class="Title4" @click="copy(item.originPrompt)">{{ item.originPrompt }}</p>
      </div>
      <div class="drawContentTitle2">
        <!-- <p v-if="item.action == 21" @click="copy(item.fullPrompt)">{{ item.fullPrompt }}</p> -->
        <p v-if="item.action == 2" @click="copy(item.prompt)">{{ item.prompt }}</p>
        <p v-else class="Title5" @click="copy(item.fullPrompt)">{{ item.fullPrompt }}</p>
      </div>
      <div class="drawImgBox">
        <NImage v-if="item.status == 3" style="width: 280px;" :preview-src="item.imageUrl" object-fit="contain"
          :src="item.imageUrl"></NImage>
        <NImage v-if="item.status == 4 || item.status == 6" style="width: 280px;" :preview-src="item.imageUrl"
          object-fit="contain" :src="item.imageUrl ? item.imageUrl : drawFail"></NImage>
        <div v-if="item.status == 1 || item.status == 2"
          style="width: 280px;height: 280px;display: flex;justify-content: center;align-items: center;">
          <div style="width: 50px;height: 60px;text-align: center;">
            <div class="loader"></div>
            <p style="margin-top: 10px;">{{ item.progress ? item.progress + "%" : "正在排队中" }}</p>
          </div>
        </div>
      </div>
      <div v-if="item.status == 4" style="display: flex;align-items: center;">
        <p style="color: #fff;margin-top: 10px;width: 70px;">绘图失败:</p>
        <p style="color: red;margin-top: 10px;width: 600px;" class="failText">{{ item.failReason }}</p>
      </div>
      <n-button type="primary" v-if="item.status === 6" style="margin-left: 12px;" @click="openRemixModal(item)">
        补充描述词
      </n-button>
      <div>
        <!-- 变换 、重绘 -->
        <div v-if="(item.action == 0||item.action == 19)&&item.status==3">
          <div class="flex justify-start btnBox">
            <div style="display: flex;align-items: center;">
              <p style="margin-top: 4px;margin-right: 10px;">变换: </p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="_item.label.indexOf('Vary') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.ZnLabel }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
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
            <template v-for="_item in item.buttons">
              <div v-if="_item.label.indexOf('Redo') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
        </div>
        <!-- 编辑、变化 -->
        <div  v-if="(item.action != 4&&item.action!=2&&item.action!=22&&item.action!=0&&item.action!=19&&item.action!=14) && item.status == 3">
          <div class="flex justify-start btnBox">
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
            <template v-for="_item in item.buttons">
              <div v-if="changeList.indexOf(_item.label) == -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
          <div class="flex justify-start btnBox">
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
            <template v-for="_item in item.buttons">
              <div v-if="changeList.indexOf(_item.label) != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
        </div>
        <!-- 放大、调整、扩图、拉伸 4-->
        <div v-if="item.action == 4 && item.status == 3" >
          <div class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>放大：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 130px;">对当前图片进行放大</div>
              </NTooltip>
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="_item.label.indexOf('U') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
          <div class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>调整：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：Vary 以当前图片为基础调整图片</div>
              </NTooltip>
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="_item.label.indexOf('V') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{
                          _item.ZnLabel }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>扩图：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：ZoomOut ，对当前图片按照倍数进行扩大，周围自动AI填充，可无限重复无限扩大</div>
              </NTooltip>
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="_item.label.indexOf('Z') != -1">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{
                          _item.ZnLabel }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.ZnLabel || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>拉伸：</p>
              <NTooltip trigger="hover" placement="top">
                <template #trigger>
                  <img style="width: 14px;height: 14px;margin-top: 4px;margin-right: 10px;" src="../img/Help.png"
                    alt="" />
                </template>
                <div style="width: 280px;">参数释义：对当前图片进行各个方向的拓展</div>
              </NTooltip>
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="!_item.label">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
        <!-- 描述 -->
        <div>
          <div v-if="item.action == 2 && item.status == 3" class="flex justify-start btnBox">
            <div style="margin-top: 4px;display: flex;align-items: center;">
              <p>描述：</p>
              <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
            </div>
            <template v-for="_item in item.buttons">
              <div v-if="!_item.label">
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, index)">
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
        <!-- 重绘2X 4x -->
        <div v-if="(item.action == 14)&&item.status==3">
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
            <template v-for="_item in item.buttons">
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
  </div>
  <!-- </div> -->
</template>
<style lang="less" scoped>
.drawListBox {
  // background-color: #1F1F38;
  display: flex;
  padding: 24px;
  margin-top: 13px;
  padding-left: 40px;

  .drawAvatar {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    overflow: hidden;

    .drawAvatarImg {
      width: 100%;
      height: 100%;
    }
  }

  .drawContent {
    margin-left: 30px;
    width: 100%;

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

      .Title3 {
        font-size: 12px;
        // color: #D6D6D6;
        margin-right: 24px;
      }

      .drawIcon {
        width: 15px;
        height: 15px;
        margin-right: 26px;
      }
    }

    .drawContentTitle1 {
      // border-bottom: 2px solid #58586E;
      padding-bottom: 1px;

      .Title4 {}
    }

    .drawContentTitle2 {
      margin-top: 10px;

      .Title5 {
        font-size: 12px;
      }
    }

    .drawImgBox {
      margin-top: 10px;

      .img {
        width: 390px;
        height: auto;
      }
    }

    .btnBox {
      // width: 180px;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: center;
    }
  }
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
.failText{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>