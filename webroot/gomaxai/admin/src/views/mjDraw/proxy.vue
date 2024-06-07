<route lang="yaml">
meta:
  title: MJ设置
  </route>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiConfig from '@/api/modules/config'

const formInline = reactive({
  mjTimeoutMs: '', // 接口超时时间
  mjProxy: '0',
  mjSocketProxyUrl: '',
  mjProxyUrl: '',
  mjLimitCount: null,
  mjProxyImgUrl: '',
  mjNotSaveImg: '0',
  mjModel: '',
  mjProxyHost: '',
  mjProxySecert: '',
  mjTransferHost: '', 
  mjTransferSecert: '',
  mjTransferOrganization: '',
  fast_mjDeduction1: '',
  fast_mjDeduction2: '',
  fast_mjDeduction3: '',
  relax_mjDeduction1: '',
  relax_mjDeduction2: '',
  relax_mjDeduction3: '',
  trubo_mjDeduction1: '',
  trubo_mjDeduction2: '',
  trubo_mjDeduction3: '',
})

const rules = ref<FormRules>({
  mjProxyHost: [{required: true}],
  mjProxySecert: [{required: true}],
  mjTransferHost: [{required: true}],
  mjTransferSecert: [{required: true}],
  fast_mjDeduction1: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  fast_mjDeduction2: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  fast_mjDeduction3: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  relax_mjDeduction1: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  relax_mjDeduction2: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  relax_mjDeduction3: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  trubo_mjDeduction1: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  trubo_mjDeduction2: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
  trubo_mjDeduction3: [{required: true, message: '扣减积分不能为空'}, { validator:(rule, value, callback) => {if (value<0) {callback('扣减积分不能小于0')} else {callback()} }}],
})

const formRef = ref<FormInstance>()

async function queryAllconfig() {
  // const res = await apiConfig.queryConfig({ keys: ['mjTimeoutMs', 'mjProxy', 'mjProxyUrl', 'mjSocketProxyUrl','mjLimitCount','mjNotSaveImg','mjProxyImgUrl', 'mjTransferUrl' , 'mjTransferKey'] })
  const res = await apiConfig.queryConfig({ keys: ['mjTimeoutMs', 'mjProxy', 'mjProxyUrl', 'mjSocketProxyUrl', 'mjLimitCount', 'mjNotSaveImg', 'mjProxyImgUrl', 'mjModel', 'mjProxyHost','mjProxySecert','mjTransferHost', 'mjTransferSecert', 'mjTransferOrganization',
  'fast_mjDeduction1',
  'fast_mjDeduction2',
  'fast_mjDeduction3',
  'relax_mjDeduction1',
  'relax_mjDeduction2',
  'relax_mjDeduction3',
  'trubo_mjDeduction1',
  'trubo_mjDeduction2',
  'trubo_mjDeduction3',
] })
  Object.assign(formInline, res.data)
}

function handlerUpdateConfig() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await apiConfig.setConfig({ settings: fotmatSetting(formInline) })
        ElMessage.success('变更配置信息成功')
      }
      catch (error) {}
      queryAllconfig()
    }
    else {
      ElMessage.error('请填写完整信息')
    }
  })
}

function fotmatSetting(settings: any) {
  return Object.keys(settings).map((key) => {
    return {
      configKey: key,
      configVal: settings[key],
    }
  })
}

onMounted(() => {
  queryAllconfig()
})
</script>

