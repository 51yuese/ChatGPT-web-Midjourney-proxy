<route lang="yaml">
meta:
  title: 灵感分类
</route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import mjInspireClassify from './components/mjInspireClassify.vue'
import MjDetail from './components/mjDetail.vue'
import type { FormInstance, FormRules } from 'element-plus'
import ApiMj from "@/api/modules/mj";
import {utcToShanghaiTime} from "@/utils/utcformatTime";

const mjDetailRef = ref();
const mjManagerRef = ref();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const formInline = reactive({
  page: 1,
  size: 20,
})

const formRef = ref<FormInstance>()

 const queryAllMjAccountList = async() => {
  try {

    loading.value = true
    const res = await ApiMj.queryMjInspireClassify(formInline)
    const { rows, count } = res.data
    loading.value = false
    total.value = count
    tableData.value = rows
  }
  catch (error) {
    loading.value = false
  }
}

 const handleAddNewMjAccount = async() => {
    mjManagerRef.value.open()
 }

 const handleModifyMjAccount = async(param: {id: number}) => {
    mjManagerRef.value.open(param.id)
 }

const handlerReset = (formEl: FormInstance | undefined) => {
  Object.assign(formInline, {
    page: 1,
    size: 20,
  });
  queryAllMjAccountList()
}


const handlerDelete = async (param: {id: number}) => {

  await ApiMj.removeMjInspireClassify({id: param.id})
  ElMessage.success('删除灵感分类成功！')
  await queryAllMjAccountList()
}

onMounted(() => {
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <mjInspireClassify ref="mjManagerRef" @fresh="queryAllMjAccountList"></mjInspireClassify>

    <MjDetail ref="mjDetailRef"  ></MjDetail>

      <page-main bottomPadding="20px" class="header">
        <el-alert show-icon title="灵感分类说明" :closable="false" description="此处的灵感分类是为了给灵感广场的图片分成各个不同类型！" type="success" />
        <el-button type="success" class="ml-3" size="large" @click="handleAddNewMjAccount">
          添加分类
          <el-icon class="ml-3">
            <Plus />
          </el-icon>
        </el-button>
      </page-main>

      <page-main bottomPadding="20px" bottomMargin="0px">

          <el-table v-loading="loading" border :data="tableData" height="64vh" width="100%" size="large">

              <el-table-column prop="name" label="分类名称" />

              <el-table-column prop="value" label="分类值" />

            <el-table-column prop="inner" label="是否内置" >
              <template #default="scope">
                <p>{{  scope.row.inner === 1 ? '内置' : '外置' }}</p>
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

                      <el-button link type="primary" size="small"  @click="handleModifyMjAccount(scope.row)">
                         编辑
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
