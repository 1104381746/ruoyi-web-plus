<script setup lang="ts">
import type { GetSessionListVO } from '@/api/model/types';
import { getModelList } from '@/api';

const imageModels = ref<GetSessionListVO[]>([]);

const params = defineModel<{ modelId: number; size: string; seed?: number }>({ required: true });

onMounted(async () => {
  try {
    let res = await getModelList({ category: 'image' });
    if (res.data.length === 0) {
      res = await getModelList({ category: '' });
    }
    imageModels.value = res.data;
    if (res.data.length > 0 && !params.value.modelId)
      params.value.modelId = res.data[0].id;
  }
  catch {}
});
</script>

<template>
  <div class="params-panel px-4 py-2 flex items-center gap-4 border-b">
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">模型</span>
      <el-select v-model="params.modelId" placeholder="选择模型" size="small" style="width: 160px">
        <el-option v-for="m in imageModels" :key="m.id!" :label="m.modelName" :value="m.id!" />
      </el-select>
    </div>
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
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">随机种子</span>
      <el-input-number v-model="params.seed" :min="0" :max="4294967295" size="small" style="width: 140px" />
    </div>
  </div>
</template>
