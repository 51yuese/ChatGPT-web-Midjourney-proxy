<route lang="yaml">
meta:
  title: 底部版权设置
    </route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'

const formInline = reactive({
  copyrightTitle: '',
  icpNumber: '',
  policeFilingNumber: '',
  icpUrl: '',
  policeFilingUrl: '',
})

const rules = ref<FormRules>({
  copyrightTitle: [{ required: true, trigger: 'blur', message: '请填写点击版权内容' }],
  icpNumber: [{ required: false, trigger: 'blur', message: '请填写ICP备案号' }],
  policeFilingNumber: [{ required: false, trigger: 'blur', message: '请填写公安网备案号' }],
  icpUrl: [{ required: false, trigger: 'blur', message: '请填写ICP备案号查询跳转地址' }],
  policeFilingUrl: [{ required: false, trigger: 'blur', message: '请填写公安网备案号查询跳转地址' }],
})

const formRef = ref<FormInstance>()

async function queryAllConfig() {
  const res = await apiConfig.queryConfig({ keys: ['copyrightTitle', 'icpNumber', 'policeFilingNumber', 'icpUrl', 'policeFilingUrl'] })
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
      queryAllConfig()
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
  queryAllConfig()
})
</script>

<template>
  <div>
    <page-main bottomPadding="20px">
      <el-alert :closable="false" show-icon title="底部版权参数说明" description="当前程序的版权信息、文字用于展示、地址用于点击文字的跳转地址" type="success" />
    </page-main>
    <el-card style="margin: 20px;">
      <template #header>
        <div class="flex justify-between">
          <b>底部版权设置</b>
          <el-button class="button"   @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="130px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="版权内容" prop="copyrightTitle">
              <el-input v-model="formInline.copyrightTitle" placeholder="请填写版权内容" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="ICP备案号" prop="icpNumber">
              <el-input v-model="formInline.icpNumber" placeholder="请填写ICP备案号" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公安网备案号" prop="policeFilingNumber">
              <el-input v-model="formInline.policeFilingNumber" placeholder="请填写公安网备案号" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="ICP备案地址" prop="icpUrl">
              <el-input v-model="formInline.icpUrl" placeholder="请填写ICP备案地址" clearable />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公安网备案地址" prop="policeFilingUrl">
              <el-input v-model="formInline.policeFilingUrl" placeholder="请填写公安网备案地址" clearable />
            </el-form-item>
          </el-col>
        </el-row>


      </el-form>
    </el-card>
  </div>
</template>
