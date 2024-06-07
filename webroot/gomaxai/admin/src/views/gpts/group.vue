<route lang="yaml">
meta:
title: 模型列表
</route>

<script lang="ts" setup>
import {computed, onMounted, reactive} from 'vue'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import ApiGpts from '@/api/modules/gpts'
import {utcToShanghaiTime} from '@/utils/utcformatTime'

import {DEDUCTTYPELIST, QUESTION_STATUS_OPTIONS} from '@/constants'
import apiSystem from "@/api/modules/system";
import {deepClone} from "@/utils";

const formRef = ref<FormInstance>()
const total = ref(0)
const visible = ref(false)
const loading = ref(false)
const modelLoading = ref(false)

const formInline = reactive({
  groupName: '',
  status: undefined,
  page: 1,
  size: 10,
})

const formPackageRef = ref<FormInstance>()
const activeModelKeyId = ref(0)

const formPackage = reactive({
  groupName: '',
  groupLogo: '',
  status: 1,
  sort: 0,
})

const rules = reactive<FormRules>({
  groupName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  groupLogo: [{ required: true, message: '分类LOGO不能为空', trigger: 'blur' }],

})

function handlerCloseDialog(formEl: FormInstance | undefined) {
  activeModelKeyId.value = 0
  formEl?.resetFields()
}


const dialogTitle = computed(() => {
  return activeModelKeyId.value ? '更新分类' : '新增分类'
})

const dialogButton = computed(() => {
  return activeModelKeyId.value ? '确认更新' : '确认新增'
})

const tableData = ref([])

async function queryModelsList() {
  try {
    loading.value = true
    const res = await ApiGpts.queryGptsGroup(formInline)
    loading.value = false
    const { rows, count } = res.data
    total.value = count
    tableData.value = rows
  }
  catch (error) {
    loading.value = false
  }
}

async function handleDeleteKey(row: any) {
  const { id } = row
  await ApiGpts.removeGptsGroup({ id })
  ElMessage({ type: 'success', message: '操作完成！' })
  queryModelsList()
}

function handleEditKey(row: any) {
  activeModelKeyId.value = row.id
  const { groupName, groupLogo, status, sort } = row
  nextTick(() => {
    Object.assign(formPackage, { groupName, groupLogo, status, sort })
  });

  visible.value = true
}

function handlerReset(formEl: FormInstance | undefined) {
  formEl?.resetFields()
  queryModelsList()
}

