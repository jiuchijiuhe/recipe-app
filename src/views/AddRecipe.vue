<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { addCustomRecipe, getCustomRecipes, deleteCustomRecipe } from '../utils/customRecipes.js'
import { INGREDIENTS } from '../utils/ingredients.js'

const router = useRouter()
const mode = ref('easy') // 'easy' | 'custom'

// === 简易模式 ===
const easyText = ref('')
const easyPreview = ref(null) // { name, cuisine, calories, tags, steps, tips }

// 烹饪方法关键词
const COOK_METHODS = {'炒':'炒','煎':'煎','炸':'炸','蒸':'蒸','煮':'煮','炖':'炖','烤':'烤','焖':'焖','拌':'拌','卤':'卤','烧':'烧','焗':'焗','空气炸锅':'空气炸锅'}

function analyzeEasy() {
  const text = easyText.value.trim()
  if (!text) { showToast('请粘贴视频文案'); return }

  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  const url = urlMatch ? urlMatch[0] : ''

  // 1. 提取菜名
  let name = ''
  const namePatterns = [/《(.+?)》/, /「(.+?)」/, /【(.+?)】/, /#(\S{2,8}(菜|饭|面|汤|煲|锅|饼|卷|虾|鸡|鱼|肉|蛋)\S*)/]
  for (const p of namePatterns) { const m = text.match(p); if (m) { name = m[1]; break } }
  if (!name) {
    const clean = text.replace(/https?:\/\/[^\s]+/g,'').replace(/[\d.]+\s*(复制打开抖音|看看)/g,'').replace(/，.*/,'').trim()
    name = clean.substring(0, 20)
  }

  // 2. 识别菜系
  let cuisine = '家常菜'
  if (/减脂|低卡|减肥|瘦身|轻食|健康餐/.test(text)) cuisine = '减脂餐'
  else if (/麻辣|火锅|川|辣子|水煮|担担/.test(text)) cuisine = '川菜'
  else if (/汤|煲|炖|暖身/.test(text)) cuisine = '汤煲'
  else if (/面|粉|米线|饺子|馄饨|包/.test(text)) cuisine = '面食'
  else if (/粤|广式|早茶|清蒸|白切/.test(text)) cuisine = '粤菜'

  // 3. 识别热量
  let calories = 300
  const calMatch = text.match(/(\d+)\s*(大卡|千卡|卡路里|kcal)/i)
  if (calMatch) calories = parseInt(calMatch[1])
  else if (cuisine === '减脂餐') calories = 250

  // 4. 提取食材（346种，按长度排序优先匹配长的）
  const sortedIngs = [...INGREDIENTS].sort((a,b) => b.length - a.length)
  const found = new Set()
  // 用占位符替换已匹配的食材避免重复匹配
  let remaining = text
  for (const ing of sortedIngs) {
    if (remaining.includes(ing)) {
      found.add(ing)
      remaining = remaining.replace(ing, '')
      if (found.size >= 10) break
    }
  }
  const mainIngs = [...found]

  // 5. 识别烹饪方法
  let method = ''
  for (const [key, val] of Object.entries(COOK_METHODS)) {
    if (text.includes(key)) { method = val; break }
  }

  // 6. 提取标签
  const tagMatches = text.match(/#\S+/g)
  const tagList = (tagMatches || []).map(t => t.replace('#','')).slice(0, 4)
  if (!tagList.length) tagList.push('自制')

  // 7. 步骤提示
  let stepHint = ''
  if (mainIngs.length && method) {
    stepHint = `食材：${mainIngs.join('、')}\n做法：${method}为主\n`
  }
  stepHint += '查看视频教程获取完整步骤'

  easyPreview.value = {
    name, cuisine, calories, tags: tagList,
    mainIngredients: mainIngs.map(n => n + ' 适量').join(', '),
    steps: stepHint,
    tips: method ? `使用${method}的方法制作，详见视频教程` : '查看视频教程获取详细步骤',
    videoUrl: url, coverImage: '🎬',
  }
}

// === 自定义模式 ===
const form = reactive({
  name: '', cuisine: '家常菜', mealType: '午餐', servings: 2,
  cookingTime: 15, difficulty: '简单', calories: 300,
  tags: '', mainIngredients: '', seasonings: '', steps: '', tips: '', videoUrl: '',
})

const cuisines = ['家常菜','川菜','粤菜','减脂餐','汤煲','面食','其他']
const meals = ['早餐','午餐','晚餐']
const diffs = ['简单','中等','困难']
const cuisineEmoji = {'家常菜':'🍳','川菜':'🌶️','粤菜':'🥢','减脂餐':'🥗','汤煲':'🍲','面食':'🍜','其他':'🍽️'}
const ingredientEmoji = {'鸡':'🐔','虾':'🦐','鱼':'🐟','肉':'🥩','猪':'🥩','牛':'🥩','蛋':'🥚','豆腐':'🧈','土豆':'🥔','茄子':'🍆','番茄':'🍅','西红柿':'🍅','黄瓜':'🥒','西兰花':'🥦','面':'🍝','饭':'🍚','汤':'🍵','菇':'🍄','菜':'🥬','包':'🥟','饺':'🥟'}

function autoEmoji(recipe) {
  if (recipe.ingredients?.main) {
    for (const item of recipe.ingredients.main) {
      for (const [key, emoji] of Object.entries(ingredientEmoji)) {
        if (item.name.includes(key)) return emoji
      }
    }
  }
  return cuisineEmoji[recipe.cuisine] || '🍽️'
}

function parseIngredients(text) {
  if (!text.trim()) return []
  return text.split(/[,，\n]/).filter(Boolean).map(s => {
    const parts = s.trim().split(/\s+/)
    return { name: parts.slice(0,-1).join(' ')||parts[0], amount: parts[parts.length-1]||'适量' }
  })
}

function parseSteps(text) {
  if (!text.trim()) return []
  return text.split('\n').filter(Boolean).map((t,i) => ({step:i+1,text:t.trim()}))
}

const uploadedImage = ref('')
function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 200*1024) { showToast('图片不能超过200KB'); return }
  const reader = new FileReader()
  reader.onload = ev => { uploadedImage.value = ev.target.result }
  reader.readAsDataURL(file)
}

