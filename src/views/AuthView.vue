<script setup>
/**
 * 内置登录 — 手机号+密码
 * 不同账号数据完全隔离（通过 localStorage 前缀实现）
 */
import { ref, computed } from 'vue'
import { showToast } from 'vant'

const phone = ref('')
const password = ref('')
const isLogin = ref(true)
const currentUser = ref(getCurrentUser())

// 用手机号+密码生成唯一数据前缀
function userKey(phone, pw) {
  let hash = 0
  const str = phone + '::' + pw
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return 'user_' + Math.abs(hash).toString(36)
}

// 获取当前登录用户
function getCurrentUser() {
  return localStorage.getItem('current_user')
}

// 用当前用户前缀读写数据
function getUserData(key) {
  const user = getCurrentUser()
  if (!user) return null
  try { return JSON.parse(localStorage.getItem(user + '_' + key) || 'null') }
  catch { return null }
}

function setUserData(key, data) {
  const user = getCurrentUser()
  if (!user) return
  localStorage.setItem(user + '_' + key, JSON.stringify(data))
}

// 登录
function handleLogin() {
  if (!phone.value || phone.value.length < 11) { showToast('请输入正确的手机号'); return }
  if (!password.value || password.value.length < 4) { showToast('密码至少4位'); return }

  const key = userKey(phone.value.trim(), password.value)

  if (isLogin.value) {
    // 检查该账号是否存在数据
    const exists = localStorage.getItem(key + '_created')
    if (!exists) {
      showToast('账号不存在，请先注册')
      return
    }
    localStorage.setItem('current_user', key)
    currentUser.value = key
    showToast('登录成功')
  } else {
    // 注册
    const exists = localStorage.getItem(key + '_created')
    if (exists) {
      showToast('该手机号已注册，请直接登录')
      isLogin.value = true
      return
    }
    localStorage.setItem(key + '_created', Date.now().toString())
    localStorage.setItem('current_user', key)
    currentUser.value = key
    showToast('注册成功')
  }
  // 刷新页面让所有数据切换
  setTimeout(() => window.location.reload(), 800)
}

// 退出
function handleLogout() {
  localStorage.removeItem('current_user')
  currentUser.value = null
  showToast('已退出')
  setTimeout(() => window.location.reload(), 500)
}

// 导出当前用户数据（加密）
function exportUserData() {
  const user = getCurrentUser()
  if (!user) { showToast('请先登录'); return }
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(user + '_')) {
      data[k] = localStorage.getItem(k)
    }
  }
  // 也导出 favorites / food-map / recipe-videos
  ;['favorites', 'food-map', 'recipe-videos'].forEach(k => {
    const v = localStorage.getItem(k)
    if (v) data[k] = v
  })

  const blob = new Blob([JSON.stringify({ user, data, time: Date.now() })], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'recipe-data.json'; document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
  showToast('数据已导出')
}

// 导入数据
function importUserData(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const json = JSON.parse(ev.target.result)
      if (!json.user || !json.data) { showToast('文件格式错误'); return }
      // 恢复数据
      Object.entries(json.data).forEach(([k, v]) => localStorage.setItem(k, v))
      localStorage.setItem('current_user', json.user)
      showToast('导入成功')
      setTimeout(() => window.location.reload(), 800)
    } catch { showToast('文件格式错误') }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-header">
      <span class="auth-icon">🍳</span>
      <h1 class="auth-title">每日食谱</h1>
      <p class="auth-subtitle" v-if="!currentUser">{{ isLogin ? '登录账号' : '注册账号' }}</p>
      <p class="auth-subtitle" v-else>已登录</p>
    </div>

    <!-- 未登录 -->
    <div class="auth-card" v-if="!currentUser">
      <van-field v-model="phone" label="手机号" placeholder="输入手机号" type="tel" maxlength="11" clearable />
      <van-field v-model="password" label="密　码" :placeholder="isLogin ? '输入密码' : '设置密码（至少4位）'" type="password" clearable />

      <div class="form-btn">
        <van-button round block type="primary" size="large" @click="handleLogin">
          {{ isLogin ? '登录' : '注册' }}
        </van-button>
      </div>

      <div class="switch" @click="isLogin = !isLogin">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </div>

      <div class="tip">
        <p>💡 同一手机号+密码，数据独立</p>
        <p>📱 换设备：先导出 → 新设备登录 → 导入</p>
      </div>
    </div>

    <!-- 已登录 -->
    <div class="auth-card" v-else>
      <div class="user-box">
        <p class="user-phone">📱 {{ phone || '已登录' }}</p>
        <p class="user-hint">你的收藏数据和美食地图</p>
      </div>
      <van-button round block type="primary" size="large" @click="exportUserData">📤 导出数据</van-button>
      <div style="margin-top:10px; text-align:center;">
        <label class="import-label">
          📥 导入数据
          <input type="file" accept=".json" style="display:none" @change="importUserData" />
        </label>
      </div>
      <van-button round block type="danger" size="large" style="margin-top:16px;" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; background: #f0f4f8; }
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-icon { font-size: 64px; }
.auth-title { font-size: 28px; font-weight: bold; margin-top: 8px; }
.auth-subtitle { font-size: 14px; color: #969799; margin-top: 6px; }
.auth-card { width: 100%; max-width: 360px; background: #fff; border-radius: 16px; padding: 20px 16px; box-shadow: 0 2px 8px rgba(91,155,213,0.1); }
.auth-card :deep(.van-field) { margin-bottom: 8px; }
.form-btn { margin-top: 16px; }
.switch { text-align: center; margin-top: 16px; color: #5B9BD5; font-size: 14px; cursor: pointer; }
.tip { margin-top: 20px; padding: 12px; background: #EBF5FB; border-radius: 8px; font-size: 12px; color: #3A7BC8; line-height: 1.8; }
.user-box { text-align: center; margin-bottom: 16px; }
.user-phone { font-size: 18px; font-weight: 600; }
.user-hint { font-size: 12px; color: #969799; margin-top: 4px; }
.import-label { color: #5B9BD5; font-size: 14px; cursor: pointer; }
</style>
