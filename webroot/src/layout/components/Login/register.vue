<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import type {FormInst, FormRules} from 'naive-ui'
import {NButton, NForm, NFormItem, NInput, useMessage} from 'naive-ui'
import {fetchRegisterAPI} from "@/api";
const registerRef = ref<FormInst | null>(null)
const Nmessage = useMessage()

const registerForm = ref({
	username:'',
	password:'',
	verifyPassword:''
})
const registerRules:registerForm = {
	username:[
		{required: true, message: '用户名不能为空', trigger: 'blur'},
		{min: 6, message: '应户名不能少于6位', trigger: 'blur'},
	],
	password:[
		{
			required: true,
			trigger: 'blur',
			validator(rule: FormItemRule, value: string){
				if(!value){
					return new Error('请输入密码')
				}else if (value.length < 6){
					return new Error('用户名长度不能少于6位')
				}else if (value != registerForm.value?.verifyPassword){
					return new Error('两次输入的密码不一致')
				}
			}
		}
	],
	verifyPassword:[
		{
			required: true,
			trigger: 'blur',
			validator(rule: FormItemRule, value: string){
				if(!value){
					return new Error('确认密码不能位空')
				}else if (value.length < 6){
					return new Error('用户名长度不能少于6位')
				}else if (value != registerForm.value?.password){
					return new Error('两次输入的密码不一致')
				}
			}
		}
	]
}

// 注册
async function registerClick(){
	registerRef.value?.validate(async errors => {
			const res = await fetchRegisterAPI({username:registerForm.value?.username, password: registerForm.value?.password}).catch(err=>{
				return err
			});
			if (res.message == "用户名格式错误！"){
				Nmessage.error("当前用户名格式错误，请使用英文字母+数字的格式")
				return
			}
			Nmessage.success("用户注册成功！快前往登录页面登录吧！")
	})
}
</script>

<template>
	<div>

		<NForm
			ref="registerRef"
			:model="registerForm"
			:rules="registerRules"
			label-placement="left"
			label-width="auto"
			size="large"
			require-mark-placement="right-hanging"
			:style="{
        maxWidth: '640px',
        marginTop: '40px'
      }"
		>
			<NFormItem path="username">

				<NInput style="position: relative" class="dark:bg-[#010102] bg-[#F4F4F4]"
								v-model:value="registerForm.username" tabindex="1" placeholder="请输入用户名(字母+数字)"/>
			</NFormItem>
			<NFormItem path="password">

				<NInput style="position: relative" class="dark:bg-[#010102] bg-[#F4F4F4]"
								v-model:value="registerForm.password" tabindex="1" placeholder="请输入密码" type="password"/>
			</NFormItem>
			<NFormItem path="verifyPassword">

				<NInput style="position: relative" class="dark:bg-[#010102] bg-[#F4F4F4]"
								v-model:value="registerForm.verifyPassword" tabindex="1" placeholder="请再次确认密码" type="password"/>
			</NFormItem>

<!--			:disabled="loading"-->
<!--			:loading="loading"-->
			<NFormItem class="mt-5">
				<NButton
					style="background-color: #3187F1;width: 50%;border-radius: 29px;margin-left: 50%;transform: translate(-50%)"
					block
					type="primary"
					@click="registerClick"
				>
					立即注册
				</NButton>
			</NFormItem>
		</NForm>
	</div>
</template>

<style scoped lang="less">
.n-input {
	width: 70% !important;
	// background-color: #3C3C5A;
	border-radius: 36px;
	height: 50px;
	margin-left: 25%;
	transform: translate(-12%)
}

/deep/ .n-input__input {
	width: 100%;
	height: 100%;
}

/deep/ .n-input__input-el {
	height: 100%;
	margin-top: 5px;
}

/deep/ .n-form-item-feedback-wrapper {
	margin-left: 17% !important;
}

/deep/ .n-input__placeholder {
	color: #BDBDBD !important;
	font-size: 12px !important;
	padding-top: 2px;
}

</style>
