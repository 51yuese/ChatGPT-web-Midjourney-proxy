<script lang="ts" setup>
import { onMounted, ref, computed, reactive, onUnmounted, getCurrentInstance, watch,  } from 'vue'
import {fetchMidjourneyGetList} from '@/api/mjDraw'
import type { ResData } from '@/api/types'
import {throttle} from '@/utils/functions/throttle'
import {useRouter} from 'vue-router'
import { copyText } from '@/utils/format'
import { useMessage} from 'naive-ui'
import {  useAuthStore } from '@/store'
import EventBus from '@/hooks/eventBus'
import axios from 'axios'


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
const router = useRouter()
const props = defineProps({
  type: {
    type: String,
    required: false,
    default: 'all'
  }
})
const newData=ref()
EventBus.on("newData",data=>{
  newData.value=data
})
const pager = reactive({
  page: 1,
  size: 999,
  rec: 1,
  squareType: props.type
})

/* 拿到图片高度 对定位top和right  新的一轮去插入最小值的那一列 贪心算法即可 */
function compilerContainer() {
  calcHeight()
  compilerColumn()
  const columns = realColumn.value
  const itemWidth = realWidth.value
  const cacheHeight = <any>[]
  dataList.value.forEach((item, index) => {
    
    let width = 200;
    let height = 300;
    
    if (item.fileInfo) {
        width = item.fileInfo.width || width
        height = item.fileInfo.height || height
    }
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
  if(newData.value){
    return newData.value.rows
  }
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
  const res: ResData = await fetchMidjourneyGetList(pager)
  let newData=res.data.rows
  newData.forEach(item=>{
    item.src=item.imageUrl+"?imageView2/0/w/400/q/85"
  })
  imageList.value = newData
}

// 画同款
const handleDraw = (item: {fullPrompt: string}) => {
  authStore.updatePromptWords({prompt: item.fullPrompt});
  router.push("/midjourney?id=textToImage");
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
  $viewerApi({options: {}, images: [item.imageUrl]})
}

const realHeight = computed(() => (item) => {
    let width = 200;
    let height = 300;
    if (item.fileInfo) {
        width = item.fileInfo.width
        height = item.fileInfo.height
    }
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

defineExpose({
  handleQuery: (type: string) => {
    pager.squareType = type;
    queryDrawImg();
    compilerContainer()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResizeThrottled)
})
function handleDetails(item){
  EventBus.emit("Details",true)
  EventBus.emit("DetailsData",item)
}
</script>

<template>
  <div class="overflow-hidden pr-0 h-full flex flex-col">
    <div class="market overflow-y-auto flex-1 min-h-screen h-[80vh] p-2 relative itemContent">
      <div id="wapper" ref="wapperRef" class="wapper"  :style="{height: `${wapperHeigth}px`}">
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
                :src="item.src"
                loading="lazy"
                @load="imgLoadSuccess($event,item)"
                @error="imgLoadError($event,item)"
            />
          </transition>
          <div class="menu" @click="handleDetails(item)">
            <div>查看详情</div>
            <!-- <div class="prompt">
              {{ item.fullPrompt }}
            </div>
            <div class="flex justify-between items-end">

              <button class="flex mr-2 h-4 w-10 items-center justify-center rounded border transition hover:bg-[#666161] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click.stop="handleDraw(item)">
                <span class="text-[12px] pt-[2px] scale-90 dark:text-slate-400">画同款</span>
              </button>
              <button class="flex h-4 w-8 items-center justify-center rounded border transition hover:bg-[#666161] dark:border-neutral-700 dark:hover:bg-[#33373c]" @click.stop="handleCopy(item)">
                <span class="text-[12px] pt-[2px] scale-90 dark:text-slate-400">复制</span>
              </button>
            </div> -->
          </div>
          <!-- <div class="item-loading" v-if="loadComplete.includes(!item.id)" :style="{width: `${realWidth}px`, height: `${realHeight(item)}px`}"></div> -->
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
        transition: all 0.2s ease-in-out;
        opacity: 1;
      }
      img{
        transform: scale(1.1);
      }
    }
    .menu{
        position: absolute;
        width: 100px;
        height: 36px;
        left: calc(50% - 50px);
        top: calc(50% - 18px);
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(80, 90, 212, 0.5);
        border: 2px solid #545FE0;
        border-radius: 4px;
        // display: none;
        opacity: 0;
        color: #fff;

    }
    .menu:hover{
      background: rgba(80, 90, 212,1);
    }
    img{
      user-select: none;
      cursor: pointer;
      transition: all .6s cubic-bezier(0.19, 1, 0.22, 1);
      border-radius: 6px;
    }

    .item-loading{
      background: #0a0a0a no-repeat center center;
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
.itemContent::-webkit-scrollbar{
  display: none;
}
.itemContent {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
