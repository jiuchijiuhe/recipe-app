<script setup>
/**
 * 食谱详情页
 * 功能：食材清单、调味料、分步骤教程、小贴士、视频教程
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import recipes from '../data/recipes.json'
import { isFavorited, toggleFavorite, addHistory } from '../utils/storage.js'

const route = useRoute()
const recipe = ref(recipes.find((r) => r.id === route.params.id) || null)
const favorited = ref(false)

// === 视频链接 ===
const videoUrl = ref('')
const showVideoInput = ref(false)
const videoInput = ref('')

function loadVideoUrl() {
  if (!recipe.value) return
  try {
    const saved = JSON.parse(localStorage.getItem('recipe-videos') || '{}')
    videoUrl.value = saved[recipe.value.id] || recipe.value.videoUrl || ''
  } catch {
    videoUrl.value = recipe.value.videoUrl || ''
  }
}

function saveVideo() {
  const url = videoInput.value.trim()
  if (!url) { showToast('请粘贴视频链接'); return }
  if (!url.startsWith('http')) { showToast('请输入有效的网址链接'); return }
  try {
    const saved = JSON.parse(localStorage.getItem('recipe-videos') || '{}')
    saved[recipe.value.id] = url
    localStorage.setItem('recipe-videos', JSON.stringify(saved))
    videoUrl.value = url
    showVideoInput.value = false
    videoInput.value = ''
    showToast('✅ 视频链接已添加')
  } catch { showToast('保存失败') }
}

function removeVideo() {
  try {
    const saved = JSON.parse(localStorage.getItem('recipe-videos') || '{}')
    delete saved[recipe.value.id]
    localStorage.setItem('recipe-videos', JSON.stringify(saved))
    videoUrl.value = ''
    showToast('视频链接已删除')
  } catch { /* ignore */ }
}

function openVideo() {
  if (videoUrl.value) window.open(videoUrl.value, '_blank')
}

