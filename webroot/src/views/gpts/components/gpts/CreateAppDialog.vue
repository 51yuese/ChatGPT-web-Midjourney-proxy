<script setup lang="ts">
import {
	NButton, NInput, NForm, NFormItem, NModal, NSwitch, NSelect, NUpload,
	useMessage
} from 'naive-ui'
import {useAuthStore} from "@/store";
import {computed, ref, watch} from 'vue';
import {fetchAddAppAPI, fetchAppSortAPI} from "@/api/appStore";
import {fetchUploadImage} from "@/api/mjDraw";


const message = useMessage()
const authStore = useAuthStore();
const createDialogStatus = ref(false)
const createDialog = computed(() => authStore.createAppDialog)


onMounted:{
	getSortData();
}

// 分类数据
const sortOptions = ref([])

const fileList = ref<File[]>([])
const fileType = ['jpg', 'jpeg', 'png'];

// 是否GPTS应用数据
const isGpts = ref([
	{
		label: '是',
		value: 'true'
	},
	{
		label: '否',
		value: 'false'
	},
])
const addFormData = ref({
	groupId: '', // 分类
	// 应用名
	modelName: '',
	desc: '', // 应用描述
	logo: '',
	demoData: '', // 实列内容
	gptsApp: false,
	modelId: '',
	// isDraw: false, // 是否绘画
	// canUpload: false, // 启用上传
	// canAudio: false //启用语音
})

const createRules: createFormRef = {
	groupId: [
		{required: true, message: '请选择应用所属分类'}
	],
	modelName: [
		{required: true, message: '请填写您的应用名称', trigger: 'blur'}
	],
	desc: [
		{required: true, message: '请填写您的应用描述', trigger: 'blur'}
	],
	logo: [
		{required: true, message: '请上传应用的logo', trigger: 'blur'}
	],
	demoData: [
		{required: true, message: '请填写应用示例', trigger: 'blur'}
	],
	gptsApp: [
		{required: true, message: '请选择应用是否为gpts应用'}
	],
	modelId: [
		{required: true, message: '请填写gpts模型id', trigger: 'blur'}
	]
}

// 分类下拉框变化事件
function SelectSortChang(e) {
	addFormData.value.groupId = e
}

// 是否GPTS应用下拉框变化事件
function SelectIsGptsChang(e) {

	if (e == 'true'){
		addFormData.value.gptsApp = true
	}else{
		addFormData.value.gptsApp = false
	}
	// addFormData.value.gptsApp = e
}

// 获取分类数据
async function getSortData() {

	const res = await fetchAppSortAPI({status: 1});
	const data = res.data.rows
	data.forEach(item => {
		var data = {
			label: '',
			value: ''
		}

		data.label = item.groupName
		data.value = item.id

		sortOptions.value.push(data)
	})
}


function handleChangeImage(e) {
	if (e.file.status === "finished" || e.file.status === "removed") {
		return
	}

	const fileName = e.file.type.split('/')[1];
	if (e.file.status === "pending" && fileType.includes(fileName)) {
		let formData = new FormData
		formData.append('filename', e.file.id + '.' + fileName)
		formData.append('file', e.file.file)
		formData.append('dir', 'feedback-upload');

		fetchUploadImage(formData).then(res => {
			console.log(res)

			if (res.code != 200) {
				message.error('图片上传失败')
				return;
			}
			addFormData.value.logo = res.data
		})
	}
}


// 新增
async function addClick() {
	console.log(addFormData.value)
	var addAppData = {}

	// groupId: number, modelName: string, desc: string, logo: string, demoData: string, gptsApp: boolean, modelId: string
	if (addFormData.value?.gptsApp == true){
		addAppData.groupId = addFormData.value?.groupId
		addAppData.modelName = addFormData.value?.modelName
		addAppData.desc = addFormData.value?.desc
		addAppData.logo = addFormData.value?.logo
		addAppData.demoData = addFormData.value?.demoData
		addAppData.gptsApp = addFormData.value?.gptsApp
		addAppData.modelId = addFormData.value?.modelId
	}else{
		addAppData.groupId = addFormData.value?.groupId
		addAppData.modelName = addFormData.value?.modelName
		addAppData.desc = addFormData.value?.desc
		addAppData.logo = addFormData.value?.logo
		addAppData.demoData = addFormData.value?.demoData
		addAppData.gptsApp = addFormData.value?.gptsApp
	}


	const res = await fetchAddAppAPI(addAppData)
	console.log(res)
	if (res.code != 200){
		message.error(res.data)
		return;
	}

	message.success("应用添加成功")
	authStore.updateCreateAppDialog(false)

}
</script>

