import type { UpdatePwdDTO, UserProfileDTO, UserProfileVO } from './types';
import { useUserStore } from '@/stores';
import { get, put } from '@/utils/request';

export const getUserProfile = () => get<UserProfileVO>('/system/user/profile').json();

export function updateUserProfile(data: UserProfileDTO) {
  return put('/system/user/profile', data).json();
}

export function updateUserPwd(data: UpdatePwdDTO) {
  return put('/system/user/profile/updatePwd', data).json();
}

export async function uploadAvatar(file: File) {
  const userStore = useUserStore();
  const formData = new FormData();
  formData.append('avatarfile', file);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/system/user/profile/avatar`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${userStore.token}`,
      ClientID: import.meta.env.VITE_CLIENT_ID,
    },
    body: formData,
  });
  return res.json();
}
