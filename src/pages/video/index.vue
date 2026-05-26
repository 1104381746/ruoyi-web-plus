<script setup lang="ts">
import { storeToRefs } from 'pinia';
import MediaBubbleRow from '@/components/MediaBubbleRow/index.vue';
import { useVideoStore } from '@/stores/modules/video';
import VideoParamsPanel from './components/VideoParamsPanel.vue';

const videoStore = useVideoStore();
const { sessionRecords, loading, currentSessionId, cancelled } = storeToRefs(videoStore);

const params = ref({ modelName: '', size: '1280x720', duration: 5, seed: undefined as number | undefined, referenceImageUrl: undefined as string | undefined });
const content = ref('');
const messageList = ref<HTMLElement | null>(null);

onMounted(async () => {
  await videoStore.fetchList(1, 100);
  if (videoStore.currentSessionId) {
    videoStore.selectSession(videoStore.currentSessionId);
  }
});

watch(currentSessionId, () => {
  params.value.referenceImageUrl = undefined;
  content.value = '';
});

watch(sessionRecords, () => {
  nextTick(() => {
    if (messageList.value)
      messageList.value.scrollTop = messageList.value.scrollHeight;
  });
}, { deep: true });

async function submit() {
  if (!content.value.trim() || !params.value.modelName)
    return;
  await videoStore.generate({
    modelName: params.value.modelName,
    content: content.value,
    size: params.value.size,
    duration: params.value.duration,
    seed: params.value.seed,
    referenceImageUrl: params.value.referenceImageUrl,
  });
  if (cancelled.value) return;
  content.value = '';
  params.value.referenceImageUrl = undefined;
}

function handleCancel() {
  videoStore.cancel();
}

function download(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'video.mp4';
  a.click();
}
</script>

<template>
  <div class="media-page">
    <div class="media-wrap" :class="{ 'has-records': sessionRecords.length > 0 }">
      <div ref="messageList" class="message-list">
        <div v-if="sessionRecords.length === 0" class="empty-state">
          <p class="text-2xl font-semibold" style="color: var(--el-text-color-primary)">
            AI 视频生成
          </p>
          <p class="text-sm mt-2" style="color: var(--el-text-color-secondary)">
            描述你想生成的视频内容，按下生成按钮开始创作
          </p>
        </div>
        <template v-else>
          <MediaBubbleRow
            v-for="record in sessionRecords"
            :key="record.id"
            :content="record.content"
            :status="record.status ?? 0"
            :media-url="record.videoUrl"
            :reference-image-url="record.referenceImageUrl"
            type="video"
            @download="download"
            @remove="videoStore.remove(record.id)"
          >
            <template #default="{ mediaUrl }">
              <video
                :src="mediaUrl"
                controls
                referrerpolicy="no-referrer"
                class="video-player"
              />
              <div class="video-meta">
                <span class="text-xs text-gray-500">{{ record.size }} · {{ record.duration }}秒</span>
                <a :href="mediaUrl" target="_blank" class="text-xs text-blue-500">在新窗口打开</a>
              </div>
            </template>
          </MediaBubbleRow>
        </template>
      </div>
      <div class="sender-box">
        <VideoParamsPanel v-model="params" :key="currentSessionId ?? undefined" />
        <div class="input-row">
          <el-input
            v-model="content"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="描述你想生成的视频内容，例如：一只猫在草地上奔跑..."
            class="flex-1"
          />
          <el-button v-if="loading" type="danger" class="send-btn" @click="handleCancel">
            取消
          </el-button>
          <el-button v-else type="primary" :disabled="!content.trim() || !params.modelName" class="send-btn" @click="submit">
            生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
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
  &::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb-bg); border-radius: 2px; }
}

.sender-box {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: var(--media-sender-shadow);
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

.video-player {
  display: block;
  width: 100%;
  max-width: 640px;
  max-height: 360px;
  border-radius: 8px;
  background: #000;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
