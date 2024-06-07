<script setup lang="ts">
import {NButton, NSelect, NInput, NImage, NModal, useMessage, NTooltip} from 'naive-ui'
import {useAuthStore} from "@/store";
import {computed, ref, reactive, onMounted, getCurrentInstance, PropType, onBeforeUnmount, toRefs, nextTick } from "vue";
import {fetchGetDraw, fetchSetImageFavor} from "@/api/mjDraw";
import {SvgIcon} from "@/components/common";
import {copyText} from "@/utils/format";
const ms = useMessage();
const authStore = useAuthStore();
const showDialog = computed(() => authStore.previewDrawDialog)
const previewDrawTaskId = computed(() => authStore.previewDrawTaskId)

enum DrawStatus {
  BEFORE_DRAW = 'beforeDraw',
  DRAWING = 'drawing',
  DRAWED = 'drawed'
}

enum DrawType {
  POLYGON = 'polygon', // 多边形
  RECTANGLE = 'rectangle', // 矩形
}

interface Point {
  x: number,
  y: number
}

interface RectanglePointData {
  leftTopPoint: Point,
  rightBottomPoint: Point
}
interface RoiData {
  points: Point[],
  type: DrawType
}
interface Size {
  width: number,
  height: number
}
const form = reactive({
  id: previewDrawTaskId.value,
  squareType: ''
})

const currentPreviewDraw = ref({})

const drawStatus = ref(DrawStatus.BEFORE_DRAW); // 画图状态

const drawType = ref(''); // 画图类型

const rectanglePointData: RectanglePointData  = reactive({ // 矩形左上角与右下角坐标
  leftTopPoint: { x: 0, y: 0 },
  rightBottomPoint: { x: 0, y: 0 }
});

let polygonPointData: Point[] = reactive([]); // 多边形顶点坐标
let discountPointData: Point[] = reactive([]); // 折线图顶点坐标
let linePointData: Point[] = reactive([]); // 直线加箭头点坐标数据
let saveRoiData: RoiData[] = reactive([]); // 保存的数据

const canvasSize = reactive({ width: 472, height: 400 });

let ctx: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;
let roiCanvas = ref();

const realWidth = ref(0)
const realHeight = ref(0)

// 关闭roi操作
const closeRoiLayer = () => {
  clearAllData()
  // emit('closeRoiLayer')
};

// 设置绘图类型
const setDrawType = (type: string) => {
  drawType.value = type
};

// 鼠标按下
const onMouseDownHandel = (e: MouseEvent) => {

  const { offsetX, offsetY, buttons } = e;

  if (buttons === 1) {

    drawStatus.value = DrawStatus.DRAWING; // 绘制中

    // 鼠标左键
    if (drawType.value === DrawType.RECTANGLE) {

      rectanglePointData.leftTopPoint = { x: offsetX, y: offsetY }

    } else if (drawType.value === DrawType.POLYGON) {

      if (polygonPointData.length === 0) {
        // 多边形没有数据时

        polygonPointData.push({ x: offsetX, y: offsetY })
        polygonPointData.push({ x: offsetX, y: offsetY })
      } else {
        // 判断点击新加的点与上上一个点一样则忽略
        polygonPointData.push({ x: offsetX, y: offsetY })
      }

    }
  } else {

    // 鼠标右键退出绘制模式，背景变亮
    if (drawType.value === DrawType.RECTANGLE) {

      // 退出时保存绘制的图形到存储数据中
      const { x: offsetX1, y: offsetY1 } = rectanglePointData.leftTopPoint
      const { x: offsetX2, y: offsetY2 } = rectanglePointData.rightBottomPoint

      if (offsetX1 !== 0 || offsetY1 !== 0 || offsetX2 !== 0 || offsetY2 !== 0) {

        const points = getRectanglePoints(rectanglePointData.leftTopPoint, rectanglePointData.rightBottomPoint)
        saveRoiData.push({ type: DrawType.RECTANGLE, points })

        // 保存完后清空现在的数据
        rectanglePointData.leftTopPoint = { x: 0, y: 0 }
        rectanglePointData.rightBottomPoint = { x: 0, y: 0 }
      }

    } else if (drawType.value === DrawType.POLYGON) {

      drawStatus.value = DrawStatus.DRAWED

      const _polygonPointData = duplicationPoint(polygonPointData)
      if (_polygonPointData.length > 2) {
        saveRoiData.push({ type: DrawType.POLYGON, points: _polygonPointData })
      }

      polygonPointData = []
    }
    drawType.value = '';
    ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height)
    drawAllSaveData()
  }
}

