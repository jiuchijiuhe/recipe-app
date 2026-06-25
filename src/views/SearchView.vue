<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllRecipes } from '../utils/customRecipes.js'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.keyword || '')

// === 食材 ===
const allRecipes = computed(() => getAllRecipes())

const allIngredients = computed(() => {
  const set = new Set()
  allRecipes.value.forEach(r => r.ingredients.main.forEach(i => set.add(i.name)))
  return [...set].sort()
})

const ingredientSearch = ref('')
const selectedIngredients = ref([])

// 搜索过滤食材
const filteredIngredients = computed(() => {
  if (!ingredientSearch.value.trim()) return allIngredients.value.slice(0, 30)
  return allIngredients.value.filter(i => i.includes(ingredientSearch.value.trim()))
})

// 自定义食材
const customIngredient = ref('')
function addCustomIngredient() {
  const val = customIngredient.value.trim()
  if (val && !selectedIngredients.value.includes(val)) {
    selectedIngredients.value.push(val)
    customIngredient.value = ''
  }
}

function toggleIngredient(name) {
  const idx = selectedIngredients.value.indexOf(name)
  if (idx >= 0) selectedIngredients.value.splice(idx, 1)
  else selectedIngredients.value.push(name)
}

// 食材折叠
const showIngredients = ref(false)

// === 菜系 ===
const cuisines = ['全部', '家常菜', '川菜', '粤菜', '减脂餐', '汤煲', '面食']
const selectedCuisine = ref(route.query.cuisine || '全部')

// === 人数 ===
const servingMode = ref('all')

// === 搜索结果 ===
const results = computed(() => {
  let list = [...allRecipes.value]

  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(r => r.name.toLowerCase().includes(kw))
  }
  if (selectedCuisine.value !== '全部') {
    list = list.filter(r => r.cuisine === selectedCuisine.value)
  }
  if (servingMode.value === 'solo') list = list.filter(r => r.servings <= 2)
  else if (servingMode.value === 'family') list = list.filter(r => r.servings >= 3)

  // 食材匹配
  if (selectedIngredients.value.length > 0) {
    list = list.map(r => {
      const ri = r.ingredients.main.map(i => i.name)
      // 双向模糊匹配：用户食材包含食谱食材 或 食谱食材包含用户食材
      const mc = selectedIngredients.value.filter(n =>
        ri.some(riName => riName.includes(n) || n.includes(riName))
      ).length
      return { ...r, _match: mc }
    })
    list = list.filter(r => r._match > 0)
    list.sort((a, b) => b._match - a._match)
  }

  return list
})

function goDetail(id) { router.push({ name: 'recipe-detail', params: { id } }) }

function clearAll() {
  selectedIngredients.value = []
  selectedCuisine.value = '全部'
  servingMode.value = 'all'
  keyword.value = ''
  ingredientSearch.value = ''
}
</script>

