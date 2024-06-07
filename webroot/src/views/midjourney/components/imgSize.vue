<script lang="ts" setup>
import { ref ,computed} from 'vue';
import {useAppStore} from "@/store";
import EventBus from '@/hooks/eventBus';
const appStore = useAppStore()
const darkMode = computed(() => appStore.theme === 'dark')
const selectIdx=ref(0)
const inpValue1=ref(1)
const inpValue2=ref(1)
const sizeValue=ref("1:1")//尺寸默认为头像框1：1
function handleClick(idx){
    selectIdx.value=idx
    if(idx==0){//头像框
        sizeValue.value="1:1"
    }else if(idx==1){//手机壁纸
        sizeValue.value="1:2"
    }else if(idx==2){//电脑壁纸
        sizeValue.value="16:9"
    }else if(idx==3){//宣传海报
        sizeValue.value="9:16"
    }else if(idx==4){//文章配图
        sizeValue.value="4:3"
    }else if(idx==5){//媒体配图
        sizeValue.value="3:4"
    }else if(idx==6){//媒体配图
        sizeValue.value="3:2"
    }else if(idx==7){//横板名片
        sizeValue.value="2:3"
    }else if(idx==8){//自定义
        sizeValue.value=inpValue1+":"+inpValue2
    }
    EventBus.emit("sizeValue", sizeValue.value)
}
</script>
<template>
    <div class="imgSizeBox">
        <div :class="selectIdx==0?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(0)">
            <div class="imgBox">
                <img src="../img/1.1.svg" alt="" v-if="darkMode">
                <img src="../img/1.1Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">1:1</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">头像框</div>
        </div>
        <div :class="selectIdx==1?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(1)">
            <div class="imgBox">
                <img src="../img/1.2.svg" alt="" v-if="darkMode">
                <img src="../img/1.2Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">1:2</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">手机壁纸</div>
        </div>
        <div :class="selectIdx==2?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(2)">
            <div class="imgBox">
                <img src="../img/16.9.svg" alt="" v-if="darkMode">
                <img src="../img/16.9Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">16:9</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">电脑壁纸</div>
        </div>
        <div :class="selectIdx==3?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]"  @click="handleClick(3)">
            <div class="imgBox">
                <img src="../img/9.16.svg" alt="" v-if="darkMode">
                <img src="../img/9.16Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">9:16</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">宣传海报</div>
        </div>
        <div :class="selectIdx==4?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]"  @click="handleClick(4)">
            <div class="imgBox">
                <img src="../img/4.3.svg" alt="" v-if="darkMode">
                <img src="../img/4.3Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">4:3</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">文章配图</div>
        </div>
        <div  :class="selectIdx==5?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(5)">
            <div class="imgBox">
                <img src="../img/3.4.svg" alt="" v-if="darkMode">
                <img src="../img/3.4Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">3:4</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">媒体配图</div>
        </div>
        <div :class="selectIdx==6?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(6)">
            <div class="imgBox">
                <img src="../img/3.2.svg" alt="" v-if="darkMode">
                <img src="../img/3.2Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">3:2</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">横板名片</div>
        </div>
        <div :class="selectIdx==7?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(7)">
            <div class="imgBox">
                <img src="../img/4.3.svg" alt="" v-if="darkMode">
                <img src="../img/4.3Light.svg" alt="" v-else>
            </div>
            <div class="title1 text-[#919393] dark:text-[#707277]">2:3</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">小红书图</div>
        </div>
        <div :class="selectIdx==8?'imgSizeItemSelect border-[2px] border-[#76A5F3] dark:border-[#2A63C5]':'imgSizeItem'" class=" dark:bg-[#202B3A] bg-[#F5F8FE]" @click="handleClick(8)">
            <div class="imgBox">
                <img src="../img/zdy.svg" alt="" v-if="darkMode">
                <img src="../img/zdyLight.svg" alt="" v-else>
                <img class="setSvg" src="../img/set.svg" alt="">
            </div>
            <div style="display: flex;margin-top: 8px;" >
				<input class="sizeInp" v-model="inpValue1" type="text" />
					<div style="margin: 0 4px;">:</div>
				<input class="sizeInp" v-model="inpValue2" type="text" />
			</div>
            <div class="title2 text-[#919393] dark:text-[#707277]">自定义</div>
        </div>
    </div>
</template>
<style scoped lang="less">
.imgSizeBox{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .imgSizeItemSelect{
        width: 30%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 8px;
        padding: 0 0;
        border-radius: 8px;
        cursor: pointer;
    }
    .imgSizeItem{
        border: 2px solid transparent;
        width: 30%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 8px;
        padding: 0 0;
        border-radius: 8px;
        cursor: pointer;
       
    }
    .imgBox{
            width: 40px;
            height: 40px;
            display: flex;
            justify-content: center;
            position: relative;
            .setSvg{
                position: absolute;
                right: 5px;
                bottom: 5px;
                width: 13px;
                height: 13px;
            }
        }
        .title1{
            font-size: 13px;
            margin-top: 8px;
        }
        .title2{
            font-size: 13px;
        }
        .sizeInp {
			width: 22px;
			text-align: center;
			height: 18px;
			border-radius: 6px;
			color: #2960BE;
            line-height: 18px;
		}
}
</style>