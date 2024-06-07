<script setup lang="ts">
   import {ref} from 'vue'
   const showDelete = ref(false)


   const handleSubmit = () => {
     showDelete.value = false;
   }
</script>

<template>
  <el-popover :visible="showDelete" placement="top" :width="160">
    <p>删除后不可找回，确定删除？</p>

    <div style="text-align: right; margin: 0">
      <el-button size="small" text @click="showDelete = false">取消</el-button>
      <el-button size="small" type="primary" @click="showDelete = false">确定</el-button>
    </div>

    <template #reference>
      <slot :visible="showDelete" ></slot>
<!--      <el-button @click="visible = true">Delete</el-button>-->
    </template>

  </el-popover>
</template>

<style scoped lang="less">

</style>
