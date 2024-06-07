<route lang="yaml">
meta:
title: 推荐关键词
</route>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import mjSuggestWord from './components/mjSuggestWord.vue'
import type {FormInstance, FormRules} from 'element-plus'
import ApiMj from "@/api/modules/mj";
import {utcToShanghaiTime} from "@/utils/utcformatTime";

const mjManagerRef = ref();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const formInline = reactive({
  page: 1,
  size: 20,
})

const formRef = ref<FormInstance>()

const queryAllMjAccountList = async () => {
  try {

    loading.value = true
    const res = await ApiMj.queryMjSuggestWord(formInline)
    const {rows, count} = res.data
    loading.value = false
    total.value = count
    tableData.value = rows
  } catch (error) {
    loading.value = false
  }
}

const handleAddNewMjAccount = async () => {
  mjManagerRef.value.open()
}

const handleModifyMjAccount = async (param: any) => {
  mjManagerRef.value.open(param)
}

const handlerReset = (formEl: FormInstance | undefined) => {
  Object.assign(formInline, {
    page: 1,
    size: 20,
  });
  queryAllMjAccountList()
}


const handlerDelete = async (param: { id: number }) => {

  await ApiMj.removeMjSuggestWord({id: param.id})
  ElMessage.success('删除推荐关键词成功！')
  await queryAllMjAccountList()
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <mjSuggestWord ref="mjManagerRef" @fresh="queryAllMjAccountList"></mjSuggestWord>

    <page-main bottomPadding="20px" class="header">
      <el-alert show-icon title="推荐关键词说明" :closable="false"
                description="此处的推荐关键词是给用户可以选择的默认绘画关键词！" type="success"/>
      <el-button type="success" class="ml-3" size="large" @click="handleAddNewMjAccount">
        添加关键词
        <el-icon class="ml-3">
          <Plus/>
        </el-icon>
      </el-button>
    </page-main>

    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" border :data="tableData" height="64vh" width="100%" size="large">

        <el-table-column prop="image" label="图标" >
          <template #default="scope">
            <img :src="scope.row.image" style="width: 64px; height: 64px;" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="suggestCn" label="关键词中文"/>
        <el-table-column prop="suggestEn" label="关键词英文"/>
        <el-table-column prop="order" label="排序权重"/>

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
