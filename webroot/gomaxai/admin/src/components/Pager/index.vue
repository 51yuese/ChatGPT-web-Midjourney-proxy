<script setup lang="ts">
import {Pager} from "@/constants/interface";

defineProps({
  pager: {
    type: Object as () => Pager,
    default: () => ({
      page: 1,
      size: 20,
      total: 0
    }),
  },
})

const emit = defineEmits(["change"]);

const handleChange = (e) => {
  console.log(e);

  emit("change", {e})
}


</script>

<template>
  <el-pagination
      v-model:current-page="pager.page"
      v-model:page-size="pager.size"
      class="mr-5"
      :page-sizes="[15, 30, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pager.total"
      @size-change="handleChange"
      @current-change="handleChange"
  />
</template>

<style scoped lang="scss">

</style>
