<script setup>
</script>

<template>
  <div id="app-container">
    <router-view />
    <van-tabbar route active-color="#FF6B8A" inactive-color="#c8c9cc">
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/search" icon="search">筛选</van-tabbar-item>
      <van-tabbar-item replace to="/takeout" icon="shop-o">随机吃</van-tabbar-item>
      <van-tabbar-item replace to="/foodmap" icon="location-o">美食地图</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #FFF5F5;
  color: #323233;
  min-height: 100vh;
}

#app-container {
  padding-bottom: 50px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: transparent;
  position: relative;
}
</style>
