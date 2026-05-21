export interface GenerateImageBo {
  modelId: number;
  sessionId?: string;
  prompt: string;
  size?: string;
  seed?: number;
}

export interface ImageRecordVo {
  id: number;
  userId: number;
  modelId: number;
  sessionId: string;
  prompt: string;
  size: string;
  seed: number;
  imageUrl: string;
  createTime: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}
