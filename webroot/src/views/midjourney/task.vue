<script setup lang="ts">
import { NSpace, NSkeleton, NEmpty, useMessage } from 'naive-ui';
import { ref, reactive, watch, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import taskTab from './components/taskTab.vue'
import taskItem1 from './components/taskItem1.vue'
import { fetchMidjourneyDrawList } from "@/api/mjDraw";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { useAuthStore } from "@/store";
import { useMidjourneyStore } from "@/store/modules/midjourney";
import { useRoute } from "vue-router";
import EventBus from '@/hooks/eventBus';
import SiderBar from '../../layout/siderBar/index.vue';
import { router } from '@/router';
import type { MessageReactive } from 'naive-ui'
let messageReactive: MessageReactive | null = null
const route = useRoute()
const activeTab = ref(0);
const totalCount = ref(0);
const loading = ref(false);
const midjourneyStore = useMidjourneyStore();
const showRegionDialog = computed(() => midjourneyStore.openRegionDialog);
const { isMobile } = useBasicLayout();
const isMore = computed(() => totalCount.value > pager.size)
const auth = useAuthStore();
const message = useMessage()
const handleChangeTab = (tab: number) => {

  activeTab.value = tab;

  if (tab !== 6) {
    pager.status = tab;
    pager.favorite = 0;
  } else {
    pager.status = 0;
    pager.favorite = 1; // 1 已收藏 0 未收藏 查询收藏时，状态未全部 111
  }
  handleQueryTaskByPage(1);
}

const list = ref([])
// {label: '全部', value: 0},
// {label: '执行中', value: 2},
// {label: '已完成', value: 34},
// {label: '已失败', value: 4},
// {label: '我的收藏', value: 6},
// status === 1 ? '等待中' : (status === 2 ? '绘制中' : (status === 3 ? '成功' : (status === 4 ? '失败' : (status === 5 ? '超时' : (status === 6 ? '收藏' : '-')))))
const pager = reactive({
  page: 1,
  size: 20,
  status: 0,
  favorite: 0
})

watch(() => showRegionDialog.value, (newValue) => {
  if (!newValue) {
    handleQueryTaskByPage(0)
  } else {
    loading.value = false;
    timer.value && clearTimeout(timer.value);
  }
})
function removeMessage() {
  if (messageReactive) {
    messageReactive.destroy()
    messageReactive = null
  }
}
const timer = ref();
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
const handleQueryTaskByPage = async (type) => {//type==0执行画图操作，type==1分页加载数据
  // loading.value = true;
  const { rows, count } = await fetchMidjourneyDrawList(pager).then(res => res.data);
  if (type == 1) {
    list.value = [
      ...list.value,
      ...rows
    ];
  } else if (type == 0) {
    list.value = rows;
  }

  removeMessage()

  // debugger;

  EnToZn(list.value)

  totalCount.value = count;

  // loading.value = false;
  timer.value && clearTimeout(timer.value)

  if (showRegionDialog.value || !route.fullPath.includes("/midjourney/paint-task")) {
    return;
  }
  let isComplete = rows.filter(item => item.status != 3)
  if (isComplete.length != 0) {
    timer.value = setTimeout(async () => {
      await handleQueryTaskByPage(0);
    }, 6000);
  }


}
function EnToZn(dataList) {
  dataList.forEach((item, index) => {
    let { buttons } = item
    let Ubtn = buttons.filter(item => item.label.indexOf("U") != -1)
    let Vbtn = buttons.filter(item => item.label.indexOf("V") != -1)
    let VaryBtn = buttons.filter(item => item.label.indexOf("Vary") != -1)
    let ZoomBtn = buttons.filter(item => item.label.indexOf("Zoom") != -1)
    let UpscaleBtn = buttons.filter(item => item.label.indexOf("Upscale") != -1)
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

  })
}
handleQueryTaskByPage(1)
// onMounted(() => {
//   const container: any = document.getElementById('footer')
//   const observer = new IntersectionObserver((entries, observer) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         if (isMore.value) {
//           pager.size = pager.size + 10
//           handleQueryTaskByPage()
//         }
//       }
//     })
//   })
//   observer.observe(container)
// })
const container = ref(null)
function createMessage1() {//数据加载
  if (!messageReactive) {
    messageReactive = message.loading("数据加载中", {
      duration: 0
    })
  }
}
function handleScroll() {
  const containerRef = container.value
  if (containerRef.scrollTop + containerRef.clientHeight >= containerRef.scrollHeight) {
    createMessage1()
    pager.page++
    if (pager.page * 20 >= totalCount.value) {
      message.error("没有更多数据了")
      return
    }
    handleQueryTaskByPage(1)
  }
}
onUnmounted(() => {
  timer.value && clearTimeout(timer.value);
})

onBeforeUnmount(() => {
  auth.updateDrawId({ id: '' })
})


const Task = ref(router.options.history.location)
EventBus.emit("drawRoute", router.options.history.location)
</script>

<template>
  <!-- 菜单栏 -->
  <div style="position: absolute;">
    <SiderBar v-if="!isMobile" :toTask="Task" />
  </div>
  <div class="bg-[#fff] dark:bg-[#15171A] mainBox">
    <div :class="isMobile ? 'h-full p-2' : ''">
      <taskTab @change="handleChangeTab" :active="activeTab"></taskTab>
      <div class="h-full overflow-y-auto" style="height: 82vh;" ref="container" @scroll="handleScroll">
        <div>
          <div v-if="loading && list.length === 0"
            class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            <div v-for="item in 10" class="mb-4  border border-gray-200 dark:border-gray-600 p-2 rounded-xl">
              <n-space vertical>

                <div class="flex justify-between">
                  <n-skeleton height="20px" width="48%" class="mt-1" :sharp="false" />
                  <n-skeleton height="20px" width="48%" class="mt-1" :sharp="false" />
                </div>

                <n-skeleton height="20px" width="100%" class="mt-1" :sharp="false" />
                <n-skeleton height="180px" width="100%" class="mt-1" :sharp="false" />

                <n-skeleton height="20px" width="60%" class="mt-1" :sharp="false" />
                <n-skeleton height="20px" width="40%" class="mt-1" :sharp="false" />
                <n-skeleton height="20px" width="20%" class="mt-1" :sharp="false" />

                <div class="flex justify-between">
                  <n-skeleton height="20px" width="48%" class="mt-1" :sharp="false" />
                  <n-skeleton height="20px" width="48%" class="mt-1" :sharp="false" />
                </div>
              </n-space>
            </div>
          </div>
          <div v-else-if="list.length > 0">
            <!-- <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"> -->
            <div class="task-list" style="display: flex;flex-wrap: wrap; justify-content: space-around;">
              <div v-for="item in list" class="itemBox">
                <taskItem1 :task="item" class="mb-4" @fresh="handleQueryTaskByPage"></taskItem1>
              </div>
            </div>

          </div>
          <div v-else>
            <div class="flex justify-center items-center">
              <n-empty description="未查询到任务"></n-empty>
            </div>

          </div>
          <div id="footer" ref="containerRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mainBox {
  margin-top: 10px;
  margin-left: 100px;
  margin-right: 10px;
  min-height: 92vh;
  border-radius: 8px;
  overflow: hidden;
  padding: 0 4px;
}

.itemBox {
  width: 280px;
  min-width: 280px;
  margin: 4px;
}

.task-list::after {
  content: "";
  display: block;
  flex: 1;
  /* 与flex: auto;等效都是自适应剩余空间*/
}</style>
