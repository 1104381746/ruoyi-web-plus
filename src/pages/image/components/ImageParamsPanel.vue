<script setup lang="ts">
import BaseParamsPanel from '@/components/BaseParamsPanel/index.vue';

const params = defineModel<{ modelId: number; size: string; seed?: number }>({ required: true });
</script>

<template>
  <div class="params-panel px-4 py-2 flex flex-wrap items-center gap-4 border-b">
    <BaseParamsPanel v-model:model-id="params.modelId" v-model:seed="params.seed" category="image" />
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">尺寸</span>
      <el-select v-model="params.size" size="small" style="width: 130px">
        <el-option label="512×512" value="512x512" />
        <el-option label="1024×1024 (1K)" value="1024x1024" />
        <el-option label="1024×768" value="1024x768" />
        <el-option label="768×1024" value="768x1024" />
        <el-option label="2048×2048 (2K)" value="2048x2048" />
        <el-option label="4096×4096 (4K)" value="4096x4096" />
      </el-select>
    </div>
  </div>
</template>
