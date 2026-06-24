import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

// 引入 Vant 组件库
import 'vant/lib/index.css'
import {
  Tabbar,
  TabbarItem,
  Search,
  Card,
  Tag,
  Button,
  Toast,
  Icon,
  Popup,
  Loading,
  Field,
  Dialog,
  Switch,
} from 'vant'

// 页面组件
import HomeView from './views/HomeView.vue'
import FavoritesView from './views/FavoritesView.vue'
import SearchView from './views/SearchView.vue'
import RecipeDetail from './views/RecipeDetail.vue'
import TakeoutView from './views/TakeoutView.vue'
import FoodMapView from './views/FoodMapView.vue'
import ProfileView from './views/ProfileView.vue'
import AuthView from './views/AuthView.vue'
import CommunityView from './views/CommunityView.vue'
import HotpotView from './views/HotpotView.vue'

// 路由配置
const routes = [
  { path: '/', component: HomeView, name: 'home' },
  { path: '/auth', component: AuthView, name: 'auth' },
  { path: '/community', component: CommunityView, name: 'community' },
  { path: '/hotpot', component: HotpotView, name: 'hotpot' },
  { path: '/favorites', component: FavoritesView, name: 'favorites' },
  { path: '/search', component: SearchView, name: 'search' },
  { path: '/takeout', component: TakeoutView, name: 'takeout' },
  { path: '/foodmap', component: FoodMapView, name: 'foodmap' },
  { path: '/profile', component: ProfileView, name: 'profile' },
  { path: '/recipe/:id', component: RecipeDetail, name: 'recipe-detail' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)

// 注册 Vant 组件
app.use(Tabbar)
app.use(TabbarItem)
app.use(Search)
app.use(Card)
app.use(Tag)
app.use(Button)
app.use(Toast)
app.use(Icon)
app.use(Popup)
app.use(Loading)
app.use(Field)
app.use(Dialog)
app.use(Switch)

app.use(router)
app.mount('#app')
