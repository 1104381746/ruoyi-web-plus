<script lang="ts" setup>
import type { TenantListVo } from '@/api/auth/types';
import { getBindingUrl, getTenantList } from '@/api/auth';

const TENANT_STORAGE_KEY = 'social_login_tenant';

const envTenantId = import.meta.env.VITE_TENANT_ID || '000000';

const loading = ref(true);
const tenantEnabled = ref(false);
const defaultTenantId = ref('');
const tenantList = ref<TenantListVo[]>([]);
const selectedTenantId = ref('');

onMounted(async () => {
  try {
    const res = await getTenantList();
    if (res.data) {
      tenantEnabled.value = res.data.multiTenancy ?? res.data.tenantEnabled ?? false;
      defaultTenantId.value = res.data.defaultTenantId || envTenantId;
      tenantList.value = res.data.voList || [];
    }
  }
  catch {
    // 获取租户列表失败时，使用环境变量默认值
  }
  finally {
    loading.value = false;
  }
});

const currentTenantId = computed(() => {
  if (tenantEnabled.value && selectedTenantId.value) {
    return selectedTenantId.value;
  }
  return defaultTenantId.value || envTenantId;
});

const canLogin = computed(() => {
  if (tenantEnabled.value) {
    return !!selectedTenantId.value;
  }
  return true;
});

async function handleWechatLogin() {
  try {
    // 将选中的租户 ID 存入 sessionStorage，供回调页面读取
    sessionStorage.setItem(TENANT_STORAGE_KEY, currentTenantId.value);
    const domain = window.location.host;
    const res = await getBindingUrl('wechat_enterprise', currentTenantId.value, domain);
    if (res.data) {
      window.location.href = res.data;
    }
  }
  catch {
    ElMessage.error('获取企业微信授权地址失败');
  }
}
</script>

<template>
  <div class="wechat-login">
    <p class="tip">
      使用企业微信扫码登录
    </p>

    <div v-if="loading" class="tenant-select-area">
      <el-icon class="is-loading" />
      <span class="loading-text">加载中...</span>
    </div>

    <div v-else-if="tenantEnabled" class="tenant-select-area">
      <span class="tenant-label">选择租户</span>
      <el-select
        v-model="selectedTenantId"
        placeholder="请选择企业/租户"
        style="width: 220px"
      >
        <el-option
          v-for="t in tenantList"
          :key="t.tenantId"
          :label="t.companyName"
          :value="t.tenantId"
        />
      </el-select>
    </div>

    <el-button
      type="primary"
      size="large"
      :disabled="!canLogin"
      @click="handleWechatLogin"
    >
      <el-icon style="margin-right: 6px">
        <ChatDotRound />
      </el-icon>
      企业微信登录
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.wechat-login {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .tip {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .tenant-select-area {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;

    .tenant-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .loading-text {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
