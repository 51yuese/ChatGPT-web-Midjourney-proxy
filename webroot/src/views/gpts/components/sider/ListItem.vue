<script setup lang='ts'>
import { NInput, NPopconfirm, NImage } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useGptsStore } from '@/store'
import { debounce } from '@/utils/functions/debounce'
import logo from '@/assets/logo.png'
interface Props {
  dataSources?: Gpts.ChatState['groupList']
  title?: string
}
interface Emit {
  (ev: 'update', group: Gpts.History, isEdit: boolean): void
  (ev: 'delete', group: Gpts.History): void
  (ev: 'sticky', group: Gpts.History): void
  (ev: 'select', group: Gpts.History): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const dataSources = props.dataSources

const gptsStore = useGptsStore()

async function handleSelect(group: Gpts.History) {
	console.log(group)
  emit('select', group)
}

// function handleEdit(group: Chat.History, isEdit: boolean, event?: MouseEvent) {
//   event?.stopPropagation()
//   group.isEdit = isEdit
// }

async function handleSticky(group: Gpts.History, event?: MouseEvent) {
  event?.stopPropagation()
  await gptsStore.updateGroupInfo({ isSticky: !group.isSticky, groupId: group.uuid })
  await gptsStore.queryMyGroup()
}

/* 删除对话组 */
async function handleDelete(params: Gpts.History, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()
  emit('delete', params)
}

const handleDeleteDebounce = debounce(handleDelete, 600)

/* 修改对话组title */
async function updateGroupInfo(params: Gpts.History) {
  const { uuid, title } = params
  params.isEdit = false
  await gptsStore.updateGroupInfo({ groupId: uuid, title })
  await gptsStore.queryMyGroup()
}

/* 修改对话组信息 */
// async function handleEnter(params: Chat.History, event: KeyboardEvent) {
//   event?.stopPropagation()
//   if (event.key === 'Enter')
//     updateGroupInfo(params)
// }

/* 保存修改的对话信息 */
function handleSave(params: Chat.History, event: KeyboardEvent) {
  event?.stopPropagation()
  updateGroupInfo(params)
}

/* 判断是不是当前选中 */
function isActive(uuid: number) {
  return gptsStore.active === uuid
}
</script>

<template>
  <p class="mb-2 text-xs text-neutral-400 font-bold">
    {{ props.title }} <span class="ml-1">({{ dataSources?.length }})</span>
  </p>
  <div v-for="item of dataSources" :key="`${item.uuid}`">

    <div
      class="relative flex items-center gap-3 px-3 py-1.5 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#1f1f38]"
      :class="isActive(item.uuid) && ['border-[#3076FD]', 'bg-neutral-100', 'text-[#3076FD]', 'dark:bg-[#1f1f38]', 'dark:border-[#3076fd]', 'pr-20']"
      @click="handleSelect(item)"
    >

      <div class="w-[40px] h-[40px] flex items-center">
        <n-image :src="item.logo || logo" :fallback-src="logo" lazy class="rounded-full overflow-hidden"></n-image>
        <!--        <SvgIcon :icon="item.isSticky ? 'ri:pushpin-2-line' : item.appId ? 'icon-park-outline:application-one' : 'ri:message-3-line'" />-->
      </div>

      <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
<!--        <NInput-->
<!--          v-if="item.isEdit"-->
<!--          v-model:value="item.title" size="tiny"-->
<!--          @keypress="handleEnter(item, $event)"-->
<!--        />-->
        <span >{{ item.title }}</span>
      </div>

      <div v-if="isActive(item.uuid)" class="absolute z-10 flex visible right-1">
        <template v-if="item.isEdit">
          <button class="p-1" @click="handleSave(item, $event)">
            <SvgIcon icon="ri:save-line" />
          </button>
        </template>

        <template v-else>
          <button class="p-1">
            <SvgIcon :icon="item.isSticky ? 'ri:unpin-line' : 'ri:pushpin-line'" @click="handleSticky(item, $event)" />
          </button>

<!--          <button v-if="!item.appId" class="p-1">-->
<!--            <SvgIcon icon="ri:edit-line" @click="handleEdit(item, true, $event)" />-->
<!--          </button>-->

          <NPopconfirm placement="bottom" @positive-click="handleDeleteDebounce(item, $event)">
            <template #trigger>
              <button class="p-1">
                <SvgIcon icon="ri:delete-bin-line" />
              </button>
            </template>
            {{ $t('chat.deleteHistoryConfirm') }}
          </NPopconfirm>

        </template>
      </div>
    </div>
  </div>
</template>
