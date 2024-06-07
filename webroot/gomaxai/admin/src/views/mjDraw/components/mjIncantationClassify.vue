<script setup lang="ts">
import ApiMj from "@/api/modules/mj";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {ref, reactive} from "vue";

const visible = ref(false);
const title = ref('');
const manageId = ref(0);
const formRef = ref();
const parentList = ref([]);
const checkAll = ref(false); // 全部选择

const form = reactive({
  classifyName: "",
  level: 2,
  type: 'text',
  pid: undefined,
});

const props = defineProps({
  list: {
    type: Array,
    required: true,
    default: () =>([])
  }
})

const emits = defineEmits(["fresh"])

const getParentList = async () => {
  const res = await ApiMj.queryTopMjIncantationClassify();
  parentList.value = res.data;
}

const rules = reactive<FormRules>({
  name: [{required: true, message: '咒语分类名称不能为空', trigger: 'change'} , {max: 10, message: "最大长度10"}],
  level: [{required: true, message: '咒语分类级别', trigger: 'change'}],
  pid: [{required: true, message: '父级必选', trigger: 'change'}],
})

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = !id ? "添加咒语分类" : "编辑咒语分类";
  getParentList();

  if (id && id > 0) {

    getMJParam({id}).then(res => {
      const {  classifyName ,
        level ,
        pid ,} = res;
      Object.assign(form, {
        classifyName ,
        level ,
        pid,
      });
    })

  } else {
    Object.assign(form, {
      classifyName: "",
      level: 2,
      pid: undefined,
    });
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {})
}

const pidChange =(pid) => {
  const p = parentList.value.find(item => item.id === pid);
  if (p) {
    form.type = p.type
  } else {
    form.type = null
  }
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

      setTimeout(() => emits("fresh", true), 50)
      close();
    }
  })

}

const submitAdd = async (form: any) => {
  await ApiMj.addMjIncantClassify(form)
  ElMessage.success('添加咒语分类成功！')
  return true
}

const getMJParam = async (form: { id: number }) => {
  console.log(form.id);
  return await ApiMj.getMjIncantClassify(form).then(res => res.data)
}

const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjIncantClassify(form)
  ElMessage.success('更新咒语分类成功！')
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
             width="500px"
             :z-index="2000">

    <div style="height: auto; overflow-y: auto; overflow-x: hidden;  ">

      <el-form :model="form" label-position="right" ref="formRef" :rules="rules" :inline="false" label-width="80px">

        <el-form-item label="分类级别" prop="level">
          <el-select v-model="form.level" placeholder="选择分类级别" fit-input-width style="width: 100%">
            <el-option :value="1" label="一级"></el-option>
            <el-option :value="2" label="二级"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="父级" prop="pid" v-if="form.level === 2">
          <el-select v-model="form.pid" placeholder="选择分类级别" fit-input-width style="width: 100%" @change="pidChange">
             <el-option v-for="item in parentList" :value="item.id" :label="item.classifyName"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分类类型" prop="type">
          <el-select v-model="form.type" :disabled="form.level === 2" placeholder="选择分类类型" fit-input-width style="width: 100%">
             <el-option value="text" label="普通"></el-option>
             <el-option value="style" label="风格"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分类名称" prop="classifyName">
          <el-input v-model="form.classifyName"  placeholder="输入分类名称" clearable
                    maxlength="50"></el-input>
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
