<route lang="yaml">
meta:
  title: MJ关键词
</route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import mjRecommendManager from './components/mjRecommendManager.vue'
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
    tableData.value = rows
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

const handleFreshAndSync = async (param: {id: number}) => {
  await ApiMj.updateMjSync({id: param.id})
  ElMessage.success('同步MJ账号成功！')
  await queryAllMjAccountList()
}

const handlerDelete = async (param: {id: number}) => {

  await ApiMj.removeMjParam({id: param.id})
  ElMessage.success('删除MJ账号成功！')
  await queryAllMjAccountList()
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <mjRecommendManager ref="mjManagerRef" @fresh="queryAllMjAccountList"></mjRecommendManager>

    <MjDetail ref="mjDetailRef"  ></MjDetail>

      <page-main bottomPadding="20px" class="header">
        <el-alert show-icon title="关键词说明" :closable="false" description="此处的提示词将会在用户端的输入框中聚焦的时候自动展示出来、用户点击你给与的预设将直接将提示词写入输入框中！" type="success" />
        <el-button type="success" class="ml-3" size="large" @click="handleAddNewMjAccount">
          添加关键词
          <el-icon class="ml-3">
            <Plus />
          </el-icon>
        </el-button>
      </page-main>

      <page-main bottomPadding="20px" bottomMargin="0px">

          <el-table v-loading="loading" border :data="tableData" height="53vh" width="100%" size="large">

              <el-table-column prop="icon" label="图标" />

              <el-table-column prop="keywordChinese" label="名称" />

              <el-table-column prop="keywordEnglish" label="英文翻译" />

              <el-table-column prop="createTime" label="创建时间" />

              <el-table-column prop="updateTime" label="更新时间" />

              <el-table-column fixed="right" label="操作" width="280" align="center">

                  <template #default="scope">

                      <el-button link type="primary" size="small"  @click="handleUpdateStatus(scope.row)">
                         翻译
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
<style lang="less"  scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
