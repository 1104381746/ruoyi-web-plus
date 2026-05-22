<script setup lang="ts">
import { storeToRefs } from 'pinia';
import MediaBubbleRow from '@/components/MediaBubbleRow/index.vue';
import { useImageStore } from '@/stores/modules/image';
import ImageParamsPanel from './components/ImageParamsPanel.vue';

const imageStore = useImageStore();
const { sessionRecords, loading } = storeToRefs(imageStore);

const params = ref({ modelId: 0, size: '1024x1024', seed: undefined as number | undefined });
const prompt = ref('');
const messageList = ref<HTMLElement | null>(null);
const previewUrl = ref('');
const showPreview = ref(false);

onMounted(() => imageStore.fetchList(1, 100));

watch(sessionRecords, () => {
  nextTick(() => {
    if (messageList.value)
      messageList.value.scrollTop = messageList.value.scrollHeight;
  });
}, { deep: true });

async function submit() {
  if (!prompt.value.trim() || !params.value.modelId)
    return;
  await imageStore.generate({ modelId: params.value.modelId, prompt: prompt.value, size: params.value.size, seed: params.value.seed });
  prompt.value = '';
}

function download(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image.png';
  a.click();
}
</script>

<template>
  <div class="media-page">
    <div class="media-wrap" :class="{ 'has-records': sessionRecords.length > 0 }">
      <div ref="messageList" class="message-list">
        <div v-if="sessionRecords.length === 0" class="empty-state">
          <p class="text-2xl font-semibold text-gray-700">
            AI 图片生成
          </p>
          <p class="text-sm text-gray-400 mt-2">
            描述你想生成的图片，按下生成按钮开始创作
          </p>
        </div>
        <template v-else>
          <MediaBubbleRow
            v-for="record in sessionRecords"
            :key="record.id"
            :prompt="record.prompt"
            :status="record.status ?? 0"
            :media-url="record.imageUrl"
            type="image"
            @download="download"
            @remove="imageStore.remove(record.id)"
          >
            <template #default="{ mediaUrl }">
              <img
                :src="mediaUrl"
                class="rounded cursor-pointer"
                style="max-width: 512px; max-height: 512px; object-fit: contain;"
                @click="previewUrl = mediaUrl; showPreview = true"
              >
            </template>
          </MediaBubbleRow>
        </template>
      </div>
      <div class="sender-box">
        <ImageParamsPanel v-model="params" />
        <div class="input-row">
          <el-input
            v-model="prompt"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="描述你想生成的图片..."
            class="flex-1"
          />
          <el-button type="primary" :loading="loading" :disabled="!prompt.trim() || !params.modelId" class="send-btn" @click="submit">
            生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <el-image-viewer v-if="showPreview" :url-list="[previewUrl]" @close="showPreview = false" />
</template>

<style lang="scss" scoped>
.media-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 32px);
  height: 100%;
  padding: 0 16px;
  overflow: hidden;
}

.media-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 860px;
  min-height: 450px;

  &.has-records {
    justify-content: space-between;
    height: calc(100vh - 60px);
    min-height: unset;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 240px);
  padding: 24px 0 16px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
}

.sender-box {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  overflow: hidden;
  flex-shrink: 0;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 12px 12px 8px;

  :deep(.el-textarea__inner) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    resize: none;
    font-size: 14px;
    padding: 4px 0;
  }
}

.send-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
}
</style>