// === 提交 ===
function handleEasySubmit() {
  if (!easyPreview.value || !easyPreview.value.name) { showToast('请先粘贴文案并分析'); return }
  const pre = easyPreview.value
  const mainIngs = pre.mainIngredients ? pre.mainIngredients.split(/[,，]/).filter(Boolean).map(s => {
    const p = s.trim().split(/\s+/)
    return { name: p.slice(0,-1).join(' ')||p[0], amount: p[p.length-1]||'适量' }
  }) : []
  addCustomRecipe({
    name: pre.name, cuisine: pre.cuisine, mealType: '午餐', servings: 1,
    cookingTime: 20, difficulty: '简单', calories: pre.calories,
    tags: pre.tags, coverImage: pre.coverImage,
    videoUrl: pre.videoUrl,
    ingredients: { main: mainIngs, seasoning: [] },
    steps: pre.steps ? [{ step: 1, text: pre.steps }] : [],
    tips: pre.tips, image: '',
  })
  showToast('食谱已添加！'); router.back()
}

function handleCustomSubmit() {
  if (!form.name.trim()) { showToast('请输入菜名'); return }
  if (!form.mainIngredients.trim()) { showToast('请输入食材'); return }
  if (!form.steps.trim()) { showToast('请输入步骤'); return }
  const recipe = {
    name: form.name.trim(), cuisine: form.cuisine, mealType: form.mealType,
    servings: form.servings, cookingTime: form.cookingTime, difficulty: form.difficulty,
    calories: form.calories,
    tags: form.tags ? form.tags.split(/[,，]/).map(t=>t.trim()).filter(Boolean) : ['自制'],
    coverImage: autoEmoji({cuisine:form.cuisine,ingredients:{main:parseIngredients(form.mainIngredients)}}),
    videoUrl: form.videoUrl.trim(),
    ingredients: { main: parseIngredients(form.mainIngredients), seasoning: parseIngredients(form.seasonings) },
    steps: parseSteps(form.steps), tips: form.tips.trim(),
    image: uploadedImage.value || '',
  }
  addCustomRecipe(recipe)
  showToast('食谱已添加！'); router.back()
}