<template>
	<!--新增应用弹窗-->
	<NModal :show="createDialog"
					style="width: 30%;border-radius: 12px;"
					:mask-closable="false" class="dark:bg-[#1A1D21] bg-[#FFF]">
		<div class="add_app_Dialog">
			<div class="title">
				<div style="display: flex;align-items: center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M6.7791 2.09329H3.73258C2.81211 2.09329 2.06592 2.83948 2.06592 3.75996V6.80648C2.06592 7.72695 2.81211 8.47314 3.73258 8.47314H6.7791C7.69958 8.47314 8.44577 7.72695 8.44577 6.80648V3.75996C8.44577 2.83948 7.69958 2.09329 6.7791 2.09329Z"
							stroke="#3378ED" stroke-width="1.67"/>
						<path
							d="M6.7791 11.3871H3.73258C2.81211 11.3871 2.06592 12.1333 2.06592 13.0538V16.1003C2.06592 17.0207 2.81211 17.7669 3.73258 17.7669H6.7791C7.69958 17.7669 8.44577 17.0207 8.44577 16.1003V13.0538C8.44577 12.1333 7.69958 11.3871 6.7791 11.3871Z"
							stroke="#3378ED" stroke-width="1.67"/>
						<path
							d="M16.1255 2.09329H13.079C12.1585 2.09329 11.4124 2.83948 11.4124 3.75996V6.80648C11.4124 7.72695 12.1585 8.47314 13.079 8.47314H16.1255C17.046 8.47314 17.7922 7.72695 17.7922 6.80648V3.75996C17.7922 2.83948 17.046 2.09329 16.1255 2.09329Z"
							stroke="#3378ED" stroke-width="1.67"/>
						<path d="M14.6023 11.7558V17.3982" stroke="#3378ED" stroke-width="1.67" stroke-linecap="round"
									stroke-linejoin="round"/>
						<path d="M17.4236 14.577L11.7812 14.577" stroke="#3378ED" stroke-width="1.67" stroke-linecap="round"
									stroke-linejoin="round"/>
					</svg>
					<div style="margin-left: 10px;font-size: 15px">新增应用</div>
				</div>
				<div>
					<!--					<img @click="authStore.updateCreateAppDialog(false)" src="@/assets/images/app/shut.png">-->
					<svg @click="authStore.updateCreateAppDialog(false)" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
							 viewBox="0 0 20 20" fill="none">
						<path d="M5.83301 5.83334L14.1663 14.1667" stroke="#A3A5A6" stroke-width="1.66667" stroke-linecap="round"
									stroke-linejoin="round"/>
						<path d="M5.83301 14.1667L14.1663 5.83334" stroke="#A3A5A6" stroke-width="1.66667" stroke-linecap="round"
									stroke-linejoin="round"/>
					</svg>
				</div>
			</div>
			<div class="add_main">
				<NForm :model="addFormData" :rules="createRules" ref="createFormRef" label-placement="left" label-width="auto">
					<div class="item_form">
						<NFormItem label="所属分类" path="groupId">
							<NSelect :options="sortOptions" placeholder="请选择应用所属分类" :on-update:value="SelectSortChang"></NSelect>
						</NFormItem>
						<NFormItem label="应用名称" path="modelName">
							<NInput v-model:value="addFormData.modelName" tabindex="1" placeholder="请输入应用的名称"/>
						</NFormItem>
						<NFormItem label="应用描述" path="desc">
							<NInput v-model:value="addFormData.desc" tabindex="1" placeholder="请输入应用的描述"/>
						</NFormItem>
					</div>
					<div class="item_form">
						<NFormItem label="应用Logo" path="logo">
							<n-upload
								accept=".jpg,.jpeg,.png"
								action=""
								:max="1"
								:default-file-list="fileList"
								:default-upload="false"
								:on-change="handleChangeImage"
								list-type="image-card"
							>
							</n-upload>
						</NFormItem>
						<NFormItem label="实列内容" path="demoData">
							<NInput type="textarea" v-model:value="addFormData.demoData" tabindex="1"
											placeholder="请填写应用的demo示例数据、每换行一次表示一个新的示例..."/>
						</NFormItem>
					</div>
					<div class="item_form">
						<NFormItem label="是否GPTS" path="gptsApp">
							<NSelect default-value="否" :options="isGpts" :on-update:value="SelectIsGptsChang"></NSelect>
						</NFormItem>
						<NFormItem label="GPTS模型ID" path="modelId" v-if="addFormData.gptsApp == true">
							<NInput v-model:value="addFormData.modelId" tabindex="1" placeholder="请填写GPTS模型ID号(官网创建后产生的ID)"/>
						</NFormItem>
					</div>
				</NForm>
