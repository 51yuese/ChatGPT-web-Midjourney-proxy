<route lang="yaml">
meta:
title: 咒语分类
</route>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'

import mjIncantationClassify from './components/mjIncantationClassify.vue'
import MjDetail from './components/mjDetail.vue'
import type {FormInstance, FormRules} from 'element-plus'

import {
  ACCESS_STATUS_OPTIONS,
  MJ_STATUS_OPTIONS,
  USER_STATUS_TYPE_MAP,
  UserStatus
} from "@/constants";
import {array2Obj} from "@/utils";
import ApiMj from "@/api/modules/mj";
import {formatTime} from "@/utils/dayjs";
import {utcToShanghaiTime} from "@/utils/utcformatTime";

const mjDetailRef = ref();
const mjManagerRef = ref();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const formInline = reactive({
  level: 0,
  page: 1,
  size: 20,
  type: '',
  keyword: ''
})

const formRef = ref<FormInstance>()

const queryAllMjAccountList = async () => {
  try {

    loading.value = true
    const res = await ApiMj.queryMjIncantClassify(formInline)
    const {rows, count} = res.data
    loading.value = false
    total.value = count
    tableData.value = rows
  } catch (error) {
    loading.value = false
  }
}

const handleUpdateStatus = async (row: any) => {

  const form = {
    id: row.id,
    enable: row.enable === 1 ? 2 : 1
  }

  const res: any = await ApiMj.setMjParamEnable(form)
  res.success && ElMessage({type: 'success', message: `账户${row.enable === 1 ? '停用' : '启用'}成功！`})

  await queryAllMjAccountList()
}

const handleAddNewMjAccount = async () => {
  mjManagerRef.value.open()
}

const handleModifyMjAccount = async (param: { id: number }) => {
  mjManagerRef.value.open(param.id);
}

const handlerReset = (formEl: FormInstance | undefined) => {
  Object.assign(formInline, {
    level: 2,
    page: 1,
    size: 20,
    type: '',
    keyword: ''
  });
  queryAllMjAccountList()
}

const handlerDelete = async (param: { id: number }) => {

  await ApiMj.removeMjIncantClassify({id: param.id})
  ElMessage.success('删除咒语分类成功！')
  await queryAllMjAccountList()
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <mjIncantationClassify ref="mjManagerRef" @fresh="queryAllMjAccountList"></mjIncantationClassify>

    <MjDetail ref="mjDetailRef"></MjDetail>

    <!-- <page-main bottomPadding="20px" class="header">
      <el-alert show-icon title="咒语分类说明" :closable="false"
                description="咒语分类分一级和二级，内置一级分类不可删除但可修改，可删除二级分类！" type="success"/>
    </page-main> -->
    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">

        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="formInline.keyword" style="width: 192px;" placeholder="分类关键字[模糊搜索]" clearable />
        </el-form-item>

        <el-form-item label="所属类型" prop="type" >
          <el-select v-model="formInline.type" style="width: 192px;" >
            <el-option value="text" label="普通"></el-option>
            <el-option value="style" label="风格"></el-option>
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
          <el-button type="success" class="ml-3" @click="handleAddNewMjAccount">
            添加咒语分类
            <el-icon class="ml-3">
              <Plus/>
            </el-icon>
          </el-button>
        </span>

      </el-form>
    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" border :data="tableData" height="64vh" width="100%" size="large">

        <el-table-column prop="classifyName" label="分类名称"/>

        <el-table-column prop="level" label="级别">
          <template #default="scope">
            <p>{{ scope.row.level === 1 ? '一级' : scope.row.level === 2 ? '二级' : '未知' }}</p>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <p>{{ scope.row.type === 'text' ? '普通' : scope.row.type === 'style' ? '风格' : '未知' }}</p>
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

            <el-button link type="primary" size="small" @click="handleModifyMjAccount(scope.row)">
              编辑
            </el-button>

            <el-popconfirm width="300px" title="删除后不可找回，确定删除?" confirm-button-text="确认"
                           @confirm="handlerDelete(scope.row)">
              <template #reference>
                <el-button link type="danger" :disabled="scope.row.inner === 1" size="small">
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