<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <van-search v-model="keyword" placeholder="搜索菜名" shape="round" background="transparent" />

    <!-- 人数 -->
    <div class="filter-row">
      <span class="flabel">人数</span>
      <div class="toggle-group">
        <span class="tbtn" :class="{ on: servingMode==='all' }" @click="servingMode='all'">全部</span>
        <span class="tbtn" :class="{ on: servingMode==='solo' }" @click="servingMode='solo'">一人食</span>
        <span class="tbtn" :class="{ on: servingMode==='family' }" @click="servingMode='family'">家庭</span>
      </div>
    </div>

    <!-- 菜系 -->
    <div class="filter-row">
      <span class="flabel">菜系</span>
      <div class="chip-scroll">
        <span v-for="c in cuisines" :key="c" class="chip" :class="{ on: selectedCuisine===c }" @click="selectedCuisine=c">{{ c }}</span>
      </div>
    </div>

    <!-- 食材（可折叠） -->
    <div class="ingredient-section">
      <div class="ing-head" @click="showIngredients = !showIngredients">
        <span class="flabel">食材 {{ selectedIngredients.length ? '('+selectedIngredients.length+')' : '' }}</span>
        <van-icon :name="showIngredients ? 'arrow-up' : 'arrow-down'" />
      </div>

      <div v-if="showIngredients" class="ing-body">
        <!-- 已选食材 -->
        <div v-if="selectedIngredients.length" class="selected-row">
          <span v-for="ing in selectedIngredients" :key="ing" class="sel-tag" @click="toggleIngredient(ing)">{{ ing }} ✕</span>
          <span class="clear-all" @click="selectedIngredients=[]">清空</span>
        </div>

        <!-- 搜索食材 -->
        <van-search v-model="ingredientSearch" placeholder="搜索食材..." shape="round" background="#f0f4f8" />

        <!-- 自定义添加 -->
        <div class="custom-row">
          <van-field v-model="customIngredient" placeholder="输入你的食材..." size="small" />
          <van-button size="small" round type="primary" @click="addCustomIngredient">添加</van-button>
        </div>

        <!-- 食材标签 -->
        <div class="ing-tags">
          <span v-for="ing in filteredIngredients" :key="ing" class="ing-tag" :class="{ sel: selectedIngredients.includes(ing) }" @click="toggleIngredient(ing)">{{ ing }}</span>
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <div class="result-header">
      <span>找到 {{ results.length }} 道菜</span>
      <span v-if="selectedIngredients.length || selectedCuisine!=='全部' || servingMode!=='all'" class="clear-link" @click="clearAll">清空筛选</span>
    </div>

    <div class="result-list" v-if="results.length">
      <van-card v-for="r in results" :key="r.id" @click="goDetail(r.id)">
        <template #title>
          <span class="rname">{{ r.name }}
            <van-tag v-if="r._match" type="primary" size="small" style="margin-left:6px;">匹配{{ r._match }}种</van-tag>
          </span>
        </template>
        <template #desc>
          <div class="rmeta"><span>⏱️{{ r.cookingTime }}分钟</span><span>👤{{ r.servings }}人</span><span>🔥{{ r.calories }}千卡</span></div>
        </template>
        <template #thumb><div class="rthumb">{{ r.coverImage }}</div></template>
        <template #tags>
          <van-tag plain type="primary" size="medium">{{ r.cuisine }}</van-tag>
          <van-tag plain type="warning" size="medium" v-if="r.tags[0]">{{ r.tags[0] }}</van-tag>
        </template>
      </van-card>
    </div>

    <div v-else class="empty-state">
      <span>🔍</span>
      <p>没有匹配的食谱</p>
      <van-button size="small" round plain type="primary" @click="clearAll">清空筛选</van-button>
    </div>
  </div>
</template>

<style scoped>
.search-page { padding-bottom: 20px; }

.filter-row { display: flex; align-items: center; padding: 8px 16px; gap: 10px; }
.flabel { font-size: 14px; font-weight: 600; white-space: nowrap; color: #646566; }

.toggle-group { display: flex; background: #EBF5FB; border-radius: 8px; padding: 2px; }
.tbtn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; color: #969799; }
.tbtn.on { background: #5B9BD5; color: #fff; font-weight: 600; }

.chip-scroll { display: flex; gap: 8px; overflow-x: auto; flex: 1; }
.chip-scroll::-webkit-scrollbar { display: none; }
.chip { flex-shrink: 0; padding: 6px 14px; font-size: 13px; border-radius: 16px; background: #fff; color: #646566; cursor: pointer; border: 1px solid #ebedf0; }
.chip.on { background: #5B9BD5; color: #fff; border-color: #5B9BD5; font-weight: 600; }

/* 食材 */
.ingredient-section { margin: 0 12px 8px; background: #fff; border-radius: 12px; overflow: hidden; }
.ing-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; cursor: pointer; }
.ing-body { padding: 0 12px 12px; }
.selected-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; align-items: center; }
.sel-tag { padding: 4px 10px; font-size: 13px; border-radius: 14px; background: #5B9BD5; color: #fff; cursor: pointer; }
.clear-all { font-size: 12px; color: #5B9BD5; cursor: pointer; margin-left: 4px; }
.custom-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.ing-tags { display: flex; flex-wrap: wrap; gap: 6px; max-height: 180px; overflow-y: auto; }
.ing-tag { padding: 5px 12px; font-size: 13px; border-radius: 14px; background: #f0f4f8; color: #646566; cursor: pointer; border: 1px solid #ebedf0; }
.ing-tag.sel { background: #5B9BD5; color: #fff; border-color: #5B9BD5; }

/* 结果 */
.result-header { display: flex; justify-content: space-between; padding: 12px 16px 4px; font-size: 14px; font-weight: 600; color: #323233; }
.clear-link { font-size: 12px; color: #5B9BD5; cursor: pointer; font-weight: 400; }

.result-list { padding: 0 12px; }
.result-list :deep(.van-card) { margin-bottom: 10px; border-radius: 12px; background: #fff; cursor: pointer; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.rname { font-size: 17px; font-weight: 600; }
.rmeta { display: flex; gap: 12px; font-size: 13px; color: #969799; margin-top: 4px; }
.rthumb { width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 50px; background: #EBF5FB; border-radius: 8px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 16px; }
.empty-state p { margin: 8px 0 12px; color: #969799; }
</style>
