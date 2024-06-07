<script setup lang="ts">
import {NTabPane, NTabs,} from 'naive-ui';
import {computed, ref ,defineEmits} from "vue";
import {MjMenu} from "@/views/midjourney/components/mj-menu";
import {useRoute, useRouter} from "vue-router";
import {fetchQueryMenuAPI} from "../../api/config"
import { SvgIcon } from '@/components/common'
import EventBus from '@/hooks/eventBus';
const emits = defineEmits(['route'])
const router = useRouter();
const route = useRoute();

const topList=ref()
const menuList = ref(MjMenu)
const activeRoutePath = computed(() =>{
  "/"+route.path.split('/')[1]
});
const handleChangeTab = (menuPath: string) => {
  emits('route', menuPath)
  router.push(`${menuPath}`);
}
// fetchQueryMenuAPI
function getList(){
    fetchQueryMenuAPI({menuPlatform:1}).then(res=>{
      console.log("route",res.data)
      topList.value=res.data
    })
}
getList()
const nowRoute=ref()
nowRoute.value=router.options.history.location


const handleClick=(item)=>{
  const {menuPath,isJump,menuIframeUrl}=item
  if (menuPath) {
    router.push(item.menuPath);
    nowRoute.value=item.menuPath
    emits('route', item.menuPath)
  } else {
    if (isJump) {
      window.open(menuIframeUrl)
    }
  }
}
EventBus.on("drawRoute",data=>{
  nowRoute.value='/midjourney'
})

EventBus.on("gptsRouter",data=>{
	nowRoute.value='/gpts'
})

</script>

<template>
  <!-- <n-tabs
      v-model:value="activeRoutePath"
      class="card-tabs flex justify-center items-center"
      default-value="signin"
      size="medium"
      animated
      @update-value="handleChangeTab"
      pane-wrapper-style="margin: 0 -4px"
      pane-style="padding: 0 4px 0 4px; box-sizing: border-box;"
  >
    <n-tab-pane :name="item.menuPath" :tab="item.menuName" v-for="item in topList" :key="item.key"></n-tab-pane>
  </n-tabs> -->
  <div class="menuBox">
<!--    <div :class="nowRoute==item.menuPath?'menuItem dark:bg-[#202B3A] bg-[#F5F8FE] dark:text-[#2960BE] text-[#3378ED] boder-[#D6D6D9] shadow-md border-[1px] dark:border-[transparent]':'menuItem1 '" v-for="item in topList" :key="item.key" @click="handleClick(item)">-->
    <div :class="nowRoute==item.menuPath?'menuItem dark:bg-[#202B3A] bg-[#F5F8FE] dark:text-[#2960BE] text-[#3378ED] dark:border-[transparent]':'menuItem1 '" v-for="item in topList" :key="item.key" @click="handleClick(item)">
      <SvgIcon :icon="item.menuIcon" class="svgicon"/>
      <p>{{ item.menuName }}</p>
    </div>
  </div>
</template>
<style lang="less" scoped>
.menuBox{
  display: flex;
  .menuItem1{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    padding: 5px 0;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
  }
  .menuItem{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    padding: 5px 0;
    // background-color: #272740;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
  }
}
.svgicon{
      width: 18px;
      height: 18px;
      margin-right: 5px;
    }
</style>
