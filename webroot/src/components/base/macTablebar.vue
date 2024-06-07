<script setup lang="ts">
import { ref } from 'vue'
import { useIpcRenderer } from '@vueuse/electron'
defineProps<{ title?: string }>()
const ipcRenderer = useIpcRenderer()
const hover = ref('')
const isMax = ref(false)

const closeWindow = () => {
  ipcRenderer.invoke('closeWindow')
}

const maxmizeMainWin = () => {
  if (isMax.value)
    ipcRenderer.invoke('unmaximizeWindow')

  else
    ipcRenderer.invoke('maxmizeWindow')

  isMax.value = !isMax.value
}

const minimizeMainWindow = () => {
  ipcRenderer.invoke('minimizeWindow')
}
</script>

<template>
  <div class="wrapper">
    <div class="btn close-btn" @click="closeWindow" @mouseover="hover = 'close'" @mouseleave="hover = ''" />
    <div class="btn min-btn" @click="minimizeMainWindow" @mouseover="hover = 'min'" @mouseleave="hover = ''" />
    <div class="btn max-btn" @click="maxmizeMainWin" @mouseover="hover = 'max'" @mouseleave="hover = ''" />
  </div>
</template>

<style scoped>
body {
   margin: 0;
}

.wrapper {
   height: 32px;
   display: flex;
   justify-content: center;
   align-items: center;
}

.btn {
   width: 12px;
   height: 12px;
   border-radius: 50%;
   margin-right: 6px;
   position: relative;
   overflow: hidden;
   cursor: pointer;
}

.btn:last-child {
   margin-right: 0;
}

.btn:before,
.btn:after {
   content: "";
   position: absolute;
   top: 100%;
   left: 50%;
   transform: translate(-50%, -50%);
   border-radius: 1px;
   opacity: 0;
   transition: all 300ms ease-in-out;
}

.close-btn {
   background: #FF5D5B;
   border: 1px solid #CF544D;
}

.min-btn {
   background: #FFBB39;
   border: 1px solid #CFA64E;
}

.max-btn {
   background: #00CD4E;
   border: 1px solid #0EA642;
}

/* Close btn */
.close-btn:before,
.close-btn:after {
   width: 1px;
   height: 70%;
   background: #460100;
}

.close-btn:before {
   transform: translate(-50%, -50%) rotate(45deg);
}

.close-btn:after {
   transform: translate(-50%, -50%) rotate(-45deg);
}

/* min btn */
.min-btn:before {
   width: 70%;
   height: 1px;
   background: #460100;
}

/* max btn */
.max-btn:before {
   width: 50%;
   height: 50%;
   background: #024D0F;
}

.max-btn:after {
   width: 1px;
   height: 90%;
   transform: translate(-50%, -50%) rotate(-135deg);
   background: #00CD4E;
}

/* Hover function */
.wrapper:hover .btn:before,
.wrapper:hover .btn:after {
   top: 50%;
   opacity: 1;
}
</style>
