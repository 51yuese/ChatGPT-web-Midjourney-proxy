<script setup lang="ts">
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore } from '@/store'
const emit = defineEmits<Emit>()
const authStore = useAuthStore()
interface Item {
  [key: number]: string
}

const siteRobotName = authStore.globalConfig?.siteRobotName || 'Ai Robot'

const data: Item = {
  1: '我希望你能担任英语翻译、拼写校对和修辞改进的角色。我会用任何语言和你交流，你会识别语言，将其翻译并用更为优美和精炼的英语回答我。请将我简单的词汇和句子替换成更为优美和高雅的表达方式，确保意思不变，但使其更具文学性。请仅回答更正和改进的部分，不要写解释。我的第一句话是“how are you ?”，请翻译它。',
  2: '我想让你扮演一个心理学家。我会告诉你我的想法。我希望你能给我科学的建议，让我感觉更好。我的第一个想法，{ 在这里输入你的想法，如果你解释得更详细，我想你会得到更准确的答案。}',
  3: '请确认我的以下请求。请您作为产品经理回复我。我将会提供一个主题，您将帮助我编写一份包括以下章节标题的PRD文档：主题、简介、问题陈述、目标与目的、用户故事、技术要求、收益、KPI指标、开发风险以及结论。在我要求具体主题、功能或开发的PRD之前，请不要先写任何一份PRD文档。',
  4: '我要你做我的私人厨师。我会告诉你我的饮食偏好和过敏，你会建议我尝试的食谱。你应该只回复你推荐的食谱，别无其他。不要写解释。我的第一个请求是“我是一名素食主义者，我正在寻找健康的晚餐点子。”',
  5: '我想让你做一个旅游指南。我会把我的位置写给你，你会推荐一个靠近我的位置的地方。在某些情况下，我还会告诉您我将访问的地方类型。您还会向我推荐靠近我的第一个位置的类似类型的地方。我的第一个建议请求是“我在上海，我只想参观博物馆。”',
  6: '如果你能穿越时空，你会去哪个时代？',
  7: '解释一下量子力学是什么？',
  8: '介绍一下人工智能的历史？',
  9: '讲解一下深度学习是如何工作的？',
}

interface Emit {
  (ev: 'prompt', item: Item): void
}
function handleClick(id: number) {
  emit('prompt', data[id])
}
const { isMobile } = useBasicLayout()
</script>

<template>
  <div :class="[isMobile ? 'mt-2' : 'mt-28']" class=" rounded-md px-4 py-4 ">
    <h1 class="mb-6 rounded px-4 py-2 text-center text-3xl font-bold text-[#3076fd]">
      {{ siteRobotName }}
    </h1>
    <div class="w-full md:min-w-[450px]">
      <div class="grid grid-cols-3 gap-x-2 gap-y-3">
        <div class="space-y-4">
          <h2 class="text-md text-center">
            <SvgIcon icon="ri:ai-generate" class="mb-2 inline-block text-lg" />
            <p>私人助理</p>
          </h2>
          <div class="space-y-e">
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800" @click="handleClick(1)">
              英语翻译官
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(2)">
              心理学家
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(3)">
              产品经理
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <h2 class="text-md text-center">
            <SvgIcon icon="ri:lightbulb-flash-line" class="mb-2 inline-block text-lg" />
            <p>轻松娱乐</p>
          </h2>
          <div class="space-y-e">
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800" @click="handleClick(4)">
              如何学做菜
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(5)">
              旅游攻略
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(6)">
              穿越时空
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <h2 class="text-md text-center">
            <SvgIcon icon="ri:book-mark-line" class="mb-2 inline-block text-lg" />
            <p>AI百科</p>
          </h2>
          <div class="space-y-e">
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800" @click="handleClick(7)">
              量子力学
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(8)">
              人工智能
            </div>
            <div class="text-ellipsis-1 cursor-pointer rounded bg-neutral-100 px-4 py-4 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mt-4" @click="handleClick(9)">
              深度学习
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 text-center text-sm text-neutral-400">
        点击以上话题，快速与我对话
      </div>
    </div>
  </div>
</template>