function getBilibiliSearchUrl() {
  if (!recipe.value) return ''
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(recipe.value.name + ' 做法')}`
}

// === 收藏 ===
function handleToggleFav() {
  if (!recipe.value) return
  favorited.value = toggleFavorite(recipe.value.id)
  showToast(favorited.value ? '❤️ 已收藏' : '已取消收藏')
}

onMounted(() => {
  loadVideoUrl()
  if (recipe.value) {
    favorited.value = isFavorited(recipe.value.id)
    addHistory(recipe.value.id)
  }
})

// 兜底
if (!recipe.value) {
  recipe.value = {
    name: '食谱未找到', cuisine: '', cookingTime: 0, servings: 0,
    calories: 0, difficulty: '', ingredients: { main: [], seasoning: [] },
    steps: [], tips: '请返回首页重新选择', coverImage: '😕', tags: [],
  }
}
</script>

<template>
  <div class="detail-page" v-if="recipe">
    <!-- 封面 -->
    <div class="cover-section">
      <div class="cover-image">{{ recipe.coverImage }}</div>
      <h1 class="recipe-title">{{ recipe.name }}</h1>
      <div class="recipe-stats">
        <span class="stat">⏱️ {{ recipe.cookingTime }}分钟</span>
        <span class="stat">👤 {{ recipe.servings }}人份</span>
        <span class="stat">🔥 {{ recipe.calories }}千卡</span>
        <span class="stat">📊 {{ recipe.difficulty }}</span>
      </div>
      <div class="recipe-tags">
        <van-tag plain type="primary" size="medium" v-for="tag in recipe.tags" :key="tag">{{ tag }}</van-tag>
        <van-tag plain color="#87CEEB" size="medium">{{ recipe.cuisine }}</van-tag>
      </div>
    </div>

    <!-- 视频教程 -->
    <div class="section video-section">
      <h3 class="section-title">📹 视频教程</h3>
      <div v-if="videoUrl" class="video-card">
        <div class="video-link-row">
          <span class="video-link-icon">🎬</span>
          <span class="video-link-text">已添加视频教程</span>
        </div>
        <div class="video-actions">
          <van-button size="small" round type="primary" @click="openVideo">▶️ 观看视频</van-button>
          <van-button size="small" round plain type="danger" @click="removeVideo">删除</van-button>
        </div>
      </div>
      <div v-if="!showVideoInput && !videoUrl" class="add-video-area">
        <van-button size="small" round plain type="primary" @click="showVideoInput = true">➕ 粘贴B站视频链接</van-button>
      </div>
      <div v-if="showVideoInput" class="video-input-area">
        <van-field v-model="videoInput" placeholder="粘贴B站视频链接..." clearable type="textarea" rows="2" />
        <div class="video-input-btns">
          <van-button size="small" round type="primary" @click="saveVideo">💾 保存</van-button>
          <van-button size="small" round plain @click="showVideoInput = false">取消</van-button>
        </div>
      </div>
      <div class="search-video-links">
        <p class="search-video-tip">🔍 在B站搜索视频教程：</p>
        <div class="search-btns">
          <a :href="getBilibiliSearchUrl()" target="_blank" class="search-btn bilibili-btn">📺 B站搜「{{ recipe.name }} 做法」</a>
        </div>
      </div>
    </div>

    <!-- 食材清单 -->
    <div class="section">
      <h3 class="section-title">📝 食材清单</h3>
      <div class="ingredient-group">
        <h4 class="ingredient-label">🥩 主料</h4>
        <div class="ingredient-list">
          <div class="ingredient-item" v-for="item in recipe.ingredients.main" :key="item.name">
            <span class="ingredient-name">{{ item.name }}</span>
            <span class="ingredient-amount">{{ item.amount }}</span>
          </div>
        </div>
      </div>
      <div class="ingredient-group">
        <h4 class="ingredient-label">🧂 调料</h4>
        <div class="ingredient-list">
          <div class="ingredient-item" v-for="item in recipe.ingredients.seasoning" :key="item.name">
            <span class="ingredient-name">{{ item.name }}</span>
            <span class="ingredient-amount">{{ item.amount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤 -->
    <div class="section">
      <h3 class="section-title">📖 做菜步骤</h3>
      <div class="steps-list">
        <div class="step-item" v-for="s in recipe.steps" :key="s.step">
          <div class="step-number">{{ s.step }}</div>
          <div class="step-content"><p class="step-text">{{ s.text }}</p></div>
        </div>
      </div>
    </div>

    <!-- 小贴士 -->
    <div class="section" v-if="recipe.tips">
      <h3 class="section-title">💡 烹饪小贴士</h3>
      <div class="tips-box"><p>{{ recipe.tips }}</p></div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <van-button round block :type="favorited ? 'default' : 'primary'" :icon="favorited ? 'star' : 'star-o'" @click="handleToggleFav">
        {{ favorited ? '❤️ 已收藏' : '⭐ 收藏食谱' }}
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.detail-page { padding-bottom: 80px; }
.cover-section { text-align: center; padding: 20px 16px; background: #fff; }
.cover-image { width: 100px; height: 100px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 60px; background: #EBF5FB; border-radius: 16px; }
.recipe-title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
.recipe-stats { display: flex; justify-content: center; gap: 10px; font-size: 13px; color: #969799; flex-wrap: wrap; margin-bottom: 10px; }
.stat { background: #EBF5FB; padding: 4px 10px; border-radius: 12px; color: #5B9BD5; }
.recipe-tags { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; }
.section { margin: 12px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.section-title { font-size: 17px; font-weight: bold; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #EBF5FB; color: #323233; }

.video-section { background: linear-gradient(135deg, #fff, #EBF5FB); }
.video-card { padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 12px; }
.video-link-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.video-link-icon { font-size: 24px; }
.video-link-text { font-size: 15px; font-weight: 600; color: #323233; }
.video-actions { display: flex; gap: 8px; }
.add-video-area { text-align: center; padding: 8px 0; }
.video-input-area { margin-bottom: 12px; }
.video-input-area :deep(.van-field) { border-radius: 8px; margin-bottom: 8px; }
.video-input-btns { display: flex; gap: 8px; }
.search-video-links { text-align: center; }
.search-video-tip { font-size: 13px; color: #969799; margin-bottom: 8px; }
.search-btns { display: flex; gap: 10px; justify-content: center; }
.search-btn { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 500; transition: transform 0.15s; }
.search-btn:active { transform: scale(0.95); }
.douyin-btn { background: #111; color: #fff; }
.bilibili-btn { background: #FB7299; color: #fff; }

.ingredient-group { margin-bottom: 12px; }
.ingredient-label { font-size: 14px; color: #969799; margin-bottom: 6px; }
.ingredient-list { display: flex; flex-wrap: wrap; gap: 6px; }
.ingredient-item { display: flex; align-items: center; background: #f0f4f8; border-radius: 8px; padding: 6px 10px; font-size: 14px; }
.ingredient-name { font-weight: 500; margin-right: 6px; }
.ingredient-amount { color: #969799; font-size: 13px; }

.steps-list { display: flex; flex-direction: column; gap: 12px; }
.step-item { display: flex; gap: 12px; align-items: flex-start; }
.step-number { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: #5B9BD5; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
.step-content { flex: 1; padding-top: 3px; }
.step-text { font-size: 15px; line-height: 1.6; color: #323233; }

.tips-box { background: #EBF5FB; border-left: 3px solid #5B9BD5; border-radius: 0 8px 8px 0; padding: 12px; font-size: 14px; line-height: 1.6; color: #3A7BC8; }

.bottom-actions { position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 448px; background: #fff; padding: 12px 16px; box-shadow: 0 -2px 10px rgba(91,155,213,0.08); }
</style>
