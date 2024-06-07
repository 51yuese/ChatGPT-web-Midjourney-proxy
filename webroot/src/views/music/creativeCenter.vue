<script setup lang="ts">
import {computed, ref} from 'vue';
import SiderBar from '../../layout/siderBar/index.vue';
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { NSpace, NSwitch, NTooltip, NSpin, useMessage } from 'naive-ui';
import { SvgIcon } from '@/components/common'
import { musicChat, createMusicGroup, musicQuery, handleMusicLog, musicModeLyrics, musicSquare, musicLike,allQuery,musicAgree} from "@/api/music"
// import EventBus from '@/hooks/eventBus';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { router } from '@/router';
import type { MessageReactive } from 'naive-ui'
import {useAuthStore} from '@/store'

const authStore = useAuthStore()
const isLogin = computed(() => authStore.isLogin);

let messageReactive: MessageReactive | null = null
const message = useMessage()
import axios from "axios"
import { parseMusicText } from '@/utils/format';
const route = useRoute()

const { isMobile } = useBasicLayout();

const active = ref(true)//自定义模式
const active1 = ref(false)//纯音乐
function handleChange(e) {//自定义开关
    active.value = e
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

const test = ref([
    { name: "V3（一次生成两首歌）", value: "suno-v3" ,title:"V3"}, 
    // { name: "V2（一次生成两首歌）", value: "suno-v2" ,title:"V2"}, 
    { name: "V3.5（一次生成两首歌）", value: "suno-v3.5" ,title:"V3.5"}
])
const mode = ref("")
mode.value = test.value[0].name
const musicMode = ref(false)
function handleMore() {
    musicMode.value = true
}
const oldCreateCenterData = ref([])
const createCenterData = ref([])
const operation = ref(false)//操作弹窗是否开启
const likeStatus = ref(1)//点赞状态    0锁定，1放行
function handleIcon(item: object, idx: number) {
    if (!item.image) {
        return
    }
    if (idx == 0) {//点赞
        let data = {
            chatLogId: item.chatLogId,
            action: "agree",
            type: "suno"
        }
        if (likeStatus.value == 0) {
            return
        }
        likeStatus.value = 0
        musicAgree(data).then(res => {
            if (item.agree == "agree") {
                createCenterData.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = null
                        ite.agreeNum--
                    }
                })
            } else if (item.agree == null) {
                createCenterData.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "agree"
                        ite.agreeNum++
                        console.log(createCenterData.value)

                    }
                })
            } else if (item.agree == "disAgree") {
                createCenterData.value.forEach(ite => {
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
                createCenterData.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "disAgree"
                        ite.agreeNum--
                    }
                })
            } else if (item.agree == null) {
                createCenterData.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "disAgree"
                    }
                })
            } else if (item.agree == "disAgree") {
                createCenterData.value.forEach(ite => {
                    if (ite.chatLogId == item.chatLogId) {
                        ite.agree = "null"
                    }
                })
            }
            likeStatus.value = 1
        })
    } else if (idx == 2) {

    } else if (idx == 3) {
        item.operation = true
        operation.value = true
    }
}
musicQuery({ modelType: 'music' }).then(res => {

})
handleMusicLog({ size: 20, page: 1, order: "createAt" }).then(res => {
    const { records } = res.data
    let newData = records.filter(item => item.text.indexOf("http") != -1)
})
//开始创作
function startCreate() {
    // let data={
    //     modelType:"music"
    // }
    // createMusicGroup(data).then(res=>{
    //     console.log(res)
    // })

	if (!isLogin.value) {
		authStore.setLoginDialog(true)
		return
	}

	createMusicFn()

}
const prompt = ref("")//歌词
const make_instrumental = ref(0)//是否纯音乐，默认为0---否
const title = ref("")//音乐名称
const mv = ref("suno-v3")//音乐模型,默认为v3模型
const tags = ref("")//音乐风格

