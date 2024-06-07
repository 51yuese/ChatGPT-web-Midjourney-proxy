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
  name: "",
  value: "",
});

const emits = defineEmits(["fresh"])

function isEnglishString(str: any) {
  var pattern = /^[A-Za-z]+$/; // 只包含大小写字母的正则表达式

  return pattern.test(str);
}
const rules = reactive<FormRules>({
  name: [{required: true, message: '灵感分类名称不能为空', trigger: 'change'} , {max: 10, message: "最大长度10"}],
  value: [{required: true, message: '灵感分类值不能为空', trigger: 'change'}, {validator: (rule, value, callback, source, options) => {
       if(!isEnglishString(value)) {
         callback("灵感分类的Key是英文字符串")
       } else {
         callback()
       }
    }}],
})

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = !id ? "添加灵感分类" : "编辑灵感分类";

  if (id && id > 0) {

    getMJParam({id}).then(res => {
      Object.assign(form, res);
    })

  } else {
    Object.assign(form, {
      name: "",
      value: "",

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
  await ApiMj.addMjInspireClassify(form)
  ElMessage.success('添加灵感分类成功！')
  return true
}
const getMJParam = async (form: { id: number }) => {
  return await ApiMj.getMjInspireClassify(form).then(res => res.data)
}

const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjInspireClassify(form)
  ElMessage.success('更新灵感分类成功！')
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

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name"  placeholder="输入分类名称" clearable
                    ></el-input>
        </el-form-item>
        <el-form-item label="分类值" prop="value">
          <el-input v-model="form.value"  placeholder="输入分类value值" clearable></el-input>
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
