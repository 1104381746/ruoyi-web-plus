<!-- Main -->
<script setup lang="ts">
import { useKeepAliveStore } from '@/stores/modules/keepAlive';

const keepAliveStore = useKeepAliveStore();

const isRouterShow = ref(true);
const refreshMainPage = (val: boolean) => (isRouterShow.value = val);
provide('refresh', refreshMainPage);
</script>

<template>
  <el-main class="layout-main">
    <router-view v-slot="{ Component, route }">
      <keep-alive :max="10" :include="keepAliveStore.keepAliveName">
        <component :is="Component" v-if="isRouterShow" :key="route.fullPath" />
      </keep-alive>
    </router-view>
  </el-main>
</template>

<style scoped lang="scss">
.layout-main {
  height: 100%;
  overflow: hidden;
}
</style>
