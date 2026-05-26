<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useImageStore } from '@/stores/modules/image';
import { useUserStore } from '@/stores/modules/user';

const imageStore = useImageStore();
const { sessionRecords } = storeToRefs(imageStore);
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

onMounted(() => imageStore.fetchList(1, 100));

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
  <div class="gallery-scroll p-6 flex flex-col gap-4">
    <template v-if="sessionRecords.length > 0">
      <div class="max-w-4xl mx-auto w-full flex flex-col gap-4">
        <template v-for="record in sessionRecords" :key="record.id">
          <!-- 用户消息：右侧 -->
          <div class="flex justify-end items-start gap-2">
            <div class="bg-green-100 rounded-lg p-3 max-w-2xl text-sm">
              {{ record.content }}
            </div>
            <el-avatar :size="32" :src="userInfo?.avatar" class="shrink-0 mt-0.5">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <!-- AI 回复：左侧 -->
          <div class="flex justify-start items-start gap-2">
            <el-avatar :size="32" class="shrink-0 mt-0.5 bg-blue-500">
              <el-icon><MagicStick /></el-icon>
            </el-avatar>
            <div class="bg-white rounded-lg p-3 shadow-sm">
              <template v-if="!record.imageUrl">
                <div class="flex flex-col items-center justify-center w-64 h-64 gap-3 text-gray-400">
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
    </template>
    <div v-else class="flex-center py-20 text-gray-400">
      输入提示词开始生成图片
    </div>
  </div>
  <el-image-viewer v-if="showPreview" :url-list="[previewUrl]" @close="showPreview = false" />
</template>

<style scoped>
.gallery-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
}
</style>
