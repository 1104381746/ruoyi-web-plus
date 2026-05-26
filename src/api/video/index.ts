import { del, get, post } from '@/utils/request';

export function generateVideo(data: any) {
  return post('/video/generate', data).json();
}

export function getVideoList(pageNum = 1, pageSize = 20, keyword?: string, sessionId?: string) {
  return get('/video/list', { pageNum, pageSize, keyword, sessionId }).json();
}

export function deleteVideo(id: number) {
  return del(`/video/${id}`).json();
}

export function cancelVideo(sessionId: string) {
  return post(`/video/cancel/${sessionId}`).json();
}
