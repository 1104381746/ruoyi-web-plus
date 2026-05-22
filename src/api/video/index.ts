import { del, get, post } from '@/utils/request';

export function generateVideo(data: any) {
  return post('/video/generate', data).json();
}

export function getVideoList(pageNum = 1, pageSize = 20) {
  return get('/video/list', { pageNum, pageSize }).json();
}

export function deleteVideo(id: number) {
  return del(`/video/${id}`).json();
}
