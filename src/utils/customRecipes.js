/**
 * 自定义食谱管理
 * 用户的食谱存 localStorage，和内置食谱合并展示
 */

const STORAGE_KEY = 'custom-recipes'

export function getCustomRecipes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export function saveCustomRecipes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addCustomRecipe(recipe) {
  const list = getCustomRecipes()
  recipe.id = 'custom-' + Date.now()
  recipe.createdAt = new Date().toISOString()
  list.unshift(recipe)
  saveCustomRecipes(list)
  return recipe
}

export function deleteCustomRecipe(id) {
  const list = getCustomRecipes().filter(r => r.id !== id)
  saveCustomRecipes(list)
}

export function updateCustomRecipe(id, data) {
  const list = getCustomRecipes()
  const idx = list.findIndex(r => r.id === id)
  if (idx >= 0) { list[idx] = { ...list[idx], ...data }; saveCustomRecipes(list) }
}

/** 获取所有食谱（内置+自定义） */
import recipes from '../data/recipes.json'
export function getAllRecipes() {
  return [...recipes, ...getCustomRecipes()]
}
