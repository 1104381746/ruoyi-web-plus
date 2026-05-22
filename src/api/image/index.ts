import { del, get, post } from '@/utils/request';

export function generateImage(data: any) {
  return post('/img/generate', data).json();
}

export function getImageList(pageNum = 1, pageSize = 20, keyword?: string) {
  return get('/img/list', { pageNum, pageSize, keyword }).json();
}

export function deleteImage(id: number) {
  return del(`/img/${id}`).json();
}
