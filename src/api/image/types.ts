export interface GenerateImageBo {
  modelName: string;
  sessionId?: string;
  content: string;
  size?: string;
  seed?: number;
  referenceImageUrl?: string;
}

export interface ImageRecordVo {
  id: number;
  userId: number;
  modelName: string;
  sessionId: string;
  content: string;
  role: string;
  totalTokens: number;
  size: string;
  seed: number;
  imageUrl: string;
  referenceImageUrl?: string;
  status: number;
  createTime: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}
