<script setup>
/**
 * 首页 — 每日食谱推荐
 * 功能：随机展示 3 道菜，换一批，搜索，分类入口
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import recipes from '../data/recipes.json'

const router = useRouter()

// 随机推荐
const dailyRecipes = ref([])

function shuffleRecipes() {
  const shuffled = [...recipes].sort(() => Math.random() - 0.5)
  dailyRecipes.value = shuffled.slice(0, 3)
}

function refreshRecommend() {
  shuffleRecipes()
  showToast({ message: '✨ 已刷新推荐', duration: 1000, position: 'top' })
}

shuffleRecipes()

const searchKeyword = ref('')

function onSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) router.push({ name: 'search', query: { keyword } })
}

function goDetail(id) {
  router.push({ name: 'recipe-detail', params: { id } })
}

const categories = [
  { name: '减脂餐', icon: '🥗', cuisine: '减脂餐' },
  { name: '家常菜', icon: '🍳', cuisine: '家常菜' },
  { name: '川菜', icon: '🌶️', cuisine: '川菜' },
  { name: '汤煲', icon: '🍲', cuisine: '汤煲' },
  { name: '面食', icon: '🍜', cuisine: '面食' },
  { name: '粤菜', icon: '🥢', cuisine: '粤菜' },
  { name: '火锅蘸料', icon: '🍲', cuisine: '_hotpot' },
]

function goCategory(cuisine) {
  if (cuisine === '_hotpot') router.push({ name: 'hotpot' })
  else router.push({ name: 'search', query: { cuisine } })
}

function goFoodMap() {
  router.push({ name: 'foodmap' })
}
</script>

<template>
  <div class="home-page">
    <!-- 顶部 -->
    <div class="header">
      <h1 class="app-title">🍳 今天吃什么？</h1>
      <p class="app-subtitle">发现美味 · 告别选择困难</p>
    </div>

    <!-- 搜索 -->
    <van-search
      v-model="searchKeyword"
      placeholder="🔍 搜索菜名，如：红烧肉"
      shape="round"
      background="transparent"
      @search="onSearch"
    />

    <!-- 美食地图入口 -->
    <div class="foodmap-banner" @click="goFoodMap">
      <div class="foodmap-left">
        <span class="foodmap-icon">🌍</span>
        <div>
          <p class="foodmap-title">美食地图</p>
          <p class="foodmap-desc">收藏各城市美食安利 · 旅游必备</p>
        </div>
      </div>
      <van-icon name="arrow" color="#5B9BD5" />
    </div>

    <!-- 分类入口 -->
    <div class="category-grid">
      <div
        v-for="cat in categories"
        :key="cat.cuisine"
        class="category-item"
        @click="goCategory(cat.cuisine)"
      >
        <span class="category-icon">{{ cat.icon }}</span>
        <span class="category-name">{{ cat.name }}</span>
      </div>
    </div>

    <!-- 今日推荐 -->
    <div class="section-header">
      <span class="section-title">🎲 今日推荐</span>
      <van-button size="small" round plain type="primary" @click="refreshRecommend">
        🔄 换一批
      </van-button>
    </div>

    <!-- 推荐列表 -->
    <div class="recipe-list">
      <van-card
        v-for="recipe in dailyRecipes"
        :key="recipe.id"
        @click="goDetail(recipe.id)"
      >
        <template #title>
          <span class="recipe-name">{{ recipe.name }}</span>
        </template>
        <template #desc>
          <div class="recipe-meta">
            <span>⏱️ {{ recipe.cookingTime }}分钟</span>
            <span>👤 {{ recipe.servings }}人份</span>
            <span>🔥 {{ recipe.calories }}千卡</span>
          </div>
        </template>
        <template #thumb>
          <div class="recipe-thumb">{{ recipe.coverImage }}</div>
        </template>
        <template #tags>
          <van-tag plain type="primary" size="medium">{{ recipe.cuisine }}</van-tag>
          <van-tag plain type="warning" size="medium" v-if="recipe.tags[0]">{{ recipe.tags[0] }}</van-tag>
        </template>
      </van-card>
    </div>

    <p class="footer-tip">💡 点击卡片查看详细做法 · 去「筛选」按食材找菜</p>
  </div>
</template>

<style scoped>
.home-page { padding-bottom: 20px; }

.header {
  text-align: center;
  padding: 20px 16px 8px;
}

.app-title {
  font-size: 26px;
  font-weight: bold;
  color: #323233;
}

.app-subtitle {
  font-size: 13px;
  color: #969799;
  margin-top: 4px;
}

/* 美食地图入口 */
.foodmap-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 12px 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #EBF5FB, #fff);
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid rgba(91,155,213,0.15);
  box-shadow: 0 1px 4px rgba(91,155,213,0.08);
}
.foodmap-left { display: flex; align-items: center; gap: 12px; }
.foodmap-icon { font-size: 32px; }
.foodmap-title { font-size: 15px; font-weight: 600; color: #323233; }
.foodmap-desc { font-size: 12px; color: #969799; margin-top: 2px; }

/* 分类 */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16px 12px;
  gap: 8px;
}

.category-item {
  flex: 1 1 calc(33.33% - 8px);
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s;
  box-shadow: 0 1px 4px rgba(91, 155, 213, 0.06);
}

.category-item:active { transform: scale(0.96); }

.category-icon { font-size: 28px; margin-bottom: 4px; }

.category-name { font-size: 13px; color: #323233; font-weight: 500; }

/* 推荐 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}

.section-title { font-size: 18px; font-weight: bold; }

/* 卡片 */
.recipe-list { padding: 0 12px; }

.recipe-list :deep(.van-card) {
  margin-bottom: 10px;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(91, 155, 213, 0.06);
}

.recipe-name { font-size: 17px; font-weight: 600; }

.recipe-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #969799;
  margin-top: 4px;
}

.recipe-thumb {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  background: #EBF5FB;
  border-radius: 8px;
}

.footer-tip {
  text-align: center;
  color: #c8c9cc;
  font-size: 13px;
  margin-top: 12px;
}
</style>
