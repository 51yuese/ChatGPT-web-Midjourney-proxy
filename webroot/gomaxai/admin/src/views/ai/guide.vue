<route lang="yaml">
    meta:
      title: 引导语设置
      </route>
    
    <script lang="ts" setup>
    import { onMounted, reactive, ref } from 'vue'
    import { ElMessage } from 'element-plus'
    import type { FormInstance, FormRules } from 'element-plus'
    import apiConfig from '@/api/modules/config'
    
    const formInline = reactive({
      guideQuestion: '',
      guideAnswer: ''
    })
    
    const rules = ref<FormRules>({
        guideQuestion: [{required: true}],
        guideAnswer: [{required: true}],
    })
    
    const formRef = ref<FormInstance>()
    
    async function queryAllconfig() {
      const res = await apiConfig.queryConfig({ keys: ['guideQuestion', 'guideAnswer'] })
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
        <page-main bottomPadding="20px">
          <el-alert :closable="false" show-icon title="会话引导说明" description="AI会话示例问题和答案！" type="success" />
        </page-main>
        <el-card style="margin: 20px;">
          <template #header>
            <div class="flex justify-between">
              <b>会话引导设置</b>
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
            <h4>引导设置</h4>
            <el-row>
              <el-col :xs="24" :md="20" :lg="15" :xl="12">
                <el-form-item label="引导问题" prop="guideQuestion" label-width="150">
                    <el-input v-model="formInline.guideQuestion" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="引导答案" prop="guideAnswer" label-width="150">
                    <el-input type="textarea" :rows="6"  v-model="formInline.guideAnswer" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
    </template>
    