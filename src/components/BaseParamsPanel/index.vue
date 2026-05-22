<script setup lang="ts">
import type { GetSessionListVO } from '@/api/model/types';
import { getModelList } from '@/api';

const props = defineProps<{
  category: string;
  modelId: number;
  seed?: number;
}>();

const emit = defineEmits<{
  'update:modelId': [value: number];
  'update:seed': [value: number | undefined];
}>();

const models = ref<GetSessionListVO[]>([]);

onMounted(async () => {
  try {
    let res = await getModelList({ category: props.category });
    if (res.data.length === 0)
      res = await getModelList({ category: '' });
    models.value = res.data;
    if (res.data.length > 0 && !props.modelId)
      emit('update:modelId', res.data[0].id!);
  }
  catch {}
});
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">模型</span>
    <el-select :model-value="modelId" placeholder="选择模型" size="small" style="width: 160px" @update:model-value="emit('update:modelId', $event)">
      <el-option v-for="m in models" :key="m.id!" :label="m.modelDescribe || m.modelName" :value="m.id!" />
    </el-select>
  </div>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">随机种子</span>
    <el-input-number :model-value="seed" :min="0" :max="4294967295" size="small" style="width: 140px" @update:model-value="emit('update:seed', $event)" />
  </div>
</template>
