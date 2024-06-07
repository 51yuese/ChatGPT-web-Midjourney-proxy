<script setup lang="ts">
import SiderBar from '../../layout/siderBar/index.vue';
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { SvgIcon } from '@/components/common'
import { ref } from "vue"
import { myMusicLog, musicLike ,musicPlay,allQuery,musicDelect,musicAgree} from "@/api/music"
import { useRouter } from "vue-router";
import axios from "axios"
import Loading from '@/components/base/Loading.vue'
import { NSpace, NSwitch, NTooltip, NSpin, useMessage } from 'naive-ui';
import type { MessageReactive } from 'naive-ui'
import { parseMusicText } from '@/utils/format';
let messageReactive: MessageReactive | null = null
const message = useMessage()
const router = useRouter()
const { isMobile } = useBasicLayout();
const myList = ref([])
const pageNmu=ref(1)
const countNum=ref()
logFn()
function logFn(){
    createMessage1()
    myMusicLog({ page: pageNmu.value, size: 40 }).then(res => {
    removeMessage()
    countNum.value=res.data.count
    const { records } = res.data
    let newData=[]
    let newRecords = records.filter(item => item.text.indexOf("https")!=-1).map(item=>{
        const [first, second] = parseMusicText(item.text);
        let {options}=item.requestOptions
        if(options!=null){
            first.model=options.model.split("-")[1]
            second.model=options.model.split("-")[1]
        }
        first.chatLogId=item.chatId
        first.agree=item.agree
        second.agree=item.agree
        second.chatLogId=item.chatId
        newData=[
            ...newData,
            first,
            second
        ]
        return newData
    })
    myList.value = [
        ...myList.value,
        ...newData
    ]
}).catch(err=>{
    removeMessage()
    // logFn()
})
}
const copyrightTitle=ref("")
const icpNumber=ref("")
const policeFilingNumber=ref("")
const icpUrl=ref("")
const policeFilingUrl=ref("")
allQuery({keys:["copyrightTitle","icpNumber","policeFilingNumber","icpUrl","policeFilingUrl"]}).then(res=>{
    copyrightTitle.value=res.data.copyrightTitle
    icpNumber.value=res.data.icpNumber
    policeFilingNumber.value=res.data.policeFilingNumber
    icpUrl.value=res.data.icpUrl
    policeFilingUrl.value=res.data.policeFilingUrl
})
const likeStatus = ref(1)//点赞状态    0锁定，1放行
function handleIcon(item: object, idx: number) {
    if (idx == 0) {//点赞
        let data = {
            relateId: item.chatLogId,
		    action: "agree",
		    relateType: "suno"
        }
        if (likeStatus.value == 0) {
            return
        }
        likeStatus.value = 0
        musicAgree(data).then(res => {
            if (item.agree == "agree") {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = null
                        ite.agreeNum--
                    }
                })
            } else if (item.agree == null) {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "agree"
                        ite.agreeNum++
                    }
                })
            } else if (item.agree == "disAgree") {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "agree"
                        ite.agreeNum++
                    }
                })
            }
            likeStatus.value = 1
        })
    } else if (idx == 1) { //踩
        let data = {
            chatLogId: item.chatLogId,
            action: "disAgree",
            type: "suno"
        }
        if (likeStatus.value == 0) {
            return
        }
        likeStatus.value = 0
        musicAgree(data).then(res => {
            if (item.agree == "agree") {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "disAgree"
                        ite.agreeNum--
                    }
                })
            } else if (item.agree == null) {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "disAgree"
                    }
                })
            } else if (item.agree == "disAgree") {
                myList.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "null"
                    }
                })
            }
            likeStatus.value = 1
        })
    }
}
const operation = ref(false)
function handleMore(item) {//更多
    item.operation = true
    operation.value = true
}
function handleSimilar(item) {//生成类似
    router.push({
        path: "/music/creativeCenter",
        query: {
            id: item.chatId
        }
    })
}
function removeMessage (){
      if (messageReactive) {
        messageReactive.destroy()
        messageReactive = null
      }
    }
