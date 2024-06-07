<script setup lang="ts">
import SiderBar from '../../layout/siderBar/index.vue';
import { useBasicLayout } from "@/hooks/useBasicLayout";
const { isMobile } = useBasicLayout();
</script>
<template>
    <div class="musicBody">
        <SiderBar :sideType="1" v-if="!isMobile" />
    </div>
</template>
<style lang="less" scoped>
.musicBody{
    display:flex;
}
</style>