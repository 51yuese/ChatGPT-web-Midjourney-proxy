<route lang="yaml">
meta:
  title: 提示词预设
</route>

<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import ApiMj from '@/api/modules/mj'
import {Upload} from "@element-plus/icons-vue";
import {useUploader} from "@/views/mjDraw/use/useUploader";
import {deepClone} from "@/utils";

const formRef = ref<FormInstance>()
const total = ref(0)
const loading = ref(false)
const modelLoading = ref(false)

const formPackageRef = ref<FormInstance>()
const activePromptId = ref(0)
const formPackage = reactive({
  isCarryParams: true,
  status: true,
  title: '',
  order: 100,
  prompt: '',
  imageUrl: '',
  aspect: '16:9'
})

interface AspectItem {
  aspect: string
}

const aspectList = ref<AspectItem[]>([
  { aspect: '1:1' },
  { aspect: '4:3' },
  { aspect: '3:4' },
  { aspect: '16:9' },
  { aspect: '9:16' },
])


const rules = reactive<FormRules>({
  isCarryParams: [{ required: true, message: '请选择你是否需要携带参数', trigger: 'change' }],
  status: [{ required: true, message: '请选择提示词开启状态', trigger: 'change' }],
  title: [{ required: true, message: '请填写您的提示词信息', trigger: 'blur' }],
  order: [{ required: true, message: '请填写您的排序id 越大越靠前', trigger: 'blur' }],
  prompt: [{ required: true, message: '请填写提示词详细内容', trigger: 'change' }],
  imageUrl: [{ required: true, message: '请输入图片URL或上传文件', trigger: 'change' }],
  aspect: [{ required: true, message: '请选择图片比例', trigger: 'change' }],
})

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activePromptId.value = 0
  formEl?.resetFields()
}
const visible = ref(false)
const dialogTitle = computed(() => {
  return activePromptId.value ? '更新提示词' : '新增提示词'
})

const dialogButton = computed(() => {
  return activePromptId.value ? '确认更新' : '确认新增'
})

const tableData = ref([])


/* 查询所有内容 */
async function queryAllPrompts() {
  try {
    loading.value = true
    const res = await ApiMj.queryPrompts()
    loading.value = false
    tableData.value = res.data
  }
  catch (error) {
    loading.value = false
  }
}

async function handleDeletePrompt(row: any) {
  const { id } = row
  await ApiMj.delPrompt({ id })
  ElMessage({ type: 'success', message: '操作完成！' })
  queryAllPrompts()
}

function handleEditPrompt(row: any) {
  activePromptId.value = row.id
  const { status, title, prompt, order, imageUrl, isCarryParams, aspect } = row
  nextTick(() => {
    Object.assign( formPackage, {status, title, prompt, imageUrl, order, isCarryParams, aspect })
  })
  visible.value = true
}

async function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      const params: any = deepClone(formPackage)
      delete params.id
      activePromptId.value && ( params.id = activePromptId.value )
      await ApiMj.setPrompt(params)
      ElMessage({ type: 'success', message: '操作成功！' })
      activePromptId.value = 0
      visible.value = false
      queryAllPrompts()
    }
  })
}

const { selectFile, upload} = useUploader();

// 选择图片上传
const handleUploadImage = async() => {
  const result = await selectFile();
  const uploadRes = await upload({file: result}).then(res => res.data)
  console.log(uploadRes);
  formPackage.imageUrl = uploadRes;
  ElMessage({ type: 'success', message: '上传图片成功！' })
}

onMounted(() => {
  queryAllPrompts()
})
</script>

<template>
  <div>
    <page-main class="header" bottomPadding="20px">
      <el-alert show-icon title="Ai智能封面说明" :closable="false" description="此处的封面图将会在用户端的展示出来、用户点击你给与的预设可以一键绘制！" type="success" />
      <el-button type="success" class="ml-3" size="large" @click="visible = true">
        添加预设
        <el-icon class="ml-3">
          <Plus />
        </el-icon>
      </el-button>
    </page-main>

    <page-main   bottomPadding="20px" bottomMargin="0px">
      <el-table v-loading="loading" border :data="tableData" height="69vh" style="width: 100%;" size="large">
        <el-table-column prop="title" label="提示词名称" width="180" />
        <el-table-column prop="aspect" label="图片比例" width="180" />
        <el-table-column prop="imageUrl" label="图片" width="180"  >
          <template #default="scope">
              <el-image :src="scope.row.imageUrl" lazy></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="prompt" label="提示词内容" >
          <template #default="scope">
            <div class="overflow-y-scroll w-full whitespace-nowrap">{{ scope.row.prompt }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" align="center" label="提示词状态" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '开启中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isCarryParams" align="center" label="携带用户的参数"  width="150">
          <template #default="scope">
            <el-tag :type="scope.row.isCarryParams ? 'success' : 'warning'">
              {{ scope.row.isCarryParams ? '携带' : '不携带' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order" align="center" label="排序ID" width="90" />
        <el-table-column fixed="right" label="操作" align="center" width="180">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEditPrompt(scope.row)">
              变更
            </el-button>
            <el-popconfirm title="确认删除此提示词么?" width="180" icon-color="red" @confirm="handleDeletePrompt(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </page-main>

    <el-dialog v-model="visible" :close-on-click-modal="false" :title="dialogTitle" width="770" @close="handlerCloseDialog(formPackageRef)">
      <el-form
        ref="formPackageRef"
        v-loading="modelLoading"
        label-position="right"
        label-width="120px"
        :model="formPackage"
        :rules="rules"
      >
        <el-form-item label="启用状态" prop="status">
          <el-switch v-model="formPackage.status"/>
        <el-tooltip
          class="box-item"
          effect="dark"
          placement="right"
        >
          <template #content>
            <div style="width: 250px;">
              关闭当前提示词、用户端将不再展示！
            </div>
          </template>
          <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
        </el-tooltip>
        </el-form-item>
        <el-form-item label="携带左侧参数" prop="isCarryParams">
          <el-switch  v-model="formPackage.isCarryParams"/>
        <el-tooltip
          class="box-item"
          effect="dark"
          placement="right"
        >
          <template #content>
            <div style="width: 250px;">
              携带左侧参数将会对提示词的参数复写、不携带则以自定义提示词中的指令参数为准！
            </div>
          </template>
          <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
        </el-tooltip>
        </el-form-item>
        <el-form-item label="排序Order" prop="order">
          <el-input v-model="formPackage.order" placeholder="排序id越大越靠前" />
        </el-form-item>
        <el-form-item label="提示词名称" prop="title">
          <el-input v-model="formPackage.title" placeholder="请填写提示词名称（用户看到的名称）" />
        </el-form-item>
        <el-form-item label="图片URL" prop="imageUrl">
          <el-input v-model="formPackage.imageUrl" placeholder="请填写在线图片URL或上传本地图片" >
            <template #append>
              <el-button :icon="Upload" @click="handleUploadImage">上传图片</el-button>
            </template>
          </el-input>

        </el-form-item>
        <el-form-item label="图片比例" prop="aspect">
          <el-select v-model="formPackage.aspect" placeholder="请选择图片比例" style="width: 100%;">
            <el-option v-for="item in aspectList" :key="item.aspect" :label="item.aspect" :value="item.aspect" />
          </el-select>
        </el-form-item>
        <el-form-item label="提示词内容" prop="proxyUrl">
          <el-input type="textarea" :rows="4" v-model="formPackage.prompt" placeholder="请填写提示词详细内容！" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="flex justify-end mr-5">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handlerSubmit(formPackageRef)">
            {{ dialogButton }}
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>


<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
