import type { GenerateImageBo, ImageRecordVo } from '@/api/image/types';
import { defineStore } from 'pinia';
import { cancelImage, deleteImage, generateImage, getImageList } from '@/api/image';
import { useSessionStore } from './session';

export const useImageStore = defineStore('image', () => {
  const records = ref<ImageRecordVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const currentRecord = ref<ImageRecordVo | null>(null);
  const sessionRecords = ref<ImageRecordVo[]>([]);
  const currentSessionId = ref<string | null>(null);
  const cancelled = ref(false);

  async function generate(bo: GenerateImageBo) {
    if (!currentSessionId.value) {
      const sessionStore = useSessionStore();
      const session = await sessionStore.createTypedSession(bo.content, 'image');
      currentSessionId.value = String(session.id!);
    }
    cancelled.value = false;
    loading.value = true;
    const placeholder = { id: -Date.now(), content: bo.content, role: 'user', totalTokens: 0, imageUrl: '', userId: 0, modelName: bo.modelName, sessionId: currentSessionId.value, size: bo.size ?? '', seed: bo.seed ?? 0, referenceImageUrl: bo.referenceImageUrl, createTime: '' } as ImageRecordVo;
    sessionRecords.value.push(placeholder);
    try {
      const res = await generateImage({ ...bo, sessionId: currentSessionId.value });
      if (cancelled.value) return;
      const idx = sessionRecords.value.findIndex(r => r.id === placeholder.id);
      if (idx !== -1)
        sessionRecords.value.splice(idx, 1, res.data);
      records.value.unshift(res.data);
      total.value++;
      currentRecord.value = res.data;
    }
    catch {
      if (cancelled.value) return;
      sessionRecords.value = sessionRecords.value.filter(r => r.id !== placeholder.id);
    }
    finally {
      loading.value = false;
    }
  }

  function cancel() {
    cancelled.value = true;
    loading.value = false;
    for (const r of sessionRecords.value) {
      if (!r.imageUrl) r.status = 3;
    }
    if (currentSessionId.value) {
      cancelImage(currentSessionId.value).catch(() => {});
    }
  }

  async function fetchList(pageNum = 1, pageSize = 20, keyword?: string) {
    try {
      const sessionId = currentSessionId.value || undefined;
      console.log('[imageStore] fetchList called:', { pageNum, pageSize, keyword, sessionId, currentSessionId: currentSessionId.value });
      const res = await getImageList(pageNum, pageSize, keyword, sessionId);
      console.log('[imageStore] fetchList response:', { dataKeys: Object.keys(res), recordsCount: res.data?.records?.length, total: res.data?.total });
      records.value = res.data.records;
      total.value = res.data.total;
      if (sessionId) {
        sessionRecords.value = [...records.value].reverse();
        currentRecord.value = records.value[0] ?? null;
      }
      console.log('[imageStore] fetchList done:', { recordsCount: records.value.length, sessionRecordsCount: sessionRecords.value.length, currentRecordId: currentRecord.value?.id });
    }
    catch (e) {
      console.error('[imageStore] fetchList error:', e);
    }
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
      sessionRecords.value = records.value.filter(r => String(r.sessionId) === String(record.sessionId)).reverse();
    }
    else {
      sessionRecords.value = record ? [record] : [];
    }
  }

  function selectSession(sessionId: string) {
    console.log('[imageStore] selectSession:', { sessionId, type: typeof sessionId, recordsCount: records.value.length });
    currentSessionId.value = String(sessionId);
    currentRecord.value = records.value.find(r => String(r.sessionId) === String(sessionId)) ?? null;
    sessionRecords.value = records.value.filter(r => String(r.sessionId) === String(sessionId)).reverse();
    console.log('[imageStore] selectSession result:', { currentSessionId: currentSessionId.value, foundRecord: !!currentRecord.value, sessionRecordsCount: sessionRecords.value.length });
  }

  function newSession() {
    currentRecord.value = null;
    currentSessionId.value = null;
    sessionRecords.value = [];
  }

  return { records, total, loading, cancelled, currentRecord, sessionRecords, currentSessionId, generate, cancel, fetchList, remove, setCurrentRecord, selectSession, newSession };
});
