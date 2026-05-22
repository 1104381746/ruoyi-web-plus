export interface GenerateVideoBo {
  modelId: number;
  sessionId?: string;
  prompt: string;
  size?: string;
  duration?: number;
  seed?: number;
}

export interface VideoRecordVo {
  id: number;
  userId: number;
  modelId: number;
  sessionId: string;
  prompt: string;
  size: string;
  duration: number;
  seed: number;
  videoUrl: string;
  status: number;
  createTime: string;
}
