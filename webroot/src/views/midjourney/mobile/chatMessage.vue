<script setup lang="ts">

import {  NInput, NSwitch,  } from "naive-ui";
import {SvgIcon} from "@/components/common";
import {computed, ref } from "vue";
import {t} from "@/locales";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {useAuthStore} from "@/store";
const {isMobile} = useBasicLayout();
const {updatePromptWords, updateInspireDialog} = useAuthStore();
const prompt = ref('');

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const handleModifyPrompt = () => {
  updatePromptWords({prompt: prompt.value});
}

const handlePromptCreate = () => {
  updateInspireDialog(true)
}

</script>

<template>
  <footer class="input-message">
    <div :class="['m-auto', isMobile ? 'px-2 py-1' : 'mt-4']">
      <div class="flex items-stretch space-x-2">
        <div class="relative flex-1 mj-input">
          <div class="flex justify-between items-center mb-2">

            <p class="flex flex-start items-center text-[16px]">
              <SvgIcon icon="ri:input-field"></SvgIcon>
              输入描述词
            </p>

            <div class="bg-[#F7F7F7] bg-gradient-to-r from-[#3076ED] to-[#54A2F5] hover:bg-gradient-to-r rounded-3xl flex justify-start py-1 px-2
             cursor-pointer hover:bg-[#3144F1] hover:dark:bg-[#3144F1]" @click="handlePromptCreate">
              <p class="select-none text-[12px]">咒语生成器</p>
            </div>
          </div>


          <NInput
              ref="inputRef"
              v-model:value="prompt"
              @update:value="handleModifyPrompt"
              type="textarea"
              round
              class="pb-10"
              clearable
              maxlength="500"
              show-count
              :placeholder="placeholder"
              :rows="3"
          >
          </NInput>

          <div class="absolute bottom-2  left-2">
            <div class="flex items-center justify-between">
              <div class="flex justify-between items-center">
                <label class="text-sm">自动翻译</label>
                <NSwitch text size="small" round></NSwitch>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">

</style>
