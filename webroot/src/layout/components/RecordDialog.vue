<script setup lang='ts'>
import {NAvatar, NDrawer, NDrawerContent, NModal, useDialog, useMessage,} from 'naive-ui';
import {useBasicLayout} from '@/hooks/useBasicLayout';
import {useAppStore, useAuthStore, useGlobalStoreWithOut} from '@/store';
import {SIcon, SvgIcon} from "@/components/common";
import defaultAvatar from "@/assets/avatar.png";
import {computed, nextTick, ref} from 'vue';
import {ListenStatusEnum, useChatRealtime} from "@/hooks/useChatRealtime";

const {isMobile} = useBasicLayout();
const authStore = useAuthStore();
const ms = useMessage();

defineProps<Props>();

const emit = defineEmits(["submit"]);
const appStore = useAppStore();
const theme = computed(() => appStore.theme);
const useGlobalStore = useGlobalStoreWithOut();
const loading = ref(true);
const {isSmallMd} = useBasicLayout();
const dialog = useDialog();

const showVoice = ref(false);

const { initAndStart,  stop, controller, hasMicrophone, voice, isListen, listenStatus, recordingRef, playVoiceRef } = useChatRealtime();
interface Props {
  visible: boolean,
}

const avatar = computed(() => authStore.userInfo.avatar);
const username = computed(() => authStore.userInfo.username);
const handleCloseDialog = () => {
	stop(ListenStatusEnum.none);
	loading.value = true;
	isListen.value = false;
	listenStatus.value = 0
}

// 切换
const handleTogglePlay = () => {

  if (isListen.value && listenStatus.value !== ListenStatusEnum.none ) {
    stop(ListenStatusEnum.none);
    controller.abort();
    return;
  }

	isListen.value = !isListen.value;

	if (listenStatus.value === ListenStatusEnum.none) {
		listenStatus.value = ListenStatusEnum.listening
	}

	isListen.value && initAndStart().catch(error => { ms.error(error) });
	!isListen.value && stop(ListenStatusEnum.none);
}

const tips = computed(() => {
	 return  listenStatus.value === ListenStatusEnum.listening ? '聆听中...' : listenStatus.value === ListenStatusEnum.thinking ? '思考中...' : listenStatus.value === ListenStatusEnum.speaking ? '回答中...' :  listenStatus.value === ListenStatusEnum.none  ? '点击左下角开始，右下角选择音色' : '对话出错，请再说一遍试试';
})

const handleExit = () => {
  isListen.value = false;
	stop(ListenStatusEnum.none);
  controller.abort();
  useGlobalStore.updateRecordDialog(false);
}

// 初始化
const init = async () => {

	const exist = await hasMicrophone();

  if (!exist) {
		ms.error("未检测到麦克风，请插入麦克风等音频输入设备。");
		return;
	}

	isListen.value = false;
	listenStatus.value = 1;

	handleTogglePlay();
}

const openDialog = () => {
  nextTick().then(() => {
		init();
  })
}

const options = [
    {value: "alloy"},
    {value: "echo"},
    {value: "fable"},
    {value: "onyx"},
    {value: "nova"},
    {value: "shimmer"},
]
const handleSelectVoice = (item: {value: string}) => {
   voice.value = item.value;
   showVoice.value = false;
}

</script>

<template>
  <NModal :show="visible"
					style="width: 100%; max-width: 640px; "
          :style="[isMobile ? 'height: 100vh' : 'height: auto']"
          :on-after-enter="openDialog"
          :on-after-leave="handleCloseDialog"
  >
    <div class="bg-white rounded dark:bg-gradient-to-b from-[#262643] to-[#0C0C16]" :class="[isMobile ? '' : 'pb-8']">

      <div v-if="!isMobile">

        <NModal :show="showVoice"
                preset="dialog"
                :show-icon="false"
                @close="showVoice = false"
                style="width: 60%; max-width: 500px; "
        >
          <div>
            <p>选择音调</p>

            <ul class="flex flex-col ">
              <li v-for="item in options" class="relative my-1 leading-8 dark:bg-[#262643] px-2 cursor-pointer" @click="voice = item.value">
                <div class="absolute right-2 top-[5px]" v-if="item.value === voice">
                  <SvgIcon icon="gravity-ui:check" class="text-xl"></SvgIcon>
                </div>
                <p class="text-md">{{item.value}}</p>
              </li>
            </ul>

          </div>
        </NModal>
      </div>
      <div v-else>
        <n-drawer v-model:show="showVoice"
                  :mask-closable="false"
                   placement="bottom"
                   class="!h-[45vh]"
                  style="--n-body-padding:0">
          <n-drawer-content class="mydrawer">

            <template #default>
              <div class="px-2">
                <p class="mt-4">选择音调</p>
                <ul class="flex flex-col ">
                  <li v-for="item in options" class="relative my-1 leading-8 dark:bg-[#262643] px-2 cursor-pointer" @click="handleSelectVoice(item)">
                    <div class="absolute right-2 top-[5px]" v-if="item.value === voice">
                      <SvgIcon icon="gravity-ui:check" class="text-xl"></SvgIcon>
                    </div>
                    <p class="text-md">{{item.value}}</p>
                  </li>
                </ul>
              </div>

            </template>
          </n-drawer-content>
        </n-drawer>
      </div>

      <div class="h-full transition-all">
        <div class="h-full overflow-hidden">
          <div class="flex flex-col justify-center items-center mt-10">
            <NAvatar :size="64"
                     :src="avatar"
                     round
                     bordered
                     :fallback-src="defaultAvatar"
                     class="cursor-pointer"
            />
            <p class="select-none ml-1">{{username}}</p>
          </div>

          <div class="px-4 flex flex-col items-center">

            <div class="w-full h-auto">
              <canvas class="h-[45vh] w-full" ref="playVoiceRef"></canvas>
            </div>

            <div class="flex flex-col justify-end">
              <!--绘制讲话的动画 -->
              <canvas class="h-[50px] w-full" ref="recordingRef" ></canvas>
              <div class="flex justify-center items-center">
                <SvgIcon icon="streamline:voice-mail" v-if="isListen && listenStatus === 1"></SvgIcon>
                <p class="text-center">{{ tips }}</p>
              </div>
            </div>

          </div>

          <div class="flex justify-around items-center w-full mt-8">

            <SvgIcon  :icon="isListen ? 'heroicons-solid:stop' : 'gridicons:pause'" class="text-[28px] cursor-pointer" @click="handleTogglePlay"></SvgIcon>

            <div class="darK:bg-[red] bg-[#d81e6] text-[#d81e6] dark:text-[#fff] "  @click="handleExit">
              <SIcon  name="icon_cancel" class="text-[44px] cursor-pointer darK:bg-[red] bg-[#d81e6]"></SIcon>
            </div>

            <SvgIcon  icon="ep:set-up" class="text-[24px] cursor-pointer" @click="showVoice = true"></SvgIcon>
          </div>

        </div>
      </div>
    </div>
  </NModal>
</template>
