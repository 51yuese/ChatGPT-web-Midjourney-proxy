<script lang="ts" setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'

import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { NButton, NIcon } from 'naive-ui'
import { Copy, Delete, Refresh, Time, Comment } from '@icon-park/vue-next'

import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { Validate } from "@/utils/validate";

import word from '@/assets/images/word.png'
import excel from '@/assets/images/excel.png'
import pdf from '@/assets/images/pdf.png'
import ppt from '@/assets/images/ppt.png'
import voice from '@/assets/images/voice.png'
import file from '@/assets/images/file.png'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  asRawText?: boolean
  dateTime?: string
  chatTail?: string
}

interface Emit {
  (ev: 'regenerate'): void

  (ev: 'delete'): void

  (ev: 'copy'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const textRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  linkify: true,
  html: true,
  highlight(code, language) {

    const validLang = !!(language && hljs.getLanguage(language))

    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }

    return highlightBlock(hljs.highlightAuto(code).value, '')
  },

}).enable('image');

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })

mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'rounded-md',
    isMobile.value ? 'p-2' : 'px-3 py-2',
    // props.inversion ? 'bg-[#F1F5F1]' : 'bg-[#FBFBFB]',
    props.inversion ? 'dark:text-[#fff]' : 'dark:text-[#000]',
    // props.inversion ? 'dark:bg-[#303056]' : 'dark:bg-[#33334D]',
    props.inversion ? 'message-request' : 'message-reply',
    { 'text-red-500': props.error },
  ]
})


const getUrl = (str: string) => {
  const reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
  const strValue = str.match(reg);
  if (strValue && strValue.length > 0) {
    return strValue[0];
  }
  return "";
}
const access = "jpg|bmp|gif|ico|pcx|jpeg|tif|png|doc|docx|xlsx|xls|pdf|ppt|pptx|wav|mp3|pcm|aac"

const accessType = access.split("|");
const text = computed(() => {
  const value = props.text ?? ''

  if (!props.asRawText) {
    // [![](img.png)](url)
    // 图片
    if (value.includes("uploaded")) {
      const url = getUrl(value)
      if (Validate.isImg(value)) {
        const txt = value.replace(` ${url}`, `[![${url}](${url})](${url})`)
        return mdi.render(txt)
      }
      if (Validate.isPdf(value)) {
        const txt = value.replace(` ${url}`, `[![${url}](${pdf})](${url})`)
        return mdi.render(txt)
      }
      if (Validate.isWord(value)) {
        const txt = value.replace(` ${url}`, `[![${url}](${word})](${url})`)
        return mdi.render(txt)
      }
      if (Validate.isExcel(value)) {
        const txt = value.replace(` ${url}`, `[![${url}](${excel})](${url})`)
        return mdi.render(txt)
      }
      if (Validate.isPPt(value)) {
        const txt = value.replace(` ${url}`, `[![${url}](${ppt})](${url})`)
        return mdi.render(txt)
      }
      if (Validate.isVoice(value)) {
        // const txt = value.replace(` ${url}`, `![${url}](/src/assets/images/voice.png)`)
        const txt = value.replace(` ${url}`, `<audio id="audio" controls  controlslist="noplaybackrate nodownload" poster="${voice}" preload="none"> <source id="mp3" src="${url}"></audio>
 `)
        return mdi.render(txt)
      }
      const txt = value.replace(` ${url}`, `[![${url}](${file})](${url})`)
      return mdi.render(txt)
    }

    return mdi.render(value)
  }

  return value
})

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

function handleRegenerate() {
  emit('regenerate')
}

function handleCopy() {
  emit('copy')
}

function handleDelete() {
  emit('delete')
}

defineExpose({ textRef })
function timestampFormat(dateTime) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30
  var result = "";
  // 当前时间的毫秒值
  let currentTime = new Date().getTime()
  // 发布时间的毫秒值
  let pushTime = Date.parse(dateTime.replace(/-/gi, "-"))
  var diffValue = currentTime - pushTime;
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  if (monthC >= 1) {
    result = parseInt(monthC) + "个月前";
  }
  else if (weekC >= 1) {
    result = "发表于" + parseInt(weekC) + "周前";
  }
  else if (dayC >= 1) {
    result = parseInt(dayC) + "天前";
  }
  else if (hourC >= 1) {
    result = parseInt(hourC) + "个小时前";
  }
  else if (minC >= 1) {
    result = parseInt(minC) + "分钟前";
  } else
    result = "刚刚";
  return result;
}
</script>

