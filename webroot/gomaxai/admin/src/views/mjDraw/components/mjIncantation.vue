<script setup lang="ts">
import ApiMj from "@/api/modules/mj";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";
import apiSystem from "@/api/modules/system";


const visible = ref(false);
const title = ref('');
const manageId = ref(0);
const formRef = ref();
const translating = ref(false); // 全部选择

const form = reactive({
  incantationCn: "",
  incantationEn: "",
  pid: undefined,
  img: ""
});

const props = defineProps({
  list: {
    type: Array,
    required: true,
    default: () =>([])
  }
})

const parentList = computed(() => props.list.filter((item: any) => item.level === 2))

const emits = defineEmits(["fresh"])

const rules = reactive<FormRules>({
  incantationCn: [{required: true, message: '咒语名称不能为空', trigger: 'change'} , {max: 50, message: "最大长度50"}],
  incantationEn: [{required: true, message: '咒语英文翻译不能为空', trigger: 'change'} , {max: 100, message: "最大长度100"}],
  pid: [{required: true, message: '分类必选', trigger: 'change'}],
})

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = !id ? "添加咒语" : "编辑咒语";
  if (id && id > 0) {
    getMJParam({id}).then(res => {
      const {  incantationCn ,
        incantationEn , img,
        pid ,} = res;
      Object.assign(form, {
        incantationCn ,
        incantationEn ,
        img,
        pid,
      });
    })

  } else {
    Object.assign(form, {
      incantationCn: "",
      incantationEn: "",
      pid: undefined,
      img: "",
    });
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {})
}

const handleChange = (ev: any) => {

  const imageType = ev.name.split(".")[1]

  const formData = new FormData()
  formData.append('filename', ev.raw.uid + '.' + imageType)
  formData.append('file', ev.raw)
  formData.append('dir', 'gpts-logo');

  apiSystem.uploadFile(formData).then(res => {
    form.img = res.data
  })

}

const beforeAvatarUpload = (rawFile: { type: string; size: number; }) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持jpg和png格式')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片不能大于2M!')
    return false
  }
  return true
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
  await ApiMj.addMjIncantation(form)
  ElMessage.success('添加咒语成功！')
  return true
}

const getMJParam = async (form: { id: number }) => {
  return await ApiMj.getMjIncantation(form).then(res => res.data)
}

// 翻译
const handleTranslate = async (str: string) => {
  translating.value = true;
  const en = await ApiMj.getCnTranslateEn({text: str}).then(res => res.data).catch(error => {
    translating.value = false;
  })
  form.incantationEn = en;
  translating.value = false;
}

const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjIncantation(form)
  ElMessage.success('更新咒语成功！')
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

      <el-form :model="form" label-position="right" :disabled="translating" ref="formRef" :rules="rules" :inline="false" label-width="80px">

        <el-form-item label="咒语图片" prop="img">
          <el-upload class="logo-uploader" action="" :auto-upload="false" :show-file-list="false"
            @change="handleChange($event)" :before-upload="beforeAvatarUpload">
            <img v-if="form.img" :src="form.img" class="avatar" />
            <el-icon v-else class="logo-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>


        <el-form-item label="咒语名称" prop="incantationCn">
          <el-row :gutter="4">
            <el-col :span="23">
              <el-input v-model="form.incantationCn"  style="width: 100%"   placeholder="输入中文咒语" clearable
                        maxlength="50"></el-input>
            </el-col>
            <el-col :span="1">
              <el-button @click="handleTranslate(form.incantationCn)" :loading="translating">翻译</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="咒语英译" prop="incantationEn">
          <el-input v-model="form.incantationEn"  placeholder="输入咒语英译" clearable
                    maxlength="50"></el-input>
        </el-form-item>


        <el-form-item label="分类" prop="pid" >
          <el-select v-model="form.pid" placeholder="选择分类" fit-input-width style="width: 100%">
             <el-option v-for="item in parentList" :value="item.id" :label="item.classifyName"></el-option>
          </el-select>
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
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.logo-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.logo-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
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
