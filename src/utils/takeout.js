/**
 * 外卖工具函数
 * 功能：浏览器定位 + 生成美团/饿了么跳转链接
 */

// 外卖平台分类
export const TAKEOUT_CATEGORIES = [
  { name: '火锅', icon: '🫕', keyword: '火锅' },
  { name: '烧烤', icon: '🍖', keyword: '烧烤' },
  { name: '日料', icon: '🍣', keyword: '日料' },
  { name: '炸鸡汉堡', icon: '🍔', keyword: '炸鸡' },
  { name: '奶茶饮品', icon: '🧋', keyword: '奶茶' },
  { name: '快餐简餐', icon: '🍱', keyword: '快餐' },
  { name: '米粉面条', icon: '🍜', keyword: '面条' },
  { name: '轻食沙拉', icon: '🥗', keyword: '沙拉' },
  { name: '蛋糕甜点', icon: '🍰', keyword: '蛋糕' },
  { name: '小龙虾', icon: '🦞', keyword: '小龙虾' },
  { name: '披萨', icon: '🍕', keyword: '披萨' },
  { name: '地方菜', icon: '🥘', keyword: '家常菜' },
]

// 外卖平台配置
export const PLATFORMS = [
  { name: '美团外卖', icon: '🟡', color: '#FFD100', id: 'meituan' },
  { name: '饿了么', icon: '🔵', color: '#0085FF', id: 'eleme' },
]

/**
 * 获取用户地理位置
 */
export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, error: '您的浏览器不支持定位功能' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        error: null,
      }),
      (err) => {
        let errorMsg = '定位失败'
        if (err.code === err.PERMISSION_DENIED) errorMsg = '定位被拒绝，请在浏览器设置中允许定位'
        else if (err.code === err.POSITION_UNAVAILABLE) errorMsg = '无法获取位置信息'
        else if (err.code === err.TIMEOUT) errorMsg = '定位超时，请重试'
        resolve({ lat: null, lng: null, error: errorMsg })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  })
}

/**
 * 跳转到外卖平台
 * 策略：先尝试 URL Scheme 唤起 App，800ms 无响应则跳网页版
 */
export function openTakeoutApp(platform, keyword = '') {
  const kw = encodeURIComponent(keyword)

  // URL Scheme（唤起 App）
  const schemes = {
    meituan: 'meituanwaimai://',
    eleme: 'eleme://',
  }

  // 网页版（兜底）
  const webUrls = {
    meituan: keyword
      ? `https://i.meituan.com/s/%E5%A4%96%E5%8D%96/?keyword=${kw}`
      : 'https://i.meituan.com/',
    eleme: keyword
      ? `https://h5.ele.me/search/#keyword=${kw}`
      : 'https://h5.ele.me/',
  }

  const scheme = schemes[platform] || ''
  const webUrl = webUrls[platform] || ''

  if (!scheme) {
    window.location.href = webUrl
    return
  }

  // 尝试唤起 App
  const startTime = Date.now()
  window.location.href = scheme

  // 800ms 后如果还在当前页面，说明没装 App，跳网页版
  setTimeout(() => {
    if (Date.now() - startTime < 900) {
      window.location.href = webUrl
    }
  }, 800)
}

/**
 * 反向地理编码：经纬度 → 城市/区县名称
 * 使用免费的 Nominatim API（无需注册）
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh`
    const res = await fetch(url, { headers: { 'User-Agent': 'RecipeApp/1.0' } })
    const data = await res.json()
    if (data && data.address) {
      const addr = data.address
      // 返回最精确的地名：县城 > 城市 > 省
      return addr.county || addr.city || addr.town || addr.state || addr.province || ''
    }
  } catch { /* 网络失败忽略 */ }
  return ''
}

/** 高德地图查看附近 */
export function getAmapFoodUrl(lat, lng) {
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=当前位置&callnative=1`
}
