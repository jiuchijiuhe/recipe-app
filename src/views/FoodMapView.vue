<script setup>
import { ref, reactive, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  detectCity, getAllCities, getCityList, getCityItems,
  addFoodItem, removeFoodItem, toggleItemPublic, generateShareText,
  extractShareInfo,
} from '../utils/foodMap.js'

const showAdd = ref(false)
const addForm = reactive({ url: '', title: '', source: '抖音', city: '', isPublic: false })
const detectedCity = ref('')

// 粘贴链接时自动提取分享文案（抖音/小红书）
function onUrlInput() {
  const text = addForm.url.trim()
  if (text.includes('v.douyin.com') || text.includes('xhslink.com') || text.includes('抖音') || text.includes('小红书')) {
    const { url, title, source } = extractShareInfo(text)
    if (url) addForm.url = url
    if (source && source !== '其他') addForm.source = source
    if (title && !addForm.title) {
      addForm.title = title
      const city = detectCity(title)
      if (city) { addForm.city = city; detectedCity.value = city }
    }
  }
}

function onTextChange() {
  if (addForm.title.trim()) {
    const city = detectCity(addForm.title)
    detectedCity.value = city || '未识别到城市，请手动选择'
    if (city && !addForm.city) addForm.city = city
  } else { detectedCity.value = '' }
}

function handleAdd() {
  if (!addForm.url.trim()) { showToast('请粘贴视频链接'); return }
  if (!addForm.title.trim()) { showToast('请输入描述文字'); return }
  if (!addForm.city) { showToast('请选择城市'); return }
  addFoodItem(addForm.url.trim(), addForm.title.trim(), addForm.source, addForm.city, addForm.isPublic)
  showToast('已添加')
  showAdd.value = false
  Object.assign(addForm, { url: '', title: '', source: '抖音', city: '', isPublic: false })
  detectedCity.value = ''
  refreshData()
}

function copyLink(url) {
  navigator.clipboard?.writeText(url)
    .then(() => showToast('链接已复制，去App打开'))
    .catch(() => showToast('请长按链接文字复制'))
}

const cityList = ref(getCityList())
const selectedCity = ref(null)
const cityItems = ref([])

function refreshData() {
  cityList.value = getCityList()
  if (selectedCity.value) cityItems.value = getCityItems(selectedCity.value)
}

function selectCity(c) { selectedCity.value = c; cityItems.value = getCityItems(c) }
function backToList() { selectedCity.value = null; cityItems.value = [] }

async function handleDelete(id) {
  try {
    await showConfirmDialog({ title: '删除', message: '确定删除？' })
    removeFoodItem(selectedCity.value, id)
    refreshData()
    if (cityItems.value.length === 0) backToList()
    showToast('已删除')
  } catch { /* 取消 */ }
}

function handleTogglePublic(item) {
  toggleItemPublic(selectedCity.value, item.id)
  refreshData()
}

import { useRouter } from 'vue-router'
const router = useRouter()
function sharePublic() {
  router.push('/community')
}

const allCities = computed(() => {
  const c = new Set(cityList.value.map(i => i.city))
  return [...cityList.value, ...getAllCities().filter(x => !c.has(x)).map(x => ({ city: x, count: 0 }))]
})

const sourceOptions = ['抖音', '小红书', 'B站', '其他']

function cityEmoji(city) {
  const m = { '成都':'🐼','重庆':'🔥','广州':'🦐','西安':'🏯','长沙':'🌶️','上海':'🌃','北京':'🏛️','深圳':'💻','杭州':'🛶','南京':'🏛️','青岛':'🍺','大连':'🌊','厦门':'🏝️','三亚':'🌴','昆明':'🌸','丽江':'🏮','哈尔滨':'❄️','武汉':'🏗️','天津':'🎡','苏州':'🏯','桂林':'⛰️','拉萨':'🏔️','延边':'🍖','顺德':'🍲','乐山':'🍢' }
  return m[city] || '📍'
}
</script>

