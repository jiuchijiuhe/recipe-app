/**
 * 数据同步工具 — 导出/导入
 * 无需任何外部服务，数据通过文件或链接在设备间传递
 */

/** 导出所有数据为 JSON 文件并下载 */
export function exportAllData() {
  const data = {
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    foodMap: JSON.parse(localStorage.getItem('food-map') || '{"cities":{}}'),
    videos: JSON.parse(localStorage.getItem('recipe-videos') || '{}'),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recipe-backup-${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return '导出成功'
}

/** 导入数据 */
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (data.favorites) localStorage.setItem('favorites', JSON.stringify(data.favorites))
    if (data.foodMap) localStorage.setItem('food-map', JSON.stringify(data.foodMap))
    if (data.videos) localStorage.setItem('recipe-videos', JSON.stringify(data.videos))
    return { success: true, message: '导入成功！刷新页面即可看到数据' }
  } catch {
    return { success: false, message: '文件格式不对，请重试' }
  }
}

/** 从文件读取内容 */
export function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}
