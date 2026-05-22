import type { GenerateImageBo, ImageRecordVo } from '@/api/image/types';
import { defineStore } from 'pinia';
import { deleteImage, generateImage, getImageList } from '@/api/image';

export const useImageStore = defineStore('image', () => {
  const records = ref<ImageRecordVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const currentRecord = ref<ImageRecordVo | null>(null);
  const sessionRecords = ref<ImageRecordVo[]>([]);
  const currentSessionId = ref<string | null>(null);

  function newSessionId() {
    return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function generate(bo: GenerateImageBo) {
    if (!currentSessionId.value) {
      currentSessionId.value = newSessionId();
    }
    loading.value = true;
    const placeholder = { id: -Date.now(), prompt: bo.prompt, imageUrl: '', userId: 0, modelId: bo.modelId, sessionId: currentSessionId.value, size: bo.size ?? '', seed: bo.seed ?? 0, createTime: '' } as ImageRecordVo;
    sessionRecords.value.push(placeholder);
    try {
      const res = await generateImage({ ...bo, sessionId: currentSessionId.value });
      const idx = sessionRecords.value.findIndex(r => r.id === placeholder.id);
      if (idx !== -1)
        sessionRecords.value.splice(idx, 1, res.data);
      records.value.unshift(res.data);
      total.value++;
      currentRecord.value = res.data;
    }
    catch {
      sessionRecords.value = sessionRecords.value.filter(r => r.id !== placeholder.id);
    }
    finally {
      loading.value = false;
    }
  }

  async function fetchList(pageNum = 1, pageSize = 20, keyword?: string) {
    try {
      const res = await getImageList(pageNum, pageSize, keyword);
      records.value = res.data.records;
      total.value = res.data.total;
    }
    catch {}
  }

  async function remove(id: number) {
    try {
      await deleteImage(id);
      records.value = records.value.filter(r => r.id !== id);
      sessionRecords.value = sessionRecords.value.filter(r => r.id !== id);
      total.value--;
      if (currentRecord.value?.id === id) {
        currentRecord.value = records.value[0] ?? null;
        sessionRecords.value = currentRecord.value ? [currentRecord.value] : [];
      }
    }
    catch {}
  }

  function setCurrentRecord(record: ImageRecordVo | null) {
    currentRecord.value = record;
    currentSessionId.value = record?.sessionId ?? null;
    if (record?.sessionId) {
      sessionRecords.value = records.value.filter(r => r.sessionId === record.sessionId);
    }
    else {
      sessionRecords.value = record ? [record] : [];
    }
  }

  function newSession() {
    currentRecord.value = null;
    currentSessionId.value = null;
    sessionRecords.value = [];
  }

  return { records, total, loading, currentRecord, sessionRecords, currentSessionId, generate, fetchList, remove, setCurrentRecord, newSession };
});
