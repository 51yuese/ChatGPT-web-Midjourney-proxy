<script setup lang="ts">
import {computed, onMounted} from 'vue'
import {useAuthStore} from "@/store";

const auth = useAuthStore()
const Wx = computed(() => auth.globalConfig.vxNumber);
const QQ = computed(() => auth.globalConfig.qqNumber);

</script>

<template>
	<div class="full-container">
		<h1 class="unlawful">域名未被授权，请联系客服购买正版授权!!</h1>
		<div>
			<p>QQ客服：<span>{{ QQ || "124628086" }}</span></p>
			<p>VX客服：<span>{{ Wx || 'lzgzs168' }}</span></p>
		</div>
	</div>
	<p></p>
</template>

<style scoped lang="less">
.full-container {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	div {
		p {
			font-size: 24px;
			font-weight: bold;
		}
	}

	.unlawful {
		font-weight: bolder;
		letter-spacing: 10px;
		user-select: none;
		text-align: center;
		font-size: 40px;
		background: -webkit-linear-gradient(135deg,
		#0eaf6d,
		#ff6ac6 25%,
		#147b96 50%,
		#e6d205 55%,
		#2cc4e0 60%,
		#8b2ce0 80%,
		#ff6384 95%,
		#08dfb4);
		/* 文字颜色填充设置为透明 */
		-webkit-text-fill-color: transparent;
		/* 背景裁剪，即让文字使用背景色 */
		-webkit-background-clip: text;
		/* 背景图放大一下，看着柔和一些 */
		-webkit-background-size: 200% 100%;
		/* 应用动画flowCss 12秒速度 无限循环 线性匀速动画*/
		-webkit-animation: flowCss 12s infinite linear;
		animation: flowCss 12s infinite linear;
	}

	@keyframes flowCss {
		0% {
			/* 移动背景位置 */
			background-position: 0 0;
		}

		100% {
			background-position: -500% 0;
		}
	}

	.unlawful:hover {
		-webkit-animation: flowCss 4s infinite linear;
	}
}

</style>
