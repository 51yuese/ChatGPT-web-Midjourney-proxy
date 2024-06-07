<route lang="yaml">
meta:
title: 管理员管理
</route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance,  } from 'element-plus'
import { ElMessage } from 'element-plus'
import ApiAccess from '@/api/modules/access'
import type { UserStatus } from '@/constants'
import {
  ACCESS_STATUS_MAP,
  ACCESS_STATUS_OPTIONS, ENABLE_STATUS_TYPE_MAP, MANGER_OPTIONS_MAP, MenuKeys, USER_STATUS_TYPE_MAP,

} from '@/constants'

import Manager from './components/manager.vue'
const formRef = ref<FormInstance>()
const total = ref(0)
const visible = ref(false)
const loading = ref(false)

const form = reactive({
  status: 0,
  id: 0,
})


const formInline = reactive({
  username: '',
  name: '',
  status: 0,
  page: 1,
  size: 20,
})

const managerRef = ref()


interface ManagerItem {
  id: number
  name: string;
  role: number
  status: 0 | 1 | 2
  managerStatus: 1 | 2
  username: string
  createdAt: Date
  updatedAt: Date
  access: string
}

const tableData = ref<ManagerItem[]>([])

async function queryAllUserList() {
  try {

    loading.value = true
    const res = await ApiAccess.queryAccessList(formInline)
    const { rows, count } = res.data
    loading.value = false
    total.value = count
    tableData.value = rows
  }
  catch (error) {
    loading.value = false
  }
}

async function handleUpdateStatus(row: ManagerItem) {

  const form = {
     id: row.id,
     status: row.managerStatus === 1 ? 2 : 1
  }

  const res: any = await ApiAccess.updateManagerStatus(form)
  res.success && ElMessage({ type: 'success', message: `管理员${row.managerStatus === 1 ? '停用' : '启用'}成功！` })

  await queryAllUserList()
}

async function handleUpdateAccess(param: { userId: number; }) {
  managerRef.value.open(param.userId);
}

function handlerReset(formEl: FormInstance | undefined) {
  Object.assign(formInline, {
    username: '',
    name: '',
    status: 0,
    page: 1,
    size: 20,
  });
  queryAllUserList()
}

async function handlerResetUserPass(row: { id: number, username: string }) {
  const { id } = row
  const res: any = await ApiAccess.resetUserPassword({ id })
  res.success && ElMessage({ type: 'success', message: `重置管理员[ ${row.username} ]密码为初始密码为[123456]完成！` })
  await queryAllUserList()
}

// 添加管理员
function  handleAddNewManager() {
  managerRef.value.open();
}


const getAccessName = (access: string) => {

  if (!access) {
    return "全部"
  }

  const acc = access && JSON.parse(access) || []
  return acc.map((item: string) => MenuKeys.map().get(item)).join("，")

}

const handlerDelete = async (param: {id: number}) => {

  await ApiAccess.deleteAccess({id: param.id})
  ElMessage.success('删除管理员成功！')
  await queryAllUserList()
}

const userRole = (role: string) => {
  return ['super', 'admin'].includes(role);
}

onMounted(() => queryAllUserList())

</script>

<template>
  <div>

    <Manager ref="managerRef" @fresh="queryAllUserList"></Manager>

    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">

        <el-form-item label="管理员账号" prop="name">
          <el-input v-model="formInline.username" placeholder="用户账号[模糊搜索]" clearable />
        </el-form-item>

        <el-form-item label="管理员状态" prop="status">
           <el-select v-model="formInline.status" style="width: 192px;">
             <el-option v-for="item in ACCESS_STATUS_OPTIONS" :label="item.label" :value="item.value"></el-option>
           </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryAllUserList">
            查询
          </el-button>
          <el-button @click="handlerReset(formRef)">
            重置
          </el-button>
        </el-form-item>

        <span style="float: right;">
          <el-button type="success" @click="handleAddNewManager">
            添加管理员
            <el-icon class="ml-3">
              <Plus />
            </el-icon>
          </el-button>
        </span>

      </el-form>
    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">
      <el-table v-loading="loading" border :data="tableData" height="66vh" width="100%" size="large">
        <el-table-column prop="id" label="管理员ID" width="100" />

        <el-table-column prop="username" label="登录账号"   />
        <el-table-column prop="password" label="登录密码"  />

        <el-table-column prop="managerStatus" label="管理员状态" align="center">
          <template #default="{ row }: { row: { managerStatus: UserStatus } }">
            <el-tag :type="USER_STATUS_TYPE_MAP[row.managerStatus]">
              {{ ACCESS_STATUS_MAP[row.managerStatus] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="角色" width="130" align="center"  >
          <template #default="{ row }: { row: { role: string } }">
            <p>{{MANGER_OPTIONS_MAP[row.role]}}</p>
          </template>
        </el-table-column>

        <el-table-column prop="accessLabel" label="权限" width="320" align="center" >
          <template #default="{ row }: { row: { accessLabel: string } }">
             <p>{{getAccessName(row.accessLabel)}}</p>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template #default="scope">

            <el-button link type="primary" size="small" :disabled="userRole(scope.row.role)" @click="handleUpdateAccess(scope.row)">
              编辑权限
            </el-button>

            <el-button link type="primary" size="small" :disabled="userRole(scope.row.role)" @click="handleUpdateStatus(scope.row)">
              {{ scope.row.managerStatus === 1 ? '停用' : '启用' }}
            </el-button>

            <el-popconfirm title="确认重置此用户密码为【123456】?" confirm-button-text="确认重置" @confirm="handlerResetUserPass(scope.row)">
              <template #reference>
                <el-button link type="danger" :disabled="userRole(scope.row.role)">
                  重置密码
                </el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm title="删除后不可找回，确定删除?" confirm-button-text="确认" @confirm="handlerDelete(scope.row)">
              <template #reference>
                <el-button link type="danger" :disabled="userRole(scope.row.role)" size="small" >
                  删除
                </el-button>
              </template>
            </el-popconfirm>

          </template>
        </el-table-column>
      </el-table>
      <el-row class="flex justify-end mt-5 pb-5">
        <el-pagination
            v-model:current-page="formInline.page"
            v-model:page-size="formInline.size"
            class="mr-5"
            :page-sizes="[15, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="queryAllUserList"
            @current-change="queryAllUserList"
        />
      </el-row>
    </page-main>


  </div>
</template>
