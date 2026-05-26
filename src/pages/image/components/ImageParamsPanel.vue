<script setup lang="ts">
import BaseParamsPanel from '@/components/BaseParamsPanel/index.vue';
import RefImageUpload from '@/components/RefImageUpload/index.vue';

const params = defineModel<{ modelName: string; size: string; seed?: number; referenceImageUrl?: string }>({ required: true });
const mode = ref<'text' | 'image'>('text');

watch(mode, (v) => {
  if (v === 'text') params.value.referenceImageUrl = undefined;
});
</script>

<template>
  <div class="params-panel border-b">
    <div class="px-4 py-2 flex flex-wrap items-center gap-4">
      <el-segmented v-model="mode" :options="[{ label: '文生图', value: 'text' }, { label: '图生图', value: 'image' }]" size="small" />
      <BaseParamsPanel v-model:model-name="params.modelName" v-model:seed="params.seed" category="image" />
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
    <div v-if="mode === 'image'" class="px-4 pb-3">
      <RefImageUpload v-model="params.referenceImageUrl" />
    </div>
  </div>
</template>
