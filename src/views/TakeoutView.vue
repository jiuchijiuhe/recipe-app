<script setup>
/**
 * 随机美食抽取器
 * 功能：实时定位到区县 → 推荐当地特色 → 随机抽取菜系 → 复制关键词
 */
import { ref, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { getCurrentPosition, reverseGeocode, TAKEOUT_CATEGORIES } from '../utils/takeout.js'
import localFoods from '../data/localFoods.json'

// === 定位 ===
const loading = ref(true)
const detectedCity = ref('')
const location = ref({ lat: null, lng: null, error: null })

async function doLocate() {
  loading.value = true
  const result = await getCurrentPosition()
  location.value = result

  if (!result.error && result.lat) {
    const city = await reverseGeocode(result.lat, result.lng)
    // 去掉"市""县""区"后缀做匹配
    if (city) {
      detectedCity.value = city
      // 自动匹配城市列表
      const clean = city.replace(/市|县|区|自治州|地区$/, '')
      if (localFoods[city]) userCity.value = city
      else if (localFoods[clean]) userCity.value = clean
      // 模糊匹配
      else {
        const match = Object.keys(localFoods).find(k => city.includes(k) || k.includes(clean))
        if (match) userCity.value = match
      }
    }
  }
  loading.value = false
  if (result.error) showToast({ message: result.error, duration: 2000 })
}

onMounted(doLocate)

// === 城市选择 ===
const userCity = ref('')
const showCityPicker = ref(false)

function selectCity(city) {
  userCity.value = city
  showCityPicker.value = false
}

const localSpecials = computed(() => {
  if (!userCity.value) return []
  return localFoods[userCity.value] || []
})

// 热门城市
const hotCities = ['北京', '上海', '广州', '深圳', '成都', '重庆', '杭州', '西安', '长沙', '武汉', '南京', '厦门', '昆明', '贵阳', '拉萨', '乌鲁木齐']

// 所有有数据的城市
const allCityNames = Object.keys(localFoods)

// 搜索城市
const citySearch = ref('')
const filteredCities = computed(() => {
  if (!citySearch.value.trim()) return allCityNames.slice(0, 60)
  const kw = citySearch.value.trim()
  return allCityNames.filter(c => c.includes(kw)).slice(0, 30)
})

// === 随机抽取 ===
const isSpinning = ref(false)
const result = ref(null)
const showResult = ref(false)

function randomPick() {
  if (isSpinning.value) return
  isSpinning.value = true
  showResult.value = false
  let count = 0
  const interval = setInterval(() => {
    const cat = TAKEOUT_CATEGORIES[Math.floor(Math.random() * TAKEOUT_CATEGORIES.length)]
    result.value = { name: cat.name, icon: cat.icon, keyword: cat.keyword }
    if (++count >= 15) {
      clearInterval(interval)
      isSpinning.value = false
      showResult.value = true
      showToast({ message: `🎉 就决定是：${result.value.name}！`, duration: 2000 })
    }
  }, 100)
}

function copyKeyword() {
  if (!result.value) return
  const text = result.value.keyword + (userCity.value ? ` ${userCity.value}` : '')
  navigator.clipboard?.writeText(text).then(() => {
    showToast({ message: `📋 已复制「${text}」，去美团搜索吧！`, duration: 2500 })
  }).catch(() => {
    showToast({ message: `搜索关键词：${text}`, duration: 3000 })
  })
}
</script>

<template>
  <div class="takeout-page">
    <div class="header">
      <h1 class="page-title">🎲 今天吃什么</h1>
      <p class="page-subtitle">纠结症终结者·随机抽取·当地特色</p>
    </div>

    <!-- 定位 -->
    <div class="location-bar">
      <div class="location-info" v-if="!loading && detectedCity">
        <span class="location-dot">📍</span>
        <span class="location-city">{{ detectedCity }}</span>
      </div>
      <div class="location-info" v-else-if="!loading && !detectedCity && !location.error">
        <span>📍 已定位（未识别城市）</span>
      </div>
      <div class="location-info" v-else-if="!loading && location.error">⚠️ {{ location.error }}</div>
      <div class="location-info" v-else><van-loading size="16" color="#5B9BD5" /><span style="margin-left:8px;">定位中...</span></div>
      <van-button size="small" round plain type="primary" @click="doLocate" :loading="loading">重新定位</van-button>
    </div>

    <!-- 城市选择 -->
    <div class="section">
      <div class="section-top">
        <h3 class="section-title">🏙️ {{ userCity || '选择城市看当地美食' }}</h3>
        <van-button size="mini" round plain type="primary" @click="showCityPicker = true">
          换城市
        </van-button>
      </div>
      <div class="hot-cities">
        <span v-for="c in hotCities" :key="c" class="city-chip" :class="{ active: userCity === c }" @click="selectCity(c)">{{ c }}</span>
      </div>
    </div>

    <!-- 当地特色 -->
    <div class="section" v-if="localSpecials.length > 0">
      <h3 class="section-title">🔥 当地必吃</h3>
      <div class="local-tags">
        <span v-for="food in localSpecials" :key="food" class="local-tag">{{ food }}</span>
      </div>
    </div>

    <!-- 随机抽取 -->
    <div class="lottery-section">
      <div class="lottery-box" :class="{ spinning: isSpinning }">
        <span v-if="!result" class="lottery-placeholder">🎯</span>
        <span v-else class="lottery-icon">{{ result.icon }}</span>
        <p v-if="!result" class="lottery-text">点下面按钮开始</p>
        <p v-else class="lottery-text">{{ result.name }}</p>
      </div>
      <van-button round block type="primary" size="large" :loading="isSpinning" @click="randomPick">
        {{ isSpinning ? '🎰 抽取中...' : '🎲 随机抽取' }}
      </van-button>
      <van-button v-if="showResult && result" round block plain type="primary" style="margin-top:10px;" @click="copyKeyword">
        📋 复制「{{ result.keyword }}」搜索
      </van-button>
    </div>

    <!-- 城市弹窗 -->
    <van-popup v-model:show="showCityPicker" round position="bottom" :style="{ height: '75%' }">
      <div class="city-picker">
        <h3 class="picker-title">选择城市</h3>
        <van-search v-model="citySearch" placeholder="搜索城市名..." shape="round" background="transparent" />
        <div class="city-list">
          <span v-for="c in filteredCities" :key="c" class="pick-city-chip" :class="{ active: userCity === c }" @click="selectCity(c)">{{ c }}</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.takeout-page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.page-title { font-size: 26px; font-weight: bold; }
.page-subtitle { font-size: 13px; color: #969799; margin-top: 4px; }

.location-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin: 8px 12px; padding: 12px 16px; background: #fff; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(91,155,213,0.06);
}
.location-info { display: flex; align-items: center; font-size: 14px; color: #323233; }
.location-city { font-weight: 600; color: #5B9BD5; margin-left: 4px; }

.section { margin: 12px; }
.section-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.section-title { font-size: 17px; font-weight: bold; }

.hot-cities { display: flex; flex-wrap: wrap; gap: 8px; }
.city-chip { padding: 6px 12px; font-size: 13px; border-radius: 16px; background: #fff; color: #646566; cursor: pointer; border: 1px solid #ebedf0; }
.city-chip.active { background: #5B9BD5; color: #fff; border-color: #5B9BD5; }

.local-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.local-tag { padding: 8px 14px; font-size: 14px; border-radius: 20px; background: linear-gradient(135deg, #FF6B35, #FF8C42); color: #fff; font-weight: 500; }

.lottery-section { padding: 16px; }
.lottery-box { display: flex; flex-direction: column; align-items: center; padding: 30px; background: #fff; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(91,155,213,0.1); }
.lottery-box.spinning { animation: shake 0.1s infinite; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
.lottery-icon { font-size: 64px; }
.lottery-placeholder { font-size: 64px; opacity: 0.5; }
.lottery-text { font-size: 20px; font-weight: bold; margin-top: 8px; color: #323233; }

.city-picker { padding: 16px; }
.picker-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 8px; }
.city-list { display: flex; flex-wrap: wrap; gap: 8px; max-height: 400px; overflow-y: auto; }
.pick-city-chip { padding: 8px 14px; font-size: 14px; border-radius: 16px; background: #f0f4f8; color: #646566; cursor: pointer; border: 1px solid #ebedf0; }
.pick-city-chip.active { background: #5B9BD5; color: #fff; border-color: #5B9BD5; font-weight: 600; }
</style>
