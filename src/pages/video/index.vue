<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/modules/user';
import { useVideoStore } from '@/stores/modules/video';
import VideoParamsPanel from './components/VideoParamsPanel.vue';

const videoStore = useVideoStore();
const { sessionRecords, loading } = storeToRefs(videoStore);
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const params = ref({ modelId: 0, size: '1280x720', duration: 5, seed: undefined as number | undefined });
const prompt = ref('');
const messageList = ref<HTMLElement | null>(null);

onMounted(() => videoStore.fetchList(1, 100));

watch(sessionRecords, () => {
  nextTick(() => {
    if (messageList.value)
      messageList.value.scrollTop = messageList.value.scrollHeight;
  });
}, { deep: true });

async function submit() {
  if (!prompt.value.trim() || !params.value.modelId)
    return;
  await videoStore.generate({
    modelId: params.value.modelId,
    prompt: prompt.value,
    size: params.value.size,
    duration: params.value.duration,
    seed: params.value.seed,
  });
  prompt.value = '';
}
</script>

<template>
  <div class="video-page">
    <div class="chat-wrap" :class="{ 'has-records': sessionRecords.length > 0 }">
      <!-- 消息列表 / 空状态 -->
      <div ref="messageList" class="message-list">
        <div v-if="sessionRecords.length === 0" class="empty-state">
          <p class="text-2xl font-semibold text-gray-700">
            AI 视频生成
          </p>
          <p class="text-sm text-gray-400 mt-2">
            描述你想生成的视频内容，按下生成按钮开始创作
          </p>
        </div>
        <template v-else>
          <template v-for="record in sessionRecords" :key="record.id">
            <!-- 用户提示词 -->
            <div class="bubble-row bubble-row--user">
              <div class="bubble bubble--user">
                {{ record.prompt }}
              </div>
              <el-avatar :size="36" :src="userInfo?.avatar" class="avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>

            <!-- AI 回复 -->
            <div class="bubble-row bubble-row--ai">
              <div class="ai-avatar">
                🎬
              </div>
              <div class="bubble bubble--ai">
                <!-- 生成中 -->
                <template v-if="record.status === 0 && !record.videoUrl">
                  <div class="generating">
                    <div class="generating-spinner" />
                    <span>视频生成中，请耐心等待（约 1-3 分钟）...</span>
                  </div>
                </template>
                <!-- 失败 -->
                <template v-else-if="record.status === 2">
                  <div class="error-state">
                    <el-icon color="#f56c6c">
                      <CircleClose />
                    </el-icon>
                    <span>生成失败，请重试</span>
                  </div>
                </template>
                <!-- 成功 -->
                <template v-else-if="record.videoUrl">
                  <video
                    :src="record.videoUrl"
                    controls
                    referrerpolicy="no-referrer"
                    class="video-player"
                    @error="(e) => console.error('Video error:', e, record.videoUrl)"
                  />
                  <div class="video-meta">
                    <span class="text-xs text-gray-500">{{ record.size }} · {{ record.duration }}秒</span>
                    <a :href="record.videoUrl" target="_blank" class="text-xs text-blue-500">在新窗口打开</a>
                  </div>
                  <div class="video-actions">
                    <a :href="record.videoUrl" target="_blank" download>
                      <el-button size="small" type="primary" plain>下载</el-button>
                    </a>
                    <el-button size="small" type="danger" plain @click="videoStore.remove(record.id)">
                      删除
                    </el-button>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- 输入区 -->
      <div class="sender-box">
        <VideoParamsPanel v-model="params" />
        <div class="input-row">
          <el-input
            v-model="prompt"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="描述你想生成的视频内容，例如：一只猫在草地上奔跑..."
            class="prompt-input"
            @keydown.ctrl.enter="submit"
          />
          <el-button type="primary" :loading="loading" :disabled="!prompt.trim() || !params.modelId" class="send-btn" @click="submit">
            生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-page {
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

.chat-wrap {
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
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 24px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
  }
}

.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &--user {
    justify-content: flex-end;
  }
}

.avatar {
  flex-shrink: 0;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.bubble {
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 680px;
  font-size: 14px;
  line-height: 1.6;

  &--user {
    background: #e8f4ff;
    color: #1a1a1a;
    border-bottom-right-radius: 4px;
  }

  &--ai {
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
    border-bottom-left-radius: 4px;
    padding: 16px;
  }
}

.generating {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #6b7280;
  font-size: 14px;
  min-width: 280px;
}

.generating-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 14px;
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
  border-top: 1px solid #f0f0f0;
}

.video-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
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

.prompt-input {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
}
</style>