function createMessage () {
    if (!messageReactive) {
      messageReactive = message.loading("下载中，请稍等", {
        duration: 0
      })
    }
}
function handleDownload(item: object, type: string) {//下载
    let baseURL = import.meta.env.VITE_GLOB_API_URL
    createMessage()
    if (type == "mp4") {
        let fileName = item.mp4.split('/').pop()
        closeMask()
        axios.get(baseURL + '/proxy/down', {
            responseType: 'blob',
            params: { url: item.mp4 }
        }).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", fileName)
            link.click()
            removeMessage()
            message.success("下载成功")
        })
    } else if (type == "mp3") {
        let fileName = item.mp3.split('/').pop()
        closeMask()
        axios.get(baseURL + '/proxy/down', {
            responseType: 'blob',
            params: { url: item.mp3 }
        }).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", fileName)
            link.click()
            removeMessage()
            message.success("下载成功")
        })
    }
}
const playVideo=ref("")//当前播放的视频
const isPlay=ref(true)//是否播放
function handlePlay(){//暂停开始
    const video = document.getElementById('video');
    if(isPlay.value){
        isPlay.value=false
        //暂停
        video.pause()
    }else{
        isPlay.value=true
        // 播放
        video.play()    
    }
}
function handleWatch(item){//观看
    playVideo.value=item.mp4
    let data={
        recoredId:item.chatLogId
    }
    item.playNum++
    musicPlay(data).then(res=>{
        
    })
}
function handleCheckout(type){//上一首、下一首，type=0上一首，1下一首
    let mp4List=[]
    let haveMp4=myList.value.filter(item=>item.mp4!="解析错误")
    haveMp4.forEach(item=>{
        mp4List=[
            ...mp4List,
            item.mp4
        ]
    })
    let idx=mp4List.indexOf(playVideo.value)
    if(type==0){
        if(idx==0){
            return
        }
        idx--
        let data = {
			recoredId: haveMp4[idx].chatId
		}
		haveMp4[idx].playNum++
		musicPlay(data).then(res => {
			
		})
        playVideo.value=mp4List[idx]
    }else if(type==1){
        if(idx==mp4List.length-1){
            return
        }
        idx++
        let data = {
			recoredId: haveMp4[idx].chatId
		}
		haveMp4[idx].playNum++
		musicPlay(data).then(res => {
			
		})
        playVideo.value=mp4List[idx]
    }
}


