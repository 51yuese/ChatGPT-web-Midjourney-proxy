<script lang="ts" setup>
import {computed, ref} from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'

import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import {NButton, NIcon} from 'naive-ui'
import {Copy, Delete, Refresh, Time, Comment} from '@icon-park/vue-next'

import {useBasicLayout} from '@/hooks/useBasicLayout'
import {t} from '@/locales'
import {Validate} from "@/utils/validate";

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


function timestampFormat(dateTime){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30
	var result = "";
	// 当前时间的毫秒值
	let currentTime = new Date().getTime()
	// 发布时间的毫秒值
	let pushTime =  Date.parse(dateTime.replace(/-/gi,"-"))
	var diffValue  = currentTime - pushTime;
	var monthC =diffValue/month;
	var weekC =diffValue/(7*day);
	var dayC =diffValue/day;
	var hourC =diffValue/hour;
	var minC =diffValue/minute;
	if(monthC>=1){
		result= parseInt(monthC) + "个月前";
	}
	else if(weekC>=1){
		result="发表于" + parseInt(weekC) + "周前";
	}
	else if(dayC>=1){
		result= parseInt(dayC) +"天前";
	}
	else if(hourC>=1){
		result= parseInt(hourC) +"个小时前";
	}
	else if(minC>=1){
		result= parseInt(minC) +"分钟前";
	}else
		result="刚刚";
	return result;
}


interface Emit {
  (ev: 'regenerate'): void

  (ev: 'delete'): void

  (ev: 'copy'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const {isMobile} = useBasicLayout()

const textRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  linkify: true,
  html: true,
  highlight(code, language) {

    const validLang = !!(language && hljs.getLanguage(language))

    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, {language: lang}).value, lang)
    }

    return highlightBlock(hljs.highlightAuto(code).value, '')
  },

}).enable('image');

mdi.use(mila, {attrs: {target: '_blank', rel: 'noopener'}})

