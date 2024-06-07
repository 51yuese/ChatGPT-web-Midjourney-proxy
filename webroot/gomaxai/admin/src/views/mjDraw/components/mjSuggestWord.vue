<script setup lang="ts">
import ApiMj from "@/api/modules/mj";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";
import {useUploader} from "@/views/mjDraw/use/useUploader";
import {Upload} from "@element-plus/icons-vue";

const visible = ref(false);
const title = ref('');
const manageId = ref(0);
const formRef = ref();
const checkAll = ref(false); // 全部选择

const { selectFile, upload} = useUploader();

const form = reactive({
  image: "",
  suggestCn: "",
  suggestEn: "",
  order: 100,
});

const emits = defineEmits(["fresh"])

const rules = reactive<FormRules>({
  image: [{required: true, message: '推荐关键词图片', trigger: 'change'} ],
  suggestCn: [{required: true, message: '推荐关键词中文不能为空', trigger: 'change'} ],
  suggestEn: [{required: true, message: '推荐关键词英文不能为空', trigger: 'change'}  ],
  order: [{required: true, message: '排序越大越靠前', trigger: 'change'}],
})

function open(data?: any) {
  visible.value = true;
  manageId.value = data.id || 0;
  title.value = !data.id ? "添加咒语分类" : "编辑咒语分类";

  if (data.id && data.id > 0) {
    Object.assign(form, data);
  } else {
    Object.assign(form, {
      image: "",
      suggestCn: "",
      suggestEn: "",
      order: 100,
    });
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {
    image: "",
    suggestCn: "",
    suggestEn: "",
    order: 100,
  })
}

const handleSubmit = async (formEl: FormInstance | undefined) => {
  await formEl?.validate(async (valid) => {
    if (valid) {
      // 编辑
      if (manageId.value) {
        await submitSave({
          id: manageId.value,
          ...form,
        });

      } else {
        // 新增
        await submitSave(form);
      }

      emits("fresh", true)
      close();
    }
  })

}

const submitSave = async (form: any) => {
  await ApiMj.addMjSuggestWord(form)
  ElMessage.success('保存推荐关键词成功！')
  return true
}

const getMJParam = async (form: { id: number }) => {
  // return await ApiMj.getMjIncantClassify(form).then(res => res.data)
}


// 选择图片上传
const handleUploadImage = async() => {
  const result = await selectFile();
  const uploadRes = await upload({file: result}).then(res => res.data)
  console.log(uploadRes);
  form.image = uploadRes;
  ElMessage({ type: 'success', message: '上传图片成功！' })
}


const submitUpdate = async (form: any) => {
  // await ApiMj.modifyMjIncantClassify(form)
  ElMessage.success('更新推荐关键词成功！')
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
             width="700px"
             :z-index="2000">

    <div style="height: auto; overflow-y: auto; overflow-x: hidden;  ">

      <el-form :model="form" label-position="right" ref="formRef" :rules="rules" :inline="false" label-width="120px">

        <el-form-item label="关键词中文" prop="suggestCn">
          <el-input v-model="form.suggestCn"  placeholder="输入推荐关键词中文" clearable
                    ></el-input>
        </el-form-item>

        <el-form-item label="关键词英文" prop="suggestEn">
          <el-input v-model="form.suggestEn"  placeholder="输入推荐关键词英文" clearable
                    ></el-input>
        </el-form-item>

        <el-form-item label="图标" prop="image">

          <el-input v-model="form.image" placeholder="请填写在线图片URL或上传本地图片" >
            <template #append>
              <el-button :icon="Upload" @click="handleUploadImage">上传图片</el-button>
            </template>
          </el-input>

        </el-form-item>

        <el-form-item label="排序" prop="classifyName">
          <el-input v-model="form.order" type="number"  placeholder="输入排序(越大越靠前)" clearable
                    maxlength="6"></el-input>
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
