<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { getPublicItems } from '../utils/foodMap.js'

const feed = ref([])
const showShare = ref(false)
const shareText = ref('')
const showImport = ref(false)
const importText = ref('')

function loadFeed() {
  try { feed.value = JSON.parse(localStorage.getItem('comm-feed') || '[]') }
  catch { feed.value = [] }
}

function doShare() {
  const pub = getPublicItems()
  if (!Object.keys(pub).filter(k => pub[k]?.length).length) {
    showToast('请先去美食地图添加安利并设为公开')
    return
  }
  shareText.value = JSON.stringify(pub)
  // 先试自动复制
  const ta = document.createElement('textarea')
  ta.value = shareText.value
  ta.style.position = 'fixed'; ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
    showToast('已复制！发给朋友')
  } catch {
    showShare.value = true
  }
  document.body.removeChild(ta)
}

function doImport() {
  try {
    const data = JSON.parse(importText.value.trim())
    addToFeed(data)
    importText.value = ''
    showImport.value = false
  } catch { showToast('格式不对') }
}

function addToFeed(data) {
  loadFeed()
  Object.entries(data).forEach(([city, items]) => {
    if (!Array.isArray(items)) return
    items.forEach(item => {
      if (!feed.value.find(f => f.url === item.url)) {
        feed.value.unshift({ ...item, city, time: Date.now() })
      }
    })
  })
  if (feed.value.length > 200) feed.value = feed.value.slice(0, 200)
  localStorage.setItem('comm-feed', JSON.stringify(feed.value))
  showToast('已加入Feed')
}

function clearFeed() {
  feed.value = []
  localStorage.removeItem('comm-feed')
  showToast('已清除')
}

onMounted(loadFeed)
</script>

<template>
  <div class="page">
    <div class="header">
      <h1 class="t">美食社区</h1>
      <p class="st">分享和发现美食安利</p>
    </div>
    <div class="bar">
      <van-button round size="small" type="primary" @click="doShare">分享公开收藏</van-button>
      <van-button round size="small" plain type="primary" @click="showImport = true">加载别人分享</van-button>
    </div>

    <div v-if="feed.length" class="feed">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0 4px;">
        <h3 class="ft">Feed ({{ feed.length }})</h3>
        <span style="font-size:12px;color:#ee0a24;cursor:pointer;" @click="clearFeed">清除</span>
      </div>
      <div v-for="(item, idx) in feed" :key="idx" class="card">
        <a :href="item.url" target="_blank" class="card-link">
          <div class="card-top">
            <span class="card-city">{{ item.city }}</span>
            <span class="card-src">{{ item.source || '抖音' }}</span>
          </div>
          <p class="card-title">{{ item.title }}</p>
        </a>
      </div>
    </div>
    <div v-else class="empty">
      <span class="ei">📭</span>
      <p>还没有内容</p>
    </div>

    <!-- 分享弹窗 -->
    <van-popup v-model:show="showShare" round position="bottom" :style="{ height:'55%' }">
      <div class="pop">
        <h3>复制下面文字发给朋友</h3>
        <div class="text-box">{{ shareText }}</div>
        <p style="font-size:12px;color:#969799;text-align:center;">全选 → 复制 → 发给朋友</p>
      </div>
    </van-popup>

    <!-- 加载弹窗 -->
    <van-popup v-model:show="showImport" round position="bottom" :style="{ height:'50%' }">
      <div class="pop">
        <h3>粘贴朋友发你的内容</h3>
        <van-field v-model="importText" placeholder="长按粘贴..." type="textarea" rows="5" />
        <van-button round block type="primary" @click="doImport" style="margin-top:12px;">加载</van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.t { font-size: 26px; font-weight: bold; }
.st { font-size: 13px; color: #969799; margin-top: 4px; }
.bar { display: flex; gap: 10px; padding: 12px 16px; justify-content: center; }
.feed { padding: 0 12px; }
.ft { font-size: 16px; font-weight: bold; margin: 12px 0; }
.card { background: #fff; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.card-link { display: block; padding: 14px 16px; text-decoration: none; color: inherit; }
.card-link:active { background: #f7f8fa; }
.card-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
.card-city { font-size: 13px; font-weight: 600; color: #5B9BD5; }
.card-src { font-size: 11px; background: #111; color: #fff; padding: 2px 8px; border-radius: 3px; }
.card-title { font-size: 15px; font-weight: 500; }
.empty { text-align: center; padding: 60px 16px; }
.ei { font-size: 48px; }
.pop { padding: 24px 16px; }
.pop h3 { text-align: center; margin-bottom: 12px; }
.text-box { background: #f5f5f5; border-radius: 8px; padding: 12px; font-size: 11px; word-break: break-all; color: #323233; max-height: 300px; overflow-y: auto; user-select: all; }
</style>