const onMousemoveHandel = (e: MouseEvent) => {
  if (drawStatus.value !== DrawStatus.DRAWING || !drawType.value) {
    // 不在绘制中状态时，不进行下一步操作
    return
  }
  ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height)
  const { offsetX, offsetY } = e
  if (drawType.value === DrawType.RECTANGLE) {
    rectanglePointData.rightBottomPoint = { x: offsetX, y: offsetY }
    drawRectangleHandel(rectanglePointData)
  } else if (drawType.value === DrawType.POLYGON) {
    if (polygonPointData.length - 1 > 0) {
      polygonPointData[polygonPointData.length - 1] = { x: offsetX, y: offsetY }
      drawLinesPolygon(polygonPointData)
    }
  }
  // 绘制剩余全部图形
  drawAllSaveData()
}

const onMouseupHandel = () => {
  if (drawType.value === DrawType.RECTANGLE) {
    drawStatus.value = DrawStatus.DRAWED
  }
}

const onMouseLeave = () => {
  drawStatus.value = DrawStatus.BEFORE_DRAW
}

// 获取矩形4个顶点坐标
const getRectanglePoints = (leftTopPoint: Point, rightBottomPoint: Point) => {
  const points: Point[] = []

  const { x: offsetX1, y: offsetY1 } = leftTopPoint;
  const { x: offsetX2, y: offsetY2 } = rightBottomPoint;

  points.push(leftTopPoint);
  points.push({ x: offsetX1, y: offsetY2 });

  points.push(rightBottomPoint);
  points.push({ x: offsetX2, y: offsetY1 });
  return points
}

// 画矩形
const drawRectangleHandel = (rectanglePointData: RectanglePointData) => {
  const points = getRectanglePoints(rectanglePointData.leftTopPoint, rectanglePointData.rightBottomPoint)
  drawLines(points, DrawType.RECTANGLE)
}

// 依次划线
const drawLines = (points: Point[], type: DrawType) => {
  if (type === DrawType.POLYGON ) {
    ctx.strokeStyle = 'red'
  } else if (type === DrawType.RECTANGLE) {
    ctx.strokeStyle = 'green'
  }
  ctx.lineWidth = 2
  ctx?.beginPath()
  points.forEach((point: Point, index: number) => {
    const { x, y } = point;
    if (index === 0) {
      ctx?.moveTo(x, y)
    } else {
      ctx?.lineTo(x, y)
    }
  })
  ctx?.closePath()
  ctx?.stroke()
}

// 依次划线 多边形 区分颜色
const drawLinesPolygon = (points: Point[]) => {
  (ctx as CanvasRenderingContext2D).lineWidth = 2
  points.forEach((point: Point, index: number) => {

    const { x, y } = point;

    if (index === 0) {
      ctx?.beginPath()
      ctx?.moveTo(x, y)
    } else {
      if (index === points.length - 1) {
        (ctx as CanvasRenderingContext2D).strokeStyle = 'yellow'
      } else {
        (ctx as CanvasRenderingContext2D).strokeStyle = 'red'
      }
      ctx?.lineTo(x, y)
      ctx?.closePath()
      ctx?.stroke()
      ctx?.beginPath()
      ctx?.moveTo(x, y)
      if (index === points.length - 1 && points.length > 2) {
        ctx?.lineTo(points[0].x, points[0].y)
        ctx?.closePath()
        ctx?.stroke()
      }
    }
  })
}


