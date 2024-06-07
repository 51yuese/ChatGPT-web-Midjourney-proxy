<template>
    <div class="userDetailBox dark:bg-[#32324D] bg-[#fff]">
        <div class="userDetailTop">
            <div class="avatarBox bg-[#fff] dark:bg-[#32324D]">
                <img style="width: 100%;height: 100%;border-radius: 50%;" :src="avatar?avatar:'../img/avatar.png'" alt="">
            </div>
            <div style="width: 35px;height: 35px;background-color: #3080D7;border-radius:50%;display: flex;justify-content: center;align-items: center;">
                <img src="../img/bi.png" alt="">
            </div>
        </div>
        <div class="userDetailContent">
            <div style="padding: 12px 17px;border-radius: 10px;" class="bg-[#efefef] dark:bg-[#1A1A2F]">
                <div class="userDetailItem border-b-[2px] broder-[#cecece] dark:border-[#686885]">
                    <div style="display: flex;align-items: center;height: 30px;">
                        <p style="font-size: 20px;margin-right: 5px;" class="text-[#808080] dark:text-[#fff]">{{ username }}</p>
                        <!-- <img v-if="userBalance?.expirationTime" style="width: 20px;height: 20px;margin-left: 10px;" src="../img/vipUser.png" alt=""> -->
                        <!-- <img v-else style="width: 20px;height: 20px;margin-left: 10px;" src="../img/noVipUser.png" alt=""> -->
                        <SvgIcon class="text-2xl" :class="userBalance?.expirationTime?'text-[#EFBA0A]':'text-[#808080] dark:text-[#fff]'" icon="solar:crown-broken"></SvgIcon>
                    </div>
                    <div v-if="userBalance?.expirationTime" style="display: flex;justify-content: space-between;">
                        <p class="text-[#7E7E7E] dark:text-[#fff]">已开通会员</p>
                        <p class="isVip text-[#7E7E7E] dark:text-[#fff]">到期时间：{{ utcToShanghaiTime(userBalance?.expirationTime) }}</p>
                    </div>
					<p v-else class="isVip text-[#7E7E7E] dark:text-[#fff]"  @click="handleGoVip">未开通，点击了解特权</p>
                </div>
                <div class="userDetailItem  border-b-[2px] broder-[#cecece] dark:border-[#686885]">
                    <p style="font-size: 20px;" class="text-[#808080] dark:text-[#fff]">绘画积分</p>
                    <div style="display: flex;align-items: center;">
                        <img src="../img/yellowStart.png" alt="">
                        <p style="margin-left: 10px;color: #49A0FE;">积分：{{ userBalance.drawMjCount}}</p>
                    </div>
                </div>
                <div class="userDetailItem" style="display: flex;justify-content: space-between;align-items: center;"  @click="logOut">
                    <div style="display: flex;align-items: center;">
                        <!-- <img src="../img/out.png" alt=""> -->
                        <SvgIcon class="text-4xl" icon="mdi:shutdown"></SvgIcon>
                        <p style="margin-left: 10px;">退出登录</p>
                    </div>
                    <!-- <img style="width: 10px;height: 20px;" src="../img/userDetailright.png" alt=""> -->
                    <SvgIcon class="text-3xl" icon="mingcute:right-line"></SvgIcon>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed} from 'vue'
import { useAuthStore ,useGlobalStore} from "@/store";
import {utcToShanghaiTime} from "@/utils/date";
import {useRoute, useRouter} from "vue-router";
import { SvgIcon } from '@/components/common'
const authStore = useAuthStore();
const avatar = computed(() => authStore.userInfo.avatar);
const username = computed(() => authStore.userInfo.username);
const userBalance = computed(() => authStore.userBalance);
const router = useRouter()
const globalStore = useGlobalStore();
function logOut() {
	authStore.logOut()
	router.push('/')
}
const handleGoVip = () => {
	// router.push("/pay")
	handleGoMember();
}
// 会员中心
const handleGoMember = async () => {
	if (authStore.checkAuth()) {
		globalStore.updateVipDialog(true)
	}
}
</script>
<style lang="less" scoped>
.userDetailBox{
    width: 400px;
    height: 400px;
    position: absolute;
    // background-color: #32324D;
    z-index: 999999;
    left: 0;
    bottom: 90px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 7px 22px 2px rgba(26,26,47,0.82);
    .userDetailTop{
        width: 100%;
        height: 85px;
        background-color: #529FF5;
        // box-shadow: 0 10px 25px 1px #1A1A2F;
        position: relative;
        display: flex;
        justify-content: flex-end;
        padding: 10px 12px 0 0;
        .avatarBox{
            // background-color:#32324D;
            position: absolute;
            top: 50%;
            left: 22px;
            border-radius: 50%;
            padding: 5px;
            width: 80px;
            height: 80px;
        }
    }
    .userDetailContent{
        margin-top: 57px;
        width: 100%;
        height: auto;
        padding: 0 27px 25px 26px;
        .userDetailItem{
            padding: 12px 14px;
        }
        // .line{
        //     border-bottom: 2px solid #686885;
        // }
    }
}
.isVip{
    cursor: pointer;
}
</style>