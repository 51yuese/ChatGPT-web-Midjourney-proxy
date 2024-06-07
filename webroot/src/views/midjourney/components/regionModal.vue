<script setup lang="ts">
import {NInput, NModal, NSpin, useMessage} from 'naive-ui'
import {computed, ref, watch} from "vue";
const { updateDrawId } = useAuthStore();
import {useMidjourneyStore} from "@/store/modules/midjourney";
import {SIcon} from "@/components/common";
import {MjPaper} from "@/store/modules/midjourney/draw";
import {fetchAddMjDrawTaskAPI} from "@/api/mjDraw";
import {MidjourneyActionEnum, MidJourneyDrawEnum, REGION_REDRAW_ACTION_OPTIONS} from "@/constants";
import {useAuthStore} from "@/store";
import {getModalImgById} from "@/api/file";
import EventBus from "@/hooks/eventBus"

const ms = useMessage();

const mjPager = ref<MjPaper>()
const canvasRef = ref()
const loading = ref(true);

// const authStore = useAuthStore();
const midjourneyStore = useMidjourneyStore();
const showDialog = computed(() => midjourneyStore.openRegionDialog);
const varyRegionInfo = computed(() => midjourneyStore.varyRegionInfo);

const prompt = ref("");

watch(() => varyRegionInfo.value, (newValue) => {
    prompt.value = newValue.varyRegionPrompt;
   	handleInit(newValue);
}, {deep: true})
const resquestStatus=ref(0)
const handleSubmit = () => {
  if(resquestStatus.value==1){
    return
  }
  resquestStatus.value=1
  mjPager.value?.submit().then(async res => {
    await handleAddTask({
					taskId: varyRegionInfo.value.taskId,
					action: MidjourneyActionEnum.VARY_REGION,
					customId: varyRegionInfo.value.varyRegionCustomId,
					prompt: prompt.value,
					mask: res,
			})
    handleClose();
    resquestStatus.value=0
	}).catch(error => {
     ms.error(error)
  })
}

const handleAddTask = async (param: REGION_REDRAW_ACTION_OPTIONS) => {
    const result = await fetchAddMjDrawTaskAPI({
				type: MidJourneyDrawEnum.REGION_ACTION,
				params: param
    }).then(res => res.data)
    updateDrawId({id: result})
    EventBus.emit("regoinMldal",result)
    result && ms.success('提交任务成功！');
}

const getImg = (base64: string) => {
  return new Promise<HTMLImageElement>(async (resolve) => {
    const img = new Image();
    img.src =  base64;
    img.onload = () => resolve(img);
  })
}


// 初始化
// 这个task是Task实例，之前的代码太乱了
const handleInit = async (varyRegionInfo: any) => {
		loading.value = true;
    // todo 必须转base64 否则会跨域 除非将图片全部存到自己的服务器
    const res = await getModalImgById(varyRegionInfo.taskId);
    const img = await getImg(res.data);
		loading.value = false;
    mjPager.value = new MjPaper(canvasRef.value, img);
}

const btns = [
  { label: 'rect', value: 0, icon: 'rect' },
  { label: 'lasso', value: 0.5, icon: 'lasso' },
]

const activeBtn = ref(0);

// 重做
const handleRedo = () => {
  mjPager.value?.undo();
}

// 重做
const handleChangeBtn = (item: {value: 0 | 0.5}) => {
  activeBtn.value = item.value;
  mjPager.value?.updateTool(item.value);
}

const handleClose = () => {
  activeBtn.value = 0;
  midjourneyStore.closeRegionModal(false );
  mjPager.value?.destroy();
}

</script>

<template>

  <n-modal
      v-model:show="showDialog"
      :mask-closable="false"
      :show-icon="false"
      preset="dialog"
      style="width: 1200px; height: 800px"
      title="区域重绘"
      @close="handleClose"
  >
    <div class="relative">

      <div class="flex-1 flex items-center justify-center  relative h-full">

        <div  class="absolute top-0 h-[640px]" v-if="loading.value">
          <div class="w-full h-full justify-center items-center flex"  >
            <n-spin size="large" />
<!--            <SvgIcon icon="line-md:downloading-loop" class="text-[60px] text-green-300"></SvgIcon>-->
          </div>
        </div>

        <canvas
            ref="canvasRef"
            resize="true"
            :style ="{
              padding: '0px',
              margin: '0px',
              width: '1024px',
              height: '640px'
            }">
        </canvas>
      </div>

      <div class="absolute left-0 top-0 flex justify-center items-center"  id="appbody">
        <button  @click="handleRedo" class="rounded-full bg-[#5a91fc] dark:bg-[#888] w-8 h-8">
          <SIcon name="undo" class="text-white"  />
        </button>
      </div>

      <div class="flex  inset-x-0 bottom-0 w-full items-end justify-between p-3 gap-4">
        <div class="flex gap-2" v-for="item in btns" @click="handleChangeBtn(item)">
          <button class="rounded-full  w-8 h-8" :class="[item.value === activeBtn ? 'bg-[#3076ED] dark:bg-[#3076ED]' :'bg-[#5a91fc] dark:bg-[#888]']">
             <SIcon :name="item.icon" class="text-white"></SIcon>
          </button>
        </div>

        <div class="flex items-end flex-1 gap-4">
          <!-- <div style="width: 100%;" class="dark:bg-[#010102] bg-[#f4f4f4]"> -->
            <n-input
              v-model:value="prompt"
              :rows="2"
              class="resize-none overflow-hidden flex-1 !border-gray-200 rounded bg-[#f4f4f4] dark:bg-[#010102]"
              placeholder="输入描述信息"
          />
          <!-- </div> -->


          <button class="rounded-full bg-[#3076ED] dark:bg-[#3076ED] w-8 h-8"
                  :disabled="!prompt"
                  @click="handleSubmit">
            <SIcon v-if="resquestStatus == 0" name="send" class="text-white"></SIcon>
            <n-spin v-if="resquestStatus == 1" :size="18" stroke="#fff" style="margin-top: 5px;"/>
          </button>

        </div>
      </div>

    </div>

  </n-modal>
</template>