const drawAllSaveData = () => {
  saveRoiData.forEach((item: RoiData) => {
    drawLines(item.points, item.type)
  })
}

// 清空数据并清除画不
const clearAllData = () => {
  saveRoiData = []
  rectanglePointData.leftTopPoint = { x: 0, y: 0 }
  rectanglePointData.rightBottomPoint = { x: 0, y: 0 }
  polygonPointData = []
  discountPointData = []
  linePointData = []
  ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height)
}

const duplicationPoint = (points: Point[]) => {
  const result: Point[] = []
  const keySet: any = {}
  points.forEach(item => {
    if (!keySet[`${item.x}_${item.y}`]) {
      result.push(item)
    }
    keySet[`${item.x}_${item.y}`] = item
  })
  return result
}

// 坐标转换，当canvas大小发生变化时，进行坐标转换
const pointTranform = () => {
  if (roiCanvas.value) {
    const { width, height } = canvasSize // 变化前canvas大小
    const { clientHeight, clientWidth } =  roiCanvas.value // 变化后canvas大小
    canvasSize.width = clientWidth
    canvasSize.height = clientHeight
    const widthRate = width / clientWidth
    const heightRate = height / clientHeight
    nextTick(() => {
      // 更新已经绘制的ori图形坐标，并重新绘制
      saveRoiData.forEach(item => {
        item.points.forEach((point: Point) => {
          point.x = Math.round(point.x / widthRate)
          point.y = Math.round(point.y / heightRate)
        })
      })
      // 重新绘制
      ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height)
      drawAllSaveData()
    })
  }
}

// 点击保存按钮，对外暴露事件提供roi数据
const submitRoiData = () => {
  const { width, height } = canvasSize

  if (realWidth.value === 0 && realHeight.value === 0) {
    realWidth.value = width
    realHeight.value = height
  }

  const widthRate = width / realWidth.value
  const heightRate = height / realHeight.value
  const roiData: RoiData[] = JSON.parse(JSON.stringify(saveRoiData))

  roiData.forEach(item => {
    const { points } = item
    points.forEach(point => {
      point.x = Math.round(point.x / widthRate)
      point.y = Math.round(point.y / heightRate)
    })
  })

  drawType.value = ''
  // emit('roiDataChange', roiData)
}

// 设置roidata
const setRoiData = (roiDatas: RoiData[]) => {
  const roiDatasCopy: RoiData[] = JSON.parse(JSON.stringify(roiDatas))
  const { width, height } = canvasSize
  if (realWidth.value === 0 && realHeight.value === 0) {
    realWidth.value = width
    realHeight.value = height
  }
  const widthRate = width / realWidth.value
  const heightRate = height / realHeight.value
  roiDatasCopy.forEach(item => {
    const { points } = item
    points.forEach(point => {
      point.x = Math.round(point.x * widthRate)
      point.y = Math.round(point.y * heightRate)
    })
  })
  saveRoiData = roiDatasCopy
  drawType.value = ''
  ctx?.clearRect(0, 0, canvasSize.width, canvasSize.height)
  drawAllSaveData()
}

const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(pointTranform)
  resizeObserver.observe(roiCanvas.value)
}

const disObserver = () => {
  resizeObserver?.disconnect()
}


const intCanvas = () => {
   ctx = roiCanvas.value.getContext('2d')
}
onBeforeUnmount(disObserver)


// t提交
const handleSubmit = async () => {

}

/* 复制 */
const handleCopyPrompt = (item: { fullPrompt: string }) => {
  const {fullPrompt} = item
  copyText({text: fullPrompt})
  ms.success('复制prompt完成！')
}

// 查询广场类型列表
const handleGetCurrentTask = async () => {
  currentPreviewDraw.value = await fetchGetDraw({id: previewDrawTaskId.value}).then(res => res.data);
  const image = new Image();

  image.src = currentPreviewDraw.value.fileInfo?.cosUrl;

  image.onload = function () {
    realWidth.value = this.width;
    realHeight.value = this.height;
  }
  intCanvas();
  initResizeObserver();
}

