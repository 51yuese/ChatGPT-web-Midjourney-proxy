<route lang="yaml">
meta:
title: 模型列表
</route>

<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage, ElUpload, type FormInstance, type FormRules } from 'element-plus'
import ApiGpts from '@/api/modules/gpts'
import { utcToShanghaiTime } from '@/utils/utcformatTime'
import axios from 'axios'
import { QUESTION_STATUS_OPTIONS, MODEL_LIST } from '@/constants'
import { deepClone } from "@/utils";
import apiSystem from "@/api/modules/system";
import { useScroll } from '@/utils/useScroll'
const { scrollToBottomIfAtBottom } = useScroll();

const map = new Map<number, string>()
const formRef = ref<FormInstance>()
const formGptsModelRef = ref<FormInstance>()
const total = ref(0)
const visible = ref(false)
const loading = ref(false)
const modelLoading = ref(false)
const visibleStore = ref(false)

const formInline = reactive({
  modelName: '',
  status: null,
  back: 1,
  page: 1,
  size: 20,
})

const gptStore = reactive({
  title: "发现GPT"
})

const formPackageRef = ref<FormInstance>()
const activeModelKeyId = ref(0)

const gptsList = ref([])
// const modelName = ref<{[key: number]: string}>({})

const formPackage = reactive({
  sortId: 1,
  groupId: '',
  modelId: '',
  modelName: '',
  desc: '',
  logo: '',
  demoData: '',
  status: true,
  isDraw: false,
  canAudio: false,
  canUpload: false,
  gptsApp: false,
  recommend: false,
  useCount: 0,
  collectCount: 0,
  remark: '',
  relModel: ''
})

const modelGroup = ref<any[]>([])

const rules = reactive<FormRules>({
  groupId: [{ required: true, message: '请选择应用类别', trigger: 'blur' }],
  relModel: [{ required: true, message: '请选择关联模型', trigger: 'blur' }],
  gptsApp: [{ required: true, message: '请选择是否GPTS应用', trigger: 'blur' }, {
    validator(rule, value, callback) {
      if (value) {
        const selectedGroup = modelGroup.value.find(item => item.id === formPackage.groupId);
        if (!selectedGroup) {
          callback('请先选择应用类别')
        } else if (!selectedGroup.key) {
          callback('当前应用类别未配置GPTS key，请先配置应用类别GPTS key 或者使用其他类别')
        }
      }
      return callback()
    },
  }],
  modelName: [{ required: true, message: '请填写您的应用名称', trigger: 'blur' }],
  desc: [{ required: true, message: '请填写您的调用应用描述', trigger: 'blur' }],
  logo: [{ required: true, message: '请选择logo', trigger: 'blur' }],
  modelId: [{ required: true, message: '请填写您的调用模型的Id(官网产生的id)', trigger: 'blur' }],
  // appid: [{ required: true, message: '请填写您的调用模型的appid', trigger: 'blur' }],
  status: [{ required: true, message: '请选择key的启用状态', trigger: 'change' }],
  isDraw: [{ required: false, message: '请选择当前key是否作为基础绘画key', trigger: 'change' }],

})

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activeModelKeyId.value = 0
  formEl?.resetFields()
}

const dialogTitle = computed(() => {
  return activeModelKeyId.value ? '更新应用' : '新增应用'
})

const dialogButton = computed(() => {
  return activeModelKeyId.value ? '确认更新' : '确认新增'
})

const tableData = ref([])


async function queryModelsList() {
  try {
    loading.value = true
    const res = await ApiGpts.queryModels(formInline)
    loading.value = false
    const { rows, count } = res.data
    total.value = count;
    tableData.value = rows
  } catch (error) {
    loading.value = false
  }
}

async function handleDeleteKey(row: any) {
  const { id } = row
  await ApiGpts.delModels({ id })
  ElMessage({ type: 'success', message: '操作完成！' })
  queryModelsList()
}

