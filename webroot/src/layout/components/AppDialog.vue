<script setup lang='ts'>
import {
  NButton,
  NUpload,
  NForm,
  NIcon,
  NSelect,
  NModal,
  NInput,
  useDialog,
  useMessage, NFormItem, NSwitch, NTooltip, FormRules
} from 'naive-ui'

import {computed, reactive, ref} from 'vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useAppCatStoreWithOut, useAppStore, useAuthStore, useGlobalStoreWithOut} from '@/store'
import {fetchUploadImage} from "@/api/mjDraw";
import {CloseOutline} from "@vicons/ionicons5";
import {SvgIcon} from "@/components/common";
import {useRouter} from "vue-router";
import {ResData} from "@/api/types";
import {fetchCustomAppAPI, fetchQueryAppCatsAPI} from "@/api/appStore";

defineProps<Props>()

const authStore = useAuthStore()
const useGlobalStore = useGlobalStoreWithOut()
const loading = ref(false)
const {isSmallMd} = useBasicLayout()

const message = useMessage()
const dialog = useDialog()
const appCatStore = useAppCatStoreWithOut()

interface Props {
  visible: boolean,
}

const formRef = ref()


const fileList = ref<File[]>([])
const fileType = ['jpg', 'jpeg', 'png'];


const handleChangeImage = (ev: { file: { status: string; type: string; id: string; file: string | Blob; }; fileList: { file: File }[] }) => {

  if (ev.file.status === "finished" || ev.file.status === "removed") return;

  const fileName = ev.file.type.split('/')[1];

  if (ev.file.status === "pending" && fileType.includes(fileName)) {
    const formData = new FormData()
    formData.append('filename', ev.file.id + '.' + fileName)
    formData.append('file', ev.file.file)
    formData.append('dir', 'feedback-upload');
    fetchUploadImage(formData).then(res => {
      appForm.value.coverImg = res.data
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
    // appForm.value.coverImg =  appForm.value.coverImg.filter(item => item.search(ev.file.url) === -1);
    return;
  }

  const id = ev.file.id;
  const fileName = ev.file.type.split('/')[1];
  const name = id + '.' + fileName;
  // appForm.value.coverImg =  appForm.value.coverImg.filter(item => item.search(name) === -1);

}

const handleClose = () => {
  Object.assign(appForm, defaultForm());
  appCatStore.updateAppDialog(false)
  loading.value = false;
}


const defaultForm = () => {
  return {
    catId: null,
    name: null,
    preset: null,
    des: null,
    demoData: '',
    coverImg: '',
    public: false,
  }
}

const appForm = ref(defaultForm())

const rules: FormRules = {
  catId: [
    {required: true, message: '请选择分类',  },
  ],
  name: [
    {required: true, message: '请输入应用名称', trigger: 'input'},
    {min: 2, max: 30, message: '长度应为2到10个字符之间', trigger: 'input'},
  ],
  preset: [
    {required: true, message: '请输入预设prompt', trigger: 'input'},
    {min: 6, max: 1200, message: '长度应为6到1200个字符之间', trigger: 'input'},
  ],
  des: [
    {required: true, message: '请输入简短的应用描述', trigger: 'input'},
    {max: 50, message: '长度应为0到50个字符之间', trigger: 'input'},
  ],
  demoData: [
    {required: true, message: '请输入示例数据、按回车换行表示新增一条', trigger: 'input'},
    {max: 100, message: '长度应为0到100个字符之间', trigger: 'input'},
  ],
  coverImg: [
    {required: true, message: '请上传应用Logo', trigger: 'change'},
  ],
  public: [
    {required: true, message: '请选择是否公开'},
  ],
}

const activeAppId = ref(0)
const isAllowEditAppPublic = ref(false)

const {isMobile} = useBasicLayout()
const ms = useMessage()
const router = useRouter()
const catList = ref([])
const appStore = useAppStore();
const theme = computed(() => appStore.theme);

async function queryCats() {
  catList.value = await fetchQueryAppCatsAPI().then(res => res.data.rows)
}


function handlerSubmit() {
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      const params: any = appForm.value
      activeAppId.value && (params.appId = activeAppId.value)
      const res: ResData = await fetchCustomAppAPI(params)
      const msg = activeAppId.value ? '个人应用修改完成！' : '个人应用创建完成！'
      res.success && ms.success(msg)
      await appCatStore.queryMineApps()
      handleResetState()
      handleClose();
    }
  })
}

