<script setup lang="ts">
import type { UpdatePwdDTO, UserProfileDTO, UserProfileVO } from '@/api/user/types';
import { useRouter } from 'vue-router';
import { getUserProfile, updateUserProfile, updateUserPwd, uploadAvatar } from '@/api/user';
import { asideTheme, headerTheme, menuTheme, optimumHeaderTheme, pageTheme } from '@/config/darkMode';
import { useDesignStore, useUserStore } from '@/stores';

const router = useRouter();
const userStore = useUserStore();
const designStore = useDesignStore();

const activeNav = ref('basic');
const loading = ref(false);
const avatarInputRef = ref<HTMLInputElement>();

const navItems = [
  { key: 'basic', icon: 'User', label: '个人信息' },
  { key: 'appearance', icon: 'Brush', label: '外观设置' },
  { key: 'security', icon: 'Lock', label: '安全设置' },
];

/* 基本设置 */
const profileData = ref<UserProfileVO>({});
const basicForm = reactive<UserProfileDTO>({
  nickName: '',
  email: '',
  phonenumber: '',
  sex: '2',
});

const avatarUrl = ref('');
const saving = ref(false);

async function fetchProfile() {
  loading.value = true;
  try {
    const res = await getUserProfile();
    const data = res.data;
    profileData.value = data;
    if (data?.user) {
      basicForm.nickName = data.user.nickName || '';
      basicForm.email = data.user.email || '';
      basicForm.phonenumber = data.user.phonenumber || '';
      basicForm.sex = data.user.sex ?? '2';
      avatarUrl.value = (data.user as any).avatar ?? userStore.userInfo?.avatar ?? '';
    }
  }
  finally {
    loading.value = false;
  }
}

async function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file)
    return;
  try {
    const res = await uploadAvatar(file);
    if (res.code === 200) {
      avatarUrl.value = res.data.imgUrl;
      if (userStore.userInfo) {
        userStore.updateUserInfo({ avatar: res.data.imgUrl });
      }
      ElMessage.success('头像更新成功');
    }
    else {
      ElMessage.error(res.msg || '上传失败');
    }
  }
  catch {
    ElMessage.error('头像上传异常');
  }
  finally {
    target.value = '';
  }
}

async function saveBasic() {
  saving.value = true;
  try {
    const res = await updateUserProfile(basicForm);
    if (res.code === 200) {
      ElMessage.success('保存成功');
      userStore.updateUserInfo({ nickName: basicForm.nickName });
    }
    else {
      ElMessage.error(res.msg || '保存失败');
    }
  }
  finally {
    saving.value = false;
  }
}

/* 外观设置 */
const themeValue = ref<'light' | 'dark'>(designStore.darkMode === 'dark' ? 'dark' : 'light');

function applyTheme(mode: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.add('dark-transition-enabled');
  if (mode === 'dark') {
    root.classList.add('dark');
    root.style.setProperty('--sidebar-background-color', '#141414');
  }
  else {
    root.classList.remove('dark');
    root.style.setProperty('--sidebar-background-color', '#f3f4f6');
  }
  const themes = [
    headerTheme[mode],
    asideTheme[mode],
    menuTheme[mode],
    optimumHeaderTheme[mode],
    pageTheme[mode],
  ];
  for (const vars of themes) {
    if (vars) {
      for (const [key, value] of Object.entries(vars)) {
        root.style.setProperty(key, value as string);
      }
    }
  }
  designStore.setDarkMode(mode);
  setTimeout(() => root.classList.remove('dark-transition-enabled'), 400);
}

watch(themeValue, val => applyTheme(val));
applyTheme(themeValue.value);

/* 安全设置 */
const pwdForm = reactive<UpdatePwdDTO & { confirmPassword: string }>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const changingPwd = ref(false);

async function savePassword() {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }
  changingPwd.value = true;
  try {
    const res = await updateUserPwd({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录');
      pwdForm.oldPassword = '';
      pwdForm.newPassword = '';
      pwdForm.confirmPassword = '';
      setTimeout(() => userStore.logout(), 1500);
    }
    else {
      ElMessage.error(res.msg || '修改失败');
    }
  }
  finally {
    changingPwd.value = false;
  }
}

onMounted(() => fetchProfile());
</script>

