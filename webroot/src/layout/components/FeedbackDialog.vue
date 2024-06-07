<script setup lang='ts'>
import {
  NButton,
  NUpload,
  NGrid,
  NGridItem,
  NForm,
  NFormItemGi,
  useThemeVars,
  NProgress,
  NIcon,
  NSelect,
  NModal,
  NSkeleton,
  NSpace,
  NInput,
  useDialog,
  useMessage
} from 'naive-ui'
import {CloseOutline} from '@vicons/ionicons5'
import {computed, reactive, ref} from 'vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAuthStore, useGlobalStoreWithOut} from '@/store'
import {fetchFeedbackAdd} from "@/api/global";
import {fetchUploadImage} from "@/api/mjDraw";

defineProps<Props>()

const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(false)
const {isSmallMd} = useBasicLayout()

const message = useMessage()
const dialog = useDialog()

interface Props {
  visible: boolean,
}

function handleCloseDialog() {
  loading.value = false;
  Object.assign(form, {
    feedType: 'bug',
    description: '',
    telephone: '',
    wechat: '',
    images: []
  });
}

const formRef = ref()

const form = reactive<{
  feedType: string,
  description: string,
  telephone: string,
  wechat: string,
  images: string[],
}>({
  feedType: 'bug',
  description: '',
  telephone: '',
  wechat: '',
  images: [],
})

const feedBackList = [{label: "Bug反馈", value: 'bug'}, {label: "意见反馈", value: 'advice'}, {label: "建议反馈", value: 'suggestion'}]

const rules = {
  feedType: [{required: true, message: "必选", trigger: ['change']}],
  description: [{required: true, message: "必填", trigger: ['input']}],
  telephone: [{required: true, message: "必填", trigger: ['input']}],
}
const fileList = ref<File[]>([])
const fileType = ['jpg', 'jpeg','png'];
const handleChangeImage = (ev: { file: { status: string; type: string; id: string; file: string | Blob; }; fileList: { file: File }[] }) => {

  if (ev.file.status === "finished" || ev.file.status === "removed") return;

  const fileName = ev.file.type.split('/')[1];

  if (ev.file.status === "pending" && fileType.includes(fileName)) {
    const formData = new FormData()
    formData.append('filename', ev.file.id + '.' + fileName)
    formData.append('file', ev.file.file)
    formData.append('dir', 'feedback-upload');
    fetchUploadImage(formData).then(res => {
      form.images.push(res.data);
    })
  }

}

const handleBeforeUpload = (ev: { file: { name: string, type: string }; fileList: FileList[] }) => {
  const fileName = ev.file.type.split('/')[1];
  if (ev.fileList.length > 3) {
    message.warning("最多只能上传4张图片")
    return false;
  }
  return fileType.includes(fileName) && ev.fileList.length <= 3;
}

const handleRemove = (ev: { file: { id: string; status: string; type: string; url: string; }; }) => {

  if (ev.file.status === "finished") {
    form.images = form.images.filter(item => item.search(ev.file.url) === -1);
    return;
  }

  const id = ev.file.id;
  const fileName = ev.file.type.split('/')[1];
  const name = id + '.' + fileName;
  form.images = form.images.filter(item => item.search(name) === -1);

}

const handleClose = () => {
  Object.assign(form, {
    feedType: 'bug',
    description: '',
    telephone: '',
    wechat: '',
    images: []
  });
  useGlobalStore.updateFeedbackDialog(false)
  loading.value = false;
}

const handleSubmit = () => {
  formRef.value.validate(async (res: any) => {

    if (res) {
       return
    }
    loading.value = true;
    const result = await fetchFeedbackAdd({...form, images: form.images.join("|")}).then(res => {
      return res.data
    })

    message.success("反馈成功");
    handleClose();

  })
}

</script>

<template>
  <NModal :show="visible"
          role="dialog"
          preset="dialog"
					class="dark:bg-[#15171A] bg-[#FFFFFF]"
          title="意见反馈"
          :close-on-esc="false"
          :mask-closable="false"
          :show-icon="false"
          @close="handleClose"
          :style="{ maxWidth: `800px`, minWidth: isSmallMd ? '100%' : '700px' }"
          :on-after-leave="handleCloseDialog">

    <div class="p-4 bg-white rounded dark:bg-[#15171A] max-h-4/5" >

      <NForm ref="formRef"
             :model="form"
             :rules="rules"
             :size="'medium'"
             label-placement="top">

        <n-grid :cols="1">
          <n-form-item-gi :span="12" label="反馈类型" path="feedType">
						<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
							<n-select v-model:value="form.feedType" placeholder="请选择反馈类型" :options="feedBackList"/>
						</div>
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="详细描述" path="description">
						<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
							<n-input type="textarea" v-model:value="form.description" show-count maxlength="2000" rows="5" placeholder="请输入详细描述"/>
						</div>
          </n-form-item-gi>

          <n-form-item-gi :span="12" label="截图上传" path="images">
            <div class="flex-1">
              <n-upload
                  accept=".jpg,.jpeg,.png"
                  action=""
                  :disabled="form.images.length >= 4"
                  :default-file-list="fileList"
                  :default-upload="false"
                  :on-change="handleChangeImage"
                  :on-before-upload="handleBeforeUpload"
                  :on-remove="handleRemove"
                  list-type="image-card"
              >
              </n-upload>
              <p class="text-[12px] mt-1">单张照片大小不超过2M，最多4张</p>
            </div>


          </n-form-item-gi>

          <n-form-item-gi :span="12" label="联系电话" path="telephone">
						<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
							<n-input v-model:value="form.telephone" maxlength="11" placeholder="请输入您的联系电话"/>
						</div>

          </n-form-item-gi>

          <n-form-item-gi :span="12" label="您的微信" path="wechat">
						<div class="dark:bg-[#010102] bg-[#f4f4f4] w-full">
							<n-input v-model:value="form.wechat" placeholder="请输入您的微信号"/>
						</div>
          </n-form-item-gi>
        </n-grid>

      </NForm>

      <div class="mt-4 flex items-center justify-end space-x-4">
        <NButton  class="w-full" type="primary" round @click="handleSubmit" :loading="loading">
          提交反馈
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped lang="less">
	.n-input{
		background-color: transparent;
		//--n-border: 0px solid rgb(224, 224, 230) !important;
	}
	/deep/.n-base-selection-label{
		background-color: transparent !important;
	}

</style>