// === 我的食谱 ===
const myList = ref(getCustomRecipes())
function refreshList() { myList.value = getCustomRecipes() }
function delRecipe(id) { deleteCustomRecipe(id); refreshList(); showToast('已删除') }
</script>

<template>
  <div class="page">
    <div class="header"><h1 class="t">✍️ 创建食谱</h1></div>

    <!-- 模式切换 -->
    <div class="mode-bar">
      <span class="mode-btn" :class="{on:mode==='easy'}" @click="mode='easy'">⚡ 简易创建</span>
      <span class="mode-btn" :class="{on:mode==='custom'}" @click="mode='custom'">🔧 自定义</span>
    </div>

    <!-- 简易模式 -->
    <div v-if="mode==='easy'" class="easy">
      <div class="warning">
        <p>⚠️ 简易模式说明</p>
        <p>• 食材识别基于关键词匹配，可能不完整或不准确</p>
        <p>• 热量为预估值，仅供参考</p>
        <p>• 如需精准食谱，请使用「自定义」模式或发给我来添加</p>
      </div>
      <van-field v-model="easyText" placeholder="直接粘贴抖音分享文案..." type="textarea" rows="4" />
      <van-button round block type="primary" @click="analyzeEasy" style="margin-top:8px;">🔍 分析食谱</van-button>

      <!-- 分析结果 -->
      <div v-if="easyPreview" class="preview-card">
        <h3>📋 分析结果（可手动修改）</h3>
        <van-field v-model="easyPreview.name" label="菜名" />
        <div class="row"><span class="lbl">菜系</span><div class="chips"><span v-for="c in cuisines" :key="c" class="chip" :class="{on:easyPreview.cuisine===c}" @click="easyPreview.cuisine=c">{{c}}</span></div></div>
        <van-field v-model="easyPreview.calories" label="热量(千卡)" type="number" />
        <van-field v-model="easyPreview.mainIngredients" label="识别到的食材" type="textarea" rows="2" />
        <van-field v-model="easyPreview.steps" label="步骤提示" type="textarea" rows="3" />
        <van-field v-model="easyPreview.tips" label="小贴士" type="textarea" rows="2" />
        <van-button round block type="primary" size="large" @click="handleEasySubmit" style="margin-top:12px;">发布食谱</van-button>
      </div>
    </div>

    <!-- 自定义模式 -->
    <div v-if="mode==='custom'" class="custom">
      <div v-if="myList.length" class="my">
        <h3>📋 我的食谱 ({{ myList.length }})</h3>
        <div v-for="r in myList" :key="r.id" class="my-item">
          <span>{{ r.coverImage }} {{ r.name }}</span>
          <span style="color:#ee0a24;cursor:pointer;font-size:12px" @click="delRecipe(r.id)">删除</span>
        </div>
      </div>

      <van-field v-model="form.name" label="菜名" placeholder="如：低卡番茄炒蛋" />
      <van-field v-model="form.calories" label="热量(千卡)" type="number" placeholder="预估值，仅供参考" />
      <van-field v-model="form.cookingTime" label="时间(分钟)" type="number" />
      <div class="row"><span class="lbl">菜系</span><div class="chips"><span v-for="c in cuisines" :key="c" class="chip" :class="{on:form.cuisine===c}" @click="form.cuisine=c">{{c}}</span></div></div>
      <div class="row"><span class="lbl">餐时</span><div class="chips"><span v-for="m in meals" :key="m" class="chip" :class="{on:form.mealType===m}" @click="form.mealType=m">{{m}}</span></div></div>
      <div class="row"><span class="lbl">难度</span><div class="chips"><span v-for="d in diffs" :key="d" class="chip" :class="{on:form.difficulty===d}" @click="form.difficulty=d">{{d}}</span></div></div>
      <div class="row"><span class="lbl">份数</span><van-stepper v-model="form.servings" min="1" max="10" /></div>

      <div class="row"><span class="lbl">图片</span>
        <label class="upload-btn">📷 上传<input type="file" accept="image/*" style="display:none" @change="handleImageUpload"></label>
        <img v-if="uploadedImage" :src="uploadedImage" class="preview-img" />
        <span v-else style="font-size:11px;color:#c8c9cc;">不传则自动emoji</span>
      </div>

      <van-field v-model="form.tags" label="标签" placeholder="减脂,快手 (逗号分隔)" />
      <van-field v-model="form.mainIngredients" label="主料" placeholder="鸡胸肉 200g&#10;西红柿 2个" type="textarea" rows="3" />
      <van-field v-model="form.seasonings" label="调料" placeholder="盐 少许&#10;生抽 1勺" type="textarea" rows="2" />
      <van-field v-model="form.steps" label="步骤" placeholder="每行一步&#10;1. 鸡胸肉切片&#10;2. 热锅少油煎熟" type="textarea" rows="5" />
      <van-field v-model="form.tips" label="小贴士" type="textarea" rows="2" />
      <van-field v-model="form.videoUrl" label="视频链接" placeholder="抖音/B站链接 (可选)" />

      <div class="submit"><van-button round block type="primary" size="large" @click="handleCustomSubmit">发布食谱</van-button></div>
    </div>
  </div>
