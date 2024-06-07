<script lang="ts" setup>
import { ref, computed } from 'vue';
import { NTooltip, useMessage, NButton, NImage, NSpin } from 'naive-ui';
import { useAuthStore } from "@/store";
import { MidjourneyActionEnum, MidJourneyDrawEnum } from "@/constants";
import clipboard3 from "vue-clipboard3"
import {
  fetchAddMjDrawTaskAPI,
  fetchGetDraw,
  imgSeed
} from "@/api/mjDraw";
import Loading from '@/components/base/Loading.vue'
import { SvgIcon } from '@/components/common';
import drawFail from '@/assets/images/draw-fail.png'
import { useMidjourneyStore } from "@/store/modules/midjourney";
import { router } from '@/router';
import EventBus from '@/hooks/eventBus';
const midjourneyStore = useMidjourneyStore();
const { toClipboard } = clipboard3();
const { updateDrawId } = useAuthStore();
const authStore = useAuthStore()
const ms = useMessage();
const props = defineProps({
  drawLogList: { type: Array },
  task: { type: Object, required: true },
})
const drawLog = ref(props.drawLogList)//绘画记录数组
const emit = defineEmits(['fresh', 'newJob'])


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
  result && ms.success('提交任务成功！');
  emit("newJob", result.data)
}

// 按钮操作
// const handleClick = async (index: { prompt: string, mode: number, id: number, imageUrl }, subItem: { label: string, customId: string, emoji: string }) => {
const handleClick = async (_item, task) => {
  if (!authStore.isLogin) {
    ms.warning("请先登录")
    authStore.setLoginDialog(true);
    return;
  }
  _item.isSuccse = true

  const action = getAction(_item);
  await handleAddDrawTask({
    action,
    taskId: task.id,
    customId: _item.customId,
    messageFlags: task.messageFlags || 0
  })
  _item.isSuccse = false

}
const openRemixModal = (task: any) => {
  // 局部重绘 modal
  router.push({ path: "midjourney/paint-task" })
  // 	if (task.action === 9) {
  // 		midjourneyStore.openRegionModal(true, {
  // 			customId: task.customId,
  // 			taskId: task.id,
  // 			mode: task.mode
  // 		});
  // 	}
  // 	// remix modal
  // 	else {
  // 		authStore.updateRemixModal(true, {
  // 			prompt: '',
  // 			taskId: task.id,
  // 			customId: task.customId,
  // 		});
  // 	}
}
//fetchGetDraw


