<script setup lang="ts">
import { NButton, NCard, NDataTable, NDrawer, NDrawerContent, NGrid, NGridItem, NInput, NSpace, useDialog, useMessage } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
import { fetchGetRechargeLogAPI } from '@/api/balance'
import { fetchGetPackageAPI, fetchUseCramiAPI } from '@/api/crami'
import { RechargeTypeMap } from '@/constants'
import type { ResData } from '@/api/types'
const { isSmallMd, isMobile } = useBasicLayout()
const authStore = useAuthStore()
const ms = useMessage()
const dialog = useDialog()
interface RechargeLog {
  uid: string
  rechargeType: number
  usesLeft: number
  paintCount: number
  balance: number
  createdAt: Date
}

interface Rkg {
  name: string
  coverImg: string
  des: string
  rechargeType: number
  model3Count: number
  model4Count: number
  drawMjCount: number
  expireDateCn: string
  createdAt: Date
  price: number
}

const userBalance = computed(() => authStore.userBalance)
const loading = ref(false)
const code = ref('')
const showDrawer = ref(false)
const packageList = ref<Rkg[]>([])
const rechargeLoading = ref(false)

const paginationReg = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    paginationReg.page = page
    queryRechargeLog()
  },
  onUpdatePageSize: (pageSize: number) => {
    paginationReg.pageSize = pageSize
    paginationReg.page = 1
    queryRechargeLog()
  },
})

const columns = computed(() => {
  return [
    {
      title: '订单编号',
      key: 'uid',
    },
    {
      title: '充值类型',
      key: 'rechargeType',
      render(row: RechargeLog) {
        return RechargeTypeMap[row.rechargeType]
      },
    },
    {
      title: '基础模型额度',
      key: 'model3Count',
    },
    {
      title: '高级模型额度',
      key: 'model4Count',
    },
    {
      title: 'MJ绘画额度',
      key: 'drawMjCount',
    },
    {
      title: '有效期',
      key: 'expireDateCn',
    },
    {
      title: '充值时间',
      key: 'createdAt',
      render(row: RechargeLog) {
        return row.createdAt
      },
    },
  ]
})

const data = ref([])

async function queryRechargeLog() {
  const res: ResData = await fetchGetRechargeLogAPI({ page: paginationReg.page, size: paginationReg.pageSize })
  const { rows } = res.data
  data.value = rows
}

async function useCrami() {
  if (!code.value)
    return ms.warning('请先填写卡密！')
  try {
    loading.value = true
    await fetchUseCramiAPI({ code: code.value })
    ms.success('卡密兑换成功、祝您使用愉快！')
    queryRechargeLog()
    authStore.getUserInfo()
    authStore.getUserBalance()
    loading.value = false
  }
  catch (error) {
    loading.value = false
  }
}

function openDrawer() {
  showDrawer.value = true
}

async function openDrawerAfter() {
  const res: ResData = await fetchGetPackageAPI({ status: 1, size: 30 })
  packageList.value = res.data.rows
}

const buyCramiAddress = computed(() => authStore.globalConfig?.buyCramiAddress)

function buyPackage() {
  window.open(buyCramiAddress.value)
}

onMounted(() => {
  queryRechargeLog()
  authStore.getUserBalance()
})

</script>