// 收藏
const handleFavorite = async (item: { id: number; favorite: number; }) => {
  const {id, favorite} = item;
  const result = await fetchSetImageFavor({id, favorite: favorite === 1 ? 0 : 1}).then(res => res.data)
  result && ms.success(`${favorite === 0 ? '收藏' : "取消收藏"} 成功`);
  await handleGetCurrentTask();
}


</script>

<template>

  <n-modal
      v-model:show="showDialog"
      :mask-closable="false"
      :show-icon="false"
      preset="dialog"
      title="区域重绘"
      style="width: 1000px; height: auto;"
      @after-enter="handleGetCurrentTask"
      @close="authStore.updatePreview(false, previewDrawTaskId)"
  >

  <div>
    <div class="flex flex-col">
      <p  class="select-none">区域重绘自主选择重绘的区域，调整提示词</p>
      <div class="flex flex-row justify-between items-center">
        <div class="h-[400px] w-1/2 bg-[#ccc]  ">

          <div
              class="cw-roi-component-container w-full h-full "
              @click.stop=""
              @dblclick.stop=""
              @mousemove.stop=""
              @contextmenu="(e) => { e.preventDefault() }"
              :style="{background: '#ccc url(' + currentPreviewDraw.fileInfo?.cosUrl +  ') no-repeat center center  / 100% 100% border-box border-box fixed' }"
          >
            <canvas
                ref="roiCanvas"
                class="roi-canvas"
                :style="{ background: drawType ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)' }"
                :width="canvasSize.width"
                :height="canvasSize.height"
                @mousedown="onMouseDownHandel"
                @mousemove="onMousemoveHandel"
                @mouseup="onMouseupHandel"
                @mouseleave="onMouseLeave"
            >
            </canvas>
          </div>
        </div>

        <div class="h-[400px] w-1/2 ml-4 ">
          <p class="select-none">提示词</p>
          <div class="rounded border-gray-500 border  h-auto h-min-15">
            <NInput type="textarea" :rows="4" :autosize="{ minRows: 5, maxRows: 5 }"  v-model:value="currentPreviewDraw.fullPrompt"> </NInput>
          </div>

          <div class="mt-5">
            <p class="my-2 select-none">绘制操作</p>

            <div class="flex ">

              <NTooltip placement="top-start" trigger="hover" >
                <template #trigger>
                  <n-button size="small" @click="closeRoiLayer" style="margin-right: 1rem;">  <SvgIcon icon="pajamas:clear-all" class="text-[18px] mx-1 cursor-pointer"/></n-button>
                </template>
                <div>
                  还原
                </div>
              </NTooltip>

              <NTooltip placement="top-start" trigger="hover" >
                <template #trigger>
                  <n-button size="small" style="margin-right: 1rem;" @click="setDrawType(DrawType.RECTANGLE)">  <SvgIcon icon="subway:rectangular" class="text-[18px] mx-1 cursor-pointer"/></n-button>
                </template>
                <div>
                  绘制矩形
                </div>
              </NTooltip>

              <NTooltip placement="top-start" trigger="hover" >
                <template #trigger>
                  <n-button size="small" @click="setDrawType(DrawType.POLYGON)">
<!--                    <template #icon>-->
<!--                      <g-icon name="noose"></g-icon>-->
<!--                    </template>-->
                    <SvgIcon icon="carbon:area-custom" class="text-[18px] mx-1 cursor-pointer"/>
                  </n-button>
                </template>
                <div>
                  任意绘制
                </div>
              </NTooltip>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

    <template #action>
      <NButton round @click="authStore.updatePreview(false, previewDrawTaskId)">取消</NButton>
      <NButton round type="primary" @click="handleSubmit">提交</NButton>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">
   .cw-roi-component-container {

   }
</style>
