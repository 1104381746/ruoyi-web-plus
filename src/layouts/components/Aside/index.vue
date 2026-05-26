<!-- Aside 侧边栏 -->
<script setup lang="ts">
import type { ChatSessionVo } from '@/api/session/types';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { get_session } from '@/api';
import logo from '@/assets/images/logo.png';
import Collapse from '@/layouts/components/Header/components/Collapse.vue';
import AiIcon from '@/components/AiIcon.vue';
import { useDesignStore } from '@/stores';
import { useImageStore } from '@/stores/modules/image';
import { useSessionStore } from '@/stores/modules/session';
import { useVideoStore } from '@/stores/modules/video';

const route = useRoute();
const router = useRouter();
const designStore = useDesignStore();
const sessionStore = useSessionStore();

const sessionId = computed(() => route.params?.id);
const conversationsList = computed(() => sessionStore.sessionList);
const chatSessions = computed(() =>
  (conversationsList.value as (ChatSessionVo & { group?: string })[]).filter(s => !s.type || s.type === 'chat'),
);
const chatGroupedList = computed(() => {
  const groups: { label: string; items: (ChatSessionVo & { group?: string })[] }[] = [];
  const groupOrder = ['今天', '昨天', '本周', '本月', '更早'];
  const list = chatSessions.value;
  for (const item of list) {
    const group = item.group || '更早';
    let groupObj = groups.find(g => g.label === group);
    if (!groupObj) {
      groupObj = { label: group, items: [] };
      groups.push(groupObj);
    }
    groupObj.items.push(item);
  }
  groups.sort((a, b) => groupOrder.indexOf(a.label) - groupOrder.indexOf(b.label));
  return groups;
});

const contextMenu = reactive<{ visible: boolean; left: number; top: number; item: ChatSessionVo | null }>({
  visible: false,
  left: 0,
  top: 0,
  item: null,
});

const loadMoreLoading = computed(() => sessionStore.isLoadingMore);
const active = ref<string | undefined>();

const expandedGroups = ref<Set<string>>(new Set(['今天']));
function toggleGroup(label: string) {
  if (expandedGroups.value.has(label))
    expandedGroups.value.delete(label);
  else
    expandedGroups.value.add(label);
}

const searchKeyword = ref('');

let searchTimer: ReturnType<typeof setTimeout> | null = null;

function debounce(fn: (val: string) => void) {
  return (val: string) => {
    if (searchTimer)
      clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fn(val), 300);
  };
}

watch(searchKeyword, debounce((val) => {
  if (val.trim())
    sessionStore.searchSessions(val.trim());
  else
    sessionStore.clearSearch();
}));

const imageStore = useImageStore();
const videoStore = useVideoStore();
const { currentSessionId } = storeToRefs(imageStore);
const { currentSessionId: videoSessionId } = storeToRefs(videoStore);

function handleClearSearch() {
  searchKeyword.value = '';
  sessionStore.clearSearch();
}