<template>
  <div class="foodmap-page">
    <div class="header">
      <h1 class="page-title">美食地图</h1>
      <p class="page-subtitle">收藏各城市美食安利 · <router-link to="/community" style="color:#5B9BD5;">查看社区</router-link></p>
    </div>
    <div class="top-actions">
      <van-button round block type="primary" @click="showAdd = true">添加美食安利</van-button>
      <van-button round plain type="default" @click="sharePublic" style="margin-top:8px;">分享公开收藏</van-button>
    </div>

    <!-- 城市列表 -->
    <div v-if="!selectedCity">
      <div v-if="cityList.length" class="section">
        <h3 class="section-title">已收藏的城市</h3>
        <div class="city-grid">
          <div v-for="it in cityList" :key="it.city" class="city-card" @click="selectCity(it.city)">
            <span class="city-emoji">{{ cityEmoji(it.city) }}</span>
            <span class="city-name">{{ it.city }}</span>
            <span class="city-count">{{ it.count }}个</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">🗺️</span><p class="empty-text">还没有收藏</p>
      </div>
    </div>

    <!-- 城市详情 -->
    <div v-else>
      <div class="city-header">
        <van-icon name="arrow-left" size="20" @click="backToList" />
        <h2 class="city-title">{{ selectedCity }}</h2>
      </div>

      <div class="food-list">
        <div v-for="item in cityItems" :key="item.id" class="food-card">
          <!-- 可点击的链接区域 -->
          <a :href="item.url" target="_blank" rel="noopener" class="food-body">
            <p class="food-title">{{ item.title }}</p>
            <p class="food-url">{{ item.url }}</p>
            <span class="food-source-tag" :class="item.source">{{ item.source }}</span>
            <span class="food-date">{{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}</span>
            <span v-if="item.isPublic" class="public-badge">公开</span>
          </a>
          <!-- 操作按钮 -->
          <div class="food-actions" @click.stop>
            <van-icon :name="item.isPublic?'eye-o':'closed-eye'" :color="item.isPublic?'#07C160':'#969799'" size="16" @click="handleTogglePublic(item)" style="padding:6px" />
            <van-icon name="delete-o" color="#ee0a24" size="16" @click="handleDelete(item.id)" style="padding:6px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加弹窗 -->
    <van-popup v-model:show="showAdd" round position="bottom" :style="{ height: '78%' }">
      <div class="add-form">
        <h3 class="form-title">添加美食安利</h3>
        <van-field v-model="addForm.url" label="链接" placeholder="直接粘贴抖音分享文案" clearable @update:model-value="onUrlInput" />
        <van-field v-model="addForm.title" label="描述" placeholder="粘贴文案（含城市名）" type="textarea" rows="3" @update:model-value="onTextChange" />
        <div class="city-detect" v-if="addForm.title.trim()">
          <span class="detect-label">识别：</span>
          <span class="detect-result" :class="{ ok: !detectedCity.startsWith('未') }">{{ detectedCity }}</span>
        </div>
        <div class="row">
          <span class="fl">城市</span>
          <div class="chips">
            <span v-for="c in allCities.slice(0,20)" :key="c.city" class="chip" :class="{ on: addForm.city===c.city }" @click="addForm.city=c.city">{{ c.city }}</span>
          </div>
        </div>
        <div class="row">
          <span class="fl">来源</span>
          <div class="chips">
            <span v-for="s in sourceOptions" :key="s" class="chip" :class="{ on: addForm.source===s }" @click="addForm.source=s">{{ s }}</span>
          </div>
        </div>
        <div class="row">
          <span class="fl">隐私</span>
          <van-switch v-model="addForm.isPublic" active-color="#07C160" size="18" />
          <span style="font-size:12px;color:#969799;margin-left:8px;">{{ addForm.isPublic ? '公开' : '私密' }}</span>
        </div>
        <div class="form-submit">
          <van-button round block type="primary" @click="handleAdd">确认添加</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.foodmap-page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 26px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }
.top-actions { padding: 12px 16px; }
.section { padding: 0 16px; }
.section-title { font-size: 17px; font-weight: bold; margin-bottom: 12px; }

.city-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
.city-card { display: flex; flex-direction: column; align-items: center; padding: 16px 8px; background: #fff; border-radius: 12px; cursor: pointer; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.city-card:active { transform: scale(0.96); }
.city-emoji { font-size: 36px; margin-bottom: 6px; }
.city-name { font-size: 16px; font-weight: 600; }
.city-count { font-size: 12px; color: #5B9BD5; margin-top: 2px; }

.city-header { display: flex; align-items: center; gap: 10px; padding: 16px; background: #fff; margin-bottom: 8px; }
.city-title { font-size: 20px; font-weight: bold; flex: 1; }

.food-list { padding: 0 12px; }
.food-card { display: flex; align-items: flex-start; background: #fff; padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }

/* 链接区域 — 原生 a 标签，最可靠 */
.food-body { flex: 1; text-decoration: none; color: inherit; display: block; }
.food-body:active { opacity: 0.7; }
.food-title { font-size: 15px; font-weight: 600; color: #323233; margin-bottom: 4px; }
.food-url { font-size: 10px; color: #5B9BD5; word-break: break-all; line-height: 1.3; margin-bottom: 6px; text-decoration: underline; text-underline-offset: 3px; }
.food-source-tag { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 11px; color: #fff; margin-right: 6px; }
.food-source-tag.抖音 { background: #111; }
.food-source-tag.小红书 { background: #FF2442; }
.food-source-tag.B站 { background: #FB7299; }
.food-source-tag.其他 { background: #999; }
.food-date { font-size: 11px; color: #c8c9cc; }
.public-badge { display: inline-block; font-size: 10px; color: #07C160; margin-left: 4px; }

.food-actions { display: flex; flex-direction: column; gap: 2px; margin-left: 8px; padding-top: 2px; }

.empty-state { text-align: center; padding: 60px 16px; }
.empty-icon { font-size: 48px; }
.empty-text { font-size: 16px; font-weight: 600; color: #323233; margin-top: 12px; }

.add-form { padding: 20px 16px; }
.form-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 12px; }
.city-detect { padding: 8px 16px; font-size: 13px; display: flex; align-items: center; gap: 6px; }
.detect-label { color: #969799; }
.detect-result { font-weight: 600; }
.detect-result.ok { color: #07C160; }
.detect-result:not(.ok) { color: #ee0a24; }
.row { padding: 12px 16px; }
.fl { font-size: 14px; font-weight: 600; display: block; margin-bottom: 6px; color: #646566; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; max-height: 100px; overflow-y: auto; }
.chip { padding: 5px 12px; font-size: 13px; border-radius: 14px; background: #f0f4f8; color: #646566; cursor: pointer; border: 1px solid #ebedf0; }
.chip.on { background: #5B9BD5; color: #fff; border-color: #5B9BD5; }
.form-submit { padding: 16px; }
</style>
