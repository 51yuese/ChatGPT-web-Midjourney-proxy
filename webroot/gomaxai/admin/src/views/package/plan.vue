<route lang="yaml">
meta:
  title: 套餐类型
</route>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import ApiPackage from '@/api/modules/package'
import { IS_OPTIONS, IS_TYPE_MAP, PACKAGE_TYPE_OPTIONS } from '@/constants/index'
import { utcToShanghaiTime } from '@/utils/utcformatTime'

const formRef = ref<FormInstance>()
const total = ref(0)
const visible = ref(false)
const loading = ref(false)

const formInline = reactive({
  name: '',
  page: 1,
  size: 10,
})
const formPackageRef = ref<FormInstance>()
const activePackageId = ref(0)

interface Package {
  id?: number | null
  name?: string | null
  title?: string | null
  desc?: string | string[] | null
  status?: number | null
  order?: number | null
}

const formPackage = reactive({
  name: null,
  title: null,
  desc: null,
  order: null,
  status: null
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请填写套餐类型名称', trigger: 'blur' }],
  title: [{ required: true, message: '请填写细描述标题', trigger: 'blur' }],
  desc: [{ required: true, message: '请填写详细描述（回车换行）', trigger: 'blur' }],
  status: [{ required: true, message: '请选择开启状态', trigger: 'change' }],
})

const tableData = ref([])

async function queryAllUserList() {
  try {
    loading.value = true

    const res = await ApiPackage.queryPackageType()
    loading.value = false

    const { rows, count } = res.data
    total.value = count
    tableData.value = rows
  }
  catch (error) {
    loading.value = false
  }
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields()
  queryAllUserList()
}

async function handleDeletePackage({ id }) {
  await ApiPackage.delPackageType({ id })
  ElMessage({ type: 'success', message: '删除套餐类型成功！' })
  queryAllUserList()
}

function handleUpdatePackage(row: Package) {

  console.log(row);
  activePackageId.value = row.id as number
  nextTick(() => {

    const {title, desc, order, name, status} = row;

    Object.assign(formPackage, {title,  desc, order, name, status});

  })
  visible.value = true
}

const dialogTitle = computed(() => {
  return activePackageId.value ? '更新类型' : '新增类型'
})

const dialogButton = computed(() => {
  return activePackageId.value ? '确认更新' : '确认新增'
})

function handleCreatePkg() {
    if (tableData.value.length >= 2) {
        return ElMessage({ type: 'warn', message: '目前只能支持两类套餐！' })
    }
    activePackageId.value = 0
    visible.value = true
    formPackageRef.value?.resetFields()
}

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activePackageId.value = 0
  formEl?.resetFields()
}

async function handlerSubmit(formEl: FormInstance | undefined) {
  formEl?.validate(async (valid) => {
    if (valid) {
      if (activePackageId.value) {
        await ApiPackage.updatePackageType({ id: activePackageId.value, ...formPackage })
        ElMessage({ type: 'success', message: '更新类型成功！' })
      }
      else {
        await ApiPackage.createPackageType(formPackage)
        ElMessage({ type: 'success', message: '创建新的类型成功！' })
      }
      visible.value = false
      queryAllUserList()
    }
  })
}

onMounted(() => {
  queryAllUserList()
})
</script>

<template>
  <div>

    <page-main bottomPadding="20px">
      <div class="header">
        <el-alert :closable="false"
                  show-icon title="新版套餐类型说明"
                  description="新版本套餐分为不限时套餐和限时套餐！" type="success" />

        <el-button type="success" style="float: right;" @click="handleCreatePkg">
          添加类型
          <el-icon class="ml-3">
            <Plus />
          </el-icon>
        </el-button>
      </div>

    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" border :data="tableData" height="62vh" style="width: 100%;" size="large">

        <el-table-column fixed prop="name" label="名称"   />

        <el-table-column prop="order" label="排序ID" align="center" />

        <el-table-column prop="status" label="状态"  >
          <template #default="scope">
            <el-tag :type="IS_TYPE_MAP[scope.row.status]">
              {{ IS_OPTIONS[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="描述标题"   />

        <el-table-column prop="description" label="描述内容"  />

        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>


        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">

            <el-button link type="primary" size="small" @click="handleUpdatePackage(scope.row)">
              修改类型
            </el-button>
            <el-popconfirm title="确认删除此套餐类型么?" width="200" icon-color="red" @confirm="handleDeletePackage(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small">
                  删除类型
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-row class="flex justify-end mt-5">
        <el-pagination
          v-model:current-page="formInline.page"
          v-model:page-size="formInline.size"
          class="mr-5"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="queryAllUserList"
          @current-change="queryAllUserList"
        />
      </el-row>
    </page-main>

    <el-dialog v-model="visible"
               :close-on-click-modal="false"
               :title="dialogTitle"
               width="600"
               @close="handlerCloseDialog(formPackageRef)">
      <el-form
        ref="formPackageRef"
        label-position="right"
        label-width="120px"
        :model="formPackage"
        :rules="rules"
      >
        <el-row :gutter="20">

          <el-col :span="24">

            <el-form-item label="类型名称" prop="name">
              <el-input v-model="formPackage.name" placeholder="请填写套餐类型名称" />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="formPackage.status"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>

            <el-form-item label="设置排序" prop="order">
              <el-input v-model.number="formPackage.order" type="number" placeholder="排序数字越大越靠前|套餐权重等级则反之" />
            </el-form-item>

            <el-form-item label="描述标题" prop="title">
              <el-input v-model="formPackage.title"  placeholder="请填写详细描述的标题..." />
            </el-form-item>

            <el-form-item label="描述详情" prop="desc">
              <el-input v-model="formPackage.desc" type="textarea" placeholder="请填写类型详细介绍信息、用于对外展示、建议控制套餐价格字数以便于用户端对齐格式..." :rows="6" />
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

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
