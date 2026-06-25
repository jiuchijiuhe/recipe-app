<script setup>
/**
 * 我的页面 — 数据导出/导入/清除
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { exportAllData, importAllData, readFileAsText } from '../utils/sync.js'

const router = useRouter()

const fileInput = ref(null)

// 导出数据
function handleExport() {
  exportAllData()
  showToast('数据已导出为文件')
}

// 选择文件导入
function handleSelectFile() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const text = await readFileAsText(file)
  if (!text) { showToast('读取文件失败'); return }
  const result = importAllData(text)
  showToast(result.message)
  if (result.success) {
    setTimeout(() => window.location.reload(), 1500)
  }
}

// 清除所有数据
async function handleClear() {
  try {
    await showConfirmDialog({
      title: '确认清除',
      message: '这将删除所有收藏和美食地图数据，不可恢复。确定吗？',
    })
    localStorage.removeItem('favorites')
    localStorage.removeItem('food-map')
    localStorage.removeItem('recipe-videos')
    showToast('已清除全部数据')
    setTimeout(() => window.location.reload(), 1000)
  } catch { /* 取消 */ }
}

// 获取数据统计
import { getFavorites } from '../utils/storage.js'
import { getCityList } from '../utils/foodMap.js'
import { ref as vref, onMounted } from 'vue'

const favCount = vref(0)
const cityCount = vref(0)

onMounted(() => {
  favCount.value = getFavorites().length
  cityCount.value = getCityList().length
})
</script>

<template>
  <div class="profile-page">
    <div class="header">
      <h1 class="page-title">我的</h1>
      <p class="page-subtitle">数据管理</p>
    </div>

    <!-- 快捷入口 -->
    <div class="actions" style="margin-bottom:4px;">
      <div class="action-card" @click="router.push('/auth')">
        <span class="action-icon">🔐</span>
        <div class="action-info">
          <p class="action-title">账号登录</p>
          <p class="action-desc">登录后跨设备同步数据</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>

      <div class="action-card" @click="router.push('/my-recipes')">
        <span class="action-icon">✍️</span>
        <div class="action-info">
          <p class="action-title">我的食谱</p>
          <p class="action-desc">查看和管理你创建的食谱</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>

      <div class="action-card" @click="router.push('/favorites')">
        <span class="action-icon">❤️</span>
        <div class="action-info">
          <p class="action-title">我的收藏</p>
          <p class="action-desc">{{ favCount }} 道食谱</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats">
      <div class="stat-card">
        <span class="stat-num">{{ favCount }}</span>
        <span class="stat-label">收藏食谱</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ cityCount }}</span>
        <span class="stat-label">收藏城市</span>
      </div>
    </div>

    <!-- 操作 -->
    <div class="actions">
      <div class="action-card" @click="handleExport">
        <span class="action-icon">📤</span>
        <div class="action-info">
          <p class="action-title">导出数据</p>
          <p class="action-desc">保存为文件，发给另一台手机导入</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>

      <div class="action-card" @click="handleSelectFile">
        <span class="action-icon">📥</span>
        <div class="action-info">
          <p class="action-title">导入数据</p>
          <p class="action-desc">选择之前导出的文件恢复数据</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>
      <input ref="fileInput" type="file" accept=".json" style="display:none" @change="onFileChange" />

      <div class="action-card danger" @click="handleClear">
        <span class="action-icon">🗑️</span>
        <div class="action-info">
          <p class="action-title">清除数据</p>
          <p class="action-desc">删除所有收藏和美食地图数据</p>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>
    </div>

    <div class="help-tip">
      <p>💡 怎么跨设备同步？</p>
      <p>1. 旧手机：点「导出数据」→ 得到一个文件</p>
      <p>2. 把文件发到新手机（微信/QQ/AirDrop）</p>
      <p>3. 新手机：用浏览器打开网站 → 点「导入数据」→ 选文件</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page { padding-bottom: 20px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 22px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }

.stats { display: flex; gap: 10px; padding: 12px 16px; }
.stat-card { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 16px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.stat-num { font-size: 28px; font-weight: bold; color: #5B9BD5; }
.stat-label { font-size: 13px; color: #969799; margin-top: 4px; }

.actions { padding: 0 12px; }
.action-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.action-card:active { background: #f7f8fa; }
.action-card.danger { border: 1px solid rgba(238,10,36,0.15); }
.action-icon { font-size: 28px; }
.action-info { flex: 1; }
.action-title { font-size: 15px; font-weight: 600; }
.action-desc { font-size: 12px; color: #969799; margin-top: 2px; }

.help-tip { margin: 20px 16px; padding: 14px; background: #EBF5FB; border-radius: 10px; font-size: 13px; color: #3A7BC8; line-height: 1.8; }
.help-tip p:first-child { font-weight: 600; margin-bottom: 4px; }
</style>
