<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import recipes from '../data/recipes.json'

const router = useRouter()
const dailyRecipes = ref([])

function shuffleRecipes() {
  const shuffled = [...recipes].sort(() => Math.random() - 0.5)
  dailyRecipes.value = shuffled.slice(0, 3)
}
function refreshRecommend() {
  shuffleRecipes()
  showToast({ message: '✨ 换好啦～看看今天吃什么？', duration: 1200, position: 'top' })
}
shuffleRecipes()

const searchKeyword = ref('')
function onSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) router.push({ name: 'search', query: { keyword: kw } })
}
function goDetail(id) { router.push({ name: 'recipe-detail', params: { id } }) }

const categories = [
  { name: '减脂餐', icon: '🥗', cuisine: '减脂餐', gradient: 'linear-gradient(135deg, #A8E063, #56AB2F)' },
  { name: '家常菜', icon: '🍳', cuisine: '家常菜', gradient: 'linear-gradient(135deg, #FFB347, #FF9800)' },
  { name: '川菜', icon: '🌶️', cuisine: '川菜', gradient: 'linear-gradient(135deg, #FF6B6B, #E53935)' },
  { name: '汤煲', icon: '🍲', cuisine: '汤煲', gradient: 'linear-gradient(135deg, #C9A96E, #8D6E63)' },
  { name: '面食', icon: '🍜', cuisine: '面食', gradient: 'linear-gradient(135deg, #F8CD8C, #E67E22)' },
  { name: '粤菜', icon: '🥢', cuisine: '粤菜', gradient: 'linear-gradient(135deg, #64B5F6, #1976D2)' },
  { name: '火锅蘸料', icon: '🍲', cuisine: '_hotpot', gradient: 'linear-gradient(135deg, #F06292, #C2185B)' },
  { name: '创建食谱', icon: '✍️', cuisine: '_addrecipe', gradient: 'linear-gradient(135deg, #CE93D8, #7B1FA2)' },
]
function goCategory(cuisine) {
  if (cuisine === '_hotpot') router.push({ name: 'hotpot' })
  else if (cuisine === '_addrecipe') router.push({ name: 'add-recipe' })
  else router.push({ name: 'search', query: { cuisine } })
}
function goFoodMap() { router.push({ name: 'foodmap' }) }

// 可爱标语随机
const cuteMsgs = ['今天也是认真吃饭的一天呢～', '吃饱了才有力气减肥呀！', '厨房小天才就是你 🧑‍🍳', '好好吃饭 好好生活 ✨', '美食是治愈一切的良药 🍳']
const cuteMsg = ref(cuteMsgs[Math.floor(Math.random() * cuteMsgs.length)])
</script>

<template>
  <div class="home-page">
    <!-- 顶部 -->
    <div class="header">
      <div class="header-deco">🍳🥗🍜🥘🍲</div>
      <h1 class="app-title">今天吃什么？</h1>
      <p class="app-cute">{{ cuteMsg }}</p>
    </div>

    <!-- 搜索 -->
    <van-search v-model="searchKeyword" placeholder="🔍 搜搜看有没有想吃的..." shape="round" background="transparent" @search="onSearch" />

    <!-- 分类 -->
    <div class="cat-section">
      <p class="cat-label">✨ 想吃什么类型？</p>
      <div class="cat-grid">
        <div v-for="cat in categories" :key="cat.cuisine" class="cat-item" :style="{ background: cat.gradient }" @click="goCategory(cat.cuisine)">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 美食地图 -->
    <div class="foodmap-card" @click="goFoodMap">
      <span class="fm-icon">🗺️</span>
      <div class="fm-text">
        <span class="fm-title">美食地图</span>
        <span class="fm-desc">收藏旅行美食安利 ✈️</span>
      </div>
      <span class="fm-arrow">→</span>
    </div>

    <!-- 今日推荐 -->
    <div class="section-header">
      <span class="section-title">🎲 今天推荐这些给你</span>
      <van-button size="mini" round plain type="primary" @click="refreshRecommend">🔄 换一批</van-button>
    </div>

    <div class="recipe-list">
      <div v-for="(r, idx) in dailyRecipes" :key="r.id" class="recipe-card" @click="goDetail(r.id)" :style="{ animationDelay: idx * 0.1 + 's' }">
        <div class="rc-left">
          <div class="rc-emoji">{{ r.coverImage }}</div>
        </div>
        <div class="rc-right">
          <p class="rc-name">{{ r.name }}</p>
          <div class="rc-tags">
            <span class="rc-tag">{{ r.cuisine }}</span>
            <span class="rc-tag">{{ r.cookingTime }}分钟</span>
            <span class="rc-tag">{{ r.calories }}千卡</span>
          </div>
        </div>
        <span class="rc-arrow">→</span>
      </div>
    </div>

    <p class="footer-tip">💛 点击卡片查看详细做法哦～</p>
  </div>
</template>

<style scoped>
.home-page { padding-bottom: 20px; }

.header { text-align: center; padding: 20px 16px 12px; position: relative; }
.header-deco { font-size: 18px; letter-spacing: 4px; margin-bottom: 8px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.app-title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #FF6B8A, #FF9800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.app-cute { font-size: 13px; color: #FF6B8A; margin-top: 4px; opacity: 0.8; }

/* 分类 */
.cat-section { padding: 0 12px; }
.cat-label { font-size: 13px; color: #FF6B8A; padding: 0 4px 10px; font-weight: 600; }
.cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.cat-item { display: flex; flex-direction: column; align-items: center; padding: 14px 4px; border-radius: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.cat-item:active { transform: scale(0.93); box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
.cat-icon { font-size: 30px; margin-bottom: 4px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1)); }
.cat-name { font-size: 12px; color: #fff; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.15); }

/* 美食地图 */
.foodmap-card { display: flex; align-items: center; gap: 12px; margin: 12px; padding: 14px 16px; background: linear-gradient(135deg, #FFF0F3, #F0F4FF); border-radius: 16px; cursor: pointer; border: 1px solid rgba(255,107,138,0.15); }
.foodmap-card:active { transform: scale(0.98); }
.fm-icon { font-size: 32px; }
.fm-text { flex: 1; display: flex; flex-direction: column; }
.fm-title { font-size: 15px; font-weight: 600; }
.fm-desc { font-size: 12px; color: #969799; }
.fm-arrow { color: #FF6B8A; font-size: 18px; font-weight: bold; }

/* 推荐 */
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 8px; }
.section-title { font-size: 16px; font-weight: 700; color: #323233; }

.recipe-list { padding: 0 12px; }
.recipe-card { display: flex; align-items: center; gap: 12px; background: #fff; padding: 14px 16px; border-radius: 18px; margin-bottom: 10px; cursor: pointer; box-shadow: 0 2px 8px rgba(255,107,138,0.06); transition: all 0.2s; animation: slideUp 0.4s ease-out both; }
.recipe-card:active { transform: scale(0.98); box-shadow: 0 4px 12px rgba(255,107,138,0.12); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.rc-emoji { font-size: 42px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FFF5F7, #F0F4FF); border-radius: 14px; }
.rc-right { flex: 1; }
.rc-name { font-size: 16px; font-weight: 600; color: #323233; }
.rc-tags { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.rc-tag { font-size: 11px; color: #969799; background: #F5F5F5; padding: 2px 8px; border-radius: 10px; }
.rc-arrow { color: #FF6B8A; font-size: 16px; }

.footer-tip { text-align: center; color: #FF6B8A; font-size: 12px; margin-top: 12px; opacity: 0.7; }
</style>
