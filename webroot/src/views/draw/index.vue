<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NAlert, NButton, NEmpty, NIcon, NImage, NInput, NInputGroup, NTabPane, NTabs, useMessage ,NSwitch,NSpace} from 'naive-ui'
import { ImagesOutline } from '@vicons/ionicons5'
import { fetchChatDraw, fetchGetAllChatLogDraw, fetchGetChatLogDraw } from '@/api'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { TitleBar } from '@/components/base'
import { useAppStore, useAuthStore } from '@/store'
import baiduThink from '../midjourney/components/baiduThink.vue'
import createInspiration from '../midjourney/components/createInspiration.vue'
import Loading from '@/components/base/Loading.vue'
import SiderBar from '../../layout/siderBar/index.vue';
import { useRoute, useRouter } from "vue-router";
const theme = computed(() => appStore.theme)
import { MidJourneyDrawEnum } from "@/constants";
import type { ResData } from '@/api/types'
import EventBus from '@/hooks/eventBus'
const authStore = useAuthStore()
const loadingTextColor = computed(() => theme.value === 'dark' ? '#fff' : '#000')
const { isMobile } = useBasicLayout()
const appStore = useAppStore()
const isLogin = computed(() => authStore.isLogin)

const index = ref(0)
const loading = ref(false)
const ms = useMessage()
const mineDrawList: any = ref([])
const allDrawList: any = ref([])
const router = useRouter();
const route = useRoute();
const darkMode = computed(() => appStore.theme === 'dark')

watch(isLogin, async (newVal, oldVal) => {
  if (newVal && !oldVal)
    queryMyDrawList()
})

const exampleList = [
  '超级逼真的未来世界，真实照片，虚幻引擎',
  '帅哥，二次元，赛博朋克风格，精致脸庞',
  '兔子，可爱，高质量，高品质',
]

const imageSizeList = [
  // { label: '256x256', value: '256x256' },
  // { label: '512x512', value: '512x512' },
  { label: '1024x1024', value: '1024x1024' },
]

const imageNumList = [
  { label: '1张', value: 1 },
  { label: '2张', value: 2 },
  { label: '3张', value: 3 },
  { label: '4张', value: 4 },
  { label: '5张', value: 5 },
  { label: '6张', value: 6 },
  { label: '7张', value: 7 },
  { label: '8张', value: 8 },
  { label: '9张', value: 9 },
]

const promptList = ['古风', '二次元', '写实照片', '油画', '水彩画', '油墨画', '黑白雕版画', '雕塑', '3D模型', '手绘草图', '炭笔画', '极简线条画', '电影质感', '机械感']

const form = ref({
  prompt: '',
  n: 1,
  size: '1024x1024',
})

function updateEx() {
  index.value = index.value + 1 >= exampleList.length ? 0 : index.value + 1
}

async function queryMyDrawList() {
  const res: ResData = await fetchGetChatLogDraw({ model: 'DALL-E2' })
  if (!res.success)
    return
  mineDrawList.value = res.data
}

async function queryAllDrawList() {
  const res: ResData = await fetchGetAllChatLogDraw({ size: 999, rec: 1, model: 'DALL-E3' })
  if (!res.success)
    return ms.error(res.message)
  allDrawList.value = res.data.rows
}

async function drawImage() {
  if (!form.value.prompt)
    return ms.error('请输入您想要生成的图片描述信息！')
  try {
    loading.value = true
    await fetchChatDraw(form.value)
    ms.success('生成图片成完成、前往我的生成查看图片！')
    await queryMyDrawList()
    loading.value = false
  }
  catch (error) {
    ms.error('生成图片失败、请重试！')
    loading.value = false
  }
}

function updateTabs(name: string) {
  name === 'mine' && queryMyDrawList()
  name === 'all' && queryAllDrawList()
}

onMounted(() => {
  queryAllDrawList()
})
EventBus.emit("drawRoute", router.options.history.location)
const active = ref(false)//自动翻译开关
const translate = ref(0)
function handleChange() {
	if (active.value) {
		translate.value = 1
	} else {
		translate.value = 0
	}
}
const routerPath = computed(() => route.path)
const currentPage = computed(() => {
	return routerPath.value.includes('text-to-image') ?
		MidJourneyDrawEnum.TEXT_TO_IMAGE : routerPath.value.includes('image-to-text') ?
			MidJourneyDrawEnum.IMAGE_TO_TEXT : routerPath.value.includes('image-mix-image') ?
				MidJourneyDrawEnum.IMAGE_MIX_IMAGE : MidJourneyDrawEnum.NONE;
})
const thinkRef = ref()
const inspirationRef = ref()
// 联想
const handleThink = () => {
		thinkRef.value.open()
}
// 咒语生成器
const handlePromptCreate = () => {
		inspirationRef.value.open()
}
EventBus.on("selectIncantation",data=>{
  form.value.prompt=data
})
EventBus.on("think",data=>{
  form.value.prompt=data
})
</script>

