<route lang="yaml">
meta:
title: 对话小尾巴
</route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'

const formInline = reactive({
   dialogueTail: "",
})

const rules = ref<FormRules>({
   tailContent: [{ required: false, trigger: 'blur', message: '请填写对话小尾巴' }],
})

const formRef = ref<FormInstance>()

async function queryAllConfig() {
  const res = await apiConfig.queryConfig({ keys: ['dialogueTail'] })
  Object.assign(formInline, res.data)
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: formatSetting(formInline) })
        ElMessage.success('变更配置信息成功')
      }
      catch (error) {}
      await queryAllConfig()
    }
    else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function formatSetting(settings: any) {
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
      <el-alert :closable="false" show-icon title="对话小尾巴设置" description="设置对话小尾巴，前台每条对话完成后都会显示该小尾巴" type="success" />
    </page-main>

    <el-card style="margin: 20px 20px 0 20px ;;">
      <template #header>
        <div class="flex justify-between">
          <b>对话小尾巴设置</b>
          <el-button class="button" @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="130px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="对话小尾巴" prop="dialogueTail">
              <el-input v-model="formInline.dialogueTail" type="text" placeholder="请填写对话小尾巴" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
