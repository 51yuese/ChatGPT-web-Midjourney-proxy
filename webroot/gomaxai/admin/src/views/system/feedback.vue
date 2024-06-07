<route lang="yaml">
meta:
title: 用户反馈列表
</route>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'

import type {FormInstance, FormRules} from 'element-plus'
import ApiSystem from "@/api/modules/system";
import {utcToShanghaiTime} from "@/utils/utcformatTime";
import {array2Obj} from "@/utils";
import {FEEDBACK_STATUS_OPTIONS} from "@/constants";

const startIndex = ref(0);

const typeMap = array2Obj(FEEDBACK_STATUS_OPTIONS);

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const formInline = reactive({
  page: 1,
  size: 20,
})

const formRef = ref<FormInstance>()

const handleSelect = (item: any, index: number) => {
  startIndex.value = index;
}

const queryAllMjAccountList = async () => {
  try {

    loading.value = true
    const res = await ApiSystem.queryFeedback(formInline)
    const {rows, count} = res.data
    loading.value = false
    total.value = count
    tableData.value = rows
  } catch (error) {
    loading.value = false
  }
}

const handlerDelete = async (param: { id: number }) => {
  await ApiSystem.removeFeedback({id: param.id})
  ElMessage.success('删除反馈成功！')
  await queryAllMjAccountList()
}

const handleToggleStatus = async (param: { id: number; status: number; }) => {
  const {id} = param;
  await ApiSystem.setFeedbackStatus({id, status: param.status === 1 ? 0: 1})
  ElMessage.success('删除反馈成功！')
  await queryAllMjAccountList()
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <page-main bottomPadding="20px" class="header">
      <el-alert show-icon title="用户反馈说明" :closable="false" description="此处收集前端用户提交上来的反馈信息！"
                type="success"/>
      <el-button style="margin-left: 10px" @click="queryAllMjAccountList">刷新</el-button>
    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" border :data="tableData" height="64vh" width="100%" size="large">

        <el-table-column prop="feedType" label="反馈类型">
           <template #default="scope">
             <p>{{typeMap[scope.row.feedType]}}</p>
           </template>
        </el-table-column>

        <el-table-column prop="description" label="详细描述"/>

        <el-table-column prop="images" label="截图" width="450px">
          <template #default="scope">
            <el-image
                v-for="(item, index) in scope.row.images"
                style="width: 140px; height: auto; max-height: 240px; margin: 0 10px; border: 1px solid #ececec;"
                :src="item"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                preview-teleported
                :z-index="1000"
                @click="handleSelect(item, index)"
                :initial-index="startIndex"
                :preview-src-list="scope.row.images"
                fit="cover"
            />
          </template>
        </el-table-column>

        <el-table-column prop="telephone" label="联系电话"/>

        <el-table-column prop="wechat" label="微信号"/>

        <el-table-column prop="status" label="状态" >
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'info' : 'warning'">{{scope.row.status === 1 ? '已读': '未读'}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            <p>{{ utcToShanghaiTime(scope.row.createdAt) }}</p>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间">
          <template #default="scope">
            <p> {{ utcToShanghaiTime(scope.row.updatedAt) }}</p>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">

          <template #default="scope">

            <el-button link type="success" size="small" :disabled="scope.row.status === 1" @click="handleToggleStatus(scope.row)">
              {{scope.row.status === 0 ? '标记已读' : '已读'  }}
            </el-button>

            <el-popconfirm width="300px" title="删除后不可找回，确定删除?" confirm-button-text="确认"
                           @confirm="handlerDelete(scope.row)">
              <template #reference>
                <el-button link type="danger" size="small">
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
<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
