<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/modules/user';

defineProps<{
  prompt: string;
  status: number;
  mediaUrl?: string;
  type: 'image' | 'video';
  size?: string;
  duration?: number;
}>();

const emit = defineEmits<{
  preview: [url: string];
  download: [url: string];
  remove: [];
}>();

const { userInfo } = storeToRefs(useUserStore());
</script>

<template>
  <!-- 用户气泡 -->
  <div class="bubble-row bubble-row--user">
    <div class="bubble bubble--user">
      {{ prompt }}
    </div>
    <el-avatar :size="36" :src="userInfo?.avatar" class="flex-shrink-0">
      <el-icon><User /></el-icon>
    </el-avatar>
  </div>

  <!-- AI 气泡 -->
  <div class="bubble-row bubble-row--ai">
    <div class="ai-avatar">
      {{ type === 'image' ? '🎨' : '🎬' }}
    </div>
    <div class="bubble bubble--ai">
      <!-- 失败 -->
      <template v-if="status === 2">
        <div class="media-status media-status--error">
          <el-icon color="#f56c6c">
            <CircleClose />
          </el-icon>
          <span>生成失败，请重试</span>
        </div>
      </template>
      <!-- 生成中 -->
      <template v-else-if="!mediaUrl">
        <div class="media-status media-status--loading">
          <div class="spinner" />
          <span>{{ type === 'image' ? '图片生成中...' : '视频生成中，请耐心等待（约 1-3 分钟）...' }}</span>
        </div>
      </template>
      <!-- 成功 -->
      <template v-else>
        <slot :media-url="mediaUrl" />
        <div class="media-actions">
          <el-button size="small" type="primary" plain @click="emit('download', mediaUrl)">
            下载
          </el-button>
          <el-button size="small" type="danger" plain @click="emit('remove')">
            删除
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &--user { justify-content: flex-end; }
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

.media-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  min-width: 280px;

  &--error { color: #f56c6c; }
  &--loading { color: #6b7280; padding: 8px 0; }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.media-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>
