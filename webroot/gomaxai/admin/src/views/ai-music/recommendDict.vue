<route lang="yaml">
  meta:
    title: 音乐字典管理
  </route>

  <script lang="ts" setup>
  import { ElMessage } from 'element-plus'
  import { onMounted, reactive, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { utcToShanghaiTime } from '@/utils/utcformatTime'
  import ApiAiMusic, { TDict, TDictEdit, TDictPageReq } from '@/api/modules/aiMusic'


  const formRef = ref<FormInstance>()
  const total = ref(0)
  const visible = ref(false)
  const loading = ref(false)

  const formDict = reactive<TDictEdit>({});

  const pageReq = reactive<TDictPageReq>({
    dictType: '',
    dictName: '',
    page: 1,
    size: 15,
  })

  const tableData = ref<TDict[]>([])

  async function fetchDictPage() {
    try {
      loading.value = true
      const res = await ApiAiMusic.page(pageReq)
      const { rows, count } = res.data
      total.value = count
      loading.value = false
      tableData.value = rows
    }
    catch (error) {
      loading.value = false
    }
  }

  function handlerReset(formEl: FormInstance | undefined) {
    formEl?.resetFields()
    fetchDictPage()
  }

  const rules = reactive<FormRules>({
    dictType: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
    dictName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    dictValue: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
  })

  function edit(row: TDict) {
    visible.value = true
    formDict.id = row.id;
    formDict.dictType = row.dictType;
    formDict.dictName = row.dictName;
    formDict.dictValue = row.dictValue;
  }

  async function save() {
    const res = await ApiAiMusic.save(formDict)
    res.data && ElMessage({ type: 'success', message: '操作成功！' })
    visible.value = false
    fetchDictPage()
  }

  async function deleteHandler(item:TDict) {
    const res = await ApiAiMusic.delete({ids: [item.id]});
    res.data && ElMessage({ type: 'success', message: `操作成功！` })
    fetchDictPage();
  }

  onMounted(() => fetchDictPage())
  </script>

  <template>
    <div>
      <page-Main>
        <el-form ref="formRef" :inline="true" :model="pageReq">
          <el-form-item label="类型" prop="dictType">
            <el-select v-model="pageReq.dictType" placeholder="请选择类型" clearable style="width: 192px;">
              <el-option key="music-style" label="音乐风格" value="music-style" />
              <el-option key="music-lyrics" label="音乐歌词" value="music-lyrics" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称关键字" prop="dictName">
            <el-input v-model="pageReq.dictName" placeholder="请输入字典关键字" clearable style="width: 192px;"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchDictPage">
              查询
            </el-button>
            <el-button @click="handlerReset(formRef)">
              重置
            </el-button>
          </el-form-item>
          <span style="float: right;">
            <el-button type="success" @click="edit(new TDict())">
              添加内容
              <el-icon class="ml-3">
                <Plus />
              </el-icon>
            </el-button>
          </span>
        </el-form>
      </page-Main>
      <page-main bottomPadding="20px" bottomMargin="0px">
        <el-table v-loading="loading" border height="66vh" :data="tableData" style="width: 100%;" size="large">
          <el-table-column fixed prop="id" label="ID" width="80" />
          <el-table-column prop="dictType" label="类型" width="150">
            <template #default="scope">
              <span v-if="scope.row.dictType === 'music-style'">音乐风格</span>
              <span v-else-if="scope.row.dictType === 'music-lyrics'">音乐歌词</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="dictName" label="名称" width="150" />
          <el-table-column prop="dictValue" label="内容" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="200" align="center">
            <template #default="scope">
              {{ utcToShanghaiTime(scope.row.createdAt, 'YYYY-MM-DD hh:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="250" align="center">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="edit(scope.row)">
                编辑
              </el-button>
              <el-popconfirm title="确认删除?" confirm-button-text="确认删除" @confirm="deleteHandler(scope.row)">
                <template #reference>
                  <el-button link type="danger">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-row class="flex justify-end mt-5">
          <el-pagination
            class="mr-5"
            :total="total"
            @size-change="fetchDictPage"
            :page-sizes="[15, 30, 50, 100]"
            @current-change="fetchDictPage"
            v-model:page-size="pageReq.size"
            v-model:current-page="pageReq.page"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </el-row>
      </page-main>
      <el-dialog v-model="visible" :title="formDict.id ? '编辑' : '新增'" width="500px">
        <el-form :model="formDict">
          <el-form-item label="类型" label-width="90px" :rules="rules.dictType">
            <el-select v-model="formDict.dictType" placeholder="请选择类型">
              <el-option key="music-style" label="音乐风格" value="music-style" />
              <el-option key="music-lyrics" label="音乐歌词" value="music-lyrics" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称" label-width="90px" :rules="rules.dictName">
            <el-input v-model="formDict.dictName" placeholder="请输入名称"></el-input>
          </el-form-item>
          <el-form-item label="内容" label-width="90px" :rules="rules.dictValue">
            <el-input v-model="formDict.dictValue" placeholder="请输入内容"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 100%;" type="primary" @click="save">
              确定
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </template>