const handleChange = (ev: any) => {
  const imageType = ev.name.split(".")[1]
  const formData = new FormData()
  formData.append('filename', ev.raw.uid + '.' + imageType)
  formData.append('file', ev.raw)
  formData.append('dir', 'gpts-logo');

  apiSystem.uploadFile(formData).then(res => {
    formPackage.groupLogo = res.data
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

async function handlerSubmit(formEl: FormInstance | undefined) {

  formEl?.validate(async (valid) => {

    if (valid) {

      const params: any = deepClone(formPackage)
      delete params.id
      if ( activeModelKeyId.value ) {
        await ApiGpts.modifyGptsGroup({id: activeModelKeyId.value, ...params})
      } else {
        await ApiGpts.addGptsGroup(params)
      }
      ElMessage({ type: 'success', message: '操作成功！' })
      activeModelKeyId.value = 0
      visible.value = false
      queryModelsList()
    }
  })
}

onMounted(() => {
  queryModelsList()
})
</script>

<template>
  <div>
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">
        <el-form-item label="分类名称" prop="groupName">
           <el-input v-model="formInline.groupName" placeholder="分类名称" clearable></el-input>
        </el-form-item>

        <el-form-item label="启用状态" prop="status">
          <el-select v-model="formInline.status" placeholder="请选择启用状态" clearable style="width: 192px;">
            <el-option v-for="item in QUESTION_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryModelsList">
            查询
          </el-button>
          <el-button @click="handlerReset(formRef)">
            重置
          </el-button>
        </el-form-item>
        <span style="float: right;">

          <el-button type="success" @click="visible = true">
            添加分类
            <el-icon class="ml-3">
              <Plus />
            </el-icon>
          </el-button>
        </span>
      </el-form>
    </page-main>

    <page-main bottomPadding="20px">
      <el-alert show-icon  :closable="false" title="分类说明" type="success" >
        用于对应用归类，分为普通应用和GPTS应用。
        <span style="color: red">当前版本已停用分类key，请将分类key迁移至模型池设置-应用模型中，下个版本将不再显示相关属性！</span>
      </el-alert>
    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">
      <el-table v-loading="loading" height="52vh" border :data="tableData" style="width: 100%;" size="large">

        <el-table-column prop="groupName" label="分类名称"  width="180"/>
        <el-table-column prop="groupLogo" align="center" label="启用状态" width="80">
          <template #default="scope">
            <img :src="scope.row.groupLogo" alt="" srcset="" style="width: 24px;">
          </template>
        </el-table-column>

        <el-table-column prop="status" align="center" label="启用状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '使用中' : '已暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="分类绑定KEY"  width="460">
          <template #default="scope">
            <div class="overflow-y-scroll w-full whitespace-nowrap">{{ scope.row.key }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重"  width="90" align="center"/>
        <el-table-column prop="deductType" align="center" label="扣费类型" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.deductType === 1 ? 'success' : 'warning'">
              {{ scope.row.deductType === 1 ? '普通余额' : '高级余额' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="deduct" align="center" label="单次扣除" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.deductType === 1 ? 'success' : 'warning'">
              {{ `${scope.row.deduct} 余额` }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="useCount" align="center" label="调用次数" width="90" />
        <el-table-column prop="useToken" align="center" label="已使用Token"  width="120" />

        <el-table-column prop="status" align="center" label="组状态" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常工作' : scope.row.status === -1 ? '已被封禁' : '余额耗尽 ' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" align="center" label="添加时间" width="120">
          <template #default="scope">
            {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEditKey(scope.row)">
              变更
            </el-button>
            <el-popconfirm title="确认删除此分类么?" width="180" icon-color="red" @confirm="handleDeleteKey(scope.row)">
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
        <el-pagination
            v-model:current-page="formInline.page"
            v-model:page-size="formInline.size"
            class="mr-5"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="queryModelsList"
            @current-change="queryModelsList"
        />
      </el-row>
    </page-main>


    <el-dialog v-model="visible"
               :close-on-click-modal="false"
               :title="dialogTitle"
               width="1000"
               @close="handlerCloseDialog(formPackageRef)">

      <el-form
          ref="formPackageRef"
          v-loading="modelLoading"
          label-position="right"
          label-width="120px"
          :model="formPackage"
          :rules="rules"
      >

        <el-row>
          <el-col :span="12">
            <el-form-item label="分类名称" prop="groupName">
              <el-input v-model="formPackage.groupName" placeholder="请填写分类中文名称" />
            </el-form-item>
            <el-form-item label="应用Logo" prop="groupLogo">
              <el-upload class="logo-uploader" action="" :auto-upload="false" :show-file-list="false"
                @change="handleChange($event)" :before-upload="beforeAvatarUpload">
                <img v-if="formPackage.groupLogo" :src="formPackage.groupLogo" class="avatar" />
                <el-icon v-else class="logo-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <el-input style="margin-top: 10px;" v-model="formPackage.groupLogo" placeholder="分类网络地址" />
            </el-form-item>
            <el-form-item label="显示排序" prop="sort">
              <el-input v-model="formPackage.sort" type="number"/>
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  placement="right"
              >
                <template #content>
                  <div style="width: 250px;">
                    显示排序，序号越大越靠后
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="启用状态" prop="status">
              <el-switch
                  :active-value="1"
                  :inactive-value="0"
                  v-model="formPackage.status"
              />
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  placement="right"
              >
                <template #content>
                  <div style="width: 250px;">
                    账号启用状态、一旦锁定当前key将停止工作！
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
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
</style>
