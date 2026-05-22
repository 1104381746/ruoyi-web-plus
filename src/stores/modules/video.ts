import type { GenerateVideoBo, VideoRecordVo } from '@/api/video/types';
import { defineStore } from 'pinia';
import { deleteVideo, generateVideo, getVideoList } from '@/api/video';

export const useVideoStore = defineStore('video', () => {
  const records = ref<VideoRecordVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const sessionRecords = ref<VideoRecordVo[]>([]);
  const currentSessionId = ref<string | null>(null);

  function newSessionId() {
    return `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function generate(bo: GenerateVideoBo) {
    if (!currentSessionId.value) {
      currentSessionId.value = newSessionId();
    }
    loading.value = true;
    const placeholder = {
      id: -Date.now(),
      prompt: bo.prompt,
      videoUrl: '',
      userId: 0,
      modelId: bo.modelId,
      sessionId: currentSessionId.value,
      size: bo.size ?? '',
      duration: bo.duration ?? 0,
      seed: bo.seed ?? 0,
      status: 0,
      createTime: '',
    } as VideoRecordVo;
    sessionRecords.value.push(placeholder);
    try {
      const res = await generateVideo({ ...bo, sessionId: currentSessionId.value });
      const idx = sessionRecords.value.findIndex(r => r.id === placeholder.id);
      if (idx !== -1)
        sessionRecords.value.splice(idx, 1, res.data);
      records.value.unshift(res.data);
      total.value++;
    }
    catch {
      sessionRecords.value = sessionRecords.value.filter(r => r.id !== placeholder.id);
    }
    finally {
      loading.value = false;
    }
  }

  async function fetchList(pageNum = 1, pageSize = 20) {
    try {
      const res = await getVideoList(pageNum, pageSize);
      records.value = res.data.records;
      total.value = res.data.total;
    }
    catch {}
  }

  async function remove(id: number) {
    try {
      await deleteVideo(id);
      records.value = records.value.filter(r => r.id !== id);
      sessionRecords.value = sessionRecords.value.filter(r => r.id !== id);
      total.value--;
    }
    catch {}
  }

  function setCurrentSession(record: VideoRecordVo) {
    currentSessionId.value = record.sessionId;
    sessionRecords.value = records.value.filter(r => r.sessionId === record.sessionId);
  }

  function newSession() {
    currentSessionId.value = null;
    sessionRecords.value = [];
  }

  return { records, total, loading, sessionRecords, currentSessionId, generate, fetchList, remove, setCurrentSession, newSession };
});