function closeMask() {
    operation.value = false
    myList.value.forEach(item => {
        item.operation = false
    })
}
function musicDelectFn(item){//删除
    let data={
        id:item.chatLogId
    }
    closeMask()
    musicDelect(data).then(res=>{
        message.success("删除成功")
        myList.value=myList.value.filter(ite=>ite.chatLogId!=item.chatLogId)
    })
}
const container = ref(null)
function handleScroll(){
    const containerRef = container.value
    if (containerRef.scrollTop + containerRef.clientHeight +1>= containerRef.scrollHeight) {
        if(pageNmu.value*20>=countNum.value){
            message.error("没有更多数据了")
            return
        }
    pageNmu.value++
    logFn()
    }
}
function createMessage1 () {//数据加载
    if (!messageReactive) {
      messageReactive = message.loading("数据加载中", {
        duration: 0
      })
    }
}
</script>
<template>
    <div class="bg-[#f4f4f4] dark:bg-[#020104] musicBody">
        <div class="mask" v-if="operation" @click="closeMask"></div>
        <div class="videoBox" v-if="playVideo">
                <div style="width: 504px;height: 756px;border-radius: 8px;position: relative;display: flex;flex-direction: column;justify-content: center;align-items: center;" class="bg-[#E5EDFE] dark:bg-[#0A182F]">
                    <div style="width: 50px;height: 50px;">
						<div class="loader"></div>
					</div>
                    <p style="margin-top: 10px;">视频生成中，请稍等</p>
                </div>
                <video class="video" autoplay id="video" loop  :src="playVideo"></video>
                <SvgIcon icon="icon-park-solid:close-one" class="text-xl text-[#fff] text-center icon" @click="playVideo=''"></SvgIcon>
                <div class="control">
                    <img class="controlItem" style="cursor: pointer;" src="./img/start.png" alt="" @click="handleCheckout(0)">
                    <img class="controlItem" v-if="isPlay" src="./img/false.svg" style="margin: 0 50px;cursor: pointer;" alt="" @click="handlePlay">
                    <img class="controlItem" v-if="!isPlay" src="./img/play.png" style="margin: 0 50px;cursor: pointer;" alt="" @click="handlePlay">
                    <img class="controlItem" style="cursor: pointer;" src="./img/end.png" alt="" @click="handleCheckout(1)">
                </div>
            </div>
        <SiderBar :sideType="1" v-if="!isMobile" />
        <div class="myCreate bg-[#fff] dark:bg-[#15171A]">
            <div class="myCreateTop">
                <SvgIcon icon="icomoon-free:file-music" class="text-xl text-center"></SvgIcon>
                <div style="margin-left: 4px;">我的创作</div>
            </div>
            <div style="width: 100%;height: 2px;" class="bg-[#fff] dark:bg-[#010102]"></div>
            <div class="myCreateMain" ref="container" @scroll="handleScroll">
                <div class="mainLeft">
                    <div class="mainItem dark:bg-[#0A182F] bg-[#F5F8FE]" v-for="(item, index) in myList" :key="index">
                        <img style="width: 108px;height: 108px;border-radius: 8px;" @click="handleWatch(item)" v-if="item.image!='解析错误'" :src="item.image" alt="">
                        <img style="width: 108px;height: 108px;border-radius: 8px;" v-if="item.image=='解析错误'" src="./img/error.png" alt="">
                        <div class="itemInfo">
                            <div class="info" style="width: 80%;">
                                <div style="width: 40px;height: 18px;border-radius: 16px;text-align: center;color:#34C759 ;"
                                    class="bg-[#EBF9EE] dark:bg-[#175A28]">{{ item.model }}</div>
                                <div style="margin: 6px 0;">{{ item.title ? item.title : "匿名" }}</div>
                                <div>{{ item.intro }}</div>
                            </div>
                            <div class="operation">
                                <img class="icon" @click="handleIcon(item, 0)" v-if="item.agree != 'agree'"
                                    src="./img/thumbs.png" alt="">
                                <img class="icon" @click="handleIcon(item, 0)" v-if="item.agree == 'agree'"
                                    src="./img/thumbs1.png" alt="">
                                <img class="icon" @click="handleIcon(item, 1)" v-if="item.agree != 'disAgree'"
                                    src="./img/unthumbs.png" alt="">
                                <img class="icon" @click="handleIcon(item, 1)" v-if="item.agree == 'disAgree'"
                                    src="./img/unthumbs1.png" alt="">
                                <!-- <SvgIcon icon="charm:forward" class="icon text-xl text-center" @click="handleIcon(item, 2)">
                                </SvgIcon> -->
                                <div class="iconBox" style="position: relative;">
                                    <!-- 更多 -->
                                    <SvgIcon icon="ri:more-line" class="text-xl text-center icon" @click="handleMore(item)">
                                    </SvgIcon>
                                    <div class="operationBox bg-[#fff] dark:bg-[#15171A]" v-if="item.operation">
                                        <!-- <div class="operationItem" @click="handleSimilar(item)">生成类似</div> -->
                                        <div class="operationItem" style="display: flex;"
                                            @click="handleDownload(item, 'mp4')">
                                            <SvgIcon icon="gravity-ui:video" style="margin-right: 5px;"
                                                class="text-xl text-center"></SvgIcon>
                                            <div>下载视频</div>
                                        </div>
                                        <div class="operationItem" style="display: flex;"
                                            @click="handleDownload(item, 'mp3')">
                                            <SvgIcon icon="fluent:headphones-sound-wave-24-filled"
                                                style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
                                            <div>下载音频</div>
                                        </div>
                                        <div class="operationItem" style="display: flex;color:#FF5E55 ;" @click="musicDelectFn(item)">
                                            <SvgIcon icon="mi:delete" style="margin-right: 5px;margin-top:5px"
                                                class="text-xl text-center"></SvgIcon>
                                            <div>删除</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="end text-[#A3A5A6] dark:text-[#76777A]">版权所有 © {{ copyrightTitle }} <a :href="icpUrl ||'#'"><a :href="policeFilingUrl ||'#'">{{policeFilingNumber}}</a>{{icpNumber}}</a></div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.musicBody {
    width: 100%;
    display: flex;
    height: 100%;
    padding-right: 10px;

    .myCreate {
        width: 100%;
        margin-top: 10px;
        height: 92vh;
        border-radius: 12px;
        position: relative;

        .myCreateTop {
            padding: 12px;
            display: flex;
        }

        .myCreateMain {
            padding: 0 20px;
            height: 90%;
            overflow: auto;
            .mainLeft {
                flex: 1;
                margin-right: 20px;

                .mainItem:hover {
                    border:1px solid #5A91FC;
                }
                .mainItem {
                    padding: 6px;
                    margin-top: 20px;
                    display: flex;
                    border-radius: 6px;
                    border:1px solid transparent;
                    display: flex;
                    align-items: center;
                    .itemInfo {
                        display: flex;
                        flex: 1;
                        padding: 12px 0;
                        justify-content: space-between;
                        align-items: center;

                        .info {
                            margin-left: 12px;
                            display: flex;
                            flex-direction: column;
                        }

                        .operation {
                            display: flex;

                            .iconBox {
                                display: flex;
                                align-items: center;

                                .operationBox {
                                    position: absolute;
                                    z-index: 1000;
                                    right: 0;
                                    top: 30px;
                                    width: 150px;
                                    padding: 10px 20px;
                                    border-radius: 12px;
                                    line-height: 30px;

                                    .operationItem {
                                        cursor: pointer;
                                    }
                                }
                            }

                            .icon {
                                margin-right: 24px;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }
}

.end {
    width: 100%;
    text-align: center;
    font-size: 13px;
    margin-top: 5px;
    position: absolute;
    height: 35px;
    line-height: 35px;
    // bottom: -25px;
}

.mask {
    width: 100%;
    height: 100vh;
    position: absolute;
    z-index: 999;
}
.videoBox{
            position: absolute;
            width: 504px;
            top: 20px;
            left: calc(50% - 252px);
            z-index: 99;
            border-radius: 12px;
            overflow: hidden;
            .video{
                position: absolute;
                top:0;
                z-index: 101;
            }
            .icon{
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 102;
            }
            .control{
                    width: 100%;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    background: rgba(0, 0, 0, 0.24);
                    backdrop-filter: blur(4.6px);
                    z-index: 102;
                    height: 72px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .controlItem{
                        width: 42px;
                        height: 42px;
                    }
                }
        }

        .loader {
	width: 50px;
	padding: 8px;
	aspect-ratio: 1;
	border-radius: 50%;
	background: #438FEF;
	--_m:
		conic-gradient(#0000 10%, #000),
		linear-gradient(#000 0 0) content-box;
	-webkit-mask: var(--_m);
	mask: var(--_m);
	-webkit-mask-composite: source-out;
	mask-composite: subtract;
	animation: l3 1s infinite linear;
}

@keyframes l3 {
	to {
		transform: rotate(1turn)
	}
}
</style>