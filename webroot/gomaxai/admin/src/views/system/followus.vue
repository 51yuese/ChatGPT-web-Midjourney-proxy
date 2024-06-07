<route lang="yaml">
meta:
  title: 关注我们
  </route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElUpload } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'
import apiSystem from '@/api/modules/system'

const formInline = reactive({
  wechatImage: '',
  weMiniProgramImage: '',
  chatOnline: '',
})

const rules = ref<FormRules>({
  wechatImage: [{ required: true, trigger: 'blur', message: '微信公众号二维码' }],
  weMiniProgramImage: [{ required: true, trigger: 'blur', message: '微信小程序二维码' }],
  chatOnline: [{ required: true, trigger: 'blur', message: '在线客服地址' }],
})

const formRef = ref<FormInstance>()

async function queryAllconfig() {
  const res = await apiConfig.queryConfig({ keys: ['wechatImage', 'weMiniProgramImage','chatOnline'] })
  Object.assign(formInline, res.data)
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: fotmatSetting(formInline) })
        ElMessage.success('变更二维码成功')
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

const handleChange = (ev: any, type: string) => {

  const imageType = ev.name.split(".")[1]

  const formData = new FormData()
  formData.append('filename', ev.raw.uid + '.' + imageType)
  formData.append('file', ev.raw)
  formData.append('dir', 'follow-upload');

  apiSystem.uploadFile(formData).then(res => {
    const url = res.data;
       if (type === 'wechat') {
         formInline.wechatImage = url
       }
     if (type === 'miniProgram') {
      formInline.weMiniProgramImage = url;
    }
  })

}

const beforeAvatarUpload = (rawFile: { type: string; size: number; }) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持jpg和png格式')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片不能大于2M!')
    return false
  }
  return true
}

onMounted(() => {
  queryAllconfig()
})
</script>

<template>
  <div>
    <page-main bottomPadding="20px">
      <el-alert :closable="false" show-icon title="关注我们说明" description="关注我们上传微信公众号和小程序二维码，前端自动显示！" type="success" />
    </page-main>
    <el-card style="margin: 20px;">
      <template #header>
        <div class="flex justify-between">
          <b>微信公众号和微信小程序二维码设置</b>
          <el-button class="button"   @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="130px">
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="公众号二维码" prop="wechatImage">

              <el-upload
                  class="avatar-uploader"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleChange($event, 'wechat')"
                  :before-upload="beforeAvatarUpload"
              >
                <img v-if="formInline.wechatImage" :src="formInline.wechatImage" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>

            </el-form-item>
            <el-form-item label="小程序二维码" prop="weMiniProgramImage">
              <el-upload
                  class="avatar-uploader"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleChange($event, 'miniProgram')"
                  :before-upload="beforeAvatarUpload"
              >
                <img v-if="formInline.weMiniProgramImage" :src="formInline.weMiniProgramImage" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="在线客服地址" prop="chatOnline">
              <el-input v-model="formInline.chatOnline"></el-input>
            </el-form-item>
          </el-col>

        </el-row>


      </el-form>
    </el-card>
  </div>
</template>
<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