function handleEditKey(row: any) {
  activeModelKeyId.value = row.id
  for (let p in formPackage) {
    formPackage[p] = row[p]
  }
  // const { modelName, groupId, demoData, sortId, status, modelId, desc, logo, canUpload, canAudio, isDraw, gptsApp,  } = row
  // nextTick(() => {
  //   Object.assign(formPackage, row)
  // })
  visible.value = true
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields()
  queryModelsList()
}


async function handlerSubmit(formEl: FormInstance | undefined) {

  formEl?.validate(async (valid) => {

    if (valid) {

      const params: any = deepClone(formPackage)
      delete params.id

      activeModelKeyId.value && (params.id = activeModelKeyId.value)

      await ApiGpts.setModels(params)

      ElMessage({ type: 'success', message: '操作成功！' })

      activeModelKeyId.value = 0
      visible.value = false
      queryModelsList()
    }
  })
}

async function queryModelGroupsList() {
  try {
    const res = await ApiGpts.queryGptsGroup({ page: 1, size: 20 }).then(res => res.data)
    const { rows } = res;
    modelGroup.value = rows;
    return true
  } catch (error) {
    loading.value = false
  }
}


const handleChange = (ev: any) => {

  const imageType = ev.name.split(".")[1]

  const formData = new FormData()
  formData.append('filename', ev.raw.uid + '.' + imageType)
  formData.append('file', ev.raw)
  formData.append('dir', 'gpts-logo');

  apiSystem.uploadFile(formData).then(res => {
    formPackage.logo = res.data
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

queryModelGroupsList()

onMounted(async () => {
  await queryModelsList();
})

// const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/search?q=${ st.value.q }`;
const queryGptsList = () => {

}

const queryGptsByPage = async () => {

  modelLoading.value = true;
  const gptUrl = `https://gpts.ddaiai.com/open/gptsapi/list/${gptsList.value.length}`;

  const list = await axios.get(gptUrl).then(res => res.data).then(res => res.data.list).then(res => res.map((item:any) => ({
    modelName: item.name,
    logo: item.logo,
    useCount: +item.use_cnt,
    modelId: item.gid,
    desc: item.info,
    checked: false
  })));

  gptsList.value = gptsList.value.concat(list);
  scrollToBottomIfAtBottom();
  modelLoading.value = false;

}

const handleToggleCheck = (item: { checked: boolean; }) => {
  item.checked = !item.checked;
}

const handleSelectAll = () => {
  const isAllTrue = gptsList.value.every(item => item.checked);
  if (isAllTrue) {
    gptsList.value.forEach(item => item.checked = false)
  } else {
    gptsList.value.forEach(item => item.checked = true)
  }
}

const handleSelectAllReverse = () => {
  const isAllTrue = gptsList.value.some(item => item.checked);
  if (isAllTrue) {
    gptsList.value.forEach(item => item.checked = false)
  } else {
    gptsList.value.forEach(item => item.checked = true)
  }
}

const handleSubmitAddToGroup = async () => {
  const list = gptsList.value.filter(item => item.checked);

  if (list.length === 0) {
    ElMessage.warning("未勾选GDP模型")
    return;
  }

  formGptsModelRef.value?.validate(async (valid) => {

    if (valid) {

      const { groupId, relModel } = formPackage;

      const data = list.map(item => ({ groupId, relModel, ...item }));

      const res = await ApiGpts.insertModelsBatch(data).then(res => res.data)
      res && ElMessage.success("批量添加成功")
      activeModelKeyId.value = 0
      queryModelsList()
    }
  })

}

const handleLoadMore = () => {
  queryGptsByPage();
}

</script>

<template>
  <div>
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">

        <el-form-item label="应用名称" prop="modelName">
          <el-input v-model="formInline.modelName" placeholder="应用名称" clearable></el-input>
        </el-form-item>

        <el-form-item label="应用分类" prop="groupId">
          <el-select v-model="formInline.groupId" placeholder="应用分类" clearable style="width: 192px">
            <el-option v-for="item in modelGroup" :key="item.id" :label="item.groupName" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="启用状态" prop="status">
          <el-select v-model="formInline.status" placeholder="请选择启用状态" clearable style="width: 192px">
            <el-option v-for="item in QUESTION_STATUS_OPTIONS" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryModelsList">
            查询
          </el-button>
          <el-button @click="handlerReset(formRef)">
            重置
          </el-button>

          <el-button @click="visibleStore = true" type="success">
            发现GPTS应用
          </el-button>
        </el-form-item>
        <span style="float: right;">
          <el-button type="success" @click="visible = true">
            手动添加应用
            <el-icon class="ml-3">
              <Plus />
            </el-icon>
          </el-button>
        </span>
      </el-form>
    </page-main>
    <page-main bottomPadding="20px">
      <el-alert show-icon :closable="false" title="KEY池说明"
        description="所有key会根据你所选的应用自动分类、会以第一个加入的key为标准、建议所有同模型的key参数配置相同、否则可能特殊场景会有迷惑性。不同模型可以设置不同的扣费类型以及单次调用扣除的额度、额度不再以次为单位、改为(积分)概念！你可以设置模型最大上限和回复上限、以及最大轮次用以限制用户的最大上下文、当限制token后、用户端可选范围受其影响、轮次同理、到达轮次之后会移除掉更靠前的上下文！"
        type="success" />
    </page-main>
    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" height="52vh" border :data="tableData" style="width: 100%;" size="large">

        <el-table-column prop="modelName" label="应用名称" />

        <el-table-column prop="groupName" label="应用分类">
          <!--          <template #default="scope">-->
          <!--            <p>{{ scope.row.groupName }}</p>-->
          <!--          </template>-->
        </el-table-column>

        <el-table-column prop="modelId" label="GPTSId" />

        <el-table-column prop="status" align="center" label="启用状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '使用中' : '已暂停' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="desc" label="描述" align="center" />
        <el-table-column prop="logo" label="Logo" align="center">
          <template #default="scope">
            <el-image lazy :src="scope.row.logo" style="width: 80px; height: 80px; border-radius: 50%;"></el-image>
          </template>
        </el-table-column>


        <el-table-column prop="remark" align="center" label="备注">
          <template #default="scope">
            {{ scope.row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" align="center" label="添加时间">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEditKey(scope.row)">
              变更
            </el-button>
            <el-popconfirm title="确认删除此应用么?" width="180" icon-color="red" @confirm="handleDeleteKey(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-row class="flex justify-end mt-5">
        <el-pagination v-model:current-page="formInline.page" v-model:page-size="formInline.size" class="mr-5"
          :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="queryModelsList" @current-change="queryModelsList" />
      </el-row>
    </page-main>

    <el-dialog v-model="visibleStore" lock-scroll top="30px" style="height: 90vh" :close-on-click-modal="false"
      :title="gptStore.title" width="1500" @open="queryGptsByPage" @close="visibleStore = false">
      <el-form ref="formGptsModelRef" label-position="right" inline :model="formPackage"
        :rules="rules">
        <el-form-item>
          <el-button type="primary" @click="handleSelectAll">全选</el-button>
          <el-button type="primary" @click="handleSelectAllReverse">反选</el-button>
        </el-form-item>
        <el-form-item label="添加到" prop="groupId">
          <el-select v-model="formPackage.groupId" placeholder="请选择应用分类" clearable fit-input-width
            style="width: 192px">
            <el-option v-for="item in modelGroup" :key="item.id" :label="item.groupName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用关联模型" prop="relModel">
          <el-select v-model="formPackage.relModel" filterable  clearable placeholder="请选用绑定的模型" style="width: 192px">
            <el-option
              v-for="item in MODEL_LIST"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmitAddToGroup">确认添加到分类</el-button>
        </el-form-item>
      </el-form>
      <div v-loading="modelLoading" v-if="modelLoading" style="height: 70vh;width: 100%;"></div>

      <div v-else style="height: 68vh; overflow-y: auto; overflow-x: hidden;">
        <el-row :gutter="10">
          <el-col :xs="8" :sm="6" :md="4" :lg="4" :xl="6" v-for="v in gptsList" ref="scrollRef">
            <div class="group cursor-pointer " @click="handleToggleCheck(v)">
              <div class="flex-1">
                <div class="left-text">
                  <h3 class="model-name"> {{ v.modelName }}</h3>
                  <el-tag type="success" size="small" round v-if="v.useCount && (+v.useCount) > 0">
                    <div class="flex items-center">
                      <SvgIcon name="hot" class="hot-icon"></SvgIcon>
                      {{ v.useCount }}
                    </div>
                  </el-tag>
                </div>

                <div class="line-clamp-2">{{ v.desc }}</div>
              </div>
              <div class="gpt-image">
                <el-image :src="v.logo" :preview-disabled="true" lazy class="image-icon">
                  <template #placeholder>
                    <div class="download-svg">
                      <SvgIcon name="downloading-loop" class="download"></SvgIcon>
                    </div>
                  </template>
                </el-image>
              </div>

              <div class="checked" v-if="v.checked">
                <div class="rotate">
                  <svg-icon class="correct-icon" name="correct"></svg-icon>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="center cursor-pointer" @click="handleLoadMore">
          <svg-icon name="down-round" style="width: 40px; height: 40px;"></svg-icon>
        </div>
      </div>

      <!--      <template #footer>-->
      <!--        <span class="flex justify-end mr-5">-->
      <!--          <el-button @click="visibleStore = false">关闭</el-button>-->
      <!--          &lt;!&ndash;          <el-button type="primary" @click="handlerSubmit(formPackageRef)">&ndash;&gt;-->
      <!--          &lt;!&ndash;            {{ dialogButton }}&ndash;&gt;-->
      <!--          &lt;!&ndash;          </el-button>&ndash;&gt;-->
      <!--        </span>-->
      <!--      </template>-->

    </el-dialog>

    <el-dialog v-model="visible" :close-on-click-modal="false" :title="dialogTitle" width="1000"
      @close="handlerCloseDialog(formPackageRef)">
      <el-form ref="formPackageRef" v-loading="modelLoading" label-position="right" label-width="120px"
        :model="formPackage" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="groupId">
              <el-select v-model="formPackage.groupId" placeholder="请选择应用所属分类" clearable fit-input-width
                style="width: 100%">
                <el-option v-for="item in modelGroup" :key="item.id" :label="item.groupName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用名称" prop="modelName">
              <el-input v-model="formPackage.modelName" placeholder="请填写应用中文名称（用户选择的）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用描述" prop="desc">
              <el-input v-model="formPackage.desc" placeholder="请填写应用描述" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注说明" prop="remark">
              <el-input v-model="formPackage.remark" placeholder="请填写应用备注" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否GPTS应用" prop="gptsApp">
              <el-select v-model="formPackage.gptsApp" placeholder="请选择应用类型" fit-input-width style="width: 100%"
                :disabled="Boolean(activeModelKeyId)">
                <el-option :key="1" :label="'是'" :value="true" />
                <el-option :key="2" :label="'否'" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formPackage.gptsApp">
            <el-form-item label="GPTS模型Id" prop="modelId">
              <el-input v-model="formPackage.modelId" placeholder="请填写GPTS模型Id号（官网创建后产生的Id）" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-else>
            <el-form-item label="应用关联模型" prop="relModel">
              <el-select v-model="formPackage.relModel" filterable allow-create clearable placeholder="请选用绑定的模型" style="width: 90%;">
                <el-option
                  v-for="item in MODEL_LIST"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
              <el-tooltip
                class="box-item"
                effect="dark"
                placement="right"
              >
                <template #content>
                  <div style="width: 250px;">
                    当前应用会使用当前模型类型下关联模型可用模型key，目前仅仅支持通用模型类型
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>

          <el-col :span="24"></el-col>
          <el-col :span="12">
            <el-form-item label="应用Logo" prop="logo">
              <el-upload class="logo-uploader" action="" :auto-upload="false" :show-file-list="false"
                @change="handleChange($event)" :before-upload="beforeAvatarUpload">
                <img v-if="formPackage.logo" :src="formPackage.logo" class="avatar" />
                <el-icon v-else class="logo-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <el-input style="margin-top: 10px;" v-model="formPackage.logo" placeholder="应用Logo网络地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="示例内容" prop="demoData">
              <el-input v-model="formPackage.demoData" type="textarea" placeholder="请填写应用的demo示例数据、每换行一次表示一个新的示例..."
                :rows="4" />
            </el-form-item>
            <el-col :span="24">
              <el-form-item label="排序权重" prop="sortId">
                <el-input v-model="formPackage.sortId" placeholder="请填写排序权重（越大越靠前，默认1）" />
              </el-form-item>
            </el-col>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预设热度" prop="useCount">
              <el-input v-model="formPackage.useCount" placeholder="请填写预设热度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预设收藏" prop="collectCount">
              <el-input v-model="formPackage.collectCount" placeholder="请填写预设收藏" />
            </el-form-item>
          </el-col>
          <el-col :span="24"></el-col>
          <!-- <el-col :span="6">
            <el-form-item label="是否绘画应用" prop="isDraw">
              <el-switch v-model="formPackage.isDraw" :active-value="true" :inactive-value="false" />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px;">
                    是否支持绘画功能
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item label="是否推荐" prop="recommend">
              <el-switch v-model="formPackage.recommend" :active-value="true" :inactive-value="false" />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px;">
                    推荐应用,前端将会推荐显示
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用上传" prop="canUpload">
              <el-switch v-model="formPackage.canUpload" :active-value="true" :inactive-value="false" />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px;">
                    启用上传,前端将具备上传文件的操作，请注意模型模型支持的情况启用才有效
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="6">
            <el-form-item label="启用语音" prop="canAudio">
              <el-switch v-model="formPackage.canAudio" :active-value="true" :inactive-value="false" />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px;">
                    启用语音,前端将具备上传音频文件的的操作，请注意模型模型支持的情况启用才有效
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item label="启用状态" prop="status">
              <el-switch :active-value="1" :inactive-value="0" v-model="formPackage.status" />
              <el-tooltip class="box-item" effect="dark" placement="right">
                <template #content>
                  <div style="width: 250px;">
                    应用启用状态、一旦锁定当前key将停止工作！
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>

        </el-row>
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

<style scoped lang="less">
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.group {
  position: relative;
  ;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  padding: 8px 16px;
  border-radius: 10px;
  background: #f7f7f7;
  margin-bottom: 0.6rem;

  .flex-1 {
    width: 100%;

    //display: flex;
    //flex: 1 auto auto;
    .left-text {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      ;
      text-overflow: ellipsis;

      .hot-icon {
        width: 14px;
        height: 14px;
      }

      .model-name {
        margin: 0 0 0.4rem 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1
      }
    }
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2
  }

  .download-svg {
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;

    .download {
      width: 70px;
      height: 70px;
    }
  }

  .gpt-image {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;

    .image-icon {
      border-radius: 50%;
    }

    &:hover {
      transition: .3s;
      scale: 1.2;
    }
  }

}

.checked {
  position: absolute;
  top: -14px;
  right: -36px;

  .rotate {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 90px;
    background: #409eff;
    transform: rotate(45deg);
    padding-top: 16px;

    .correct-icon {
      transform: rotate(-45deg);
      width: 24px;
      height: 24px;
      fill: #fff;
    }
  }
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  ;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
<style>
.logo-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.logo-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>