mdi.use(mdKatex, {blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000'})

const wrapClass = computed(() => {
//   return [
//     'text-wrap',
//     'min-w-[20px]',
//     'rounded-md',
//     isMobile.value ? 'p-2' : 'px-3 py-2',
//     props.inversion ? 'bg-[#F1F5F1]' : 'bg-[#FBFBFB]',
//     props.inversion ? 'dark:text-[#fff]' : 'dark:text-[#000]',
//     props.inversion ? 'dark:bg-[#15171A]' : 'dark:bg-[#1C2635]',
//     props.inversion ? 'message-request' : 'message-reply',
//     {'text-red-500': props.error},
//   ]
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
        const txt = value.replace(` ${url}`, `[![${url}](${url}#pic_center)](${url})`)
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

defineExpose({textRef})
</script>

<template>
  <div style="width: 100%" :class="wrapClass" class="w-full">
    <div ref="textRef" class="leading-relaxed break-words">
    <!--  答  -->
      <div v-if="!inversion" class="flex flex-col items-start">
        <div class="w-full">
          <div class="dark:bg-[#1C2635] bg-[#F5F8FE] dark:text-[#ffffff] text-[#3378ED]" style="padding: 10px;border-radius: 8px">
<!--						<div v-if="!asRawText" :class="['w-full', { 'dark:text-[#2960B] text-[#3378ED]': loading}]" v-html="text"/>-->

<!--						<div v-else class="w-full dark:text-[#2960B] text-[#3378ED]" v-text="text"/>-->

						<div v-if="!asRawText" :class="['w-full', { 'dark:text-[#ffffff] text-[#3378ED]': loading}]" v-html="text"/>

						<div v-else class="w-full dark:text-[#ffffff] text-[#3378ED]" v-text="text"/>
					</div>

          <!--这里是新按照UI图修改的内容-->
          <div class="mt-4 flex items-center">
<!--            <NIcon :size="12" :component="Comment" class="mr-1.5 text-[#2F88FF]"/>-->
						<svg class="mr-1" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
							<g clip-path="url(#clip0_357_574)">
								<path d="M9.99999 18.3334C14.6024 18.3334 18.3333 14.6024 18.3333 10C18.3333 5.39765 14.6024 1.66669 9.99999 1.66669C5.39761 1.66669 1.66666 5.39765 1.66666 10C1.66666 11.1299 1.89152 12.2073 2.29894 13.1898C2.50929 13.6971 2.76831 14.1791 3.07017 14.63C3.17148 14.7813 2.98142 15.738 2.49999 17.5C4.26203 17.0186 5.2187 16.8285 5.37003 16.9299C5.82095 17.2317 6.30295 17.4907 6.81024 17.7011C7.79274 18.1085 8.87012 18.3334 9.99999 18.3334Z" stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
								<path d="M6.91855 8.25836H13.9099" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M9.10278 6.55743L7.88873 13.4426" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M12.0195 6.55743L10.8054 13.4426" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M6.08521 11.6667H13.0766" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
							</g>
							<defs>
								<clipPath id="clip0_357_574">
									<rect width="20" height="20" fill="white"/>
								</clipPath>
							</defs>
						</svg>
            <p class="text-xs dark:text-[#484A4D] text-[#A3A5A6] ">{{ chatTail }}</p>
          </div>

          <div class="flex mt-2" style="align-items: center; justify-content: space-between">

<!--            <p class="text-xs text-[#888] flex items-center mr-4" :class="[inversion ? '' : 'text-left']">-->
<!--              <NIcon :size="10" :component="Time" class="mr-1.5"/>-->
<!--              <span class="leading-none mt-0.5 line-clamp-1">-->
<!--								{{ dateTime }}-->
<!--							</span>-->
<!--            </p>-->

            <div>
							<NButton style="border-radius: 8px; padding: 0 12px" class="dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C]" text @click="handleRegenerate">
								<template #icon>
<!--									<NIcon :size="10" :component="Refresh"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<path d="M15.3033 15.3033C13.9461 16.6605 12.0711 17.5 10 17.5C5.85787 17.5 2.5 14.1421 2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C12.0711 2.5 13.9461 3.33947 15.3033 4.69671C15.9941 5.38754 17.5 7.08333 17.5 7.08333" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M17.5 3.33331V7.08331H13.75" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5">重新回答</span>
							</NButton>

							<span class="ml-4 "/>

							<NButton style="border-radius: 8px; padding: 0 12px" class="dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C] ml-2 " text @click="handleCopy">
								<template #icon>
<!--									<NIcon :size="10" :component="Copy"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<rect x="2.07745" y="5.34167" width="12.4709" height="12.5559" rx="4" stroke="#A3A5A6" stroke-width="1.67"/>
										<path d="M5.43121 5.84316V5.84316C5.43121 3.75122 7.12707 2.05536 9.21902 2.05536H13.9021C16.1113 2.05536 17.9021 3.84622 17.9021 6.05536V10.7936C17.9021 12.902 16.1929 14.6113 14.0844 14.6113V14.6113" stroke="#A3A5A6" stroke-width="1.67"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5 ">复制</span>
							</NButton>

							<span class="ml-4"/>

							<NButton style="border-radius: 8px; padding: 0 12px" class="dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C]" text @click="handleDelete">
								<template #icon>
<!--									<NIcon :size="10" :component="Delete"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<path d="M4.65503 4.99585V13.5249C4.65503 15.7341 6.44589 17.5249 8.65503 17.5249H11.3449C13.554 17.5249 15.3449 15.7341 15.3449 13.5249V4.99585H4.65503Z" stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
										<path d="M8.57471 8.55914V13.1914" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M11.4253 8.55914V13.1914" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M2.87341 4.99585H17.1265" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M6.49884 4.9958L6.91386 4.26902C7.5473 3.15972 8.72672 2.47504 10.0041 2.47504V2.47504C11.2926 2.47504 12.4805 3.17153 13.1096 4.29596L13.5012 4.9958H6.49884Z" stroke="#A3A5A6 " stroke-width="1.67" stroke-linejoin="round"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5">删除</span>
							</NButton>
						</div>

						<div class="dark:text-[#484A4D] text-[#A3A5A6]">{{timestampFormat(dateTime)}}</div>
          </div>

          <!-- <span v-if="loading" class="dark:text-white w-[4px] h-[20px] block animate-blink" /> -->
        </div>

      </div>

      <!-- 问 -->
			<div v-else>
					<div class="dark:bg-[#15171A] bg-[#F4F4F4]" style="padding: 10px;border-radius: 8px">
						<div v-if="!asRawText" :class="['w-full markdown-body', { 'markdown-body-generate dark:text[#fff]': loading}]" v-html="text"/>
						<div v-else class="w-full whitespace-pre-wrap" v-text="text"/>
					</div>

					<!--这里是新按照UI图修改的内容-->
					<!--        <div class="mt-4 flex items-center">-->
					<!--          <NIcon :size="12" :component="Comment" class="mr-1.5 text-[#2F88FF]"/>-->
					<!--          <p class="text-xs text-[#888] ">{{ chatTail }}</p>-->
					<!--        </div>-->

					<div class="flex mt-2" style="align-items: center; justify-content: space-between">

<!--						<p class="text-xs text-[#888] flex items-center mr-4" :class="[inversion ? ' ' : 'text-left']">-->
<!--							<NIcon :size="10" :component="Time" class="mr-1.5"/>-->
<!--							<span class="leading-none mt-0.5 line-clamp-1">-->
<!--								{{ dateTime }}-->
<!--							</span>-->
<!--						</p>-->

						<div>
							<NButton style="border-radius: 8px; padding: 0 12px" class="dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C]" text @click="handleRegenerate">
								<template #icon>
<!--									<NIcon :size="10" :component="Refresh"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<path d="M15.3033 15.3033C13.9461 16.6605 12.0711 17.5 10 17.5C5.85787 17.5 2.5 14.1421 2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C12.0711 2.5 13.9461 3.33947 15.3033 4.69671C15.9941 5.38754 17.5 7.08333 17.5 7.08333" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M17.5 3.33331V7.08331H13.75" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5">重新提问</span>
							</NButton>

							<span class="ml-4 "/>

							<NButton style="border-radius: 8px; padding: 0 12px" class="ml-2 dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C]" text @click="handleCopy">
								<template #icon>
<!--									<NIcon :size="10" :component="Copy"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<rect x="2.07745" y="5.34167" width="12.4709" height="12.5559" rx="4" stroke="#A3A5A6" stroke-width="1.67"/>
										<path d="M5.43121 5.84316V5.84316C5.43121 3.75122 7.12707 2.05536 9.21902 2.05536H13.9021C16.1113 2.05536 17.9021 3.84622 17.9021 6.05536V10.7936C17.9021 12.902 16.1929 14.6113 14.0844 14.6113V14.6113" stroke="#A3A5A6" stroke-width="1.67"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5">复制</span>
							</NButton>

							<span class="ml-4"/>

							<NButton style="border-radius: 8px; padding: 0 12px" class="dark:bg-[#15171A] bg-[#F4F4F4] dark:text-[#F4F4F4] text-[#03060C]" text @click="handleDelete">
								<template #icon>
<!--									<NIcon :size="10" :component="Delete"/>-->
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 20 20" fill="none">
										<path d="M4.65503 4.99585V13.5249C4.65503 15.7341 6.44589 17.5249 8.65503 17.5249H11.3449C13.554 17.5249 15.3449 15.7341 15.3449 13.5249V4.99585H4.65503Z" stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
										<path d="M8.57471 8.55914V13.1914" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M11.4253 8.55914V13.1914" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M2.87341 4.99585H17.1265" stroke="#A3A5A6" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M6.49884 4.9958L6.91386 4.26902C7.5473 3.15972 8.72672 2.47504 10.0041 2.47504V2.47504C11.2926 2.47504 12.4805 3.17153 13.1096 4.29596L13.5012 4.9958H6.49884Z" stroke="#A3A5A6" stroke-width="1.67" stroke-linejoin="round"/>
									</svg>
								</template>
								<span class="text-xs leading-none mt-0.5">删除</span>
							</NButton>
						</div>
						<div class="dark:text-[#484A4D] text-[#A3A5A6]">{{timestampFormat(dateTime)}}</div>

					</div>

			</div>


    </div>
  </div>
</template>

<style lang="less">
@import url(./style.less);
</style>
