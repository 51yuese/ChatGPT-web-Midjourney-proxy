<route lang="yaml">
meta:
  title: MJ账号管理
</route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import MjManger from './components/mjManger.vue'
import MjDetail from './components/mjDetail.vue'
import type { FormInstance, FormRules } from 'element-plus'

import {
  ACCESS_STATUS_OPTIONS,
  MJ_STATUS_OPTIONS,
  USER_STATUS_TYPE_MAP,
  UserStatus
} from "@/constants";
import {array2Obj} from "@/utils";
import ApiMj from "@/api/modules/mj";
import {formatTime} from "@/utils/dayjs";
const mjDetailRef = ref();
const mjManagerRef = ref();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const modeMap = array2Obj(MJ_STATUS_OPTIONS);
const enableMap = array2Obj(ACCESS_STATUS_OPTIONS);

const formInline = reactive({
  account: '',
  channelId: '',
  enable: 0,
  page: 1,
  size: 20,
})

const formRef = ref<FormInstance>()

 const queryAllMjAccountList = async() => {
  try {

    loading.value = true
    const res = await ApiMj.queryMjParamByPage(formInline)
    const { rows, count } = res.data
    loading.value = false
    total.value = count
    tableData.value = rows.map(item => {
      return {
        infoLoading: false,
        ...item,
      }
    })
  }
  catch (error) {
    loading.value = false
  }
}

 const handleUpdateStatus = async(row: any) => {

  const form = {
    id: row.id,
    enable: row.enable === 1 ? 2 : 1
  }

  const res: any = await ApiMj.setMjParamEnable(form)
  res.success && ElMessage({ type: 'success', message: `账户${row.enable === 1 ? '停用' : '启用'}成功！` })

  await queryAllMjAccountList()
}

 const handleAddNewMjAccount = async() => {
    mjManagerRef.value.open()
 }

 const handleModifyMjAccount = async(param: {id: number}) => {
    mjManagerRef.value.open(param.id)
 }

const handlerReset = (formEl: FormInstance | undefined) => {
  Object.assign(formInline, {
    account: '',
    channelId: '',
    enable: 0,
    page: 1,
    size: 20,
  });
  queryAllMjAccountList()
}

const handleGetDetail = (row: { id: number }) => {
   const {id} = row;
   mjDetailRef.value.open(id)
}

const handleFreshAndSync = async (param: {id: number, infoLoading: boolean}) => {
    param.infoLoading = true;
  await ApiMj.updateMjSync({id: param.id})
  ElMessage.success('同步MJ账号成功！')
  param.infoLoading = false;
  await queryAllMjAccountList()
}

const handlerDelete = async (param: {id: number}) => {

  await ApiMj.removeMjParam({id: param.id})
  ElMessage.success('删除MJ账号成功！')
  await queryAllMjAccountList()
}

const orderPlanFilter = (orderPlan: number) => {
    if (orderPlan === 1) {
        return '基本'

    } else if (orderPlan === 2) {
        return '标准'

    } else if (orderPlan === 3) {
        return '专业'

    } else {
        return '强大'
    }
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <MjManger ref="mjManagerRef" @fresh="queryAllMjAccountList"></MjManger>
    <MjDetail ref="mjDetailRef"  ></MjDetail>

     <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">

        <el-form-item label="账号名" prop="account">
          <el-input v-model="formInline.account" width="100%" placeholder="账号名[模糊搜索]" clearable />
        </el-form-item>

        <el-form-item label="通道ID(channelId)" prop="channelId">
          <el-input v-model="formInline.channelId" placeholder="频道ID[模糊搜索]" clearable />
        </el-form-item>

        <el-form-item label="状态" prop="enable" style="width: 192px;">
          <el-select v-model="formInline.enable" >
            <el-option v-for="item in ACCESS_STATUS_OPTIONS" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="queryAllMjAccountList">
            查询
          </el-button>
          <el-button @click="handlerReset(formRef)">
            重置
          </el-button>
        </el-form-item>

        <span style="float: right;">
          <el-button type="success" @click="handleAddNewMjAccount">
            添加MJ账号
            <el-icon class="ml-3">
              <Plus />
            </el-icon>
          </el-button>
        </span>

      </el-form>
    </page-main>

      <page-main bottomPadding="20px">
          <el-alert :closable="false" show-icon title="MJ账号管理" description="详细配置请参考说明文档，添加MJ账号参数！" type="success" />
      </page-main>

      <page-main bottomPadding="20px" bottomMargin="0px">

          <el-table v-loading="loading" border :data="tableData" height="53vh" width="100%" size="large">

              <el-table-column prop="guildId" label="服务器ID" />

              <el-table-column prop="channelId" label="频道ID" />

              <el-table-column prop="account" label="账户" />

              <el-table-column prop="mode" label="出图模式" >
                <template #default="{ row }: { row: { mode: UserStatus } }">
                  <el-tag :type="USER_STATUS_TYPE_MAP[row.mode]">
                    {{ modeMap[row.mode] }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="fastRemainTime" label="快速时间剩余"   />

              <el-table-column prop="orderPlan" label="订阅计划">
                <template #default="scope">
                    {{ orderPlanFilter(scope.row.orderPlan) }}
                </template>
              </el-table-column>

              <el-table-column prop="enable" label="状态"  >
                  <template #default="{ row }: { row: { enable: UserStatus } }">
                      <el-tag :type="USER_STATUS_TYPE_MAP[row.enable]">
                          {{ enableMap[row.enable] }}
                      </el-tag>
                  </template>
              </el-table-column>

            <el-table-column prop="createdAt" label="创建时间"   >
              <template #default="{ row }: { row: { createdAt: Date } }">
                 <p>{{formatTime(row.createdAt)}}</p>
              </template>
            </el-table-column>

              <el-table-column fixed="right" label="操作" width="280" align="center">

                  <template #default="scope">

                    <el-button link type="primary" size="small"  @click="handleGetDetail(scope.row)">
                       详情
                    </el-button>

                    <el-button link type="primary" size="small"  @click="handleModifyMjAccount(scope.row)">
                        更新并重连
                    </el-button>

                    <el-popconfirm  width="300px" title="为了避免封号，程序每天同步一次，确认手动同步？" confirm-button-text="确认" @confirm="handleFreshAndSync(scope.row)">
                      <template #reference>
                        <el-button link type="danger" :loading="scope.row.infoLoading" size="small" >
                          同步
                        </el-button>
                      </template>
                    </el-popconfirm>

                      <el-button link type="primary" size="small"  @click="handleUpdateStatus(scope.row)">
                          {{ scope.row.enable === 1 ? '停用' : '启用' }}
                      </el-button>

                      <el-popconfirm   width="300px" title="删除后不可找回，确定删除?" confirm-button-text="确认" @confirm="handlerDelete(scope.row)">
                          <template #reference>
                              <el-button link type="danger"   size="small" >
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
                      @size-change="queryAllMjAccountList"
                      @current-change="queryAllMjAccountList"
              />
          </el-row>
      </page-main>

  </div>
</template>
