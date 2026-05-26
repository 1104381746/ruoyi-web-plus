export interface GenerateVideoBo {
  modelName: string;
  sessionId?: string;
  content: string;
  size?: string;
  duration?: number;
  seed?: number;
  referenceImageUrl?: string;
}

export interface VideoRecordVo {
  id: number;
  userId: number;
  modelName: string;
  sessionId: string;
  content: string;
  role: string;
  totalTokens: number;
  size: string;
  duration: number;
  seed: number;
  videoUrl: string;
  referenceImageUrl?: string;
  status: number;
  createTime: string;
}
