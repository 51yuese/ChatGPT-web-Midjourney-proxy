<script setup lang='ts'>
import {onMounted, reactive} from 'vue'
import {queryCopyRight} from "@/api/global";

const formData = reactive({

	agreementTitle: '', // 用户协议
	policyTitle: '', // 隐私政策协议

	filingNumber: '',
	companyName: '',

})

async function queryCopyright() {

	const res = await queryCopyRight({ keys: [
		  'filingNumber',
			'companyName',
			'agreementTitle',
			'policyTitle',

		// 	copyrightTitle: '',
		// icpNumber: '',
		// policeFilingNumber: '',
		// icpUrl: '',
		// policeFilingUrl: '',

		] })
	Object.assign(formData, res.data)
}

onMounted(() => {
	queryCopyright()
})

</script>

<template>
  <div class="copy-container">
		<div>
			<p class="agreement">
				<router-link to="/agreement" target="_blank">
					<span>{{formData.agreementTitle|| ""}}</span>
				</router-link>
				<span v-if="formData.policyTitle" style="margin: 0 4px;">|</span>
				<router-link to="/policy" target="_blank">
					<span>{{formData.policyTitle}}</span>
				</router-link>
			</p>
		</div>
		<div>
			<p>版权所有 © {{formData.companyName}} {{formData.filingNumber}}
<!--				<span  v-if="formData.icpNumber">-->
<!--			      <img src="@/assets/icp-icon.png" alt="">-->
<!--			      <a :href="formData.icpUrl || '#'">{{formData.icpNumber}}</a>-->
<!--		      </span>-->
<!--				<span v-if="formData.policeFilingNumber">-->
<!--			      <img src="@/assets/police.png" alt="">-->
<!--			      <a :href="formData.policeFilingUrl || '#'">{{formData.policeFilingNumber}}</a>-->
<!--		      </span>-->
			</p>
		</div>

  </div>

</template>
<style lang="less" scoped>
  .copy-container {
		display: flex;
		flex-direction: column;
		div {
			display: flex;
			justify-content: center;
			.agreement {
				span {
					margin: 0;
				}
			}
			p {
				font-size: 12px;
				color: #888;
				display: flex;
				span {
					display: flex;
					margin-left: 10px;
					img {
						width: 16px;
					}
				}
			}
		}

  }
</style>
