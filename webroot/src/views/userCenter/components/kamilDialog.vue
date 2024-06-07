<script setup lang="ts">
import {
	NModal,
	useMessage,
	NButton,
	NInput,
} from 'naive-ui'
import { useAuthStore } from "@/store";
import { computed, ref } from 'vue'
import {fetchUseCramiAPI} from "@/api/crami";

const message = useMessage();
const authStore = useAuthStore()

// 卡密兑换框的状态
const kamilDialog = computed(() => authStore.kamilDialog)
// 卡密数据
const kamiData = ref('')


// 卡密激活事件
async function kamiActivateEvent(){
	if (kamiData.value == "") {
		message.error('卡密不能为空')
		return
	}
	const res = await fetchUseCramiAPI({ code: kamiData.value });
	if (res.code == 200) {
		message.success(res.data)
		kamiData.value = ''
		authStore.updateKamilDialog(false)
		authStore.getUserInfo()
		authStore.getUserBalance()
	} else {
		message.error(res.data)
	}
}
</script>

<template>
	<!--卡密兑换  对话框-->
	<NModal :show="kamilDialog" :mask-closable="false">
		<div class="kamil_activate_dialog  dark:bg-[#15171A] bg-[#fff]">
			<div class="close_btn" @click="authStore.updateKamilDialog(false)">
				<img src="@/assets/images/close.png">
			</div>
			<div style="font-size: 20px;text-align: center;margin: 30px;0">卡密激活</div>
			<div class="kami_input">
				<div>卡号：</div>
				<div class="dark:bg-[#010102] bg-[#f4f4f4]">
					<NInput v-model:value="kamiData" placeholder="请输入您的卡号" @keyup.enter="kamiActivateEvent" />
				</div>
			</div>
			<NButton tertiary style="color: #fff;" @click="kamiActivateEvent">
				激活
			</NButton>
		</div>
	</NModal>
</template>

<style scoped lang="less">
.kamil_activate_dialog {
	width: 500px;
	height: 300px;
	// background: #3B3B62;
	border-radius: 5px;
	position: relative;

	.kami_input {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;

		.n-input {
			background-color: transparent;
			// background-color: #323254;
			font-size: 12px;
			color: #C0C0C0;
			border-radius: 5px;
			width: 350px;
			--n-border: 0px solid rgb(224, 224, 230) !important;
		}
	}

	.n-button {
		background-color: #1174B3;
		color: #C0C0C0;
		border-radius: 5px;
		font-size: 12px;
		padding: 0 40px;
		margin-left: 50%;
		transform: translate(-50%);
		margin-top: 50px;
	}

	.close_btn {
		position: absolute;
		right: 10px;
		top: 10px;

		img {
			width: 20px;
			height: 20px;
		}
	}
}
</style>