function parseDate(val?: string | Date): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val);
  if (/^\d+$/.test(s)) return new Date(Number(s));
  const d = new Date(s.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

function getTimeGroup(createTime?: string | Date): string {
  const d = parseDate(createTime);
  if (!d) return '更早';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (d >= todayStart) return '今天';
  if (d >= yesterdayStart) return '昨天';
  if (d >= weekStart) return '本周';
  if (d >= monthStart) return '本月';
  return '更早';
}

function formatTime(isoStr?: string | Date): string {
  const d = parseDate(isoStr);
  if (!d) return '';
  const now = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  if (d >= todayStart) return `今天 ${hours}:${minutes}`;
  if (d >= yesterdayStart) return `昨天 ${hours}:${minutes}`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${hours}:${minutes}`;
}

const imageSessions = computed(() => {
  const filtered = (conversationsList.value as (ChatSessionVo & { group?: string })[]).filter(s => s.type === 'image');
  console.log('[Aside] imageSessions computed:', { total: conversationsList.value.length, image: filtered.length, types: conversationsList.value.map(s => s.type) });
  return filtered;
});
const videoSessions = computed(() => {
  const filtered = (conversationsList.value as (ChatSessionVo & { group?: string })[]).filter(s => s.type === 'video');
  console.log('[Aside] videoSessions computed:', { total: conversationsList.value.length, video: filtered.length, types: conversationsList.value.map(s => s.type) });
  return filtered;
});

function groupByTime<T extends { createTime?: string | Date }>(items: T[]) {
  const groupOrder = ['今天', '昨天', '本周', '本月', '更早'];
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const label = getTimeGroup(item.createTime);
    let g = groups.find(x => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(item);
  }
  groups.sort((a, b) => groupOrder.indexOf(a.label) - groupOrder.indexOf(b.label));
  return groups;
}

const imageGroupedList = computed(() => groupByTime(imageSessions.value));
const videoGroupedList = computed(() => groupByTime(videoSessions.value));
const imageExpandedGroups = ref<Set<string>>(new Set(['今天']));
const videoExpandedGroups = ref<Set<string>>(new Set(['今天']));
function toggleImageGroup(label: string) {
  if (imageExpandedGroups.value.has(label))
    imageExpandedGroups.value.delete(label);
  else
    imageExpandedGroups.value.add(label);
}
function toggleVideoGroup(label: string) {
  if (videoExpandedGroups.value.has(label))
    videoExpandedGroups.value.delete(label);
  else
    videoExpandedGroups.value.add(label);
}

const isImageMode = computed(() => route.path.startsWith('/image'));
const isVideoMode = computed(() => route.path.startsWith('/video'));

const tabIndex = computed(() => {
  if (isImageMode.value) return 1;
  if (isVideoMode.value) return 2;
  return 0;
});

async function switchTab(idx: number) {
  searchKeyword.value = '';
  if (idx === 0) {
    sessionStore.sessionType = 'chat';
    handleCreatChat();
    await sessionStore.requestSessionList(1, true);
  }
  else if (idx === 1) {
    sessionStore.sessionType = 'image';
    imageStore.newSession();
    router.push('/image');
    await sessionStore.requestSessionList(1, true);
  }
  else {
    sessionStore.sessionType = 'video';
    videoStore.newSession();
    router.push('/video');
    await sessionStore.requestSessionList(1, true);
  }
}

onMounted(async () => {
  if (isImageMode.value)
    sessionStore.sessionType = 'image';
  else if (isVideoMode.value)
    sessionStore.sessionType = 'video';

  await sessionStore.requestSessionList();

  if (conversationsList.value.length > 0 && sessionId.value) {
    const currentSessionRes = await get_session(`${sessionId.value}`);
    sessionStore.setCurrentSession(currentSessionRes.data);
  }
});

watch(
  () => sessionStore.currentSession,
  (newValue) => {
    active.value = newValue ? `${newValue.id}` : undefined;
  },
);

// 创建会话
function handleCreatChat() {
  // 创建会话, 跳转到默认聊天
  sessionStore.createSessionBtn();
}

async function handleImageItemClick(item: ChatSessionVo) {
  imageStore.selectSession(item.id!);
  await imageStore.fetchList(1, 100);
  router.push('/image');
}

async function handleVideoItemClick(item: ChatSessionVo) {
  videoStore.selectSession(item.id!);
  await videoStore.fetchList(1, 100);
  router.push('/video');
}

// 切换会话
function handleChatItemClick(item: ChatSessionVo) {
  closeContextMenu();
  sessionStore.setCurrentSession(item);
  router.replace({
    name: 'chatWithId',
    params: {
      id: item.id,
    },
  });
}

// 处理组件触发的加载更多事件
async function handleLoadMore() {
  if (!sessionStore.hasMore)
    return;
  await sessionStore.loadMoreSessions();
}

// 聊天历史滚动加载
function handleChatScroll(e: Event) {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 80) {
    handleLoadMore();
  }
}

// 右键菜单
function handleChatContextMenu(e: MouseEvent, item: ChatSessionVo) {
  e.preventDefault();
  contextMenu.visible = true;
  contextMenu.left = e.clientX;
  contextMenu.top = e.clientY;
  contextMenu.item = item;
}

function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.item = null;
}

function handleContextMenuRename() {
  const item = contextMenu.item;
  if (!item) return;
  closeContextMenu();
  ElMessageBox.prompt('', '编辑对话名称', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputErrorMessage: '请输入对话名称',
    confirmButtonClass: 'el-button--primary',
    cancelButtonClass: 'el-button--info',
    roundButton: true,
    inputValue: item.sessionTitle,
    autofocus: false,
    inputValidator: (value) => {
      if (!value) return false;
      return true;
    },
  }).then(({ value }) => {
    sessionStore
      .updateSession({
        id: item.id!,
        sessionTitle: value,
        sessionContent: item.sessionContent,
      })
      .then(() => {
        ElMessage({
          type: 'success',
          message: '修改成功',
        });
        nextTick(() => {
          if (sessionStore.currentSession?.id === item.id) {
            sessionStore.setCurrentSession({
              ...item,
              sessionTitle: value,
            });
          }
        });
      });
  });
}

function handleContextMenuDelete() {
  const item = contextMenu.item;
  if (!item) return;
  closeContextMenu();
  ElMessageBox.confirm('删除后，聊天记录将不可恢复。', '确定删除对话？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    cancelButtonClass: 'el-button--info',
    roundButton: true,
    autofocus: false,
  })
    .then(async () => {
      await sessionStore.deleteSessions([item.id!]);
      nextTick(() => {
        if (item.id === active.value) {
          sessionStore.createSessionBtn();
        }
      });
    })
    .catch(() => {});
}
</script>

<template>
  <div
    class="aside-container"
    :class="{
      'aside-container-suspended': designStore.isSafeAreaHover,
      'aside-container-collapse': designStore.isCollapse,
      // 折叠且未激活悬停时添加 no-delay 类
      'no-delay': designStore.isCollapse && !designStore.hasActivatedHover,
    }"
  >
    <div class="aside-wrapper">
      <div v-if="!designStore.isCollapse" class="aside-header">
        <div class="flex items-center gap-8px hover:cursor-pointer" @click="handleCreatChat">
          <el-image :src="logo" alt="logo" fit="cover" class="logo-img" />
          <span class="logo-text max-w-150px text-overflow">RuoYi-AI</span>
        </div>
        <Collapse class="ml-auto" />
      </div>

      <div class="aside-body">
        <!-- 模式切换 -->
        <div class="mode-switcher">
          <div class="switcher-track">
            <div
              class="switcher-indicator"
              :style="{ left: `calc(3px + ${tabIndex} * (100% / 3))` }"
            />
            <button class="switcher-tab" :class="{ active: tabIndex === 0 }" @click="switchTab(0)">
              <el-icon class="switcher-icon"><ChatDotRound /></el-icon>
              <span>AI 对话</span>
            </button>
            <button class="switcher-tab" :class="{ active: tabIndex === 1 }" @click="switchTab(1)">
              <el-icon class="switcher-icon"><Picture /></el-icon>
              <span>AI 生图</span>
            </button>
            <button class="switcher-tab" :class="{ active: tabIndex === 2 }" @click="switchTab(2)">
              <el-icon class="switcher-icon"><VideoCamera /></el-icon>
              <span>AI 视频</span>
            </button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-wrapper">
          <el-input
            v-model="searchKeyword"
            :placeholder="isVideoMode ? '搜索视频记录' : isImageMode ? '搜索生图记录' : '搜索对话记录'"
            clearable
            class="search-input"
            @clear="handleClearSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <!-- 分割线 -->
        <div class="divider" />

        <!-- 新建按钮 -->
        <div class="px-3 mb-2">
          <el-button class="w-full" @click="isVideoMode ? videoStore.newSession() : isImageMode ? imageStore.newSession() : handleCreatChat()">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>
            {{ isVideoMode ? '新建视频' : isImageMode ? '新建生图' : '新建对话' }}
          </el-button>
        </div>

        <div v-if="isImageMode" class="aside-content">
          <div v-if="imageSessions.length > 0" class="image-history-list overflow-y-auto">
            <div class="chat-group-title" style="padding-top: 8px; padding-bottom: 4px;">
              最近对话
            </div>
            <template v-for="group in imageGroupedList" :key="group.label">
              <div
                class="chat-group-title chat-group-toggle"
                @click="toggleImageGroup(group.label)"
              >
                <el-icon class="group-chevron" :class="{ expanded: imageExpandedGroups.has(group.label) }">
                  <ArrowRight />
                </el-icon>
                {{ group.label }}
              </div>
              <div
                v-if="imageExpandedGroups.has(group.label)"
                v-for="item in group.items"
                :key="item.id"
                class="history-item px-3 py-2 mx-2 rounded-lg cursor-pointer flex items-center gap-2"
                :class="currentSessionId != null && String(currentSessionId) === String(item.id) ? 'history-item-active' : 'history-item-hover'"
                @click="handleImageItemClick(item)"
              >
                <Picture class="flex-none" style="width:16px;height:16px;color:var(--el-text-color-secondary)" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs truncate" style="color:var(--el-text-color-primary)">
                    {{ item.sessionTitle }}
                  </div>
                  <div class="text-xs mt-0.5" style="color:var(--el-text-color-secondary)">
                    {{ formatTime(item.createTime) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <el-empty v-else class="h-full flex-center" description="暂无生图记录" />
        </div>

        <div v-if="isVideoMode" class="aside-content">
          <div v-if="videoSessions.length > 0" class="image-history-list overflow-y-auto">
            <div class="chat-group-title" style="padding-top: 8px; padding-bottom: 4px;">
              最近对话
            </div>
            <template v-for="group in videoGroupedList" :key="group.label">
              <div
                class="chat-group-title chat-group-toggle"
                @click="toggleVideoGroup(group.label)"
              >
                <el-icon class="group-chevron" :class="{ expanded: videoExpandedGroups.has(group.label) }">
                  <ArrowRight />
                </el-icon>
                {{ group.label }}
              </div>
              <div
                v-if="videoExpandedGroups.has(group.label)"
                v-for="item in group.items"
                :key="item.id"
                class="history-item px-3 py-2 mx-2 rounded-lg cursor-pointer flex items-center gap-2"
                :class="videoSessionId != null && String(videoSessionId) === String(item.id) ? 'history-item-active' : 'history-item-hover'"
                @click="handleVideoItemClick(item)"
              >
                <VideoCamera class="flex-none" style="width:16px;height:16px;color:var(--el-text-color-secondary)" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs truncate" style="color:var(--el-text-color-primary)">
                    {{ item.sessionTitle }}
                  </div>
                  <div class="text-xs mt-0.5" style="color:var(--el-text-color-secondary)">
                    {{ formatTime(item.createTime) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <el-empty v-else class="h-full flex-center" description="暂无视频记录" />
        </div>

        <div v-if="!isImageMode && !isVideoMode" class="aside-content">
          <div v-if="chatSessions.length > 0" class="chat-history-list overflow-y-auto" @scroll="handleChatScroll">
            <div class="chat-group-title" style="padding-top: 8px; padding-bottom: 4px;">
              最近对话
            </div>
            <template v-for="group in chatGroupedList" :key="group.label">
              <div
                class="chat-group-title chat-group-toggle"
                @click="toggleGroup(group.label)"
              >
                <el-icon class="group-chevron" :class="{ expanded: expandedGroups.has(group.label) }">
                  <ArrowRight />
                </el-icon>
                {{ group.label }}
              </div>
              <div
                v-if="expandedGroups.has(group.label)"
                v-for="item in group.items"
                :key="item.id"
                class="history-item px-3 py-2 mx-2 rounded-lg cursor-pointer flex items-center gap-2"
                :class="active === item.id ? 'history-item-active' : 'history-item-hover'"
                @click="handleChatItemClick(item)"
                @contextmenu.prevent="handleChatContextMenu($event, item)"
              >
                <AiIcon class="flex-none" style="width:16px;height:16px;color:var(--el-text-color-secondary)" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs truncate" style="color:var(--el-text-color-primary)">
                    {{ item.sessionTitle }}
                  </div>
                  <div class="text-xs mt-0.5" style="color:var(--el-text-color-secondary)">
                    {{ formatTime(item.createTime) }}
                  </div>
                </div>
              </div>
            </template>
            <div v-if="loadMoreLoading" class="text-center py-2 text-xs" style="color:var(--el-text-color-secondary)">
              加载中...
            </div>
          </div>
          <el-empty v-else class="h-full flex-center" description="暂无对话记录" />
        </div>

        <!-- 右键菜单 -->
        <Teleport to="body">
          <div
            v-if="contextMenu.visible"
            class="context-menu-overlay"
            @click="closeContextMenu"
            @contextmenu.prevent="closeContextMenu"
          />
          <div
            v-if="contextMenu.visible"
            class="context-menu-panel"
            :style="{ left: contextMenu.left + 'px', top: contextMenu.top + 'px' }"
          >
            <div class="context-menu-item" @click="handleContextMenuRename">
              <el-icon class="mr-2"><EditPen /></el-icon>
              编辑名称
            </div>
            <div class="context-menu-item context-menu-item-danger" @click="handleContextMenuDelete">
              <el-icon class="mr-2"><Delete /></el-icon>
              删除
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 基础样式
.aside-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  width: var(--sidebar-default-width);
  height: 100%;
  pointer-events: auto;
  background-color: var(--sidebar-background-color);
  border-right: 0.5px solid var(--s-color-border-tertiary, rgb(0 0 0 / 8%));
  .aside-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;

    // 侧边栏头部样式
    .aside-header {
      display: flex;
      align-items: center;
      height: 36px;
      margin: 10px 12px 0;
      .logo-img {
        box-sizing: border-box;
        width: 36px;
        height: 36px;
        padding: 4px;
        overflow: hidden;
        background-color: var(--el-bg-color);
        border-radius: 50%;
        img {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
      }
      .logo-text {
        font-size: 16px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        transform: skewX(-2deg);
      }
    }

    // 侧边栏内容样式
    .aside-body {
      // 模式切换 - 胶囊滑动指示器
      .mode-switcher {
        padding: 0 12px 4px;

        .switcher-track {
          position: relative;
          display: flex;
          background: var(--el-fill-color);
          border-radius: 12px;
          padding: 3px;
        }

        .switcher-indicator {
          position: absolute;
          top: 3px;
          left: 3px;
          width: calc(100% / 3 - 6px);
          height: calc(100% - 6px);
          background: var(--el-bg-color);
          border-radius: 10px;
          box-shadow: 0 1px 3px rgb(0 0 0 / 8%), 0 1px 2px rgb(0 0 0 / 4%);
          transition: left .35s cubic-bezier(.4, 0, .2, 1);
        }

        .switcher-tab {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 4px;
          font-size: 12.5px;
          font-weight: 400;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--el-text-color-secondary);
          transition: color .25s;
          border-radius: 10px;
          outline: none;
          white-space: nowrap;
          font-family: inherit;

          &.active {
            color: var(--el-text-color-primary);
            font-weight: 500;
          }

          .switcher-icon {
            font-size: 15px;
            transition: transform .25s;
          }

          &.active .switcher-icon {
            transform: scale(1.1);
          }
        }
      }

      // 搜索框样式
      .search-wrapper {
        padding: 16px 12px 12px;
        .search-input {
          :deep(.el-input__wrapper) {
            padding: 8px 12px;
            background-color: var(--el-fill-color-light);
            border-radius: 10px;
            box-shadow: none;
            transition: all 0.2s ease;
            &:hover {
              background-color: var(--el-fill-color);
            }
            &.is-focus {
              background-color: var(--el-bg-color);
              box-shadow: 0 0 0 1px rgb(0 87 255 / 20%);
            }
          }
          :deep(.el-input__inner) {
            font-size: 14px;
            color: var(--el-text-color-primary);
            &::placeholder {
              color: var(--el-text-color-placeholder);
            }
          }
          :deep(.el-input__prefix) {
            color: var(--el-text-color-placeholder);
          }
        }
      }

      // 分割线
      .divider {
        height: 1px;
        margin: 12px;
        background-color: var(--el-fill-color);
      }
      .aside-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        height: 100%;
        min-height: 0;

        // 会话列表高度-基础样式
        .chat-history-list {
          height: calc(100vh - 180px);
        }
      }
    }
  }
}

// 折叠样式
.aside-container-collapse {
  position: absolute;
  top: 54px;
  z-index: 22;
  height: auto;
  max-height: calc(100% - 110px);
  padding-bottom: 12px;
  overflow: hidden;

  /* 禁用悬停事件 */
  pointer-events: none;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 15px;
  box-shadow:
    0 10px 20px 0 var(--aside-shadow),
    0 0 1px 0 rgb(0 0 0 / 15%);
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s;

  /* 新增：未激活悬停时覆盖延迟 */
  &.no-delay {
    transition-delay: 0s, 0s;
  }
}

// 悬停样式
.aside-container-collapse:hover,
.aside-container-collapse.aside-container-suspended {
  height: auto;
  max-height: calc(100% - 110px);
  padding-bottom: 12px;
  overflow: hidden;
  pointer-events: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 15px;
  box-shadow:
    0 10px 20px 0 var(--aside-shadow),
    0 0 1px 0 rgb(0 0 0 / 15%);

  // 直接在这里写悬停时的样式（与 aside-container-suspended 一致）
  opacity: 1;

  // 过渡动画沿用原有设置
  transform: translateX(15px);
  transition: opacity 0.3s ease 0s, transform 0.3s ease 0s;

  // 会话列表高度-悬停样式
  .chat-history-list {
    height: calc(100vh - 155px) !important;
  }
}

.image-history-list {
  height: calc(100vh - 180px);
}

.chat-group-title {
  padding-left: 12px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  font-size: 12px;
  padding-top: 8px;
  padding-bottom: 4px;
  background-color: var(--sidebar-background-color);
}

.chat-group-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--el-text-color-regular);
  }

  .group-chevron {
    font-size: 12px;
    transition: transform 0.2s ease;
    transform: rotate(0deg);

    &.expanded {
      transform: rotate(90deg);
    }
  }
}

.history-item {
  transition: background-color 0.15s;
}
.history-item-active {
  background-color: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.history-item-hover:hover {
  background-color: var(--el-fill-color-light);
}
</style>

<style>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

.context-menu-panel {
  position: fixed;
  z-index: 9999;
  min-width: 140px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--context-menu-shadow);
  padding: 4px 0;
  transform: translate(4px, 4px);
}

.context-menu-panel .context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: background-color 0.15s;
}

.context-menu-panel .context-menu-item:hover {
  background-color: var(--el-fill-color-light);
}

.context-menu-panel .context-menu-item.context-menu-item-danger {
  color: #f56c6c;
}

.context-menu-panel .context-menu-item.context-menu-item-danger:hover {
  background-color: rgb(245 108 108 / 6%);
}
</style>
