<script setup lang="ts">
import { ref } from 'vue'
import Market from '@/views/midjourney/components/market.vue';
import { InspirationTab } from "@/views/midjourney/components/mj-menu";
import { fetchQuerySpireClassify, inspirationSearch } from "@/api/mjDraw";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import SiderBar from '../../layout/siderBar/index.vue';
import EventBus from '@/hooks/eventBus';
import { router } from "@/router";
const { isMobile } = useBasicLayout();
const marketRef = ref()
const activeTab = ref('')
const tabListRef = ref();
const inspireTypeList = ref<{ name: string, value: string }[]>([])
const handleChangeTab = (param: { value: string }) => {
  activeTab.value = param.value;
  marketRef.value.handleQuery(param.value)
  EventBus.emit("newData", "")
}

const handleQueryInspireType = async () => {
  const expand = await fetchQuerySpireClassify({ page: 1, size: 100 }).then(res => res.data.rows);
  inspireTypeList.value = [{ name: "全部", value: '' }].concat(expand) || InspirationTab;
  marketRef.value.handleQuery(activeTab.value)
}

handleQueryInspireType();
EventBus.emit("drawRoute", router.options.history.location)
const newData = ref()
const keyWord = ref()

// 搜索
function handleSearch() {
  let data = {
    keyword: keyWord.value,
    page: 1,
    size: 999,
  }
  inspirationSearch(data).then(res => {
    newData.value = res.data
    EventBus.emit("newData", newData.value)
  })
  keyWord.value = ""
}


</script>

<template>
  <!-- 菜单栏 -->
  <div style="position: absolute;">
    <SiderBar v-if="!isMobile" />
  </div>
  <div class="mask"></div>
  <div class="dark:bg-[#15171A] bg-[#fff] mainBox">
  <!-- <div class="h-full overflow-hidden dark:bg-[#010102] bg-[#f4f4f4]" :class="[isMobile ? 'p-0' : 'p-3']"> -->
      <div class="flex justify-center" v-if="!isMobile">
        <!-- <h2 class="text-lg mb-1.5">AI绘画示例广场</h2> -->
      </div>
      <div style="display: flex;justify-content: center;margin-top: 10px;">
        <div class="inpBox bg-[#EBEBEB] dark:bg-[#171726]">
          <input class="inp bg-[#f4f4f4] dark:bg-[#010102]" v-model="keyWord" type="text" placeholder="输入关键词">
          <div class="iconBox" @click="handleSearch">
            <img src="./img/search.png" alt="">
            <p>搜索</p>
          </div>
        </div>
      </div>
      <!-- tab -->
      <div class="flex w-full flex-j mb-2 items-center overflow-x-hidden justify-center" style="margin-top: 25px;"
        v-if="!isMobile">
        <div class="relative z-40 transition-300 ease">
          <ul class="flex justify-start items-center" ref="tabListRef">
            <li v-for="(item) in inspireTypeList" @click="handleChangeTab(item)" class="mr-1 ml-1 w-auto select-none cursor-pointer
						   hover:dark:text-[#fff] hover:text-[#fff]
					     hover:bg-gradient-to-l from-[#2F73EC] to-[#5AA8F7]
						   duration-300 flex rounded-3xl"
              :class="[item.value === activeTab ? 'text-[#fff] bg-gradient-to-l from-[#2F73EC] to-[#5AA8F7]  dark:text-[#fff]' : 'bg-[transparent] dark:bg-[transparent]']">
              <div class="pl-3 pr-3 pt-1 pb-1 whitespace-nowrap">{{ item.name }}</div>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 规则 -->
      <div class="flex-1 h-[82vh] " style="padding: 0 200px;margin-bottom: 10px;">
        <Market ref="marketRef" :type="activeTab"></Market>
      </div>
      
    <!-- </div> -->
  </div>
</template>

<style scoped lang="less">
.inpBox {
  width: 1338px;
  height: 50px;
  // background-color: #171726;
  border-radius: 29px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .inp {
    height: 50px;
    // background-color: #171726;
    width: 94%;
    padding-left: 33px;
    color: #8F8F8F;
    font-size: 16px;
    box-sizing: border-box;
  }

  .iconBox {
    display: flex;
    justify-content: center;
    padding-right: 20px;

    img {
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
  }
}

.mainBox {
  height: 92vh;
  margin-top: 10px;
  margin-left: 100px;
  margin-right: 10px;
  border-radius: 8px;
  overflow: hidden;
}
// .mask{
//   width: 100%;
//   height: 100vh;
//   background-color: #15171A;
//   position: absolute;
//   z-index: 100000;
//   left: 0;
// }
</style>
