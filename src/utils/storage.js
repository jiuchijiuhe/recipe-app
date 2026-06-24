/**
 * 本地存储工具
 * 功能：收藏管理、浏览历史
 */

// === 收藏 ===

/** 获取收藏的食谱 ID 列表 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]')
  } catch {
    return []
  }
}

/** 检查是否已收藏 */
export function isFavorited(recipeId) {
  return getFavorites().includes(recipeId)
}

/** 切换收藏状态，返回新状态 */
export function toggleFavorite(recipeId) {
  const list = getFavorites()
  const idx = list.indexOf(recipeId)
  if (idx >= 0) {
    list.splice(idx, 1)
    localStorage.setItem('favorites', JSON.stringify(list))
    return false
  } else {
    list.push(recipeId)
    localStorage.setItem('favorites', JSON.stringify(list))
    return true
  }
}

// === 浏览历史 ===

/** 记录浏览 */
export function addHistory(recipeId) {
  try {
    let list = JSON.parse(localStorage.getItem('history') || '[]')
    list = list.filter(id => id !== recipeId)
    list.unshift(recipeId)
    if (list.length > 20) list = list.slice(0, 20)
    localStorage.setItem('history', JSON.stringify(list))
  } catch { /* ignore */ }
}

/** 获取最近浏览 */
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('history') || '[]')
  } catch {
    return []
  }
}
