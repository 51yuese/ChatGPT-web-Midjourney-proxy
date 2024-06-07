<script lang="ts" setup>
import { onMounted, ref, computed, onUnmounted, getCurrentInstance, watch,  } from 'vue'
import { fetchMidjourneyGetList } from '@/api/mjDraw'
import type { ResData } from '@/api/types'
import {throttle} from '@/utils/functions/throttle'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { useMessage, NSlider, NInput, NIcon } from 'naive-ui'
import {  useAuthStore } from '@/store'
import { FlashOutline } from '@vicons/ionicons5'
const authStore = useAuthStore()

const $viewerApi = getCurrentInstance()?.appContext.config.globalProperties.$viewerApi
const ms = useMessage()
const imageList = ref([])
const boxRefs = ref<any>({})
const otherInfoContainerHeight = ref(0)
const realWidth = ref(160)
const realColumn = ref(0)
const right = ref(10)
const bottom = ref(10)
const loadComplete = ref([])
const wapperRef = ref<HTMLDivElement | null>(null)
const wapperHeigth = ref(0)
const isLogin = computed(() => authStore.isLogin)
const scaleWidth = ref(30)
const keyword = ref('')
const width = computed(() => {
	return scaleWidth.value + right.value + 150
})


/* 拿到图片高度 对定位top和right  新的一轮去插入最小值的那一列 贪心算法即可 */
function compilerContainer() {
  calcHeight()
  compilerColumn()
  const columns = realColumn.value
  const itemWidth = realWidth.value
  const cacheHeight = <any>[]
		dataList.value.forEach((item, index) => {
    const { width, height } = item.fileInfo
    const bi = itemWidth / width
    const boxheight = height * bi + bottom.value + otherInfoContainerHeight.value
    const currentBox = boxRefs.value[item.id]
    if (cacheHeight.length < columns) {
      currentBox.style.top = '0px'
      currentBox.style.left = `${(itemWidth + right.value) * index}px`
      cacheHeight.push(boxheight)
    }
    else {
      const minHeight = Math.min.apply(null, cacheHeight)
      const minIndex = cacheHeight.findIndex(t => t === minHeight)
      currentBox.style.top = `${minHeight + 0}px`
      currentBox.style.left = `${minIndex * (realWidth.value + right.value)}px`
      cacheHeight[minIndex] += boxheight
    }
  })
	wapperHeigth.value = Math.max(...cacheHeight) + 130
}

function setItemRefs(el: HTMLDivElement, item) {
		if (el && item) {
			boxRefs.value[item.id] = el;
		}
}

/* 通过额外展示的信息计算有没有除了图片意外额外的高度 eg： 图片100px 额外显示其他信息30px cacheHeight的高度在图片的基础上需要+30 */
function calcHeight() {
  const { showName = 0, showOther = 0 } = {}
  otherInfoContainerHeight.value = [showName, showOther].filter(t => t).length * 15
}

const dataList = computed(() => {
	if(!keyword.value){
		return imageList.value
	}else{
		return imageList.value.filter((item: any) => {
			const { prompt } = item
			return prompt.includes(keyword.value)
		})
	}
})
watch(scaleWidth, () => {
	compilerContainer()
})

let timeoutId: any = null
watch(dataList, () => {
  if (!dataList.value.length) {
    return
  }
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    compilerContainer()
  }, 300)
})

async function queryDrawImg() {
  const res: ResData = await fetchMidjourneyGetList({ size: 999, rec: 1 })
  imageList.value = res.data.rows
}


/* 计算放多少列比较合理，并计算最终单个图片的宽 */
function compilerColumn() {
  if (!wapperRef.value)
    return
  const containerWidth = wapperRef.value.clientWidth

  /* 计算按目前宽度最多可以是几列 */
  realColumn.value = Math.floor(containerWidth / width.value)
  const surplus = containerWidth - realColumn.value * width.value // 剩下的多余空间
  /* 计算如果给了左右间距那么作业间距需要占多少宽度 */
  const positionWith = ((realColumn.value - 1) * right.value) // 设置的right 需要padding的值
  /* 总宽度减去right的宽度，如果是负数考虑要不要cloumn-1 那么图片真实宽度就会比传入的宽度大 */
  if (surplus - positionWith < 0)
    realColumn.value -= 1

  /* 图片宽度*列 + right的间距 不管大于小于总宽  多的或者少的那部分都平分给列容器 保证总宽是100% */
  realWidth.value = Math.floor((containerWidth - positionWith) / realColumn.value)

}

function imgLoadSuccess(e,item){
	loadComplete.value.push(item.id)
}

function imgLoadError(e,item){
	loadComplete.value.push(item.id)
}

