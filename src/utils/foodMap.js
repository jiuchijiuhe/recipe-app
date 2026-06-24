/**
 * 美食地图工具函数
 * 功能：城市识别 + 数据存储 + 隐私控制
 */

const CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '重庆',
  '延吉', '满洲里', '漠河', '稻城', '理塘', '色达', '康定', '敦煌', '婺源', '乌镇', '平遥', '阳朔', '长白山', '雪乡', '阿尔山',

  '武汉', '长沙', '西安', '郑州', '天津', '青岛', '大连', '厦门', '三亚',
  '昆明', '大理', '丽江', '贵阳', '拉萨', '桂林', '哈尔滨', '沈阳', '济南',
  '合肥', '南昌', '福州', '南宁', '海口', '乌鲁木齐', '兰州', '银川',
  '西宁', '呼和浩特', '石家庄', '太原', '长春', '宁波', '无锡', '佛山',
  '东莞', '珠海', '惠州', '温州', '泉州', '烟台', '威海', '洛阳', '开封',
  '扬州', '绍兴', '黄山', '张家界', '凤凰', '北海', '秦皇岛', '延边',
  '顺德', '潮汕', '汕头', '乐山', '自贡', '柳州', '遵义',
]

export function detectCity(text) {
  if (!text || !text.trim()) return null
  // 1. 匹配城市列表（优先长地名）
  const sorted = [...CITIES].sort((a, b) => b.length - a.length)
  for (const city of sorted) {
    if (text.includes(city)) return city
  }
  // 2. 识别「XX市」「XX县」「XX区」「XX州」
  const patterns = [
    /([一-龥]{2,6}市)/, /([一-龥]{2,6}县)/,
    /([一-龥]{2,6}区)/, /([一-龥]{2,6}州)/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1]
  }
  return null
}


export function getAllCities() { return CITIES }

export function getFoodMapData() {
  try {
    return JSON.parse(localStorage.getItem('food-map') || '{"cities":{}}')
  } catch { return { cities: {} } }
}

export function saveFoodMapData(data) {
  localStorage.setItem('food-map', JSON.stringify(data))
}

/**
 * 添加美食链接
 * @param {string} url - 链接
 * @param {string} title - 描述
 * @param {string} source - 来源平台
 * @param {string} city - 城市
 * @param {boolean} isPublic - 是否公开
 */
/**
 * 自动识别分享文案，提取链接+标题+来源
 * 支持抖音和小红书格式
 */
export function extractShareInfo(text) {
  if (!text) return { url: '', title: '', source: '抖音' }

  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  const url = urlMatch ? urlMatch[0] : ''

  let source = '其他'
  if (text.includes('抖音') || text.includes('v.douyin.com')) source = '抖音'
  else if (text.includes('小红书') || text.includes('xhslink.com')) source = '小红书'

  let title = ''
  if (source === '抖音') {
    const clean = text
      .replace(/^[\d.]+\s*/, '')
      .replace(/复制打开抖音[，,]\s*/, '')
      .replace(/看看【.+?】\s*/, '')
      .replace(/https?:\/\/[^\s]+/, '')
      .replace(/[\d\/]+\s*[A-Za-z@:.]+$/, '')
      .trim()
    if (clean) title = clean
  } else if (source === '小红书') {
    const xhsTitle = text.match(/【(.+?)】/)
    if (xhsTitle) title = xhsTitle[1]
    else {
      const clean = text.replace(/https?:\/\/[^\s]+/g, '').replace(/小红书号[：:]\s*\w+/g, '').replace(/发布于[：:]\s*\S+/g, '').trim()
      if (clean) title = clean.substring(0, 80)
    }
  }

  const tags = text.match(/#\S+/g)
  if (tags && title) {
    const tagStr = tags.filter(t => !title.includes(t)).join(' ')
    if (tagStr) title += ' ' + tagStr
  }
  if (!title) title = text.replace(url, '').trim().substring(0, 50)

  return { url, title, source }
}
function fixUrl(url) {
  let fixed = url.trim()
  if (!fixed) return fixed
  if (!fixed.startsWith('http://') && !fixed.startsWith('https://')) {
    fixed = 'https://' + fixed
  }
  return fixed
}

export function addFoodItem(url, title, source, city, isPublic = false) {
  const data = getFoodMapData()
  if (!data.cities[city]) data.cities[city] = []
  data.cities[city].push({
    id: Date.now().toString(),
    url: fixUrl(url),
    title,
    source,
    city,
    isPublic,
    createdAt: new Date().toISOString(),
  })
  saveFoodMapData(data)
}

export function removeFoodItem(city, itemId) {
  const data = getFoodMapData()
  if (data.cities[city]) {
    data.cities[city] = data.cities[city].filter((item) => item.id !== itemId)
    if (data.cities[city].length === 0) delete data.cities[city]
  }
  saveFoodMapData(data)
}

/** 切换某条收藏的公开/私密状态 */
export function toggleItemPublic(city, itemId) {
  const data = getFoodMapData()
  if (data.cities[city]) {
    const item = data.cities[city].find(i => i.id === itemId)
    if (item) {
      item.isPublic = !item.isPublic
      saveFoodMapData(data)
      return item.isPublic
    }
  }
  return false
}

export function getCityList() {
  const data = getFoodMapData()
  return Object.keys(data.cities)
    .map((city) => ({ city, count: data.cities[city].length }))
    .sort((a, b) => b.count - a.count)
}

export function getCityItems(city) {
  const data = getFoodMapData()
  const items = data.cities[city] || []
  // 修复旧数据中可能缺少 https:// 的链接
  return items.map(item => ({ ...item, url: fixUrl(item.url) }))
}

/** 获取所有公开的收藏（用于分享查看） */
export function getPublicItems() {
  const data = getFoodMapData()
  const result = {}
  Object.keys(data.cities).forEach(city => {
    const publicItems = data.cities[city].filter(i => i.isPublic)
    if (publicItems.length > 0) result[city] = publicItems
  })
  return result
}

/** 生成分享文本 */
export function generateShareText() {
  const pub = getPublicItems()
  const cities = Object.keys(pub)
  if (cities.length === 0) return '还没有公开的美食收藏，去添加吧！'

  let text = '🌍 我的美食地图\n\n'
  cities.forEach(city => {
    text += `🏙️ ${city}（${pub[city].length}个安利）\n`
    pub[city].forEach(item => {
      text += `  • ${item.title}\n    ${item.url}\n`
    })
    text += '\n'
  })
  return text
}
