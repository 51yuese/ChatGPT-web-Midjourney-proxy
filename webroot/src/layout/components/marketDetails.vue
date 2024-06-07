<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { SvgIcon } from "@/components/common";
import { useMessage ,NImage} from 'naive-ui';
import EventBus from '@/hooks/eventBus';
import { fetchGetDraw,drawAgree } from "@/api/mjDraw";
import clipboard3 from "vue-clipboard3"
import defaultAvatar from "@/assets/avatar.png";
const { toClipboard } = clipboard3();
const ms = useMessage();
const props = defineProps(["mainData"])
const detailMain = ref(null)
onMounted(() => {
    let element = detailMain.value
    setTimeout(() => {
        element.style.opacity = "1"
        element.style.transform = "translate(0)";
    }, 300)
});
function handleClose() {
    let element = detailMain.value
    element.style.opacity = "0"
    element.style.transform = "translate(-50px)";
    setTimeout(() => {
        EventBus.emit("Details", false)
    }, 300)
}
const promptEn = ref()
const drawMode = ref()
const proportion = ref()
const advanced = ref()
if (props.mainData.prompt.indexOf("--v")!=-1) {
    promptEn.value = props.mainData.prompt.split("--v")[0]
    drawMode.value = "MJ" + props.mainData.prompt.split("--v")[1].split(" ")[1]
    proportion.value = props.mainData.prompt.split("--ar")[1].split(" ")[1]
    advanced.value = "--v" + props.mainData.prompt.split("--v")[1]
} else if (props.mainData.prompt.indexOf("--niji")!=-1) {
    promptEn.value = props.mainData.prompt.split("--niji")[0]
    drawMode.value = "NJ" + props.mainData.prompt.split("--niji")[1].split(" ")[1]
    proportion.value = props.mainData.prompt.split("--ar")[1].split(" ")[1]
    advanced.value = "--NJ" + props.mainData.prompt.split("--niji")[1]
} else if(props.mainData.prompt.indexOf("--niji")==-1){
    promptEn.value = props.mainData.prompt
}else if(props.mainData.prompt.indexOf("--v")==-1){
    promptEn.value = props.mainData.prompt
}
const userData=ref(null)
fetchGetDraw({ jobId: props.mainData.jobId ,detail:1}).then(res => {
    if(res){
        userData.value=res.data
    }
})
async function copy(type) {
    if (type == 0) {
        try {
            await toClipboard(props.mainData.originPrompt);
            ms.success("复制成功")
        } catch (error) {
            ms.error("复制失败!!")
        }
    }else if(type==1){
        try {
            await toClipboard(promptEn.value);
            ms.success("复制成功")
        } catch (error) {
            ms.error("复制失败!!")
        }
    }

}
const agreeStatus=ref(0)
function handleAgree(item){
    let data={
        relateId: item.id,
        relateType:"mj",
        action:"agree"
    }
    if(agreeStatus.value==1){
        return
    }
    agreeStatus.value=1
    drawAgree(data).then(res=>{
        if(userData.value.agree=="agree"){
            userData.value.agree=null
            userData.value.agreeNum--
        }else if(userData.value.agree==null){
            userData.value.agree="agree"
            userData.value.agreeNum++
        }
        agreeStatus.value=0
    })
}
</script>
<template>
    <div class="mainBox bg-[#f4f4f4] dark:bg-[#1E1F22]">
        <div ref="detailMain" class="mainItem" style="width: 100%;display: flex;justify-content: center;">
            <div class="main bg-[#fff] dark:bg-[#303237]">
                <div style="display: flex;">
                    <div style="display: flex;justify-content: center;align-items: center;height: 600px;">
                        <div class="mainLeft">
                            <!-- <img style="width: 336px;height: auto;" :src="mainData.imageUrl" alt=""> -->
                            <NImage style="width: 336px;margin-top: 6px;" :preview-src="mainData.imageUrl" object-fit="contain"
                            :src="mainData.imageUrl"></NImage>
                        </div>
                    </div>
                    <div class="mainRight">
                        <div class="userinfo">
                            <div style="display: flex;">
                                <img v-if="userData!=null" style="width: 50px;height: 50px;border-radius: 50%;margin-right: 10px;" :src="userData.avatar" alt="">
                                <img v-if="userData==null" style="width: 50px;height: 50px;border-radius: 50%;margin-right: 10px;" :src="defaultAvatar" alt="">
                                <div>
                                    <div class="nickname">
                                        <p v-if="userData!=null">{{ userData.nickname?userData.nickname:userData.username?userData.username:"匿名" }}</p>
                                        <!-- <p v-if="userData!=null||userData==null">匿名</p> -->
                                    </div>
                                    <div style="display: flex;margin-top: 10px;">
                                        <div style="display: flex;margin-right: 10px;">
                                            <SvgIcon  icon="ph:eye-thin" style="font-size: 16px;cursor: pointer;" />
                                            <p v-if="userData!=null" style="margin-left: 4px;font-size: 12px;">{{ userData.visitNum }}</p>
                                            <p v-if="userData==null" style="margin-left: 4px;font-size: 12px;">0</p>
                                        </div>
                                        <div style="display: flex;">
                                            <SvgIcon icon="tabler:thumb-up" style="font-size: 16px;cursor: pointer;" />
                                            <p v-if="userData!=null" style="margin-left: 4px;font-size: 12px;">{{ userData.agreeNum }}</p>
                                            <p v-if="userData==null" style="margin-left: 4px;font-size: 12px;">0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="userData!=null" class="agress dark:bg-[#474858] bg-[#f4f4f4]" @click="handleAgree(mainData)">
                                <SvgIcon v-if="userData.agree==null" icon="mdi:thumb-up-outline" style="font-size: 16px;cursor: pointer;" />
                                <SvgIcon v-else icon="mdi:thumb-up" style="font-size: 16px;cursor: pointer;color: #FC8C0A;" />
                                <p style="margin-left: 4px;">点赞</p>
                            </div>
                            <div v-if="userData==null" class="agress dark:bg-[#474858] bg-[#f4f4f4]" @click="handleAgree(mainData)">
                                <SvgIcon  icon="mdi:thumb-up-outline" style="font-size: 16px;cursor: pointer;" />
                                <!-- <SvgIcon  icon="mdi:thumb-up" style="font-size: 16px;cursor: pointer;color: #FC8C0A;" /> -->
                                <p style="margin-left: 4px;">点赞</p>
                            </div>
                        </div>
                        <div class="promptZn">
                            <div style="display: flex;justify-content: space-between;">
                                <p>提示词</p>
                                <div style="display: flex;align-items: center;" @click="copy(0)">
                                    <SvgIcon icon="icon-park-outline:copy" style="font-size: 13px;cursor: pointer;" />
                                    <p style="cursor: pointer;margin-left: 4px;">复制</p>
                                </div>
                            </div>
                            <div class="ZnText dark:bg-[#010102] bg-[#f4f4f4]">
                                {{ props.mainData.originPrompt }}
                            </div>
                        </div>
                        <div class="promptEn">
                            <div style="display: flex;justify-content: space-between;">
                                <p>提示词</p>
                                <div style="display: flex;align-items: center;" @click="copy(1)">
                                    <SvgIcon icon="icon-park-outline:copy" style="font-size: 13px;cursor: pointer;" />
                                    <p style="cursor: pointer;margin-left: 4px;">复制</p>
                                </div>
                            </div>
                            <div class="EnText dark:bg-[#010102] bg-[#f4f4f4]">
                                {{ promptEn }}
                            </div>
                        </div>
                        <div class="parameterInfo">
                            <p>参数信息</p>
                            <div class="infoBox bg-[#f4f4f4] dark:bg-[#010102]">
                                <div style="display: flex;">
                                    <div style="width: 70px;">绘制模型</div>
                                    {{ drawMode?drawMode:'' }}
                                </div>
                                <div style="display: flex;">
                                    <div style="width: 70px;">图片比例</div>
                                    {{ proportion?proportion:'' }}
                                </div>
                                <div style="display: flex;" v-if="mainData.fileInfo.width">
                                    <div style="width: 70px;">图片尺寸</div>
                                    {{ mainData.fileInfo.width }} x {{ mainData.fileInfo.height }}
                                </div>
                                <div style="display: flex;" v-else>
                                    <div style="width: 70px;">图片尺寸</div> 
                                </div>
                                <div style="display: flex;">
                                    <div style="width: 70px;">高级参数</div>
                                    <div style="flex: 1;"> {{ advanced?advanced:"" }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin-left: 10px;">
                <SvgIcon @click="handleClose" icon="ei:close-o" style="font-size: 37px;cursor: pointer;" />
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.mainBox {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .mainItem {
        opacity: 0;
        transition: all .5s;
        transform: translate(-50px);
    }

    .main {
        min-width: 60%;
        height: 600px;
        border-radius: 12px;
        overflow: hidden;

        .mainLeft {
            padding: 0 80px;

        }

        .mainRight {
            flex: 1;
            padding: 30px 30px 30px 0;

            .userinfo {
                display: flex;
                justify-content: space-between;
            }

            .agress {
                width: 70px;
                height: 30px;
                border-radius: 20px;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            }

            .promptZn {
                margin-top: 30px;

                .ZnText {
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    max-height: 110px;
                    max-width: 600px;
                    overflow-y: auto;
                }
            }

            .promptEn {
                margin-top: 10px;

                .EnText {
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 10px;
                    max-height: 110px;
                    max-width: 600px;
                    overflow-y: auto;
                }
            }

            .parameterInfo {
                margin-top: 30px;
                max-width: 600px;
                .infoBox {
                    padding: 15px 15px;
                    border-radius: 8px;
                }
            }
        }
    }
}
</style>