const changeList = ref(["V1", "V2", "V3", "V4"])
const seedValue = ref()
// EventBus.on("seed",data=>{
//   seedValue.value=data
// })
function handleSeed() {
  let data = {
    jobId: props.task.jobId
  }
  imgSeed(data).then(res => {
    console.log(res)
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
const btnBox1 = ref([1, 3, 21, 7, 8, 12, 11, 9, 17])
</script>
<template>
  <!-- <div class="w-[1200px] rounded bg-[#F7F7F7] dark:bg-[#313155] h-auto flex-1" style="width: 100%;"> -->
  <div class="drawListBox dark:bg-[#010102] bg-[#f4f4f4]"  v-for="item in props.task" :key="item.id">
    <!-- <div class="drawListBox"> -->
    <div class="drawAvatar">
      <img class="drawAvatarImg" src="../img/drawLogo.png" alt="">
    </div>
    <div class="drawContent">
      <div style="display: flex;align-items: center;justify-content: space-between;">
        <div class="drawContentTitle">
          <p class="Title1">Midjourney Bot</p>
          <p class="Title2">AI机器人</p>
          <p class="Title3 text-[#808080] dark:text-[#d6d6d6]" v-if="item.createdAt">{{  item.createdAt.split("T")[0] }} {{ item.createdAt.split("T")[1].split(".")[0]  }}</p>
          <div v-if="item.status == 3">
            <p v-if="seedValue">seed值: {{ seedValue }}</p>
            <p v-if="item.status == 3 && !seedValue" class="Title5" @click="handleSeed">获取seed值</p>
          </div>
          <div v-else>
            <p>生成中：{{ item.progress ? item.progress + "%" : "正在排队中" }} </p>
          </div>
          <!-- <div class="flex" style="align-items: center;">
            <NTooltip placement="top-start" trigger="hover" v-if="props.task.status === 3">
              <template #trigger>
                <SvgIcon icon="bi:send" @click="handlePublishSquare(props.task)"
                  class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                发布到广场
              </div>
            </NTooltip>
            <NTooltip placement="top-start" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ph:copy-light" @click="handleCopyPrompt(props.task)"
                  class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                复制最终执行提示词
              </div>
            </NTooltip>

            <NTooltip placement="top-start" trigger="hover" v-if="props.task.status === 3">
              <template #trigger>
                <SvgIcon icon="icons8:down-round" @click="handleDownload(props.task)"
                  class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                下载图片
              </div>
            </NTooltip>

            <NTooltip placement="top-start" trigger="hover">
              <template #trigger>
                <SvgIcon @click="handleFavorite(props.task)"
                  :icon="props.task.favorite === 0 ? 'uit:favorite' : 'uis:favorite'"
                  class="text-[14px] mx-1 cursor-pointer" />
              </template>
              <div>
                收藏此任务
              </div>
            </NTooltip>
          </div> -->
        </div>
        <div class="twoBtnBox">
          <div class="publishBox bg-[#3378ED] dark:bg-[#2960BE]" v-if="task.status === 3">
            <SvgIcon icon="mdi:forward-outline" style="font-size: 17px;"></SvgIcon>
            <div style="margin-left: 4px;">发布</div>
          </div>
          <div class="twoBtnBoxDel bg-[#FF1D00] dark:bg-[#FF5E55]" v-if="task.status === 3">
            <SvgIcon icon="fluent:delete-12-regular" style="font-size: 17px;"></SvgIcon>
            <div style="margin-left: 4px;">删除</div>
          </div>
        </div>
      </div>
      <div class="drawContentTitle1 border-b-[2px] dark:border-[#58586E] borde-[#E2E2E2]">
        <p class="" @click="copy(item.originPrompt)">{{ item.originPrompt }}</p>
      </div>
      <div class="drawContentTitle2">
        <p class="Title" @click="copy(item.prompt)">{{ item.prompt ? item.prompt.split('--')[0] : '' }}
        </p>
      </div>
      <div class="drawImgBox" :style="{ height: item.imageUrl ? '280px' : '280px' }" v-if="item.status!=4&&item.status!=6">
        <div v-if="item.imageUrl == null || item.imageUrl == ''"
          class="progressBox dark:bg-[#15171A] bg-[#f9f9f9]">
        </div>
        <div class="progressTetx" v-if="item.progress != 100">
          <div>
            <div class="loader"></div>
          </div>
          <p style="margin-top: 10px;">{{ item.progress ? item.progress + ' %' : "排队中" }}</p>
        </div>
        <NImage style="width: 280px;" :preview-src="item.imageUrl" object-fit="contain" :src="item.imageUrl">
        </NImage>
        
        <!-- <div v-if="props.task.status == 6" class="">
          <img class="w-auto object-contain " :src="drawFail" alt="">
        </div> -->
        <!-- <Loading v-if="!props.task.imageUrl && props.task.status != 6"></Loading> -->

      </div>
      <div>
        <NImage v-if="item.status==4||item.status==6" style="width: 280px;margin-top: 10px;" :preview-src="drawFail" object-fit="contain" :src="drawFail">
        </NImage>
      </div>
        <n-button type="primary" v-if="item.status === 6" style="margin-left: 12px;"
        @click="openRemixModal(item)">
        补充描述词
      </n-button>
        <div v-if="item.status == 4" style="display: flex;align-items: center;">
          <p style="color: #fff;margin-top: 10px;width: 70px;">绘图失败:</p>
          <p style="color: red;margin-top: 10px;width: 600px;" class="failText">{{ item.failReason }}</p>
        </div>
     
      <!-- <div v-if="props.task.progress!=100" style="text-align: center;">加载中:{{ props.task.progress }}%</div> -->
      <div>
        <!-- 重绘、变化 -->
        <div style="margin-top: 10px;">
          <div class="flex justify-start btnBox" v-if="(item.action == 0)&&item.status==3">
            <div style="display: flex;align-items: center;">
              <p style="margin-top: 4px;margin-right: 10px;">变化: </p>
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item, item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Vary (Subtle)"?"变化（弱）":_item.label=="Vary (Strong)"?"变化（强）":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label=="Vary (Subtle)"?"变化（弱）":_item.label=="Vary (Strong)"?"变化（强）":"" || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
          <div class="flex justify-start btnBox" v-if="(item.action == 0)&&item.status==3">
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="Redo Upscale (Subtle)"?"重绘（强）":_item.label=="Redo Upscale (Creative)"?"重绘（弱）":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label=="Redo Upscale (Subtle)"?"重绘（强）":_item.label=="Redo Upscale (Creative)"?"重绘（弱）":"" || _item.emoji }}</p>
                </n-tooltip>
              </div>

            </template>
          </div>
        </div>
        <!-- 编辑、变化 -->
        <div v-if="(item.action != 4 && item.action != 2&& item.action != 22&& item.action != 0) && item.status == 3" style="margin-top: 10px;">
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="U1"?"选中1":_item.label=="U2"?"选中2":_item.label=="U3"?"选中3":"选中4" }}</p>
                      <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label=="U1"?"选中1":_item.label=="U2"?"选中2":_item.label=="U3"?"选中3":"选中4" || _item.emoji }}</p>
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{_item.label=="V1"?"变换1":_item.label=="V2"?"变换2":_item.label=="V3"?"变换3":"变换4" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{ _item.label=="V1"?"变换1":_item.label=="V2"?"变换2":_item.label=="V3"?"变换3":"变换4" || _item.emoji }}</p>
                </n-tooltip>
              </div>
            </template>
          </div>
        </div>
        <!-- 调整、扩图、拉伸 -->
        <div v-if="item.action == 4 && item.status == 3" style="margin-top: 10px;">
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.label=="Upscale (Subtle)"?"放大（弱）":_item.label=="Upscale (Creative)"?"放大（强）":""}}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{_item.label=="Upscale (Subtle)"?"放大（弱）":_item.label=="Upscale (Creative)"?"放大（强）":"" || _item.emoji }}</p>
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Vary (Subtle)"?"微调（弱）":_item.label=="Vary (Strong)"?"微调（强）":_item.label=="Vary (Region)"?"局部重绘":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{  _item.label=="Vary (Subtle)"?"微调（弱）":_item.label=="Vary (Strong)"?"微调（强）":_item.label=="Vary (Region)"?"局部重绘":""  || _item.emoji }}</p>
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
                      <n-spin v-if="_item.isSuccse" :size="8" class="buttonText" stroke="#7E7E8D" />
                      <div v-else>
                        <p v-if="_item.label" class="buttonText dark:bg-[#484A4D] bg-[#D1D2D3]">{{ _item.emoji }} {{ _item.label=="Zoom Out 2x"?"扩2倍":_item.label=="Zoom Out 1.5x"?"扩1.5倍":"" }}</p>
                        <p v-else class="buttonText bg-[#3378ED]">{{ _item.emoji }}</p>
                      </div>
                    </button>
                  </template>
                  <p class="buttonText">{{  _item.label=="Zoom Out 2x"?"扩2倍":_item.label=="Zoom Out 1.5x"?"扩1.5倍":""  || _item.emoji }}</p>
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
                    <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
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
        <div v-if="item.action == 2 && item.status == 3" class="flex justify-start btnBox">
          <div style="margin-top: 4px;display: flex;align-items: center;">
            <p>描述：</p>
            <img style="width: 14px;height: 14px;margin-right: 10px;" src="../img/Help.png" alt="" />
          </div>
          <template v-for="_item in item.buttons">
            <div v-if="!_item.label">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <button class="buttonBox" style="margin: 4px 4px 0 4px" @click="handleClick(_item,  item)">
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
  <!-- </div> -->
</template>
<style lang="less" scoped>
.drawListBox {
  display: flex;
  padding: 24px;
  margin-top: 13px;

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

    .drawContentTitle1 {

      .Title4 {}
    }

    .drawContentTitle2 {
      margin-top: 10px;

      .Title5 {
        font-size: 12px;
        color: #fff;
      }
    }

    .drawImgBox {
      margin-top: 10px;
      position: relative;
      display: flex;
      align-items: center;

      .img {
        width: 390px;
        height: auto;
      }
    }

    .btnBox {
      // width: 180px;
      flex-wrap: wrap;
      justify-content: flex-start;
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

.Title5 {
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
  width: 280px;
  height: 280px;
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
}
.failText{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

</style>