<template>
  <!-- 菜单栏 -->
  <div style="position: absolute;">
    <SiderBar v-if="!isMobile" />
  </div>
  <baiduThink ref="thinkRef"></baiduThink>
	<createInspiration ref="inspirationRef"></createInspiration>
  <!-- <div class="main  h-full overflow-auto bg-custom-background-image bg-repeat-y bg-cover bg-center dark:bg-[#24272e]" :class="isMobile ? ['px-0'] : ['px-10']" :style="{ backgroundImage: !darkMode ? `url('https://seek.yesongit.com/_nuxt/bg.0b4507a9.png')` : '' }"> -->
  <div class="main  bg-center dark:bg-[#010102]">
    <div class="bg-[#FFFFFF] dark:bg-[#15171A] mainBox">
      <TitleBar title="AI绘画基础版" des="基础版绘图速度较快、根据关键词生成~大约需要10-30s左右时间、合理使用！" :padding="isMobile ? 2 : 20" />
      <div :class="isMobile ? ['px-2'] : ['px-20']">
        <!-- <NAlert :show-icon="false" type="success" class="mt-5">
        <span class="text-[#67c23a]">每生成一张图片需要扣除您的两个基础模型余额、我们将默认将您的输入转为英文！</span>
      </NAlert> -->
        <!-- <div class="flex my-5">
        <b class="text-primary cursor-pointer select-none flex-shrink-0" @click="updateEx">换示例</b>
        <p class="mx-2 text-[#707384] select-none flex-shrink-0">
          Prompt示例：
        </p>
        <p class=" text-[#707384]">
          {{ exampleList[index] }}
        </p>
      </div> -->

        <div class=" bg-[#f4f4f4] dark:bg-[#010102] " style="height: 100px;display: flex;margin-top: 10px;border-radius: 4px;">
          <div style="flex: 1;display: flex;flex-direction: column;justify-content: space-between;">
            <NInputGroup>
              <!-- <NInput style="background: transparent;" size="large" :disabled="loading"
                clearable placeholder="请输入您想要生成的图片描述信息、可以参考上面的示例文字、我们将会对其转为英文绘画、请知悉！" /> -->
              <input style="width: 100%;height: 50px;background-color: transparent;padding-left: 10px;" type="text" v-model="form.prompt" placeholder="请输入您想要生成的图片描述信息、可以参考上面的示例文字、我们将会对其转为英文绘画、请知悉！" >
            </NInputGroup>
            <div style="display: flex;margin-left: 10px;padding-bottom: 10px;"> 
              <div class="otherItem">
                <p class="otherText text-[#808080] dark:text-[#fff]" style="margin-top: 3px;">自动翻译</p>
                <n-space>
                  <NSwitch v-model:value="active" @update:value="handleChange" size="small"
                    :disabled="currentPage == 2 || currentPage == 3" />
                </n-space>
              </div>
              <div class="otherItem" @click="handleThink">
                <p class="otherText text-[#808080] dark:text-[#fff]" style="margin-top: 3px;">联想</p>
                <img class="setImg" src="../midjourney/img/head.png" alt="">
              </div>
              <div class="otherItem" @click="handlePromptCreate">
                <p class="otherText text-[#808080] dark:text-[#fff]" style="margin-top: 3px;">提示词生成器</p>
              </div>
            </div>
          </div>
          <div style="display: flex;align-items: flex-end;padding-bottom: 10px;margin-right: 10px;">
            <NButton :loading="loading" :disabled="loading" @click="drawImage" style="background-color: #408EFC;border-radius: 8px;">
              <template #icon>
                <NIcon>
                  <ImagesOutline />
                </NIcon>
              </template>
              生成图片
            </NButton>
          </div>

        </div>
        <div class="mt-5 p-4 bg-[#f4f4f4] dark:bg-[#010102] rounded-lg">
          <!-- <h4 class="text-base mb-2">
          参数设置
        </h4>
        <div class="flex mt-5">
          <span class="mr-2 inline-block w-16 flex-shrink-0">图片尺寸:</span>
          <div>
            <span v-for="item in imageSizeList" :key="item.value" class=" py-2 px-5 rounded ml-2 select-none cursor-pointer inline-block mb-2" :class="item.value === form.size ? ['text-primary', 'bg-[#0d6efd1c]'] : ['bg-[#bfc4d033]']" @click="form.size = item.value">{{ item.label }}</span>
          </div>
        </div>
        <div class="flex mt-6 pb-8 border-b border-[#000c3f1a]">
          <span class="mr-2  w-16 flex-shrink-0">图片张数:</span>
          <div>
            <span v-for="item in imageNumList" :key="item.value" class=" py-2 px-5 rounded ml-2 select-none cursor-pointer mb-2 inline-block" :class="item.value === form.n ? ['text-primary', 'bg-[#0d6efd1c]'] : ['bg-[#bfc4d033]']" @click="form.n = item.value">{{ item.label }}</span>
          </div>
        </div> -->
          <div class="flex mt-5">
            <h4 class="text-base mr-2  w-20 flex-shrink-0">
              修饰词参考
            </h4>
            <p class="text-[#707384]">
              您可参考或选用下列各类修饰词丰富您的输入文本，尝试生成更加多样的图像，更多修饰词可参考 Prompt指南 或 自由输入 探索大模型作画更多未知能力
            </p>
          </div>
          <div class="flex mt-5 ">
            <h4 class="text-base mr-2  w-20 flex-shrink-0">
              图像类型
            </h4>
            <div>
              <span v-for="(item, i) in promptList" :key="item" class="cursor-pointer hover:text-primary"
                @click="form.prompt += form.prompt ? `，${item}` : item">{{ `${item} ${i + 1 === promptList.length ? '' :
                  '、'}` }}</span>
            </div>
          </div>
        </div>
        <div v-if="loading" class="mt-8 pb-10">
          <div class="flex justify-center">
            ----------- 正在生成中、图片越大数量越多所需时间越多、预计15S -----------
          </div>
          <div class="flex flex-wrap mt-8">
            <div class="w-44 h-44 border rounded-md relative  ml-4 mt-4" v-for="i in form.n" :key="i">
              <Loading :text-color="loadingTextColor" :words="['图', '片', '绘', '制', '中']" />
            </div>
            <!-- <img v-for="i in 5" :key="i" class="w-40 rounded ml-4 mt-4" src="https://public-1300678944.cos.ap-shanghai.myqcloud.com/blog/16816463869037208e40df8ceb5ff.gif"> -->
          </div>
        </div>
        <NTabs type="line" animated class="mt-5" @update:value="updateTabs">
          <!-- <NTabPane name="all" tab="公共生成">
            <div v-if="allDrawList.length" class="flex flex-wrap mt-8">
              <NImage v-for="item in allDrawList" :key="item.answer" lazy class="w-40 ml-4 mb-4" :src="item.thumbImg"
                :preview-src="item.answer" />
            </div>
            <NEmpty v-else size="huge" class="mt-20" description="暂无数据哟~" />
          </NTabPane> -->
          <NTabPane name="mine" tab="我的生成">
            <div v-if="mineDrawList.length" class="flex flex-wrap mt-8">
              <NImage v-for="(item, i) in mineDrawList" :key="item.answer" lazy object-fit="contain"
                class="flex justify-center"
                :class="[isMobile ? 'w-6/12 ml-0 mb-4' : 'w-40 ml-4 mb-4', i % 2 === 0 ? 'pr-1' : 'pl-1']"
                :src="item.thumbImg" :preview-src="item.answer" />
            </div>
            <NEmpty v-else size="huge" class="mt-20" description="暂无数据哟~" />
          </NTabPane>
        </NTabs>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.main {
  margin: 0 10px;
}

.mainBox {
  height: 92vh;
  margin-top: 10px;
  margin-left: 90px;
  border-radius: 8px;
}
.otherItem {
					width: auto;
					display: flex;
					margin-right: 20px;
					align-items: center;
					cursor: pointer;

					.setImg {
						width: 16px;
						height: 16px;
					}

					.otherText {
						font-size: 13px;
						margin: 0 5px;
					}
				}
</style>
