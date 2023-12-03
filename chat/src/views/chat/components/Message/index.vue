<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean // 反转
  error?: boolean
  loading?: boolean
	chatTail?: string
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const ms = useMessage()
const { isMobile } = useBasicLayout()

const { iconRender } = useIconRender()

const textRef = ref<HTMLElement>()

const validImage = (str?: string) => str && /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png)$/.test(str)

const image = [".jpg", ".png", '.jpeg', 'webp']
const asRawText = ref(props.inversion && !props.text?.includes("https://") && !validImage(props?.text))

const messageRef = ref<HTMLElement>()
//
// const options = computed(() => {
//
//   const common = [
//     {
//       label: t('chat.copy'),
//       key: 'copyText',
//       icon: iconRender({ icon: 'ri:file-copy-2-line' }),
//     },
//     {
//       label: t('common.delete'),
//       key: 'delete',
//       icon: iconRender({ icon: 'ri:delete-bin-line' }),
//     },
//   ]
//
//   if (!props.inversion) {
//     common.unshift({
//       label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
//       key: 'toggleRenderType',
//       icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
//     })
//   }
//
//   return common
// })

// function handleSelect(key: 'copyText' | 'delete' | 'toggleRenderType') {
//   switch (key) {
//     case 'copyText':
//       copyText({ text: props.text ?? '' })
//       ms.success('复制成功！')
//       return
//     case 'toggleRenderType':
//       asRawText.value = !asRawText.value
//       return
//     case 'delete':
//       emit('delete')
//   }
// }

function handleDelete() {
  emit('delete')
}

function handleCopy() {
  copyText({ text: props.text ?? '' })
  props.text && ms.success('复制成功！')
}

function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden items-start"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 mt-1"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >

        <TextComponent
          ref="textRef"
					:chatTail="chatTail"
					:dateTime="dateTime"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :as-raw-text="asRawText"
          @regenerate="handleRegenerate"
          @copy="handleCopy"
          @delete="handleDelete"
        />

      </div>
    </div>
  </div>
</template>
