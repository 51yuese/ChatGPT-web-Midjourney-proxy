<route lang="yaml">
meta:
title: 咒语
</route>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {ElMessage} from 'element-plus'
import mjIncantation from './components/mjIncantation.vue'
import MjDetail from './components/mjDetail.vue'
import type {FormInstance, FormRules} from 'element-plus'
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
  keyword: '',
  pid: ''
})

const formRef = ref<FormInstance>()

const queryAllMjAccountList = async () => {
  try {

    loading.value = true
    const res = await ApiMj.queryMjIncantation(formInline)
    const {rows, count} = res.data
    loading.value = false
    total.value = count
    tableData.value = rows.map(item => {
      const parent = typeMap.get(item.pid);
      item.type = parent.type === 'text' ? '普通' : parent.type === 'style' ? '风格' : '';
      item.category = parent.classifyName;
      return item;
    })
  } catch (error) {
    loading.value = false
  }
}


const handleAddNewMjAccount = async () => {
  mjManagerRef.value.open()
}

const handleModifyMjAccount = async (param: { id: number }) => {
  mjManagerRef.value.open(param.id)
}

const handlerReset = (formEl: FormInstance | undefined) => {
  Object.assign(formInline, {
    keyword: '',
    pid: '',
    page: 1,
    size: 20,
  });
  queryAllMjAccountList()
}


const handlerDelete = async (param: { id: number }) => {

  await ApiMj.removeMjIncantation({id: param.id})
  ElMessage.success('删除MJ账号成功！')
  await queryAllMjAccountList()
}

const classifyList = ref([])
const typeMap = new Map()

const queryAllClassifyList = async () => {
  const list = await ApiMj.queryAllMjIncantClassify({level: 2}).then(res => res.data)
  classifyList.value = list;
  if (list.length ) {
    list.forEach((item: { id: number; classifyName: string; }) => {
      typeMap.set(item.id, item)
    })
  }
}

onMounted(async() => {
  await queryAllClassifyList();
  queryAllMjAccountList();
})
</script>

<template>
  <div>

    <mjIncantation ref="mjManagerRef" :list="classifyList" @fresh="queryAllMjAccountList"></mjIncantation>

    <MjDetail ref="mjDetailRef"></MjDetail>

    <!-- <page-main bottomPadding="20px" class="header">
      <el-alert show-icon title="咒语说明" :closable="false"
                description="此处的咒语用于前端灵活搭配不同词语组合！"
                type="success"/>
      <el-button type="success" class="ml-3" size="large" @click="handleAddNewMjAccount">
        添加咒语
        <el-icon class="ml-3">
          <Plus/>
        </el-icon>
      </el-button>
    </page-main> -->

    <page-main>
      <el-form ref="formRef" :inline="true" :model="formInline">

        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="formInline.keyword" style="width: 192px;" placeholder="分类关键字[模糊搜索]" clearable />
        </el-form-item>

        <el-form-item label="所属分类" prop="pid" >
          <el-select v-model="formInline.pid" style="width: 192px;" >
            <el-option v-for="item in classifyList" :key="item.id" :value="item.id" :label="item.classifyName"></el-option>
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
            添加咒语
            <el-icon class="ml-3">
              <Plus/>
            </el-icon>
          </el-button>
        </span>
      </el-form>
    </page-main>




    <page-main bottomPadding="20px" bottomMargin="0px">

      <el-table v-loading="loading" border :data="tableData" height="64vh" width="100%" size="large">

        <el-table-column prop="img" label="图片">
          <template #default="scope">
            <el-image v-if="scope.row.img" style="width: 100px; height: 100px" :src="scope.row.img" fit="fill" />
            <span v-else>--</span>
          </template>
        </el-table-column>

        <el-table-column prop="incantationCn" label="名称"/>

        <el-table-column prop="incantationEn" label="英文翻译"/>

        <el-table-column prop="type" label="类型">
        </el-table-column>

        <el-table-column prop="category" label="分类">
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