<template>
  <div class="flex h-full flex-col">
    <NCard>
      <template #header>
        <div>我的积分</div>
      </template>
      <NGrid style="padding: 0 30px" :x-gap="24" :y-gap="24" :cols=" isSmallMd ? 1 : 2" class="mt-0">
        <NGridItem class="n-grid-item border dark:border-[#ffffff17] rounded-sm p-3">
          <div class="text-[#95aac9] mb-2 text-base">
            基础模型余额
          </div>
          <b class="text-3xl text-[#C7B51B] dark:text-[#C7B51B]">{{ userBalance.sumModel3Count ?? 0 }}</b> <span class="ml-4 text-[#989898] ">每次对话根据模型消费不同积分！</span>
        </NGridItem>
        <NGridItem class="n-grid-item border dark:border-[#ffffff17] rounded-sm p-3">
          <div class="text-[#95aac9] mb-2 text-base">
            高级模型余额
          </div>
          <b class="text-3xl text-[#C7B51B] dark:text-[#C7B51B]">{{ userBalance.sumModel4Count ?? 0 }}</b> <span class="ml-4 text-[#989898] ">每次对话根据模型消费不同积分！</span>
        </NGridItem><NGridItem class="n-grid-item border dark:border-[#ffffff17] rounded-sm p-3">
          <div class="text-[#95aac9] mb-2 text-base">
            MJ绘画余额
          </div>
          <b class="text-3xl text-[#C7B51B] dark:text-[#C7B51B]">{{ userBalance.sumDrawMjCount ?? 0 }}</b> <span class="ml-4 text-[#989898] ">根据画图动作消耗不同的积分！</span>
        </NGridItem><NGridItem class="n-grid-item border dark:border-[#ffffff17] rounded-sm p-3">
          <div class="text-[#95aac9] mb-2 text-base">
            权益兑换
          </div>
          <NSpace :wrap="false">
						<div class="dark:bg-[#010102] bg-[#f4f4f4]">
							<NInput  v-model:value="code" placeholder="请粘贴或填写您的卡密信息！" class="mr-3" maxlength="128" show-count clearable />
						</div>

            <NButton type="primary" :loading="loading" @click="useCrami">
              兑换
            </NButton>
<!--            <NButton v-if="buyCramiAddress" type="success" @click="openDrawer">-->
<!--              购买卡密-->
<!--            </NButton>-->
          </NSpace>
        </NGridItem>
      </NGrid>
    </NCard>
    <NCard class="mt-5 flex-1 dark:bg-[#010102] bg-[#ffffff] dark:border-[#010102] border-[#f4f4f4]">
      <template #header>
        <div>充值记录</div>
      </template>
      <NDataTable class="" style="padding: 0 30px" :columns="columns" :loading="rechargeLoading" :scroll-x="800" :data="data" max-height="280" :pagination="paginationReg" />
    </NCard>
    <NDrawer v-model:show="showDrawer" :width=" isSmallMd ? '100%' : 502" :on-after-enter="openDrawerAfter">
      <NDrawerContent title="套餐购买" closable>
        <NGrid :x-gap="15" :y-gap="15" :cols=" isSmallMd ? 1 : 2" class="mt-3">
          <NGridItem  v-for="(item, index) in packageList" :key="index">
            <NCard size="small" embedded>
              <template #header>
                <div class="relative">
                  <b>{{ item.name }}</b>
                </div>
              </template>
              <template #cover>
                <img :src="item.coverImg">
              </template>
              <div>
                <p>{{ item.des }}</p>
                <div class="flex justify-between items-end min-h-28">
                  <span class="text-sm font-bold mr-1">基础模型额度</span>
                  <span class="font-bold">{{ item.model3Count }}</span>
                </div>
                <div class="flex justify-between items-end min-h-28">
                  <span class="text-sm font-bold mr-1">高级模型额度</span>
                  <span class="font-bold">{{ item.model4Count }}</span>
                </div>
                <div class="flex justify-between items-end min-h-28">
                  <span class="text-sm font-bold mr-1">MJ绘画额度</span>
                  <span class="font-bold">{{ item.drawMjCount }}</span>
                </div>
                <div class="flex justify-between items-end mt-5">
                  <i class="text-xl text-[red] font-bold">{{ `￥${item.price}` }}</i>
                  <NButton type="primary" dashed size="small" @click="buyPackage">
                    购买套餐
                  </NButton>
                </div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
	.n-card{
		/* background-color: #3B3B62 !important; */
		border-radius: 10px;
	}

	.n-grid-item{
		border-radius: 10px;
	}

	.n-input {
		background-color: transparent;
		--n-border: 0px solid rgb(224, 224, 230) !important;
	}

	.n-modal .n-data-table, .n-drawer .n-data-table{
		--n-merged-th-color: transparent;
		--n-merged-td-color: transparent;
		--n-merged-border-color: #ffffff17;
	}
	/deep/.n-base-selection .n-base-selection-label{
		background-color: transparent !important;
		border: 1px solid #ffffff17;
	}
</style>