function handleResetState() {
  activeAppId.value = 0
  isAllowEditAppPublic.value = false
  appForm.value = defaultForm()
}
</script>

<template>

  <NModal :show="visible"
          title="创建应用"
          style="width: 100%; max-width: 640px"
          :mask-closable="false"
          :on-after-enter="queryCats"
          :on-after-leave="handleClose">
    <div class="p-5 bg-white rounded dark:bg-[#3E3E64]">
      <div class="absolute top-4 left-5 cursor-pointer z-30">
        <span class="font-bold text-base">创建应用</span>
      </div>
      <div class="absolute top-3 right-3 cursor-pointer z-30" @click="handleClose">
        <NIcon size="20" :color="theme === 'dark' ? '#fff' : '#333'">
          <CloseOutline/>
        </NIcon>
      </div>
      <div class="pt-5 mt-6">
        <NForm
            ref="formRef"
            :model="appForm"
            :rules="rules"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
            :style="{ maxWidth: '640px' }"
        >
          <NFormItem label="应用分类" path="catId">
            <NSelect
                v-model:value="appForm.catId"
                clearable
                size="small"
                label-field="name"
                placeholder="请选择应用分类"
                value-field="id"
                :options="catList"
            />
          </NFormItem>
          <NFormItem label="应用名称" path="name">
            <NInput v-model:value="appForm.name" placeholder="请输入您的应用名称" type="name" :maxlength="30"
                    show-name-on="click" tabindex="0"/>
          </NFormItem>
          <NFormItem label="预设指令" path="preset">
            <NInput
                v-model:value="appForm.preset"
                :max="255"
                :autosize="{
                minRows: 3,
                maxRows: 10,
              }"
                type="textarea"
                placeholder="请填写prompt预设指令（核心）"
            />
          </NFormItem>
          <NFormItem label="应用描述" path="des">
            <NInput
                v-model:value="appForm.des" :autosize="{
                minRows: 3,
                maxRows: 10,
              }" type="textarea" placeholder="请对你的应用做以简要的描述以便于大家认识它！"
            />
          </NFormItem>
          <NFormItem label="示例内容" path="demoData">
            <NInput
                v-model:value="appForm.demoData" :autosize="{
                minRows: 3,
                maxRows: 10,
              }" type="textarea"
                placeholder="请填写一个示例、方便快速告诉别人如何使用、每点击回车换行一次则是新增一条示例！"
            />
          </NFormItem>
          <NFormItem label="应用Logo" path="coverImg">

            <n-upload
                accept=".jpg,.jpeg,.png"
                action=""
                :max="1"
                :default-file-list="fileList"
                :default-upload="false"
                :on-change="handleChangeImage"
                :on-before-upload="handleBeforeUpload"
                :on-remove="handleRemove"
                list-type="image-card"
            >
              点击上传
            </n-upload>

          </NFormItem>
          <NFormItem label="是否共享" path="public">
            <NSwitch v-model:value="appForm.public" :disabled="isAllowEditAppPublic"/>
            <NTooltip placement="top-start" trigger="hover">
              <template #trigger>
                <SvgIcon icon="ri:error-warning-line" class="text-base ml-3 cursor-pointer"/>
              </template>
              <p>Tips: 请知悉 </p>
              <p>选择共享提交之后审核状态将无法编辑应用</p>
              <p>审核通过的应用将会在应用广场公开展示</p>
              <p>管理审核通过后将会赠送一定的站内额度奖励用户</p>
              <p>一旦提交处于审核中、您将不能再编辑此应用</p>
            </NTooltip>
          </NFormItem>

          <NFormItem class="mt-3">
            <NButton
                block
                type="primary"
                :disabled="loading"
                :loading="loading"
                @click="handlerSubmit"
            >
              提交
            </NButton>
          </NFormItem>
        </NForm>
      </div>
    </div>
  </NModal>
</template>
