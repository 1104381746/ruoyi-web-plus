<script setup lang="ts">
import type { GetSessionListVO } from '@/api/model/types';
import { getModelList } from '@/api';

const props = defineProps<{
  category: string;
  modelName: string;
  seed?: number;
}>();

const emit = defineEmits<{
  'update:modelName': [value: string];
  'update:seed': [value: number | undefined];
}>();

const models = ref<GetSessionListVO[]>([]);

onMounted(async () => {
  try {
    let res = await getModelList({ category: props.category });
    if (res.data.length === 0)
      res = await getModelList({ category: '' });
    models.value = res.data;
    if (res.data.length > 0 && !props.modelName)
      emit('update:modelName', res.data[0].modelName!);
  }
  catch {}
});
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">模型</span>
    <el-select :model-value="modelName" placeholder="选择模型" size="small" style="width: 160px" @update:model-value="emit('update:modelName', $event)">
      <el-option v-for="m in models" :key="m.id!" :label="m.modelDescribe || m.modelName" :value="m.modelName!" />
    </el-select>
  </div>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">随机种子</span>
    <el-input-number :model-value="seed" :min="0" :max="4294967295" size="small" style="width: 140px" @update:model-value="emit('update:seed', $event)" />
  </div>
</template>