const squareList = ref()
const nowData = ref()
onMounted(() => {
    handleSquare(route.query.id)
})
function cutNowData(data) {
    const prompt1 = data.requestOptions.prompt
    let list = prompt1.split(", ")
    let _prompt = list.filter(item => item.indexOf("prompt") != -1)
    let mv1 = list.filter(item => item.indexOf("mv") != -1)
    let make_ = list.filter(item => item.indexOf("make_") != -1)
    let tags1 = list.filter(item => item.indexOf("tags") != -1)
    let title1 = list.filter(item => item.indexOf("title") != -1)
    prompt.value = String(_prompt[0].split(" ")[1])
    mv.value = String(mv1[0].split(" ")[1])
    make_instrumental.value = Number(make_[0].split(" ")[1])
    if (tags1.length != 0) {
        tags.value = String(tags1[0].split(" ")[1])
    }
    if (title1.length != 0) {
        title.value = String(title1[0].split(" ")[1])
    }
    let id = Number(localStorage.getItem("musicGroupId"))
    let requestData = {
        prompt: prompt.value,
        options: { groupId: id },
        tags: tags.value,
        mv: mv.value,
        title: title.value,
        make_instrumental: make_instrumental.value
    }
    cutFn(requestData)
}
function handleSquare(id) {
    let data = {
        size: 40,
        page: 1,
        order: "agreeNum"
    }
    musicSquare(data).then(res => {
        const { records } = res.data
        const newData = res.data.records.filter(item => item.text).map(item => {
            const [first, second] = parseMusicText(item.text);
			item.title = first.title;
			item.image =  first.image;
			item.agree =  first.agree;
			item.agreeNum =  first.agreeNum;
			item.operation =  first.operation;
			item.intro =   first.intro;
			item.mp3 = first.mp3;  
			item.mp4 =   first.mp4;
            return item;
        })
        squareList.value = newData
        newData.forEach((item, index) => {
            if (newData[index].chatId == id) {
                nowData.value = newData[index]
            }
        })
        if (!nowData.value) {
            return
        }
        cutNowData(nowData.value)
    })
}