<template>
  <div>
    <!-- <page-main bottomPadding="20px">
      <el-alert :closable="false" show-icon title="MJ参数说明" description="如果您是海外服务器则不强制开启代理、反之则需要开启代理、代理为系统配套项目、非常规代理、如果您想自己搭建代理请查看教程、如果您想使用系统提供的默认代理、那么选择开启代理并且不填写代理地址即可使用默认地址、如果想获取默认地址请在售后群获取地址！" type="success" />
    </page-main> -->
    <el-card style="margin: 20px;">
      <template #header>
        <div class="flex justify-between">
          <b>MJ参数设置</b>
          <el-button class="button"   @click="handlerUpdateConfig">
            保存设置
          </el-button>
        </div>
      </template>
      <el-form ref="formRef" :rules="rules" :model="formInline" label-width="150px">
        <!-- <h4>绘图代理设置</h4>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="是否开启代理" prop="mjProxy">
              <el-switch
                v-model="formInline.mjProxy"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="HTTP代理地址" prop="mjProxyUrl" label-width="150">
              <el-input v-model="formInline.mjProxyUrl" placeholder="请填写代理地址、详细使用请访问教程！" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="Socket代理地址" prop="mjSocketProxyUrl" label-width="150">
              <el-input v-model="formInline.mjSocketProxyUrl" placeholder="请填写Socket代理地址详细使用请访问教程！" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="绘画超时时间设置ms" prop="mjTimeoutMs" label-width="150">
              <el-input v-model="formInline.mjTimeoutMs" placeholder="请设置绘画超时时间、单位为ms、根据慢速快速定义（后续优化逻辑）" clearable />
            </el-form-item>
          </el-col>
        </el-row> -->
        <h4>绘图设置</h4>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="绘图模式" prop="mjModel" label-width="150">
              <el-select v-model="formInline.mjModel" placeholder="请选择" clearable >
                <el-option value="mjProxy" label="代理模式（通过代理服务器进行多个MJ账号管理）"></el-option>
                <el-option value="mjTransfer" label="中转模式（通过中转服务商提供的单个账号服务）"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="formInline.mjModel == 'mjProxy'">
          <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
              <el-form-item label="代理地址" prop="mjProxyHost" label-width="150">
                <el-input v-model="formInline.mjProxyHost" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
              <el-form-item label="代理密钥" prop="mjProxySecert" label-width="150">
                <el-input v-model="formInline.mjProxySecert" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
              <el-form-item label="中转地址" prop="mjTransferHost" label-width="150">
                <el-input v-model="formInline.mjTransferHost" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
              <el-form-item label="中转密钥" prop="mjTransferSecert" label-width="150">
                <el-input v-model="formInline.mjTransferSecert" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
              <el-form-item label="中转组织" prop="mjTransferOrganization" label-width="150">
                <el-input v-model="formInline.mjTransferOrganization" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-divider />
        <h4>图片存储设置</h4>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="不存储图片" prop="mjNotSaveImg">
              <el-switch
                v-model="formInline.mjNotSaveImg"
                active-value="1"
                inactive-value="0"
              />
              <el-tooltip
                class="box-item"
                effect="dark"
                placement="right"
              >
                <template #content>
                  <div style="width: 250px;">
                    默认会存储图片到配置的存储中、如果开启此选择则表示不保存原图到我们配置的存储上、那么则必须配置一个图片反代地址、直接反代访问原始图片、这样可以进一步节省空间、需要您部署mj-proxy项目并填写基础地址即可！
                  </div>
                </template>
                <el-icon class="ml-3 cursor-pointer"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="图片反代地址" prop="mjProxyImgUrl" label-width="150">
              <el-input v-model="formInline.mjProxyImgUrl" placeholder="图片反代地址、用于代理访问图片、此项目请自行部署mj-proxy项目配置其中的地址即可！" clearable  style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <h4>绘图用户设置</h4>
        <el-row>
          <el-col :xs="24" :md="20" :lg="15" :xl="12">
            <el-form-item label="单人绘图并发限制" prop="mjLimitCount" label-width="150">
              <el-input v-model="formInline.mjLimitCount" placeholder="单人同时绘制限制数量、同一时间最多可以绘制几张！" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
                <el-alert :closable="false" show-icon title="I类操作说明" type="success">
                    Imagine/Variation/Outpaint/Pan/Blend/Inpaint/Upscale 2x/Upscale 4x/PicReader/Reroll
                    <br>
                    中文释义: 想象/变体/扩展/平移/融合/补漆/放大2倍/放大4倍/图片阅读器/重掷骰子
                </el-alert>
                <el-row style="margin: 20px 0">
                    <el-col :span="8">
                        <el-form-item label="fast模式" prop="fast_mjDeduction1" label-width="100">
                        <el-input v-model="formInline.fast_mjDeduction1" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="relax模式" prop="relax_mjDeduction1" label-width="100">
                        <el-input v-model="formInline.relax_mjDeduction1" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="trubo模式" prop="trubo_mjDeduction1" label-width="100">
                        <el-input v-model="formInline.trubo_mjDeduction1" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
                <el-alert :closable="false" show-icon title="II类操作说明" type="success" >
                    Upscale/Describe/PicReaderRetry/FaceSwap/Shorten
                    <br>
                    中文释义: 放大/图表文字/图表重试/换脸/prompt缩短
                </el-alert>
                <el-row style="margin: 20px 0">
                    <el-col :span="8">
                        <el-form-item label="fast模式" prop="fast_mjDeduction2" label-width="100">
                        <el-input v-model="formInline.fast_mjDeduction2" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="relax模式" prop="relax_mjDeduction2" label-width="100">
                        <el-input v-model="formInline.relax_mjDeduction2" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="trubo模式" prop="trubo_mjDeduction2" label-width="100">
                        <el-input v-model="formInline.trubo_mjDeduction2" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :md="20" :lg="15" :xl="12">
                <el-alert :closable="false" show-icon title="III类操作说明" type="success" >
                    Fetch/ListByIds/Modal/Seed
                    <br>
                    中文释义: 获取单个任务/批量获取任务/弹出模态框/种子Seed
                </el-alert>
                <el-row style="margin: 20px 0">
                    <el-col :span="8">
                        <el-form-item label="fast模式" prop="fast_mjDeduction3" label-width="100">
                        <el-input v-model="formInline.fast_mjDeduction3" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="relax模式" prop="relax_mjDeduction3" label-width="100">
                        <el-input v-model="formInline.relax_mjDeduction3" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="trubo模式" prop="trubo_mjDeduction3" label-width="100">
                        <el-input v-model="formInline.trubo_mjDeduction3" type="number" placeholder="请输入" clearable />
                    </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>
