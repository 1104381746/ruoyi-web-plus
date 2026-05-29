<!-- 注册表单 -->
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { RegisterDTO, TenantListVo } from '@/api/auth/types';
import { useCountdown } from '@vueuse/core';
import { reactive, ref } from 'vue';
import { emailCode, getTenantList, register } from '@/api';
import { useLoginFormStore } from '@/stores/modules/loginForm';

const loginFromStore = useLoginFormStore();
const envTenantId = import.meta.env.VITE_TENANT_ID || '000000';
const tenantEnabled = ref(false);
const tenantList = ref<TenantListVo[]>([]);
const countdown = shallowRef(60);
const { start, stop, resume } = useCountdown(countdown, {
  onComplete() {
    resume();
  },
  onTick() {
    countdown.value--;
  },
});

const formRef = ref<FormInstance>();

const formModel = ref<RegisterDTO>({
  tenantId: '',
  username: '',
  email: '',
  password: '',
  emailCode: '',
  confirmPassword: '',
});

const rules = reactive<FormRules<RegisterDTO>>({
  tenantId: [{
    validator: (_, value) => {
      if (tenantEnabled.value && !value) {
        return new Error('请选择租户');
      }
      return true;
    },
    trigger: 'change',
  }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value !== formModel.value.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'change',
    },
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度在2到30个字符之间', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (!isEmail(value)) {
          return new Error('请输入正确的邮箱');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
  emailCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
});

onMounted(async () => {
  try {
    const res = await getTenantList();
    if (res.data) {
      tenantEnabled.value = res.data.multiTenancy ?? res.data.tenantEnabled ?? false;
      tenantList.value = res.data.voList || [];
      if (!tenantEnabled.value) {
        formModel.value.tenantId = res.data.defaultTenantId || envTenantId;
      }
    }
  }
  catch {
    tenantEnabled.value = false;
    formModel.value.tenantId = envTenantId;
  }
});

function isEmail(email: string) {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
  return emailRegex.test(email);
}
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const params: RegisterDTO = {
      tenantId: formModel.value.tenantId || envTenantId,
      username: formModel.value.username,
      email: formModel.value.email,
      password: formModel.value.password,
      emailCode: formModel.value.emailCode,
    };
    await register(params);
    ElMessage.success('注册成功');
    formRef.value?.resetFields();
    resume();
    loginFromStore.setLoginFormType('AccountPassword');
  }
  catch (error: any) {
    ElMessage.error(error?.data?.msg || error?.msg || error?.message || '注册失败');
  }
}

// 获取验证码
async function getEmailCode() {
  if (formModel.value.email === '') {
    ElMessage.error('请输入邮箱');
    return;
  }
  if (!isEmail(formModel.value.email)) {
    return;
  }
  if (countdown.value > 0 && countdown.value < 60) {
    return;
  }
  try {
    start();
    await emailCode({ username: formModel.value.email });
    ElMessage.success('验证码发送成功');
  }
  catch (error: any) {
    ElMessage.error(error?.data?.msg || error?.msg || error?.message || '发送验证码失败');
    stop();
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
      <el-form-item v-if="tenantEnabled" prop="tenantId">
        <el-select v-model="formModel.tenantId" placeholder="请选择租户" style="width: 100%">
          <el-option v-for="t in tenantList" :key="t.tenantId" :label="t.companyName" :value="t.tenantId" />
        </el-select>
      </el-form-item>

      <el-form-item prop="username">
        <el-input v-model="formModel.username" placeholder="请输入用户名" autocomplete="off">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="email">
        <el-input v-model="formModel.email" placeholder="请输入邮箱" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Message />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="emailCode">
        <el-input v-model="formModel.emailCode" placeholder="请输入验证码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Bell />
            </el-icon>
          </template>

          <template #suffix>
            <div class="font-size-14px cursor-pointer bg-[var(0,0,0,0.4)]" @click="getEmailCode">
              {{ countdown === 0 || countdown === 60 ? "获取验证码" : `${countdown} s` }}
            </div>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="formModel.password" placeholder="请输入密码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Unlock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input v-model="formModel.confirmPassword" placeholder="请确认密码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" native-type="submit">
          注册
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 返回登录 -->
    <div class="form-tip font-size-12px flex items-center">
      <span>已有账号，</span>
      <span
        class="c-[var(--el-color-primar,#409eff)] cursor-pointer"
        @click="loginFromStore.setLoginFormType('AccountPassword')"
      >
        返回登录
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
