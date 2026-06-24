/**
 * 推荐算法
 * 综合食材匹配、时令、历史记录排序
 */
import { getHistory } from './storage.js'

// 时令食材（按月份）
const SEASONAL = {
  // 春季 3-5月
  spring: ['韭菜', '春笋', '菠菜', '荠菜', '香椿', '蚕豆'],
  // 夏季 6-8月
  summer: ['黄瓜', '西红柿', '苦瓜', '冬瓜', '丝瓜', '空心菜', '毛豆'],
  // 秋季 9-11月
  autumn: ['莲藕', '山药', '南瓜', '红薯', '板栗', '茄子'],
  // 冬季 12-2月
  winter: ['萝卜', '白菜', '羊肉', '牛肉', '土豆', '香菇'],
}

/** 获取当前季节 */
function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

/** 获取当前时段 */
function getMealTime() {
  const h = new Date().getHours()
  if (h >= 5 && h < 10) return '早餐'
  if (h >= 10 && h < 14) return '午餐'
  if (h >= 14 && h < 17) return '下午茶'
  return '晚餐'
}

/**
 * 综合推荐打分
 * @param {Array} recipes — 全部食谱
 * @param {Object} filters — { selectedIngredients, selectedCuisine, servingMode }
 * @returns {Array} 排序后的食谱
 */
export function getRecommendations(recipes, filters = {}) {
  const { selectedIngredients = [], selectedCuisine = '全部', servingMode = 'all' } = filters
  const history = getHistory()
  const season = getSeason()
  const mealTime = getMealTime()
  const seasonalIngredients = SEASONAL[season]

  return recipes
    .map((r) => {
      let score = 0

      // 1. 食材匹配度 (0-50分)
      if (selectedIngredients.length > 0) {
        const recipeIngredients = r.ingredients.main.map((i) => i.name)
        const matchCount = selectedIngredients.filter((name) =>
          recipeIngredients.some((ri) => ri.includes(name) || name.includes(ri))
        ).length
        score += (matchCount / selectedIngredients.length) * 50
      }

      // 2. 菜系匹配 (0-20分)
      if (selectedCuisine !== '全部' && r.cuisine === selectedCuisine) {
        score += 20
      }

      // 3. 人数匹配 (0-10分)
      if (servingMode === 'solo' && r.servings <= 2) score += 10
      else if (servingMode === 'family' && r.servings >= 3) score += 10

      // 4. 用餐时段匹配 (0-10分)
      if (r.mealType === mealTime) score += 10
      // 早餐也推荐快手菜
      if (mealTime === '早餐' && r.tags.includes('快手菜')) score += 5

      // 5. 时令食材加分 (0-10分)
      const hasSeasonal = r.ingredients.main.some((item) =>
        seasonalIngredients.some((s) => item.name.includes(s))
      )
      if (hasSeasonal) score += 10

      // 6. 减脂餐季节偏好：春夏加分
      if (r.cuisine === '减脂餐' && (season === 'spring' || season === 'summer')) {
        score += 5
      }
      // 汤煲秋冬加分
      if (r.cuisine === '汤煲' && (season === 'autumn' || season === 'winter')) {
        score += 5
      }

      // 7. 历史惩罚：最近看过/收藏过的降低权重 (-20分)
      if (history.includes(r.id)) {
        score -= 20
      }

      // 8. 随机扰动：避免完全相同的排序 (0-3分)
      score += Math.random() * 3

      return { ...r, _score: Math.round(score * 10) / 10 }
    })
    .sort((a, b) => b._score - a._score)
}
