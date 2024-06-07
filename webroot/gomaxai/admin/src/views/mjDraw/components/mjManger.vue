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
  // mjId: "",
  account: "",
  channelId: "",
  guildId: "",
  authorization: "",
  mjBotChannelId: "",
  nijiBotChannelId: "",
  // applicationId: "",
  // version: "",
  // sessionId: "",
//   mode: 1,
  concurrency: 3,
  timeout: 5,
  awaitQueue: 10,
  weight: 10,
  proxyUrl: '',
  remark: ""
});

const emits = defineEmits(["fresh"])

const rules = reactive<FormRules>({
  // mjId: [{required: true, message: '请输入基础ID', trigger: 'change'} , {max: 50, message: "最大长度50"}],
  account: [{required: true, message: '请输入账户名', trigger: 'change'},  {max: 50, message: "最大长度50"}],
  channelId: [{required: true, message: '请输入频道ID', trigger: 'change'},  {max: 50, message: "最大长度50"}],
  guildId: [{required: true, message: '请输入服务器ID', trigger: 'change'},  {max: 50, message: "最大长度50"}],
  authorization: [{required: true, message: '请输入授权令牌', trigger: 'change'}, {max: 500, message: "最大长度500"}],
  // applicationId: [{required: true, message: '请输入应用ID', trigger: 'change'}, {max: 50, message: "最大长度50"}],
  // version: [{required: true, message: '请输入版本ID', trigger: 'change'},  {max: 50, message: "最大长度50"}],
  // sessionId: [{required: true, message: '请输入绘画ID', trigger: 'change'}, {max: 50, message: "最大长度50"}],
//   mode: [{required: true, message: '请选择出图模式', trigger: 'change'}],
  timeout: [{required: true, message: '超时时间介于1-20分钟之间', trigger: 'change'}],
  // awaitQueue: [{required: true, message: '等待队列介于1-20之间', trigger: 'change'}],
  concurrency: [{required: true, message: '并发数介于1-20之间', trigger: 'change'}],
})

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = !id ? "添加MJ账户信息" : "编辑MJ账户信息";

  if (id && id > 0) {
    getMJParam({id}).then(res => {
      Object.assign(form, res);
    })
  } else {
    Object.assign(form, {
      mjId: "",
      account: "",
      channelId: "",
      guildId: "",
      authorization: "",
      mjBotChannelId: "",
      nijiBotChannelId: "",
      applicationId: "",
      version: "",
      sessionId: "",
      mode: 1,
      concurrency: 3,
      timeout: 5,
      awaitQueue: 10,
      weight: 10,
      proxyUrl: '',
      remark: ""
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
  ElMessage.success('添加MJ账户信息成功！')
  return true
}
const getMJParam = async (form: { id: number }) => {
  return await ApiMj.getMjParamById(form).then(res => res.data)
}
const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjParam(form)
  ElMessage.success('更新MJ账户信息成功！')
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
             width="1200px"
             :z-index="2000">

    <div style="height: auto; overflow-y: auto; overflow-x: hidden;  ">

      <el-form :model="form" label-position="right" ref="formRef" :rules="rules" :inline="false" label-width="180px">

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="账户" prop="account">
              <el-input v-model="form.account"   placeholder="输入账户" clearable
                        ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务器ID(guildId)" prop="guildId">
              <el-input v-model="form.guildId"   placeholder="输入服务器ID" clearable
                        ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通道ID(channelId)" prop="channelId">
              <el-input v-model="form.channelId"   placeholder="输入频道ID" clearable
                         ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权令牌(authorization)" prop="authorization">
              <el-input v-model="form.authorization"   placeholder="输入授权令牌" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="MJ私信ID" prop="mjBotChannelId">
              <el-input v-model="form.mjBotChannelId"   placeholder="输入MJ私信ID" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="niji私信ID" prop="nijiBotChannelId">
              <el-input v-model="form.nijiBotChannelId"   placeholder="输入niji私信ID" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务超时时间" prop="timeout">
              <el-input-number
                  v-model="form.timeout"
                  :min="1"
                  :max="20"
                  :step="1"
                  step-strictly
                  placeholder="任务超时时间"
                  :value-on-clear="1"
                  controls-position="right"
              />
             <p style="margin: 0;">分钟</p>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权重" prop="weight">
              <el-input-number
                  v-model="form.weight"
                  :min="1"
                  :max="10"
                  :step="1"
                  step-strictly
                  placeholder="权重"
                  :value-on-clear="1"
                  controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!--
            <el-form-item label="出图模式" prop="mode">
              <el-radio-group v-model="form.mode">
                <el-radio :label="1">快速模型</el-radio>
                <el-radio :label="2">休闲模式</el-radio>
                <el-radio :label="3">Turbo模式</el-radio>
              </el-radio-group>
            </el-form-item>
            -->
<!--            <el-form-item label="代理地址" prop="proxyUrl">-->
<!--              <el-input v-model="form.proxyUrl"  placeholder="代理地址" clearable-->
<!--                        maxlength="200"></el-input>-->
<!--            </el-form-item>-->
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark"  placeholder="输入备注" clearable
                        maxlength="200"></el-input>
            </el-form-item>

          </el-col>

        </el-row>

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

.access-list, li {
  list-style: none;
  margin-bottom: 16px;
}

</style>
