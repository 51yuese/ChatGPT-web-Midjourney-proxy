<script setup lang='ts'>

import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  useThemeVars,
  NProgress,
  NIcon,
  NModal,
  NSkeleton,
  NSpace,
  useDialog,
  useMessage,
  NTooltip
} from 'naive-ui'
import {CloseOutline} from '@vicons/ionicons5'
import {computed, nextTick, ref} from 'vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAuthStore, useGlobalStoreWithOut} from '@/store'
import {SvgIcon} from "@/components/common";
import {PlayStatus, useRecordVoice} from "@/views/chat/hooks/useRecordVoice";

const ms = useMessage()

defineProps<Props>()
const emit = defineEmits(["submit"])


const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(true)
const {isSmallMd} = useBasicLayout()

const message = useMessage()
const dialog = useDialog()

const recordedChunks = ref<any[]>([])
let mediaRecorder = ref<MediaRecorder>()
let audioStream = ref<MediaStream>()
let audioPlayer = ref<any>()
let canvasContainer = ref()

const {playing, time, destroy, playRecord, getRecordFile, stopPlay, startRecord, init, recording, stopRecord} = useRecordVoice();

interface Props {
  visible: boolean,
}

function handleCloseDialog() {
  loading.value = true
}

const handleRecord = (record: boolean) => {

  if (record) {
    startRecord()
  } else {
    stopRecord();
  }
}


const handleUpload = async () => {

  const file = getRecordFile()

  emit("submit", file)
  cancelCallback();

}

const cancelCallback = () => {
  destroy()
}

function openDialog() {

  nextTick().then(() => {
    const dom = canvasContainer.value;
    if (!dom) return
    init(dom);
  })
}


</script>

<template>
  <NModal :show="visible"

          :style="{ maxWidth: `700px`, minWidth: isSmallMd ? '100%' : '500px' }"
          :on-after-enter="openDialog"
          :on-after-leave="handleCloseDialog"

  >
    <div class="p-4 bg-white rounded dark:bg-slate-800">
      <div class=" flex cursor-pointer justify-between ">

        <span class="text-xl">语音文件录制</span>
        <NIcon size="20" color="#0e7a0d" @click="useGlobalStore.updateRecordDialog(false)">
          <CloseOutline/>
        </NIcon>
      </div>


      <div class="flex flex-col">

        <div class="flex  justify-center">
          <h1 class="text-3xl">{{ time }}</h1>
        </div>

        <!-- 波形图 -->
        <div class="flex justify-center " ref="canvasContainer" style="height: 150px"></div>

        <div class="flex justify-center mt-2">

          <div>

						<NTooltip trigger="hover"  >
							<template #trigger>
								<n-button text
													class="flex items-center  justify-center rounded  transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]"
													@click="handleRecord(!recording)">
									  <span :class="'text-[#3076fd]'">
										   <SvgIcon class="text-lg mr-2.5   text-[#3076fd]" style="width: 1.6em;height: 1.6em"
																:icon="!recording ? 'icon-park-outline:voice-off' : 'streamline:voice-mail'"/>
									 </span>
								</n-button>
							</template>
							{{!recording ? '开始录音': "停止录音"}}
						</NTooltip>

						<NTooltip trigger="hover"  >
							<template #trigger>
								<n-button text
													class="flex items-center  justify-center rounded  transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]"
													@click.stop="playRecord(
															playing === PlayStatus.pause ?
														 PlayStatus.playing :  PlayStatus.pause)">
												<span :class="'text-[#3076fd]'">
														 <svg-icon  :icon="playing === PlayStatus.pause ? 'octicon:play-24' : 'carbon:pause-outline'"
																	style="width: 1.6em;height: 1.6em" class="text-lg mr-2.5  text-[#3076fd]"></svg-icon>
											 </span>
								</n-button>
							</template>
							{{playing === PlayStatus.pause ? '播放': "重播"}}
						</NTooltip>

						<NTooltip trigger="hover"  >
							<template #trigger>
								<n-button text
													class="flex items-center  justify-center rounded  transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]"
													@click.stop="stopPlay">
												<span :class="'text-[#3076fd]'">
													 <svg-icon icon="ion:stop" style="width: 1.6em;height: 1.6em" class="text-lg  mr-2.5 text-[#3076fd]"
																		 ></svg-icon>
											 </span>
								</n-button>
							</template>
							停止播放
						</NTooltip>

						<NTooltip trigger="hover"  >
							<template #trigger>
								<n-button text
													class="flex items-center  justify-center rounded  transition hover:bg-[#eef0f3] dark:border-neutral-700 dark:hover:bg-[#33373c]"
													@click.stop="handleUpload">
												<span :class="'text-[#3076fd]'">
													 <svg-icon icon="ph:upload-fill" style="width: 1.6em;height: 1.6em" class="text-lg text-[#3076fd]"
													 ></svg-icon>
											 </span>
								</n-button>
							</template>
							上传语音
						</NTooltip>
          </div>
        </div>

      </div>

    </div>
  </NModal>
</template>
