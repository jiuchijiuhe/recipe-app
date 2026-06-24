<script setup>
import { ref } from 'vue'
import sauces from '../data/hotpotSauces.json'
import { showToast } from 'vant'

const selected = ref(null)

function copyRecipe(sauce) {
  const text = `🍲 ${sauce.name}\n📝 配料：${sauce.ingredients}\n💡 ${sauce.tip}`
  navigator.clipboard?.writeText(text).then(() => {
    showToast('配方已复制')
  }).catch(() => showToast('复制失败'))
}
</script>

<template>
  <div class="hotpot-page">
    <div class="header">
      <h1 class="page-title">🍲 火锅蘸料</h1>
      <p class="page-subtitle">网红蘸碟配方合集，复制去调</p>
    </div>

    <div class="sauce-list">
      <div v-for="s in sauces" :key="s.id" class="sauce-card" @click="selected = s">
        <div class="sauce-top">
          <span class="sauce-icon">{{ s.icon }}</span>
          <div class="sauce-info">
            <p class="sauce-name">{{ s.name }}</p>
            <p class="sauce-from">{{ s.from }}</p>
          </div>
        </div>
        <div class="sauce-detail" v-if="selected?.id === s.id">
          <div class="detail-row">
            <span class="detail-label">📝 配料</span>
            <p class="detail-text">{{ s.ingredients }}</p>
          </div>
          <div class="detail-row">
            <span class="detail-label">💡 秘诀</span>
            <p class="detail-text">{{ s.tip }}</p>
          </div>
          <van-button size="small" round type="primary" @click.stop="copyRecipe(s)">📋 复制配方</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotpot-page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 26px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }

.sauce-list { padding: 0 12px; }
.sauce-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 10px; cursor: pointer; box-shadow: 0 1px 4px rgba(91,155,213,0.06); }
.sauce-top { display: flex; align-items: center; gap: 12px; }
.sauce-icon { font-size: 36px; }
.sauce-info { flex: 1; }
.sauce-name { font-size: 16px; font-weight: 600; }
.sauce-from { font-size: 12px; color: #969799; }

.sauce-detail { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.detail-row { margin-bottom: 10px; }
.detail-label { font-size: 13px; font-weight: 600; }
.detail-text { font-size: 14px; color: #646566; margin-top: 4px; line-height: 1.5; }
</style>
