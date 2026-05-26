<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { uploadFile } from '@/api/oss';

const modelValue = defineModel<string | undefined>();
const uploading = ref(false);
const previewUrl = ref(modelValue.value ?? '');

watch(modelValue, (val) => {
  previewUrl.value = val ?? '';
});

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件');
    return;
  }
  uploading.value = true;
  try {
    const url = await uploadFile(file);
    modelValue.value = url;
    previewUrl.value = url;
  }
  catch (e: any) {
    ElMessage.error(e.message || '上传失败');
  }
  finally {
    uploading.value = false;
  }
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file)
    handleFile(file);
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file)
    handleFile(file);
}

function onPaste(e: ClipboardEvent) {
  const file = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'))?.getAsFile();
  if (file)
    handleFile(file);
}

function clear() {
  modelValue.value = undefined;
  previewUrl.value = '';
}

const inputRef = ref<HTMLInputElement>();
</script>

<template>
  <div
    class="ref-upload"
    :class="{ 'has-image': previewUrl }"
    @drop="onDrop"
    @dragover.prevent
    @paste="onPaste"
    @click="!previewUrl && inputRef?.click()"
  >
    <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="onFileInput">
    <template v-if="previewUrl">
      <img :src="previewUrl" class="preview-img">
      <div class="overlay">
        <el-button size="small" @click.stop="inputRef?.click()">
          更换
        </el-button>
        <el-button size="small" type="danger" @click.stop="clear">
          移除
        </el-button>
      </div>
    </template>
    <template v-else>
      <el-icon v-if="uploading" class="is-loading" style="font-size: 1.5rem; color: var(--el-text-color-secondary)">
        <Loading />
      </el-icon>
      <template v-else>
        <el-icon style="font-size: 1.5rem; color: var(--el-border-color)">
          <Picture />
        </el-icon>
        <span class="text-xs mt-1" style="color: var(--el-text-color-secondary)">点击/拖拽/粘贴上传参考图</span>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ref-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  border: 1.5px dashed var(--ref-upload-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
  background: var(--ref-upload-bg);

  &:hover { border-color: var(--ref-upload-hover-border); }

  &.has-image { cursor: default; border-style: solid; }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgb(0 0 0 / 40%);
  opacity: 0;
  transition: opacity 0.2s;

  .has-image:hover & { opacity: 1; }
}
</style>
