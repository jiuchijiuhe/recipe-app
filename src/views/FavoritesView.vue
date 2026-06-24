<script setup>
/**
 * 收藏页 — 展示已收藏的食谱列表
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import recipes from '../data/recipes.json'
import { getFavorites, toggleFavorite } from '../utils/storage.js'

const router = useRouter()
const favList = ref([])

function loadFavorites() {
  const ids = getFavorites()
  favList.value = ids
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean)
}

onMounted(loadFavorites)

function goDetail(id) {
  router.push({ name: 'recipe-detail', params: { id } })
}

function removeFav(id) {
  toggleFavorite(id)
  loadFavorites()
  showToast('已取消收藏')
}
</script>

<template>
  <div class="fav-page">
    <div class="header">
      <h2 class="page-title">❤️ 我的收藏</h2>
      <p class="page-subtitle">收藏的食谱都在这里，随时翻看</p>
    </div>

    <!-- 有收藏 -->
    <div v-if="favList.length > 0" class="recipe-list">
      <van-card
        v-for="recipe in favList"
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
        <template #footer>
          <van-button size="small" round plain type="danger" @click.stop="removeFav(recipe.id)">取消收藏</van-button>
        </template>
      </van-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-icon">📭</span>
      <p class="empty-text">还没有收藏食谱</p>
      <p class="empty-desc">去首页浏览食谱，点击收藏按钮吧</p>
      <van-button round plain type="primary" @click="router.push('/')">去首页看看</van-button>
    </div>
  </div>
</template>

<style scoped>
.fav-page { padding-bottom: 20px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 22px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }

.recipe-list { padding: 0 12px; }
.recipe-list :deep(.van-card) {
  margin-bottom: 10px;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(91,155,213,0.06);
}
.recipe-name { font-size: 17px; font-weight: 600; }
.recipe-meta { display: flex; gap: 12px; font-size: 13px; color: #969799; margin-top: 4px; }
.recipe-thumb { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 50px; background: #EBF5FB; border-radius: 8px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 16px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 16px; font-weight: 600; color: #323233; }
.empty-desc { font-size: 13px; color: #969799; margin: 4px 0 20px; }
</style>
