<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useImageStore } from '@/stores/modules/image';

const props = defineProps<{ modelId: number; size: string; seed?: number }>();
const imageStore = useImageStore();
const { loading } = storeToRefs(imageStore);
const prompt = ref('');

async function submit() {
  if (!prompt.value.trim() || !props.modelId)
    return;
  await imageStore.generate({ modelId: props.modelId, prompt: prompt.value, size: props.size, seed: props.seed });
  prompt.value = '';
}
</script>

<template>
  <div class="prompt-input p-3 border-t flex gap-2 items-end">
    <el-input
      v-model="prompt"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 4 }"
      placeholder="描述你想生成的图片..."
      class="flex-1"
      @keydown.ctrl.enter="submit"
    />
    <el-button type="primary" :loading="loading" @click="submit">
      生成
    </el-button>
  </div>
</template>
