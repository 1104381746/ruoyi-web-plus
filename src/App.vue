<script setup lang="ts">
import { headerTheme, asideTheme, menuTheme, optimumHeaderTheme, pageTheme } from '@/config/darkMode';
import { useDesignStore, useUserStore } from '@/stores';
import { getUserProfile } from '@/api/user';

const designStore = useDesignStore();
const userStore = useUserStore();

function applyStoredTheme() {
  const mode = designStore.darkMode;
  const root = document.documentElement;
  root.classList.add('dark-transition-enabled');
  if (mode === 'dark' || mode === 'inverted') {
    root.classList.add('dark');
    root.style.setProperty('--sidebar-background-color', '#141414');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--sidebar-background-color', '#f3f4f6');
  }
  const themeMode = mode === 'inverted' ? 'inverted' : mode === 'dark' ? 'dark' : 'light';
  const themes = [headerTheme, asideTheme, menuTheme, optimumHeaderTheme, pageTheme];
  for (const vars of themes) {
    const themeVars = vars[themeMode];
    if (themeVars) {
      for (const [key, value] of Object.entries(themeVars)) {
        root.style.setProperty(key, value as string);
      }
    }
  }
  setTimeout(() => root.classList.remove('dark-transition-enabled'), 400);
}

async function ensureAvatar() {
  if (!userStore.token || userStore.userInfo?.avatar) return;
  try {
    const res = await getUserProfile();
    const avatar = (res.data?.user as any)?.avatar;
    if (avatar && userStore.userInfo) {
      userStore.updateUserInfo({ avatar });
    } else if (avatar) {
      userStore.setUserInfo({ avatar } as any);
    }
  } catch { /* 静默失败，不影响页面加载 */ }
}

onMounted(() => {
  applyStoredTheme();
  ensureAvatar();
});
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>

<style>
html.dark-transition-enabled *,
html.dark-transition-enabled *::before,
html.dark-transition-enabled *::after {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
}
</style>