<!--				<div class="switch_list">-->
<!--					<div class="switch_item">-->
<!--						<div>是否绘画</div>-->
<!--						<div>-->
<!--							<NSwitch v-model:value="addFormData.isDraw"></NSwitch>-->
<!--						</div>-->
<!--						<img src="@/assets/images/app/help.png">-->
<!--					</div>-->
<!--					<div class="switch_item">-->
<!--						<div>启用上传</div>-->
<!--						<div>-->
<!--							<NSwitch v-model:value="addFormData.canUpload"></NSwitch>-->
<!--						</div>-->
<!--						<img src="@/assets/images/app/help.png">-->
<!--					</div>-->
<!--					<div class="switch_item">-->
<!--						<div>启用语音</div>-->
<!--						<div>-->
<!--							<NSwitch v-model:value="addFormData.canAudio"></NSwitch>-->
<!--						</div>-->
<!--						<img src="@/assets/images/app/help.png">-->
<!--					</div>-->
<!--				</div>-->
				<div class="botton_card">
					<NButton strong secondary type="tertiary" class="cancel dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4]  text-[#03060C]"
									 style="cursor: pointer"
									 @click="authStore.updateCreateAppDialog(false)">取消
					</NButton>
					<NButton  class="confirm"
									 style="cursor: pointer" type="primary"
									 @click="addClick">确认新增
					</NButton>



<!--					<NButton  class="confirm dark:bg-[#484A4D] bg-[#D1D2D3] bark:text-[#76777A] text-[#A3A5A6]" style="cursor: pointer">-->
<!--						确认新增-->
<!--					</NButton>-->
				</div>
			</div>
		</div>
	</NModal>
</template>

<style scoped lang="less">
.add_app_Dialog {
	width: 100%;
	height: 100%;
	padding: 20px;

	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.item_form {
		width: 100%;
		//display: flex;
		//align-items: center;
		//justify-content: space-between;
		margin-top: 20px;
		overflow: hidden;

		.n-form-item {
			margin-right: 40px;

			.n-input, /deep/ .n-base-selection {
				//--n-border: 1px solid #76777A !important;
				background-color: transparent;
				border-radius: 12px;
				font-size: 12px;
				--n-border: 1px solid #A3A5A6 !important;
			}

			/deep/ .n-base-selection-label {
				background-color: transparent;
			}
		}

		.n-form-item-label__text {
			font-size: 13px;
		}

		.n-input__placeholder, .n-base-selection-placeholder__inner {
			font-size: 12px;
		}
	}

	.switch_list {
		display: flex;
		align-items: center;

		.switch_item {
			display: flex;
			align-items: center;
			margin-right: 10%;
			font-size: 13px;

			/deep/ .n-switch__rail {
				--n-rail-height: 18px;
				--n-rail-width: 38px;
				--n-rail-color-active: #2960BE;
				margin-left: 10px;
			}

			/deep/ .n-switch__button {
				--n-button-width: 14px;
				--n-button-height: 14px;
			}

			img {
				width: 12px;
				height: 12px;
				margin-left: 10px;
			}
		}
	}

	.botton_card {
		text-align: right;
		margin-top: 30px;

		.cancel {
			padding: 8px 12px;
			border-radius: 8px;
			font-size: 13px;
		}

		.confirm {
			border-radius: 8px;
			padding: 8px 12px;
			margin-left: 20px;
			font-size: 13px;
		}
	}
}
</style>
