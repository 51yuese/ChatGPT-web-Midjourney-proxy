<route lang="yaml">
meta:
  title: 隐私政策
    </route>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import MdEditor from 'md-editor-v3'
import axios from 'axios'
import apiConfig from '@/api/modules/config'
import 'md-editor-v3/lib/style.css'
import useSettingsStore from '@/store/modules/settings'

const settingsStore = useSettingsStore()
const formInline = reactive({
  // isAutoOpenNotice: '',
  policyContent: '',
  policyTitle: '',
})

const theme = computed(() => {
  return settingsStore.settings.app.colorScheme
})

const rules = ref<FormRules>({
  policyTitle: [
    { required: true, trigger: 'blur', message: '请填写隐私政策标题' },
  ],
  policyContent: [
    { required: true, trigger: 'blur', message: '请填写隐私政策内容' },
  ],
})
const formRef = ref<FormInstance>()

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({ keys: ['policyTitle', 'policyContent'] })
  const { policyTitle, policyContent } = res.data
  Object.assign(formInline, { policyTitle, policyContent })
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: fotmatSetting(formInline) })
        ElMessage.success('变更配置信息成功')
      }
      catch (error) {}
      queryAllconfig()
    }
    else {
      ElMessage.error('请填写完整信息')
    }
  })
}

const uploadUrl = ref(`${import.meta.env.VITE_APP_API_BASEURL}/upload/file`)

function fotmatSetting(settings: any) {
  return Object.keys(settings).map((key) => {
    return {
      configKey: key,
      configVal: settings[key],
    }
  })
}

function onChange(val) {}
async function onUploadImg(files, callback) {
  const res = await Promise.all(
    Array.from(files).map((file) => {
      return new Promise(async (resovle, reject) => {
        const form = new FormData()
        form.append('file', file)
        try {
          const res = await axios.post(uploadUrl.value, form, { headers: { 'Content-Type': 'multipart/form-data' } })
          if (!res?.data?.data) {
            ElMessage.error('图片上传失败、请检查您的配置信息！')
          }
          resovle(res.data.data)
        }
        catch (error) {
          ElMessage.error(error?.response?.data?.message || '图片上传失败、请检查您的配置信息！')
          reject(error)
        }
      })
    }),
  )
  callback(res.map(item => item))
  ElMessage({ message: '图片上传成功！', type: 'success' })
}

onMounted(() => {
  queryAllconfig()
})
</script>

<template>
  <div>
    <page-main bottomPadding="20px">
      <el-alert :closable="false" show-icon title="隐私政策设置说明" description="这里的隐私政策设置是对应用户端底部隐私政策链接的设置、你可以使用MD语法或直接使用Html标签进行发布、您也可以直接粘贴上传图片、作为图床使用、其他地方比如上传商品等地方的图片也可以暂时在此作为临时方案。" type="success" />
    </page-main>
    <el-card style="margin: 20px 20px 0 20px ;">
      <template #header>
        <div class="flex justify-between">
          <b>隐私政策设置</b>
          <el-button class="button"  @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="120px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="10">
            <el-form-item label="隐私政策标题" prop="policyTitle">
              <el-input v-model="formInline.policyTitle" :rows="1" placeholder="隐私政策标题" clearable />
            </el-form-item>
          </el-col>
<!--          <el-col :offset="2" :xs="24" :md="20" :lg="15" :xl="10">-->
<!--            <el-form-item label="自动打开公告" prop="isAutoOpenNotice">-->
<!--              <el-tooltip content="设为自动打开则网站初始化会打开、用户仍可以选择24小时不再查看、选择关闭则不会主动打开！" placement="top" :show-after="500">-->
<!--                <el-switch-->
<!--                  v-model="formInline.isAutoOpenNotice"-->
<!--                  active-value="1"-->
<!--                  inactive-value="0"-->
<!--                />-->
<!--              </el-tooltip>-->
<!--            </el-form-item>-->
<!--            <el-col :xs="24" :md="20" :lg="15" :xl="12" />-->
<!--          </el-col>-->
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="隐私政策内容" prop="policyContent">
              <MdEditor v-model="formInline.policyContent" style="min-height: 80vh;" :theme="theme" @onChange="onChange" @onUploadImg="onUploadImg" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
