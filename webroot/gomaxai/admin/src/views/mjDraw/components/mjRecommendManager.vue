<script setup lang="ts">
import ApiMj from "@/api/modules/mj";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";

const visible = ref(false);
const title = ref('');
const manageId = ref(0);
const formRef = ref();
const checkAll = ref(false); // 全部选择

const form = reactive({
  icon: "",
  keywordChinese: "",
  keywordEnglish: "",
});

const emits = defineEmits(["fresh"])

const rules = reactive<FormRules>({
  keywordChinese: [{required: true, message: '中文关键词不能为空', trigger: 'change'} , {max: 50, message: "最大长度50"}],
  keywordEnglish: [{required: true, message: '中文关键词英文翻译不能为空', trigger: 'change'},  {max: 50, message: "最大长度50"}],
})

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = !id ? "添加预设关键词" : "编辑预设关键词";

  if (id && id > 0) {
    getMJParam({id}).then(res => {
      Object.assign(form, res);
    })
  } else {
    Object.assign(form, {
      icon: "",
      keywordChinese: "",
      keywordEnglish: "",
    });
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {})
}

const handleSubmit = async (formEl: FormInstance | undefined) => {
  await formEl?.validate(async (valid) => {
    if (valid) {
      // 编辑
      if (manageId.value) {

        await submitUpdate({
          id: manageId.value,
          ...form,
        });

      } else {

        // 新增
        await submitAdd(form);

      }

      emits("fresh", true)
      close();
    }
  })

}

const submitAdd = async (form: any) => {
  await ApiMj.addMjParam(form)
  ElMessage.success('添加预设关键词成功！')
  return true
}
const getMJParam = async (form: { id: number }) => {
  return await ApiMj.getMjParamById(form).then(res => res.data)
}
const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjParam(form)
  ElMessage.success('更新预设关键词成功！')
}


defineExpose({
  open
})

</script>

<template>

  <el-dialog v-model="visible"
             :append-to-body="true"
             :close-on-click-modal="false"
             :title="title"
             top="80px"
             :fullscreen="false"
             width="600px"
             :z-index="2000">

    <div style="height: auto; overflow-y: auto; overflow-x: hidden;  ">

      <el-form :model="form" label-position="right" ref="formRef" :rules="rules" :inline="false" label-width="120px">
        <el-form-item label="中文关键词" prop="keywordChinese" >

          <el-row :gutter="4">
            <el-col :span="23">
              <el-input v-model="form.keywordChinese" style="width: 100%"   placeholder="输入中文关键词" clearable
                        maxlength="50"></el-input>
            </el-col>
            <el-col :span="1">
              <el-button>翻译</el-button>
            </el-col>
          </el-row>

        </el-form-item>

        <el-form-item label="中文关键词翻译" prop="mjId">
          <el-input v-model="form.keywordEnglish"   placeholder="输入中文关键词翻译" clearable
                    maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-upload type="card"></el-upload>
        </el-form-item>

      </el-form>

    </div>

    <template #footer>
      <el-button @click="visible= false">
        取消
      </el-button>
      <el-button type="primary" @click="handleSubmit(formRef)">
        确认
      </el-button>
    </template>

  </el-dialog>

</template>

<style scoped lang="less">
.add-manager {
  max-height: 65vh;
  overflow-y: auto;;
}

.flex-start {
  display: flex;
  justify-content: space-between;
}
.access-list, li {
  list-style: none;
  margin-bottom: 16px;
}

</style>