<template>
  <div :class="wrapClass" class="w-full">
    <div ref="textRef" class="leading-relaxed break-words" style="width:100%;">
      <!--  答  -->
      <div v-if="!inversion" class="flex flex-col items-start" style="width:100%;">
        <div class="w-full">
          <div class="dark:bg-[#1C2635] bg-[#F5F8FE] p-2 rounded-md dark:text-[#ffffff] text-[#3378ED]">

            <div  v-if="!asRawText"
              :class="['w-full', { 'markdown-body-generate': loading }]" v-html="text" />
<!--						<div  v-if="!asRawText"-->
<!--									:class="['w-full markdown-body', { 'markdown-body-generate': loading }]" v-html="text" />-->

            <div v-else class="w-full whitespace-pre-wrap" v-text="text" />
          </div>


          <div style="display: flex;justify-content: space-between;align-items: center;">
            <div>
              <!--这里是新按照UI图修改的内容-->
              <div class="mt-4 flex items-center">
                <NIcon :size="12" :component="Comment" class="mr-1.5 text-[#2F88FF]" />
                <p class="text-xs text-[#888] ">{{ chatTail }}</p>
              </div>

              <div class="flex">

                <!-- <p class="text-xs text-[#888] flex items-center mr-4" :class="[inversion ? '' : 'text-left']">
              <NIcon :size="10" :component="Time" class="mr-1.5" />
              <span class="leading-none mt-0.5 line-clamp-1">
                {{ dateTime }}
              </span>
            </p> -->
                <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                  <NButton text @click="handleRegenerate">
                    <template #icon>
                      <NIcon :size="10" :component="Refresh" />
                    </template>
                    <span class="text-xs leading-none mt-0.5">重新回答</span>
                  </NButton>
                </div>
                <span class="ml-4 " />
                <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                  <NButton class="ml-2 " text @click="handleCopy">
                    <template #icon>
                      <NIcon :size="10" :component="Copy" />
                    </template>
                    <span class="text-xs leading-none mt-0.5">复制</span>
                  </NButton>
                </div>
                <span class="ml-4" />
                <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                  <NButton text @click="handleDelete">
                    <template #icon>
                      <NIcon :size="10" :component="Delete" />
                    </template>
                    <span class="text-xs leading-none mt-0.5">删除</span>
                  </NButton>
                </div>
              </div>
            </div>
            <div class="dark:text-[#484A4D] text-[#A3A5A6]">{{ timestampFormat(dateTime) }}</div>
          </div>
        </div>

      </div>

      <!-- 问 -->
      <div v-else>

        <div>
          <div :class="props.inversion ? 'bg-[#F1F5F1]  dark:bg-[#15171A]' : 'bg-[#FBFBFB] dark:bg-[#33334D]'"
            class="p-2 rounded-md">
            <div v-if="!asRawText" :class="['w-full markdown-body', { 'markdown-body-generate': loading }]"
              v-html="text" />
            <div v-else class="w-full whitespace-pre-wrap" v-text="text" />

            <!--这里是新按照UI图修改的内容-->
            <!-- <div class="mt-4 flex items-center">
              <NIcon :size="12" :component="Comment" class="mr-1.5 text-[#2F88FF]" />
              <p class="text-xs text-[#888] ">{{ chatTail }}</p>
            </div> -->
          </div>


          <div style="display: flex;justify-content: space-between;align-items: center;">
            <div class="flex">
              <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                <NButton text @click="handleRegenerate">
                  <template #icon>
                    <NIcon :size="10" :component="Refresh" />
                  </template>
                  <span class="text-xs leading-none mt-0.5">重新提问</span>
                </NButton>
              </div>
              <span class="ml-4 " />
              <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                <NButton class="ml-2 " text @click="handleCopy">
                  <template #icon>
                    <NIcon :size="10" :component="Copy" />
                  </template>
                  <span class="text-xs leading-none mt-0.5">复制</span>
                </NButton>
              </div>


              <span class="ml-4" />
              <div class="bg-[#f4f4f4] dark:bg-[#15171A]" style="margin-top: 12px;border-radius: 5px;padding: 0 10px;">
                <NButton text @click="handleDelete">
                  <template #icon>
                    <NIcon :size="10" :component="Delete" />
                  </template>
                  <span class="text-xs leading-none mt-0.5">删除</span>
                </NButton>
              </div>
            </div>
            <div class="dark:text-[#484A4D] text-[#A3A5A6]">{{ timestampFormat(dateTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import url(./style.less);
</style>