function handleCopy(item: any){
	if(!isLogin.value){
		return authStore.setLoginDialog(true)
	}
	const {prompt } = item
	copyText({text: prompt})
	ms.success('复制prompt成功')
}

function handlePreview(item: any){
	const {fileInfo } = item
	const { cosUrl } = fileInfo
	$viewerApi({options: {}, images: [cosUrl]})
}

const realHeight = computed(() => (item) => {
	const {fileInfo} = item
	const { width, height} = fileInfo
	return height / (width / realWidth.value)
})

const handleResizeThrottled =  throttle(function(this: any) {
	compilerContainer()
}, 200)

onMounted(async () => {
  await queryDrawImg()
  compilerContainer()
	window.addEventListener('resize', handleResizeThrottled)
})

onUnmounted(() => {
	window.removeEventListener('resize', handleResizeThrottled)
})
</script>

<template>
	<div class="bg-[#E7ECF6] h-[100vh] overflow-hidden h-full p-4 pr-0 dark:bg-[#18181c] flex flex-col">
		<div class="p-4 flex pr-6 justify-between items-center">
			<div class="font-bold text-xl">AI绘画广场</div>
			<div class="w-[200px] sm:w-[300px] flex justify-between">
				<span class="hidden sm:block"  >尺寸调整</span>
				<div class="flex-1 ml-5">
					<n-slider v-model:value="scaleWidth" :step="10" />
				</div>
			</div>
		</div>
		<div class="px-4 mb-6 pr-5">
			<n-input v-model:value="keyword" placeholder="prompt关键词搜索">
      <template #prefix>
        <n-icon :component="FlashOutline" />
      </template>
    </n-input>
		</div>
		<div class="market  overflow-y-scroll flex-1 min-h-screen bg-[#E7ECF6] p-4 dark:bg-[#18181c] relative ">
			<div id="wapper" ref="wapperRef" class="wapper" :style="{height: `${wapperHeigth}px`}">
				<div
					v-for="(item, index) in dataList"
					:id="item.id" :key="index"
					:ref="(el) => setItemRefs(el, item)"
					class="wapper-item"
					:style="{ width: `${realWidth}px` }"
				>
					<transition name="img" :css="true">
						<img
							:id="item.id"
							class="item-file rounded-sm"
							:style="{width: `${realWidth}px`, height: `${realHeight(item)}px`}"
							:src="item.fileInfo.thumbImg"
							loading="lazy"
							@load="imgLoadSuccess($event,item)"
							@error="imgLoadError($event,item)"
							@click="handlePreview(item)"
						/>
					</transition>
					<div class="menu p-2 text-[#cbd5e1]">
						<div class="prompt">
							{{ item.fullPrompt }}
						</div>
						<div class="flex justify-between items-end">
							{{ item.createdAt }}
							<button class="flex h-5 w-8 items-center justify-center rounded border transition hover:bg-[#666161] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click.stop="handleCopy(item)">
								<span class="text-sm  dark:text-slate-400"><SvgIcon icon="tabler:copy" class="text-sm" /> </span>
							</button>
						</div>
					</div>
					<div class="item-loading" v-if="!loadComplete.includes(item.id)" :style="{width: `${realWidth}px`, height: `${realHeight(item)}px`}"></div>
				</div>
			</div>
		</div>
	</div>

</template>

<style lang="less">
.market{
	padding: 15px;
}

.wapper{
	width: 100%;
	position: relative;
	height: 100%;
	padding-bottom: 20px;


	&-item{
		z-index: 10;
		overflow: hidden;
		position: absolute;
		transition: all 0.5s;
		cursor: pointer;

		&:hover{
			.menu{
				transition: transform 0.3s ease-in-out;
  			transform: translateY(-10px);
			}
			img{
				transform: scale(1.1);
			}
		}

		.menu{
			position: absolute;
			bottom: 0;
			width: 94%;
			left: 3%;
			max-height: 70%;
			height: 100px;
			transform: translateY(100%);
			background-color: #090b15;
			opacity: 0.8;
			transition: all .1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
			border-radius: 10px;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.prompt{
				height: 50px;
				overflow: hidden;
			}

		}

		img{
			user-select: none;
			cursor: pointer;
			transition: all .6s cubic-bezier(0.19, 1, 0.22, 1);
			border-radius: 6px;
		}

		.item-loading{
			background: url(../../assets/img-bg.png) no-repeat center center;
			filter: blur(20px);
			position: absolute;
			top: 0;
		}
	}
}

.img-enter-active, .img-leave-active {
  transition: transform .3s;
}
.img-enter, .img-leave-to{
  transform: scale(.6);
  opacity: 0;
}


</style>
