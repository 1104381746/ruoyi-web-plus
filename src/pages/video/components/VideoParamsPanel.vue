<script setup lang="ts">
import type { GetSessionListVO } from '@/api/model/types';
import { getModelList } from '@/api';

const videoModels = ref<GetSessionListVO[]>([]);
const params = defineModel<{ modelId: number; size: string; duration: number; seed?: number }>({ required: true });

onMounted(async () => {
  try {
    const res = await getModelList({ category: 'video' });
    videoModels.value = res.data;
    if (res.data.length > 0 && !params.value.modelId)
      params.value.modelId = res.data[0].id!;
  }
  catch {}
});
</script>

<template>
  <div class="params-panel px-4 py-2 flex flex-wrap items-center gap-4 border-b">
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">模型</span>
      <el-select v-model="params.modelId" placeholder="选择模型" size="small" style="width: 160px">
        <el-option v-for="m in videoModels" :key="m.id!" :label="m.modelDescribe || m.modelName" :value="m.id!" />
      </el-select>
    </div>
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
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">随机种子</span>
      <el-input-number v-model="params.seed" :min="0" :max="4294967295" size="small" style="width: 140px" />
    </div>
  </div>
</template>
