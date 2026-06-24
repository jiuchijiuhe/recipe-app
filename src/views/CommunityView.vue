<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getPublicItems } from '../utils/foodMap.js'

const route = useRoute()

// 我的公开收藏
const myPublic = ref({})

// 社区Feed：从URL加载的其他人公开收藏
const feed = ref({}) // { city: [items] }

function loadMyData() {
  myPublic.value = getPublicItems()
}

function generateShareUrl() {
  const pub = getPublicItems()
  if (!Object.keys(pub).length) { showToast('没有公开的收藏'); return }
  const encoded = btoa(encodeURIComponent(JSON.stringify(pub)))
  const url = `${window.location.origin}${window.location.pathname}#/community?data=${encoded}`
  navigator.clipboard?.writeText(url).then(() => showToast('链接已复制，发给朋友'))
    .catch(() => showToast('复制失败'))
}

// 从localStorage加载缓存的社区数据
function loadFeed() {
  try {
    feed.value = JSON.parse(localStorage.getItem('community-feed') || '{}')
  } catch { feed.value = {} }
}

// 添加到社区Feed
function addToFeed(data) {
  loadFeed()
  Object.entries(data).forEach(([city, items]) => {
    if (!feed.value[city]) feed.value[city] = []
    items.forEach(item => {
      if (!feed.value[city].find(f => f.url === item.url)) {
        feed.value[city].push({ ...item, addedAt: Date.now() })
      }
    })
  })
  localStorage.setItem('community-feed', JSON.stringify(feed.value))
  showToast('已加入社区Feed')
}

// 清除Feed
function clearFeed() {
  feed.value = {}
  localStorage.removeItem('community-feed')
  showToast('已清除')
  loadFeed()
}

// 检查URL中的分享数据
onMounted(() => {
  loadMyData()
  loadFeed()
  if (route.query.data) {
    try {
      const data = JSON.parse(decodeURIComponent(atob(route.query.data)))
      addToFeed(data)
    } catch { /* ignore */ }
  }
})

function ce(c) {
  const m = {'成都':'🐼','重庆':'🔥','广州':'🦐','西安':'🏯','长沙':'🌶️','上海':'🌃','北京':'🏛️','深圳':'💻','杭州':'🛶'}
  return m[c] || '📍'
}

const showImport = ref(false)
const importCode = ref('')

function loadFromPaste() {
  try {
    const data = JSON.parse(decodeURIComponent(atob(importCode.value.trim())))
    addToFeed(data)
    importCode.value = ''
    showImport.value = false
    showToast('加载成功！')
  } catch { showToast('链接格式错误') }
}
</script>

<template>
  <div class="community-page">
    <div class="header">
      <h1 class="page-title">🌐 美食社区</h1>
      <p class="page-subtitle">发现大家公开的美食安利</p>
    </div>

    <!-- 我的 -->
    <div class="section">
      <h3 class="section-title">📤 我的</h3>
      <div v-if="Object.keys(myPublic).length">
        <p style="font-size:13px;color:#969799;margin-bottom:8px;">公开了 {{ Object.keys(myPublic).length }} 个城市</p>
        <van-button round size="small" type="primary" @click="generateShareUrl">🔗 生成分享链接</van-button>
      </div>
      <p v-else style="font-size:13px;color:#c8c9cc;">还没有公开的收藏，去「美食地图」添加并设为公开</p>
    </div>

    <!-- 加载别人的 -->
    <div class="section">
      <h3 class="section-title">📥 加载别人的安利</h3>
      <van-button round size="small" plain type="primary" @click="showImport = true" v-if="!showImport">粘贴分享链接</van-button>
      <div v-if="showImport" class="import-box">
        <van-field v-model="importCode" placeholder="粘贴朋友发你的链接..." type="textarea" rows="2" />
        <div style="display:flex;gap:8px;margin-top:8px;">
          <van-button round size="small" type="primary" @click="loadFromPaste">加载</van-button>
          <van-button round size="small" plain @click="showImport = false">取消</van-button>
        </div>
      </div>
    </div>

    <!-- 社区Feed -->
    <div class="section" v-if="Object.keys(feed).length">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3 class="section-title">🔥 社区Feed</h3>
        <span style="font-size:12px;color:#ee0a24;cursor:pointer;" @click="clearFeed">清除</span>
      </div>
      <div v-for="(items, city) in feed" :key="city" style="margin-bottom:12px;">
        <h4 style="font-size:15px;font-weight:600;margin-bottom:6px;">{{ ce(city) }} {{ city }}</h4>
        <div v-for="item in items" :key="item.id||item.url" class="feed-item">
          <a :href="item.url" target="_blank" class="feed-link">
            <span class="feed-source">{{ item.source||'抖音' }}</span>
            <span class="feed-title">{{ item.title }}</span>
          </a>
        </div>
      </div>
    </div>

    <div v-else class="section">
      <p style="font-size:13px;color:#c8c9cc;text-align:center;padding:40px 0;">
        还没有加载社区内容<br/>让朋友分享链接，粘贴到上面
      </p>
    </div>
  </div>
</template>

<style scoped>
.community-page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 26px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }
.section { margin: 12px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.section-title { font-size: 17px; font-weight: bold; margin-bottom: 8px; }

.import-box { margin-top: 8px; }

.feed-item { margin-bottom: 6px; }
.feed-link { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; padding: 8px; background: #f7f8fa; border-radius: 8px; }
.feed-source { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: #111; color: #fff; white-space: nowrap; }
.feed-title { font-size: 13px; flex: 1; }
</style>
