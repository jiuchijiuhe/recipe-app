<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getCustomRecipes, deleteCustomRecipe } from '../utils/customRecipes.js'
import { toggleFavorite, isFavorited } from '../utils/storage.js'

const router = useRouter()
const myRecipes = ref([])

function load() { myRecipes.value = getCustomRecipes() }

onMounted(load)

function goDetail(id) {
  router.push({ name: 'recipe-detail', params: { id } })
}

async function delRecipe(id) {
  try {
    await showConfirmDialog({ title: '删除', message: '确定删除这个食谱吗？' })
    deleteCustomRecipe(id)
    load()
    showToast('已删除')
  } catch {}
}

function goNew() {
  router.push({ name: 'add-recipe' })
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1 class="t">✍️ 我的食谱</h1>
      <p class="st">{{ myRecipes.length }} 个自定义食谱</p>
    </div>

    <div class="bar">
      <van-button round size="small" type="primary" @click="goNew">➕ 创建新食谱</van-button>
    </div>

    <div v-if="myRecipes.length" class="list">
      <div v-for="r in myRecipes" :key="r.id" class="card" @click="goDetail(r.id)">
        <div class="card-body">
          <span class="emoji">{{ r.coverImage || '🍽️' }}</span>
          <div class="info">
            <p class="name">{{ r.name }}</p>
            <p class="meta">{{ r.cuisine }} · {{ r.calories }}千卡 · {{ r.tags?.join(' ') }}</p>
          </div>
        </div>
        <van-icon name="delete-o" color="#ee0a24" size="18" @click.stop="delRecipe(r.id)" />
      </div>
    </div>

    <div v-else class="empty">
      <span class="ei">📝</span>
      <p>还没有自定义食谱</p>
      <van-button round plain type="primary" @click="goNew">创建第一个</van-button>
    </div>
  </div>
</template>

<style scoped>
.page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.t { font-size: 22px; font-weight: bold; }
.st { font-size: 13px; color: #969799; margin-top: 4px; }
.bar { padding: 12px 16px; text-align: center; }

.list { padding: 0 12px; }
.card { display: flex; align-items: center; background: #fff; padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.card-body { display: flex; align-items: center; gap: 12px; flex: 1; }
.emoji { font-size: 36px; }
.name { font-size: 15px; font-weight: 600; }
.meta { font-size: 12px; color: #969799; margin-top: 2px; }

.empty { text-align: center; padding: 60px 16px; }
.ei { font-size: 48px; }
</style>
