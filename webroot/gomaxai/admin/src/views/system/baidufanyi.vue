<route lang="yaml">
meta:
  title: MJ翻译设置
  </route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'

const formInline = reactive({
  baiduFanyiAppId: '',
  baiduFanyiSecret: '',
})

const rules = ref<FormRules>({
  baiduFanyiSecret: [{ required: true, trigger: 'blur', message: '请填写应用ID' }],
  baiduFanyiAppId: [{ required: true, trigger: 'blur', message: '请填写基础ID' }],
})

const formRef = ref<FormInstance>()

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({ keys: ['baiduFanyiSecret', 'baiduFanyiAppId'] })
  Object.assign(formInline, res.data)
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

function fotmatSetting(settings: any) {
  return Object.keys(settings).map((key) => {
    return {
      configKey: key,
      configVal: settings[key],
    }
  })
}

onMounted(() => {
  queryAllconfig()
})
</script>

<template>
  <div>
    <page-main bottomPadding="20px">
      <el-alert :closable="false" show-icon title="百度翻译参数说明" description="当前百度翻译已在1.5替换为ai翻译、仅在基础绘画中保留、如您需要、具体申请配置文档地址 https://api.fanyi.baidu.com/ 请开通通用文本翻译！" type="success" />
    </page-main>
    <el-card style="margin: 20px;">
      <template #header>
        <div class="flex justify-between">
          <b>百度翻译参数设置</b>
          <el-button class="button"   @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="130px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="百度翻译APPID" prop="baiduFanyiAppId">
              <el-input v-model="formInline.baiduFanyiAppId" placeholder="请填写百度翻译APPID" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="百度翻译秘钥" prop="baiduFanyiSecret">
              <el-input v-model="formInline.baiduFanyiSecret" placeholder="请填写百度翻译秘钥" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
