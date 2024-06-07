<script setup lang="ts">

import {MENU_LIST} from "@/constants";
import {Menu} from "@/constants/interface";
import ApiAccess from "@/api/modules/access";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";

const visible = ref(false);
const title = ref('');
const manageId = ref("")
const formRef = ref()

const list = ref<Menu[]>(MENU_LIST)

const checkAll = ref(false); // 全部选择

const form = reactive({
  username: "",
  password: "",
  role: "manager",
  access: ""
});

const emits = defineEmits(["fresh"])

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请填写登录账号', trigger: 'blur' }, {min: 4, message: "最小长度4"}, {max: 30, message: "最大长度30"}],
  password: [{ required: true, message: '请填写登录密码', trigger: 'blur' }, {min: 6, message: "最小长度6"}],
})

function open(id?: string) {
  visible.value = true;
  manageId.value = id || "";
  title.value = !id ? "添加管理员" : "编辑管理员";

  if (id) {
    getAccess({id}).then(res => {
      Object.assign(form, res);
      list.value = res.access && JSON.parse(res.access);
    })
  } else {
      Object.assign(form, {
          username: "",
          password: "",
          role: "manager",
          access: ""});
      list.value = MENU_LIST;
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {})
}

 const handleSubmit = async(formEl: FormInstance | undefined) => {

   const accessList = list.value;
   await formEl?.validate(async (valid) => {

     if (valid) {

       // 编辑
       if (manageId.value) {

         await submitUpdate({
           id: manageId.value,
           ...form,
           access: JSON.stringify(accessList)
         });

       } else {

         // 新增
         await submitAdd({
           ...form,
           access: JSON.stringify(accessList)
         });

       }

       emits("fresh", true)
       close();
     }
   })

}

const submitAdd = async (form: any) => {
   await ApiAccess.addAccess(form)
  ElMessage.success('添加管理员成功！')
  return true
}
const getAccess = async (form: any) => {
     return  await ApiAccess.getAccess(form).then(res => res.data)
}
const submitUpdate = async (form: any) => {
  await ApiAccess.updateAccess(form)
  ElMessage.success('编辑管理员成功！')
}

const handleCheckAllChange = (item: Menu, val: boolean) => {

   item.checked = val ? item.children.map((t: {value: string}) => t.value) : [];
   item.isIndeterminate = false;
   checkSelectAll();
}

const handleCheckedCitiesChange = (value: any[], item: any) => {
  const checkedCount = value.length
  item.checkAll = checkedCount === item.children.length
  item.isIndeterminate = checkedCount > 0 && checkedCount < item.children.length;
  checkSelectAll();
}

const checkSelectAll = () => {
  checkAll.value = list.value.every(item => item.checkAll);
}

const handleCheckAllRightChange = (value: boolean) => {
   handleSelectAll(value)
}

const handleSelectAll = (select: boolean) =>  {
  list.value.forEach(item => {
     item.checkAll = select;
     item.checked = select ? item.children.map(i => i.value) : []
     item.isIndeterminate = item.checked.length > 0 && item.checked.length < item.children.length;
  })

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
             fullscreen
             :z-index="2000">

    <div style="height: 80vh; overflow-y: auto; overflow-x: hidden;  ">

      <el-form :model="form"   label-position="right"  ref="formRef" :rules="rules" :inline="false" label-width="80px">

        <el-row :gutter="16">

          <el-col :span="6">
            <el-form-item label="登录账号"  prop="username">
              <el-input v-model="form.username"  :disabled="manageId !== ''" placeholder="输入管理员登录账号" clearable maxlength="50"></el-input>

            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="登录密码" prop="password"  >
              <el-input v-model="form.password" :disabled="manageId !== ''" placeholder="输入管理员登录密码" clearable maxlength="50"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">

            <el-form-item label="权限设置" style="margin-bottom: 0">
              <el-checkbox
                v-model="checkAll"
                @change="handleCheckAllRightChange"
              >全部选择</el-checkbox
              >
            </el-form-item>

            <el-form-item label-width="30px">
              <ul class="access-list">
                <li v-for="(item) in list"  >
                  <el-checkbox
                    v-model="item.checkAll"
                    :indeterminate="item.isIndeterminate"
                    @change="handleCheckAllChange(item, item.checkAll)"
                  >{{ item.name }}</el-checkbox
                  >
                  <el-checkbox-group
                    v-model="item.checked"
                    @change="handleCheckedCitiesChange($event, item)"
                  >
                    <el-checkbox v-for="city in item.children" style="margin-left: 30px" :label="city.value">
                      {{city.label}}
                    </el-checkbox>
                  </el-checkbox-group>
                </li>

              </ul>
            </el-form-item>

          </el-col>
        </el-row>

      </el-form>

    </div>

    <template  #footer>
      <el-button  @click="visible= false">
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
  overflow-y :auto;;
}
   .access-list, li{
       list-style: none;
       margin-bottom: 16px;
   }

</style>