<template>
  <div class="settings-page">
    <div class="settings-header">
      <button class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </button>
      <h2 class="settings-title">
        设置
      </h2>
      <div class="header-spacer" />
    </div>

    <div v-loading="loading" class="settings-body">
      <nav class="settings-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeNav === item.key }"
          @click="activeNav = item.key"
        >
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="settings-content">
        <!-- 个人信息 -->
        <div v-show="activeNav === 'basic'" class="content-panel">
          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">
                个人信息
              </h3>
              <p class="card-desc">
                管理你的账户基本信息
              </p>
            </div>

            <div class="avatar-section" @click="() => avatarInputRef?.click()">
              <div class="avatar-wrapper">
                <el-avatar :src="avatarUrl" :size="80" shape="circle" class="avatar-img" />
                <div class="avatar-overlay">
                  <el-icon :size="24">
                    <Camera />
                  </el-icon>
                </div>
              </div>
              <div class="avatar-text">
                <span class="avatar-label">点击更换头像</span>
                <span class="avatar-hint">支持 JPG、PNG 格式，建议 200x200</span>
              </div>
              <input ref="avatarInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload">
            </div>
          </div>

          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">
                基本资料
              </h3>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">昵称</label>
                <el-input
                  v-model="basicForm.nickName"
                  maxlength="30"
                  placeholder="请输入昵称"
                  size="large"
                />
              </div>
              <div class="form-field">
                <label class="field-label">性别</label>
                <el-radio-group v-model="basicForm.sex" size="large">
                  <el-radio-button value="0">
                    男
                  </el-radio-button>
                  <el-radio-button value="1">
                    女
                  </el-radio-button>
                  <el-radio-button value="2">
                    未知
                  </el-radio-button>
                </el-radio-group>
              </div>
              <div class="form-field">
                <label class="field-label">邮箱</label>
                <el-input
                  v-model="basicForm.email"
                  maxlength="50"
                  placeholder="请输入邮箱"
                  size="large"
                />
              </div>
              <div class="form-field">
                <label class="field-label">手机号</label>
                <el-input
                  v-model="basicForm.phonenumber"
                  maxlength="11"
                  placeholder="请输入手机号"
                  size="large"
                />
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" size="large" :loading="saving" @click="saveBasic">
                保存修改
              </el-button>
            </div>
          </div>
        </div>

        <!-- 外观设置 -->
        <div v-show="activeNav === 'appearance'" class="content-panel">
          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">
                主题模式
              </h3>
              <p class="card-desc">
                选择你喜欢的界面色彩风格
              </p>
            </div>
            <div class="theme-cards">
              <button
                class="theme-card"
                :class="{ selected: themeValue === 'light' }"
                @click="themeValue = 'light'"
              >
                <div class="theme-preview light-preview">
                  <div class="preview-sidebar" />
                  <div class="preview-body">
                    <div class="preview-header" />
                    <div class="preview-line" />
                    <div class="preview-line short" />
                  </div>
                </div>
                <span class="theme-name">浅色模式</span>
                <el-icon v-if="themeValue === 'light'" class="theme-check">
                  <CircleCheckFilled />
                </el-icon>
              </button>
              <button
                class="theme-card"
                :class="{ selected: themeValue === 'dark' }"
                @click="themeValue = 'dark'"
              >
                <div class="theme-preview dark-preview">
                  <div class="preview-sidebar" />
                  <div class="preview-body">
                    <div class="preview-header" />
                    <div class="preview-line" />
                    <div class="preview-line short" />
                  </div>
                </div>
                <span class="theme-name">深色模式</span>
                <el-icon v-if="themeValue === 'dark'" class="theme-check">
                  <CircleCheckFilled />
                </el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div v-show="activeNav === 'security'" class="content-panel">
          <div class="panel-card">
            <div class="card-header">
              <h3 class="card-title">
                修改密码
              </h3>
              <p class="card-desc">
                建议使用字母、数字和符号组合的强密码
              </p>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">当前密码</label>
                <el-input
                  v-model="pwdForm.oldPassword"
                  type="password"
                  show-password
                  maxlength="30"
                  placeholder="请输入当前密码"
                  size="large"
                />
              </div>
              <div class="form-field">
                <label class="field-label">新密码</label>
                <el-input
                  v-model="pwdForm.newPassword"
                  type="password"
                  show-password
                  maxlength="30"
                  placeholder="请输入新密码"
                  size="large"
                />
              </div>
              <div class="form-field">
                <label class="field-label">确认新密码</label>
                <el-input
                  v-model="pwdForm.confirmPassword"
                  type="password"
                  show-password
                  maxlength="30"
                  placeholder="请再次输入新密码"
                  size="large"
                />
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" size="large" :loading="changingPwd" @click="savePassword">
                修改密码
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
  background: var(--el-bg-color);

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--el-text-color-regular);
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    font-family: inherit;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }
  }

  .settings-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .header-spacer {
    width: 60px;
  }
}

.settings-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧导航 */
.settings-nav {
  width: 200px;
  padding: 16px 8px;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  flex-shrink: 0;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 16px;
    margin-bottom: 2px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    text-align: left;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.active {
      background: var(--el-fill-color);
      color: var(--el-color-primary);
      font-weight: 500;

      .nav-icon {
        color: var(--el-color-primary);
      }
    }

    .nav-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
  }
}

/* 右侧内容 */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.content-panel {
  max-width: 620px;
}

.panel-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 20px 24px 16px;
  }

  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .card-desc {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .card-footer {
    padding: 0 24px 20px;
  }
}

/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 24px 20px;
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;

  .avatar-img {
    display: block;
    border: 3px solid var(--el-border-color-lighter);
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-text {
  .avatar-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .avatar-hint {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

/* 表单网格 */
.form-grid {
  padding: 0 24px;
}

.form-field {
  margin-bottom: 20px;

  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}

/* 主题卡片 */
.theme-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 0 24px 20px;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 12px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    border-color: var(--el-border-color);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .theme-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  .theme-check {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 20px;
    color: var(--el-color-primary);
  }
}

.theme-preview {
  display: flex;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);

  .preview-sidebar {
    width: 32px;
    flex-shrink: 0;
  }

  .preview-body {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .preview-header {
    height: 10px;
    border-radius: 3px;
    width: 60%;
  }

  .preview-line {
    height: 6px;
    border-radius: 3px;
    width: 80%;
  }

  .preview-line.short {
    width: 50%;
  }

  &.light-preview {
    .preview-sidebar { background: #f3f4f6; }
    .preview-body { background: #fff; }
    .preview-header { background: #e5e7eb; }
    .preview-line { background: #f3f4f6; }
  }

  &.dark-preview {
    .preview-sidebar { background: #1a1a2e; }
    .preview-body { background: #16213e; }
    .preview-header { background: #0f3460; }
    .preview-line { background: #1a1a2e; }
  }
}
</style>
