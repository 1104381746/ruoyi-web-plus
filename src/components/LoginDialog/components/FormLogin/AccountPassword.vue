<!-- 账号密码登录表单 -->
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginDTO, TenantListVo } from '@/api/auth/types';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getRegisterEnabled, getTenantList, login } from '@/api';
import { useUserStore } from '@/stores';
import { useLoginFormStore } from '@/stores/modules/loginForm';
import { useSessionStore } from '@/stores/modules/session';

const userStore = useUserStore();
const sessionStore = useSessionStore();
const loginFromStore = useLoginFormStore();

const formRef = ref<FormInstance>();
const showRegister = ref(false);
const multiTenancy = ref(false);
const defaultTenantId = ref('');
const tenantList = ref<TenantListVo[]>([]);

const envTenantId = import.meta.env.VITE_TENANT_ID || '000000';

const formModel = reactive<LoginDTO>({
  username: '',
  password: '',
  clientId: import.meta.env.VITE_CLIENT_ID,
  grantType: 'password',
  tenantId: envTenantId,
  uuid: 'a5705def96be468f80e4b8bde3127c31',
});

onMounted(async () => {
  try {
    const listRes = await getTenantList();
    if (listRes.data) {
      multiTenancy.value = listRes.data.multiTenancy ?? listRes.data.tenantEnabled ?? false;
      defaultTenantId.value = listRes.data.defaultTenantId || envTenantId;
      tenantList.value = listRes.data.voList || [];
      if (!multiTenancy.value) {
        formModel.tenantId = defaultTenantId.value;
      }
    }
  }
  catch {
    // 获取租户列表失败，使用环境变量兜底
  }
  try {
    const regRes = await getRegisterEnabled(formModel.tenantId || envTenantId);
    showRegister.value = !!regRes.data;
  }
  catch {
    showRegister.value = false;
  }
});

const rules = reactive<FormRules<LoginDTO>>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const router = useRouter();
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    if (!formModel.tenantId) {
      formModel.tenantId = defaultTenantId.value || envTenantId;
    }
    const res = await login(formModel);
    console.log(res.data.access_token, 'res');
    res.data.access_token && userStore.setToken(res.data.access_token);
    res.data.userInfo && userStore.setUserInfo(res.data.userInfo);
    ElMessage.success('登录成功');
    userStore.closeLoginDialog();
    // 立刻获取回话列表
    await sessionStore.requestSessionList(1, true);
    router.replace('/');
  }
  catch (error) {
    console.error('请求错误:', error);
  }
}
</script>

<template>
  <div class="custom-form">
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      style="width: 230px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item v-if="multiTenancy" prop="tenantId">
        <el-select v-model="formModel.tenantId" placeholder="请选择租户" style="width: 100%">
          <el-option v-for="t in tenantList" :key="t.tenantId" :label="t.companyName" :value="t.tenantId" />
        </el-select>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="formModel.username" placeholder="请输入用户名">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="formModel.password"
          placeholder="请输入密码"
          type="password"
          show-password
        >
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" native-type="submit">
          登录
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 注册登录 -->
    <div v-if="showRegister" class="form-tip font-size-12px flex items-center">
      <span>没有账号？</span>
      <span
        class="c-[var(--el-color-primar,#409eff)] cursor-pointer"
        @click="loginFromStore.setLoginFormType('RegistrationForm')"
      >
        立即注册
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.custom-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.login-btn {
  padding: 12px;
  margin-top: 24px;
  color: white;
  cursor: pointer;
  background: #409eff;
  border: none;
  border-radius: 4px;
}
</style>