function handleChange1(e) {//纯音乐开关  1为是，0为否
    active1.value = e
    if (e) {
        make_instrumental.value = 1
    } else {
        make_instrumental.value = 0
    }
}
const modeTitle=ref("V3")
function handleMode(item) {//切换模型
    mode.value = item.name
    modeTitle.value=item.title
    mv.value = item.value
    musicMode.value = false
}
function createMusicFn() {
    let id = Number(localStorage.getItem("musicGroupId"))
    let data = {
        prompt: prompt.value,
        options: { groupId: id },
        tags: tags.value,
        mv: mv.value,
        title: title.value,
        make_instrumental: make_instrumental.value
    }
    cutFn(data)
}
const createStatus = ref(true)//创作状态
async function cutFn(data) {
    if(!createStatus.value){
        message.error("创作中,请耐心等待")
        return
    }
    createStatus.value = false
    if(!prompt.value){
        message.error("请输入歌词")
        createStatus.value=true
        return
    }
    let first = {}
    let second = {}
    first.name = title.value
    first.intro = prompt.value
    first.modetitle=modeTitle.value
    second.modetitle=modeTitle.value
    second.name = title.value
    second.intro = prompt.value
    oldCreateCenterData.value = [first, second]
    prgressFn(true)
    prompt.value=""
    title.value=""
    tags.value=""
    musicChat(data).then(res => {
        const dataText = res.split("\n").pop()
        const data = JSON.parse(dataText);
        const [first, second] = parseMusicText(data.text);

        first.name = first.title;
        second.name = second.title;
        first.chatLogId = data.chatLogId;
        second.chatLogId = data.chatLogId;
        first.modetitle=modeTitle.value
        second.modetitle=modeTitle.value

        oldCreateCenterData.value = []
        createCenterData.value = [
            ...createCenterData.value,
            first,
            second
        ]
        createStatus.value = true
        prgressFn(false)
    }).catch(err => {
        console.log("err :",err)
        message.error('请求失败')
        const [first, second] = parseMusicText('Request failed');
        oldCreateCenterData.value = []
        first.modetitle=modeTitle.value
        second.modetitle=modeTitle.value
        createCenterData.value = [
            ...createCenterData.value,
            first,
            second
        ]
        createStatus.value = true
        prgressFn(false)
    })

}
const selectItem = ref()//选中预览的音乐
const isPlay = ref(true)//是否播放
function handleStartPlay(item) {//播放
    selectItem.value = item
    const video = document.getElementById('video');
    if (video) {
        video.play()
    }
    isPlay.value = true
}
function handlePlay() {//暂停开始
    const video = document.getElementById('video');
    console.log(video)
    if (isPlay.value) {
        isPlay.value = false
        //暂停
        video.pause()
    } else {
        isPlay.value = true
        // 播放
        video.play()
    }
}
function unCustom() {
    let data = {
        dictType: "music-lyrics"
    }
    musicModeLyrics(data).then(res => {
        prompt.value = res.data.dictValue
    })
}
function handleRandom(type) {
    if (type == 0) {
        let data = {
            dictType: "music-lyrics"
        }
        musicModeLyrics(data).then(res => {
            title.value = res.data.dictName
            prompt.value = res.data.dictValue
        })
    } else if (type == 1) {
        let data = {
            dictType: "music-style"
        }
        musicModeLyrics(data).then(res => {
            tags.value = res.data.dictValue
        })
    }
}
function closeMask() {
    musicMode.value = false
    operation.value = false
    createCenterData.value.forEach(item => {
        item.operation = false
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
//prgress
const progressNum = ref(0)
const progessWid = ref(0)
// prgressFn()
function prgressFn(type) {
    progressNum.value=0
    progessWid.value=0
    let timer
    if (type == true) {
        timer = setInterval(() => {
            progressNum.value += 10
            progessWid.value = 200 * (progressNum.value / 100)
            if (progressNum.value >= 99) {
                clearTimeout(timer)
                progressNum.value = 99
                progessWid.value = 200 * (progressNum.value / 100)
            }
        }, 2000)
    }else{
        clearTimeout(timer)
    }

}
</script>
<template>
    <div class="bg-[#f4f4f4] dark:bg-[#020104] musicBody">
        <div class="mask" v-if="musicMode || operation" @click="closeMask"></div>
        <SiderBar :sideType="1" v-if="!isMobile" />
        <div class="createBox dark:bg-[#15171A] bg-[#fff]">
            <div class="createTop">
                <div class="switchBox">
                    <div style="display: flex;padding:0 4px;align-items: center;height: 36px;line-height: 36px">
                        <n-space>
                            <NSwitch v-model:value="active" @update:value="handleChange" size="small" />
                        </n-space>
                        <div style="margin-left: 4px;">自定义模式</div>
                    </div>
                    <div class="describeBox" v-if="!active">
                        <div class="describeTitle">
                            <div class="line bg-[#3378ED] dark:bg-[#2960BE]"></div>
                            <div style="margin-right: 4px;">歌曲描述</div>
                            <NTooltip trigger="hover" placement="right">
                                <template #trigger>
                                    <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                                </template>
                                <span>描述你想要的音乐风格和主题（例如"关于毕业"）。使用流派和氛围，而不是特定的艺术家和歌曲。</span>
                            </NTooltip>
                        </div>
                        <div class="describeMain bg-[#F4F4F4] dark:bg-[#010102]">
                            <textarea class="describeText bg-[#F4F4F4] dark:bg-[#010102]" placeholder="创作一首关于想和你在一起的流行歌曲"
                                v-model="prompt" cols="20" rows="10"></textarea>
                            <div class="describeBtn bg-[#3378ED] dark:bg-[#2960BE]" @click="unCustom">
                                <SvgIcon icon="ion:dice-outline"></SvgIcon>
                                <div style="margin-left: 4px;">随机生成歌词</div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex;padding:0 4px;align-items: center;height: 36px;line-height: 36px;">
                        <n-space>
                            <NSwitch v-model:value="active1" @update:value="handleChange1" size="small" />
                        </n-space>
                        <div style="margin-left: 4px;margin-right: 4px;">纯音乐</div>
                        <NTooltip trigger="hover" placement="right">
                            <template #trigger>
                                <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                            </template>
                            <span>没有歌词的音乐</span>
                        </NTooltip>
                    </div>
                </div>
                <div class="lyricsBox" v-if="active">
                    <div class="lyricsTitle">
                        <div class="line bg-[#3378ED] dark:bg-[#2960BE]"></div>
                        <div style="margin-right: 4px;">歌词</div>
                        <NTooltip trigger="hover" placement="right">
                            <template #trigger>
                                <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                            </template>
                            <span>随机生成歌词，自己写，或者从AI那里得到一些帮助。使用两首诗（8行）获得最佳效果。</span>
                        </NTooltip>
                    </div>
                    <div class="lyricsMain bg-[#F4F4F4] dark:bg-[#010102]">
                        <textarea class="lyricsText bg-[#F4F4F4] dark:bg-[#010102]" placeholder="请输入你的歌词" v-model="prompt"
                            cols="20" rows="10"></textarea>
                        <div @click="handleRandom(0)" class="lyricsBtn bg-[#3378ED] dark:bg-[#2960BE]">
                            <SvgIcon icon="ion:dice-outline"></SvgIcon>
                            <div style="margin-left: 4px;">随机生成歌词</div>
                        </div>
                    </div>
                </div>
                <div class="musicBox" v-if="active">
                    <div class="musicTitle">
                        <div class="line bg-[#3378ED] dark:bg-[#2960BE]"></div>
                        <div style="margin-right: 4px;">音乐风格</div>
                        <NTooltip trigger="hover" placement="right">
                            <template #trigger>
                                <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                            </template>
                            <span>描述你想要的音乐风格 例如：流行、摇滚、史诗。Suno的模型无法识别具体的艺人名称，但能理解音乐类型和氛围。</span>
                        </NTooltip>
                    </div>
                    <div class="musicMain bg-[#F4F4F4] dark:bg-[#010102]">
                        <textarea class="musicText bg-[#F4F4F4] dark:bg-[#010102]" placeholder="请输入你的风格" v-model="tags"
                            cols="20" rows="10"></textarea>
                        <div @click="handleRandom(1)" class="musicBtn bg-[#3378ED] dark:bg-[#2960BE]">
                            <SvgIcon icon="ion:dice-outline"></SvgIcon>
                            <div style="margin-left: 4px;">生成音乐风格</div>
                        </div>
                    </div>
                </div>
                <div class="musicNameBox" v-if="active">
                    <div class="musicNameTitle">
                        <div class="line bg-[#3378ED] dark:bg-[#2960BE]"></div>
                        <div style="margin-right: 4px;">歌曲名称</div>
                        <NTooltip trigger="hover" placement="right">
                            <template #trigger>
                                <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                            </template>
                            <span>为你的歌曲命名</span>
                        </NTooltip>
                    </div>
                    <div class="musicNameMain bg-[#F4F4F4] dark:bg-[#010102]">
                        <input v-model="title" class="musicNameText bg-[#F4F4F4] dark:bg-[#010102]" type="text"
                            placeholder="请输入你的歌名">
                    </div>
                </div>
                <div class="musicModeBox">
                    <div class="musicModeTitle">
                        <div class="line bg-[#3378ED] dark:bg-[#2960BE]"></div>
                        <div style="margin-right: 4px;">音乐模型</div>
                        <NTooltip trigger="hover" placement="right">
                            <template #trigger>
                                <SvgIcon icon="mage:question-mark-circle"></SvgIcon>
                            </template>
                            <span>官方音乐模型</span>
                        </NTooltip>
                    </div>
                    <div class="musicModeSelect bg-[#F4F4F4] dark:bg-[#010102]" @click="handleMore">
                        <div>{{ mode }}</div>
                        <SvgIcon icon="mingcute:down-line"></SvgIcon>
                    </div>
                    <div class="selectBox" style="max-height:200px ;"
                        :style="musicMode ? `height:${test.length * 50}px` : 'height:0'">
                        <div class="selectItem bg-[#F4F4F4] dark:bg-[#010102]" v-for="(item, index) in test" :key="index"
                            @click="handleMode(item)">{{ item.name }}</div>
                    </div>
                </div>
                <div class="prompt dark:bg-[#0A182F] bg-[#F5F8FE] dark:text-[#2960BE] text-[#3378ED]">
                    温馨提示：每个作品生成大概2分钟左右，请勿关闭页面。</div>
            </div>
            <div class="createBottm border-t-[1px] dark:border-[#4B4D50] border-[#000]">
                <div style="display: flex;cursor: pointer;"
                    :class="createStatus ? 'dark:bg-[#2960BE] bg-[#3378ED] botton' : 'bg-[#A5B1B6] botton text-[#A5B1B6]'"
                    @click="startCreate">
                    <div>{{ createStatus ? '创作' : '创作中,请耐心等待' }}</div>
                    <SvgIcon icon="majesticons:music-line" class="text-xl text-center"></SvgIcon>
                </div>
            </div>
        </div>
        <div class="createCenterBox dark:bg-[#15171A] bg-[#fff]">
            <div class="createCenterTop">
                <SvgIcon icon="mage:light-bulb" class="text-2xl text-center"></SvgIcon>
                <div style="margin-left: 4px;font-size: 15px;">创作中心</div>
            </div>
            <div style="width: 100%;height: 2px;" class="bg-[#fff] dark:bg-[#010102]"></div>
            <div class="createCenterMain">
                <div class="mainLeft">
                    <div class="mainItem dark:bg-[#0A182F] bg-[#F5F8FE]" v-for="(item, index) in createCenterData"
                        :key="index">
                        <img @click="handleStartPlay(item)" style="width: 108px;height: 108px;border-radius: 8px;"
                            v-if="item.image" :src="item.image" alt="">
                        <img style="width: 108px;height: 108px;border-radius: 8px;" v-if="!item.image" src="./img/error.png"
                            alt="">
                        <div class="itemInfo">
                            <div class="info" style="flex: 1;margin-right: 10px;">
                                <div style="width: 40px;height: 18px;border-radius: 16px;text-align: center;color:#34C759 ;"
                                    class="bg-[#EBF9EE] dark:bg-[#175A28]">{{ item.modetitle }}</div>
                                <div style="margin: 6px 0;">{{ item.name }}</div>
                                <div style="
                                display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2; /* 显示的行数，可以根据需要修改 */
								overflow: hidden;
								text-overflow: ellipsis;
                                ">{{ item.intro }}</div>
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
                                <SvgIcon icon="ri:more-line" class="icon text-xl text-center" @click="handleIcon(item, 3)">
                                </SvgIcon>
                                <div class="operationBox bg-[#fff] dark:bg-[#15171A]" v-if="item.operation">
                                    <!-- <div class="operationItem">生成类似</div> -->
                                    <div class="operationItem" @click="handleDownload(item, 'mp4')" style="display: flex;">
                                        <SvgIcon icon="gravity-ui:video" style="margin-right: 5px;"
                                            class="text-xl text-center"></SvgIcon>
                                        <div>下载视频</div>
                                    </div>
                                    <div class="operationItem" @click="handleDownload(item, 'mp3')" style="display: flex;">
                                        <SvgIcon icon="fluent:headphones-sound-wave-24-filled" style="margin-right: 5px;"
                                            class="text-xl text-center"></SvgIcon>
                                        <div>下载音频</div>
                                    </div>
                                    <!-- <div class="operationItem" style="display: flex;color:#FF5E55 ;">
                                        <SvgIcon icon="mi:delete" style="margin-right: 5px;" class="text-xl text-center"></SvgIcon>
                                        <div>删除</div>
                                    </div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="oldCreateCenterData" class="mainItem dark:bg-[#0A182F] bg-[#F5F8FE]"
                        v-for="(item, index) in oldCreateCenterData" :key="index">
                        <div
                            style="width: 108px;height: 108px;border-radius: 8px;position: relative;display: flex;justify-content: center;align-items: center;">
                            <n-space>
                                <n-spin stroke="#76777A" size="large" />
                            </n-space>
                        </div>

                        <div class="itemInfo">
                            <div class="info">
                                <div style="width: 40px;height: 18px;border-radius: 16px;text-align: center;color:#34C759 ;"
                                    class="bg-[#EBF9EE] dark:bg-[#175A28]">{{ item.modetitle }}</div>
                                <div style="margin: 6px 0;">{{ item.name }}</div>
                                <div style="
                                display: -webkit-box;
								-webkit-box-orient: vertical;
								-webkit-line-clamp: 2; /* 显示的行数，可以根据需要修改 */
								overflow: hidden;
								text-overflow: ellipsis;
                                
                                ">{{ item.intro }}</div>
                            </div>
                            <div class="operation">
                                <div class="initial bg-[#D1D2D3] dark:bg-[#484A4D]" ></div>
                                <div class="progressLine" :style="{ width: progessWid + 'px' }">
                                    <div class="progressNum">{{ progressNum }}%</div>
                                </div>
                                <div style="display: flex;position: absolute;top: 0;left: 20px;align-items: center;">
                                    <n-space>
                                        <n-spin stroke="#4B88EF" :size="10" />
                                    </n-space>
                                    <div style="margin-left: 10px;font-size: 13px;color: #4B88EF;">创作中，请耐心等待</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mainRight">
                    <div v-if="selectItem">
                        <video style="position: absolute;z-index: 10;" autoplay id="video" loop :src="selectItem.mp4"></video>
                        <div class="dark:bg-[#020104] bg-[#F4F4F4]" style="width: 100%;height: 700px;display: flex;flex-direction: column;justify-content: center;align-items: center;">
                            <div style="width: 50px;height: 50px;">
                                <div class="loader"></div>
                            </div>
                            <p style="margin-top: 10px;">视频生成中，请稍等</p>
                        </div>
                        <div class="control">
                            <img class="controlItem" src="./img/start.png" alt="">
                            <img class="controlItem" v-if="isPlay" src="./img/false.svg" style="margin: 0 50px;" alt=""
                                @click="handlePlay">
                            <img class="controlItem" v-if="!isPlay" src="./img/play.png" style="margin: 0 50px;" alt=""
                                @click="handlePlay">
                            <img class="controlItem" src="./img/end.png" alt="">
                        </div>
                    </div>
                    <div style="text-align: center;" v-else>请选择预览的音乐</div>
                </div>
            </div>
            <div class="end text-[#A3A5A6] dark:text-[#76777A]">版权所有 © {{ copyrightTitle }} <a :href="icpUrl ||'#'"><a :href="policeFilingUrl ||'#'">{{policeFilingNumber}}</a>{{icpNumber}}</a></div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.musicBody {
    width: 100%;
    height: 100%;
    display: flex;
    padding-right: 10px;

    .createBox {
        margin-top: 10px;
        height:92vh;
        width: 300px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 12px;

        .createTop {
            padding: 0 12px;

            .line {
                width: 4px;
                height: 16px;
                border-radius: 4px;
                margin-right: 4px;
            }

            .describeBox {
                .describeTitle {
                    display: flex;
                    align-items: center;
                }

                .describeMain {
                    margin-top: 10px;
                    height: 120px;
                    padding: 12px 12px;
                    border-radius: 8px;

                    .describeText {
                        resize: none;
                        width: 100%;
                        height: 60px;
                    }

                    .describeBtn {
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        color: #fff;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        width: 110px;
                    }
                }
            }

            .lyricsBox {
                .lyricsTitle {
                    display: flex;
                    align-items: center;
                }

                .lyricsMain {
                    margin-top: 10px;
                    height: 120px;
                    padding: 12px 12px;
                    border-radius: 8px;

                    .lyricsText {
                        resize: none;
                        width: 100%;
                        height: 60px;
                    }

                    .lyricsBtn {
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        color: #fff;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        width: 110px;
                    }
                }
            }

            .musicBox {
                margin-top: 20px;

                .musicTitle {
                    display: flex;
                    align-items: center;
                }

                .musicMain {
                    margin-top: 10px;
                    height: 120px;
                    padding: 12px 12px;
                    border-radius: 8px;

                    .musicText {
                        resize: none;
                        width: 100%;
                        height: 60px;
                    }

                    .musicBtn {
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        color: #fff;
                        font-size: 12px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        width: 110px;
                    }
                }
            }

            .musicNameBox {
                margin-top: 20px;

                .musicNameTitle {
                    display: flex;
                    align-items: center;
                }

                .musicNameMain {
                    margin-top: 10px;
                    padding: 12px 12px;
                    border-radius: 8px;

                    .musicNameText {
                        width: 100%;
                    }
                }
            }

            .musicModeBox {
                margin-top: 20px;
                position: relative;

                .musicModeTitle {
                    display: flex;
                    align-items: center;
                }

                .musicModeSelect {
                    cursor: pointer;
                    margin-top: 10px;
                    padding: 12px 12px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .selectBox {
                    overflow: hidden;
                    transition: all .5s;
                    position: absolute;
                    z-index: 1000;
                    width: 100%;
                    overflow: auto;
                    margin-top: 5px;
                }

                .selectItem {
                    padding: 12px 12px;
                    cursor: pointer;
                }
                .selectItem:hover{
                    background-color: #202B3A;
                }
            }

            .prompt {
                padding: 6px 12px 0 12px;
                border-radius: 8px;
                margin-top: 24px;
                font-size: 13px;
            }
        }

        .createBottm {
            padding: 8px 12px;
            width: 100%;
            display: flex;
            justify-content: center;

            .botton {
                width: 100%;
                height: 44px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 8px;
                color: #fff;
            }
        }
    }

    .createCenterBox {
        width: 80%;
        height: 92vh;
        margin-left: 10px;
        margin-top: 10px;
        border-radius: 12px;
        position: relative;

        .createCenterTop {
            display: flex;
            align-items: center;
            height: 44px;
            line-height: 44px;
            padding: 0 12px;
        }

        .createCenterMain {
            display: flex;
            justify-content: space-between;
            padding: 20px 20px 0px 20px;
            height: 90%;
            overflow: hidden;
            .mainLeft {
                flex: 1;
                margin-right: 20px;
                overflow: auto;

                .mainItem {
                    padding: 6px;
                    margin-top: 20px;
                    display: flex;
                    border-radius: 6px;

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
                            position: relative;
                            padding-right: 10px;

                            .progressLine {
                                height: 4px;
                                background-color: #2F69D4;
                                border-radius: 2px;
                                position: absolute;
                                transition: all .5s;
                                top: -15px;
                            }

                            .progressNum {
                                height: 20px;
                                padding: 0 5px;
                                line-height: 20px;
                                text-align: center;
                                background-color: #2960BE;
                                border-radius: 22px;
                                position: absolute;
                                border: 2px solid #fff;
                                top: -7px;
                                right: -10px;
                                color: #fff;
                            }

                            .initial {
                                width: 200px;
                                height: 4px;
                                position: relative;
                                border-radius: 2px;
                                top: -15px;
                            }

                            .icon {
                                margin-right: 24px;
                                cursor: pointer;
                            }

                            .operationBox {
                                position: absolute;
                                z-index: 1000;
                                right: 0;
                                top: 30px;
                                // width: 116px;
                                padding: 10px 20px;
                                border-radius: 12px;
                                line-height: 30px;

                                .operationItem {
                                    cursor: pointer;
                                }
                            }
                        }
                    }
                }
            }

            .mainRight {
                width: 504px;
                position: relative;
                border-radius: 10px;
                overflow: hidden;

                .rightMain {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.24);
                    backdrop-filter: blur(30px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-y: auto;

                    .musicAvatar {
                        width: 148px;
                        height: 148px;
                        border-radius: 8px;
                        margin-top: 24px;
                    }

                    .musicName {
                        margin-top: 42px;
                        font-size: 32px;
                        color: #fff;
                    }

                    .musicIntro {
                        max-width: 456px;
                        text-wrap: wrap;
                        display: flex;
                        text-align: center;
                        color: #fff;
                        margin-top: 12px;
                    }

                    .lyrics {
                        padding-bottom: 72px;
                        margin-top: 50px;
                        color: #fff;
                        font-size: 15px;
                    }
                }

                .control {
                    width: 100%;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    background: rgba(0, 0, 0, 0.24);
                    backdrop-filter: blur(4.6px);
                    z-index: 10;
                    height: 72px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .controlItem {
                        width: 42px;
                        height: 42px;
                    }
                }
            }
        }
    }

    .mask {
        width: 100%;
        height: 100vh;
        // background-color: red;
        position: absolute;
        z-index: 999;
    }

    .end {
        width: 100%;
        height: 45px;
        text-align: center;
        line-height: 45px;
        font-size: 13px;
        position: absolute;
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
