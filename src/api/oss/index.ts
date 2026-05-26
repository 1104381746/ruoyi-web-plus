import { useUserStore } from '@/stores';

export async function uploadFile(file: File): Promise<string> {
  const userStore = useUserStore();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/resource/oss/upload`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${userStore.token}`,
      ClientID: import.meta.env.VITE_CLIENT_ID,
    },
    body: form,
  });
  const json = await res.json();
  if (json.code !== 200)
    throw new Error(json.msg || '上传失败');
  return json.data.url as string;
}
