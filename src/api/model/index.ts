import type { GetSessionListVO } from './types';
import { get } from '@/utils/request';

// 获取当前用户的模型列表
export function getModelList(params?: Record<string, string>) {
  return get<GetSessionListVO[]>('/system/model/modelList', params).json();
}
