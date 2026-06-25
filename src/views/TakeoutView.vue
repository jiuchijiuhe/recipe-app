<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import recipes from '../data/recipes.json'
import { getCustomRecipes } from '../utils/customRecipes.js'

const router = useRouter()
const allRecipes = [...recipes, ...getCustomRecipes()]

const isSpinning = ref(false)
const current = ref(null)
const showResult = ref(false)

function randomPick() {
  if (isSpinning.value) return
  isSpinning.value = true
  showResult.value = false

  let count = 0
  const interval = setInterval(() => {
    current.value = allRecipes[Math.floor(Math.random() * allRecipes.length)]
    if (++count >= 20) {
      clearInterval(interval)
      isSpinning.value = false
      showResult.value = true
      showToast('🎉 ' + current.value.name + '！')
    }
  }, 80)
}

function goCook() {
  if (current.value) {
    router.push({ name: 'recipe-detail', params: { id: current.value.id } })
  }
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1 class="t">🎲 随机吃什么</h1>
      <p class="st">纠结的时候让系统帮你决定</p>
    </div>

    <!-- 抽取动画区 -->
    <div class="lottery">
      <div class="box" :class="{ spin: isSpinning }">
        <span class="emoji">{{ current?.coverImage || '🎯' }}</span>
        <p class="name">{{ current?.name || '点按钮开始' }}</p>
        <div v-if="showResult && current" class="info">
          <span>⏱️ {{ current.cookingTime }}分钟</span>
          <span>🔥 {{ current.calories }}千卡</span>
          <span>📊 {{ current.difficulty }}</span>
          <span class="cuisine">{{ current.cuisine }}</span>
        </div>
      </div>

      <van-button round block type="primary" size="large" :loading="isSpinning" @click="randomPick">
        {{ isSpinning ? '🎰 抽取中...' : '🎲 随机抽取' }}
      </van-button>

      <van-button v-if="showResult" round block plain type="primary" @click="goCook" style="margin-top:12px;">
        查看做法
      </van-button>
    </div>

    <div class="tip">
      <p>💡 从 {{ allRecipes.length }} 道菜中随机抽取，选到不喜欢的就再抽一次</p>
    </div>
  </div>
</template>

<style scoped>
.page { padding-bottom: 20px; }
.header { text-align: center; padding: 20px 16px 8px; }
.t { font-size: 26px; font-weight: bold; }
.st { font-size: 13px; color: #969799; margin-top: 4px; }

.lottery { padding: 16px; }

.box {
  display: flex; flex-direction: column; align-items: center; padding: 40px 16px;
  background: #fff; border-radius: 16px; margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(91,155,213,0.1); min-height: 180px;
}
.box.spin { animation: shake 0.08s infinite; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
.emoji { font-size: 72px; transition: all 0.08s; }
.name { font-size: 22px; font-weight: bold; margin-top: 8px; color: #323233; }
.info { display: flex; gap: 10px; margin-top: 10px; font-size: 13px; color: #5B9BD5; flex-wrap: wrap; justify-content: center; }
.cuisine { background: #EBF5FB; padding: 2px 10px; border-radius: 10px; }

.tip { text-align: center; padding: 20px 16px; font-size: 13px; color: #c8c9cc; }
</style>
