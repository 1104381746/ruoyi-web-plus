<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { socialLogin } from '@/api/auth';
import { useUserStore } from '@/stores';
import { useSessionStore } from '@/stores/modules/session';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sessionStore = useSessionStore();

const status = ref<'loading' | 'error'>('loading');
const errorMsg = ref('');

const TENANT_STORAGE_KEY = 'social_login_tenant';
// 优先从 sessionStorage 读取用户扫码前选择的租户，兜底使用环境变量
const tenantId = sessionStorage.getItem(TENANT_STORAGE_KEY) || import.meta.env.VITE_TENANT_ID || '000000';
sessionStorage.removeItem(TENANT_STORAGE_KEY);

onMounted(async () => {
  const { source, code, state } = route.query as Record<string, string>;
  if (!source || !code || !state) {
    status.value = 'error';
    errorMsg.value = '回调参数缺失，请返回重新扫码登录';
    return;
  }
  try {
    const res = await socialLogin({
      source,
      socialCode: code,
      socialState: state,
      clientId: import.meta.env.VITE_CLIENT_ID,
      grantType: 'social',
      tenantId,
    });
    const data = res.data;
    if (data?.access_token) {
      userStore.setToken(data.access_token);
    }
    if (data?.userInfo) {
      userStore.setUserInfo(data.userInfo);
    }
    ElMessage.success('登录成功');
    await sessionStore.requestSessionList(1, true);
    router.replace('/');
  }
  catch (err: any) {
    status.value = 'error';
    const msg = err?.response?.data?.msg || err?.message || '登录失败，请重试';
    errorMsg.value = msg;
  }
});

function handleBack() {
  router.replace('/');
}
</script>

<template>
  <div class="flex-center wh-full">
    <div v-if="status === 'loading'" class="flex-center flex-col gap-3">
      <el-icon class="is-loading" style="font-size: 32px">
        <Loading />
      </el-icon>
      <span>登录中...</span>
    </div>
    <div v-else class="flex-center flex-col gap-5">
      <el-result icon="error" :title="errorMsg" sub-title="请返回首页重新登录">
        <template #extra>
          <el-button type="primary" @click="handleBack">
            返回首页
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>
