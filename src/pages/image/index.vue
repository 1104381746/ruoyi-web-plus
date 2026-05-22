<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useImageStore } from '@/stores/modules/image';
import { useUserStore } from '@/stores/modules/user';
import ImageParamsPanel from './components/ImageParamsPanel.vue';

const imageStore = useImageStore();
const { sessionRecords, loading } = storeToRefs(imageStore);
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const params = ref({ modelId: 0, size: '1024x1024', seed: undefined as number | undefined });
const prompt = ref('');

onMounted(() => imageStore.fetchList(1, 100));

async function submit() {
  if (!prompt.value.trim() || !params.value.modelId)
    return;
  await imageStore.generate({ modelId: params.value.modelId, prompt: prompt.value, size: params.value.size, seed: params.value.seed });
  prompt.value = '';
}

const previewUrl = ref('');
const showPreview = ref(false);

function previewImage(url: string) {
  previewUrl.value = url;
  showPreview.value = true;
}

function download(url: string) {
  if (!url)
    return;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image.png';
  a.click();
}
</script>

<template>
  <div class="image-container">
    <div class="image-warp" :class="{ 'has-records': sessionRecords.length > 0 }">
      <!-- 消息列表 / 空状态 -->
      <div class="message-list">
        <div v-if="sessionRecords.length === 0" class="empty-welcome">
          <p class="text-2xl font-semibold text-gray-700">
            AI 图片生成
          </p>
          <p class="text-sm text-gray-400 mt-2">
            描述你想生成的图片，按下生成按钮开始创作
          </p>
        </div>
        <template v-for="record in sessionRecords" :key="record.id">
          <div class="image-bubble image-bubble-user">
            <div class="user-prompt-bubble">
              {{ record.prompt }}
            </div>
            <el-avatar :size="32" :src="userInfo?.avatar" class="shrink-0">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <div class="image-bubble image-bubble-ai">
            <el-avatar :size="32" class="shrink-0 ai-avatar">
              <el-icon><MagicStick /></el-icon>
            </el-avatar>
            <div class="ai-reply-bubble">
              <template v-if="record.status === 2">
                <div class="generating-placeholder">
                  <el-icon class="text-2xl" color="#f56c6c">
                    <CircleClose />
                  </el-icon>
                  <span class="text-sm text-red-400">生成失败，请重试</span>
                </div>
              </template>
              <template v-else-if="!record.imageUrl">
                <div class="generating-placeholder">
                  <el-icon class="text-3xl animate-spin">
                    <Loading />
                  </el-icon>
                  <span class="text-sm">图片生成中...</span>
                </div>
              </template>
              <template v-else>
                <img
                  :src="record.imageUrl"
                  class="rounded cursor-pointer"
                  style="max-width: 512px; max-height: 512px; object-fit: contain;"
                  @click="previewImage(record.imageUrl)"
                >
                <div class="flex gap-2 mt-2">
                  <el-button size="small" @click="download(record.imageUrl)">
                    下载
                  </el-button>
                  <el-button size="small" type="danger" @click="imageStore.remove(record.id)">
                    删除
                  </el-button>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区域 -->
      <div class="sender-wrapper">
        <ImageParamsPanel v-model="params" />
        <div class="prompt-input-row">
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
      </div>
    </div>
  </div>
  <el-image-viewer v-if="showPreview" :url-list="[previewUrl]" @close="showPreview = false" />
</template>

<style lang="scss" scoped>
.image-container {
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

.image-warp {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  min-height: 450px;

  &.has-records {
    justify-content: space-between;
    height: calc(100vh - 60px);
    min-height: unset;
  }
}

.empty-welcome {
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
  gap: 16px;
  max-height: calc(100vh - 240px);
  padding: 24px 0;
  overflow-y: auto;
}

.image-bubble {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &.image-bubble-user {
    justify-content: flex-end;
  }
}

.user-prompt-bubble {
  background-color: #e8f4e8;
  border-radius: 12px;
  padding: 10px 14px;
  max-width: 480px;
  font-size: 14px;
  line-height: 1.5;
}

.ai-avatar {
  background-color: #3b82f6;
  flex-shrink: 0;
}

.ai-reply-bubble {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.generating-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 256px;
  height: 256px;
  gap: 12px;
  color: #9ca3af;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #9ca3af;
}

.sender-wrapper {
  width: 100%;
  margin-bottom: 22px;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  background: #fff;
}

.prompt-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 12px;

  :deep(.el-textarea__inner) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    resize: none;
    font-size: 14px;
  }
}
</style>
