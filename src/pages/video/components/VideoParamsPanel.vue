<script setup lang="ts">
import BaseParamsPanel from '@/components/BaseParamsPanel/index.vue';

const params = defineModel<{ modelId: number; size: string; duration: number; seed?: number }>({ required: true });
</script>

<template>
  <div class="params-panel px-4 py-2 flex flex-wrap items-center gap-4 border-b">
    <BaseParamsPanel v-model:model-id="params.modelId" v-model:seed="params.seed" category="video" />
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">分辨率</span>
      <el-select v-model="params.size" size="small" style="width: 140px">
        <el-option label="720×480" value="720x480" />
        <el-option label="1280×720 (HD)" value="1280x720" />
        <el-option label="1920×1080 (FHD)" value="1920x1080" />
        <el-option label="3840×2160 (4K)" value="3840x2160" />
      </el-select>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">时长(秒)</span>
      <el-select v-model="params.duration" size="small" style="width: 100px">
        <el-option label="5秒" :value="5" />
        <el-option label="10秒" :value="10" />
        <el-option label="15秒" :value="15" />
        <el-option label="30秒" :value="30" />
      </el-select>
    </div>
  </div>
</template>