</template>

<style scoped>
.page { padding-bottom: 70px; }
.header { text-align: center; padding: 20px 16px 8px; }
.t { font-size: 26px; font-weight: bold; }

.mode-bar { display: flex; gap: 10px; padding: 8px 16px 16px; justify-content: center; }
.mode-btn { padding: 8px 20px; font-size: 15px; border-radius: 20px; background: #f0f4f8; cursor: pointer; }
.mode-btn.on { background: #5B9BD5; color: #fff; font-weight: 600; }

.easy { padding: 0 12px; }
.warning { margin: 8px 4px; padding: 12px; background: #FFF3E0; border-left: 3px solid #FF9800; border-radius: 0 8px 8px 0; font-size: 12px; color: #E65100; line-height: 1.6; }
.warning p:first-child { font-weight: 600; margin-bottom: 4px; }
.easy :deep(.van-field) { background: #fff; border-radius: 8px; margin-bottom: 4px; }

.preview-card { margin-top: 12px; background: #fff; border-radius: 12px; padding: 16px; }
.preview-card h3 { font-size: 15px; margin-bottom: 8px; }
.preview-card :deep(.van-field) { background: #f7f8fa; margin-bottom: 4px; }

.custom { padding: 0 12px; }
.custom :deep(.van-field) { background: #fff; border-radius: 8px; margin-bottom: 4px; }

.my { margin-bottom: 12px; background: #fff; border-radius: 12px; padding: 16px; }
.my h3 { font-size: 15px; margin-bottom: 8px; }
.my-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }

.row { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border-radius: 8px; margin-bottom: 4px; }
.lbl { font-size: 14px; font-weight: 500; white-space: nowrap; color: #646566; min-width: 44px; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 4px 10px; font-size: 13px; border-radius: 12px; background: #f0f4f8; cursor: pointer; }
.chip.on { background: #5B9BD5; color: #fff; }
.upload-btn { color: #5B9BD5; font-size: 14px; cursor: pointer; }
.preview-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; margin-left: 8px; }
.submit { padding: 16px 0; }
</style>
