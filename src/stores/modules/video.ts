import type { GenerateVideoBo, VideoRecordVo } from '@/api/video/types';
import { defineStore } from 'pinia';
import { cancelVideo, deleteVideo, generateVideo, getVideoList } from '@/api/video';
import { useSessionStore } from './session';

export const useVideoStore = defineStore('video', () => {
  const records = ref<VideoRecordVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const sessionRecords = ref<VideoRecordVo[]>([]);
  const currentSessionId = ref<string | null>(null);
  const cancelled = ref(false);

  async function generate(bo: GenerateVideoBo) {
    cancelled.value = false;
    loading.value = true;
    try {
      if (!currentSessionId.value) {
        const sessionStore = useSessionStore();
        const session = await sessionStore.createTypedSession(bo.content, 'video');
        currentSessionId.value = String(session.id!);
      }
      const placeholder = {
        id: -Date.now(),
        content: bo.content,
        role: 'user',
        totalTokens: 0,
        videoUrl: '',
        userId: 0,
        modelName: bo.modelName,
        sessionId: currentSessionId.value,
        size: bo.size ?? '',
        duration: bo.duration ?? 0,
        seed: bo.seed ?? 0,
        status: 0,
        referenceImageUrl: bo.referenceImageUrl,
        createTime: '',
      } as VideoRecordVo;
      sessionRecords.value.push(placeholder);
      const res = await generateVideo({ ...bo, sessionId: currentSessionId.value });
      if (cancelled.value) return;
      const idx = sessionRecords.value.findIndex(r => r.id === placeholder.id);
      if (idx !== -1) {
        if (res.data) {
          sessionRecords.value.splice(idx, 1, res.data);
          records.value.unshift(res.data);
          total.value++;
        }
        else {
          // data 为空视为失败，标记状态而不是删除
          sessionRecords.value.splice(idx, 1, { ...placeholder, id: Date.now(), status: 2 });
        }
      }
    }
    catch {
      if (cancelled.value) return;
      // 将 placeholder 标记为失败，而不是删除（保留用户输入可见）
      sessionRecords.value = sessionRecords.value.map(r =>
        r != null && r.id < 0 ? { ...r, id: Date.now(), status: 2 } : r,
      ).filter(r => r != null);
    }
    finally {
      loading.value = false;
    }
  }

  function cancel() {
    cancelled.value = true;
    loading.value = false;
    // 将 placeholder 标记为已取消，而不是删除
    sessionRecords.value = sessionRecords.value.map(r =>
      r != null && r.id < 0 ? { ...r, id: Date.now(), status: 3 } : r,
    ).filter(r => r != null);
    if (currentSessionId.value) {
      cancelVideo(currentSessionId.value).catch(() => {});
    }
  }

  async function fetchList(pageNum = 1, pageSize = 20, keyword?: string) {
    try {
      const sessionId = currentSessionId.value || undefined;
      console.log('[videoStore] fetchList called:', { pageNum, pageSize, keyword, sessionId, currentSessionId: currentSessionId.value });
      const res = await getVideoList(pageNum, pageSize, keyword, sessionId);
      console.log('[videoStore] fetchList response:', { dataKeys: Object.keys(res), recordsCount: res.data?.records?.length, total: res.data?.total });
      records.value = res.data.records;
      total.value = res.data.total;
      if (sessionId) {
        sessionRecords.value = [...records.value].reverse();
      }
      console.log('[videoStore] fetchList done:', { recordsCount: records.value.length, sessionRecordsCount: sessionRecords.value.length });
    }
    catch (e) {
      console.error('[videoStore] fetchList error:', e);
    }
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
    sessionRecords.value = records.value.filter(r => String(r.sessionId) === String(record.sessionId)).reverse();
  }

  function selectSession(sessionId: string) {
    currentSessionId.value = String(sessionId);
    sessionRecords.value = records.value.filter(r => String(r.sessionId) === String(sessionId)).reverse();
  }

  function newSession() {
    currentSessionId.value = null;
    sessionRecords.value = [];
  }

  return { records, total, loading, cancelled, sessionRecords, currentSessionId, generate, cancel, fetchList, remove, setCurrentSession, selectSession, newSession };
});
