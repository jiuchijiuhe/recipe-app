-- Supabase 数据库建表 SQL
-- 在 Supabase 后台 → SQL Editor 中粘贴运行

-- 1. 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 2. 美食地图表
CREATE TABLE IF NOT EXISTS food_map (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT DEFAULT '抖音',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 视频链接表
CREATE TABLE IF NOT EXISTS recipe_videos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 4. 启用行级安全（每用户只能看自己的数据）
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_videos ENABLE ROW LEVEL SECURITY;

-- 5. 安全策略
CREATE POLICY "users_own_data" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON food_map FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON recipe_videos FOR ALL USING (auth.uid() = user_id);
