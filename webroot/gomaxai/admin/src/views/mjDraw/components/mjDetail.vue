<script setup lang="ts">
import ApiMj from "@/api/modules/mj";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {reactive} from "vue";

const loading = ref(false);
const visible = ref(false);
const title = ref('');
const manageId = ref(0);

const form = reactive({
  id: 0,
  setting: {},
  account: "",
  channelId: "",
  guildId: "",
  authorization: "",
  applicationId: "",
  version: "",
  sessionId: "",
  usedTime: "",
  totalTime: "",
  fastRemainTime: "",
  relaxRemainTime: "",
  renewDate: "",
  orderPlan: 0,
  createdAt: "",
  updatedAt: "",
  type: 1,
  enable: 1,
  concurrency: 3,
  timeout: 5,
  awaitQueue: 10,
  remark: ""
});

const emits = defineEmits(["fresh"])

function open(id?: number) {
  visible.value = true;
  manageId.value = id || 0;
  title.value = "查看详情";
   form.id = id;
  if (id && id > 0) {
    getAccess({id}).then(res => {

      const set = JSON.parse(res.setting);

      Object.assign(form, {
         ...res,
         setting: res.setting ? set : {}
      });
    })
  }
}

function close() {
  visible.value = false;
  Object.assign(form, {})
}


const getAccess = async (form: { id: number }) => {
  return await ApiMj.getMjParamById(form).then(res => res.data)
}
const submitUpdate = async (form: any) => {
  await ApiMj.modifyMjParam(form)
  ElMessage.success('更新MJ账户信息成功！')
}


const getBtnType = (style: number) => {
  return style === 1 ? 'primary' : style === 3 ? 'success' :  style === 4 ? 'danger' : 'info'
}

const handleUpdate = async (param: {messageId: string, customId: string, flags: number, }) => {
  loading.value = true;
  const id = form.id;
  await ApiMj.updateMjSetting({...param, mode: form.type, accountId: id}).then(res => {
    getAccess({id}).then(res => {
      const set = JSON.parse(res.setting);
      Object.assign(form, {
        ...res,
        setting: res.setting ? set : {}
      });
    })
  })
  loading.value = false
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

      <div>
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>账号信息</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="12">
              <p>账户名:  <span>{{form.account}}</span></p>
              <p>频道ID:  <span>{{form.channelId}}</span></p>
              <p>服务器ID: <span> {{form.guildId}}</span></p>
              <p>授权令牌:  <span>{{form.authorization}}</span></p>
            </el-col>
            <el-col :span="12">
              <p>状态:  <span>{{form.enable === 1 ? '启用' : '停用'}}</span></p>
              <p>出图模式:  <span>{{form.type === 1 ? '快速' : form.type === 2 ? '休闲' : form.type === 3 ? 'Turbo' : ''}}</span></p>
              <p>快速时间剩余:  <span>{{form.fastRemainTime}}</span></p>
              <p>订阅计划: <span> {{form.orderPlan === 1 ? '标准' : '其他' }}</span></p>
              <p>续订时间:  <span>{{form.renewDate}}</span></p>
            </el-col>

          </el-row>
        </el-card>

        <el-card class="box-card" shadow="never" v-if="form.setting !== '{}'">
          <template #header>
            <div class="card-header">
              <span>设置</span>
            </div>
          </template>
           <div class="setting-content" v-loading="loading">


             <div v-for="item in form.setting?.components" class="setting-content-line1">
                <div v-for="subItem in item.components" class="setting-content-line2">
                   <el-button style="margin: 4px;" :type="getBtnType(subItem.style)" @click="handleUpdate({ messageId: form?.setting?.id, customId: subItem?.custom_id, flags: form?.setting?.flags!})"><span style="margin-right: 2px">{{subItem.emoji?.name}}</span>{{subItem.label}}</el-button>
                </div>
             </div>

           </div>
        </el-card>

      </div>

    </div>

  </el-dialog>

</template>

<style scoped lang="less">
.box-card {
   margin-bottom: 10px;
  :deep(.el-card__header) {
     background: #efefef;
  }
  p {
    color: #888;
    span {
      color: #222;
    }
  }
  .card-header {
    //background: #ccc;
  }
}

.access-list, li {
  list-style: none;
  margin-bottom: 16px;
}

.setting-content {
   display: flex;
   flex-direction: column;
   .setting-content-line1 {
     display: flex;
     flex-direction: row;
   }
}

</style>
