# CLAUDE.md — AI 开发助手指引

## 项目简介

每日食谱推荐 — 手机网页 App，帮助用户解决"今天吃什么"的问题。
支持按食材、菜系、人数筛选食谱，提供图文做菜步骤，收藏功能。

## 重要：工作流程

### 每次开始工作前
1. 阅读 `devlog/` 文件夹中最新的开发日志，了解当前进度
2. 阅读 `docs/execution-steps.md`，确认当前处于哪个开发阶段

### 每次工作结束后
1. 在 `devlog/` 中创建或更新当天的日志（格式：`YYYY-MM-DD.md`）
2. 日志必须包含：今日完成、遇到的问题、明日计划、当前状态

## 项目文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发需求 | [docs/requirements.md](docs/requirements.md) | 功能需求和用户故事 |
| 技术方案 | [docs/tech-spec.md](docs/tech-spec.md) | 技术选型和架构设计 |
| 设计规范 | [docs/design-guidelines.md](docs/design-guidelines.md) | UI 颜色/字体/间距规范 |
| 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) | 分阶段开发计划和进度 |
| 开发日志 | [devlog/](devlog/) | 每日开发记录 |

## 项目结构

```
recipe-app/
├── CLAUDE.md              # 本文件
├── docs/                  # 项目文档
│   ├── requirements.md
│   ├── tech-spec.md
│   ├── design-guidelines.md
│   └── execution-steps.md
├── devlog/                # 开发日志
├── src/
│   ├── data/              # 食谱 JSON 数据
│   ├── views/             # 页面组件
│   ├── components/        # 可复用组件
│   ├── utils/             # 工具函数
│   ├── App.vue            # 主入口
│   └── main.js            # 配置入口
├── index.html
└── vite.config.js
```

## 开发规范

### 代码风格
- 注释使用**中文**，方便新手理解
- 变量和函数名使用英文小驼峰（如 `getDailyRecipe`）
- 每个 `.vue` 文件使用 `<script setup>` 语法

### 组件使用
- **优先使用 Vant UI** 提供的组件，不要自己造轮子
- 按钮用 `van-button`，卡片用 `van-card`，标签用 `van-tag` 等等
- Vant 组件文档：https://vant-ui.github.io/vant/

### 数据规范
- 食谱数据统一放在 `src/data/` 目录下
- 每条食谱的 ID 使用英文+数字，如 `mapo-tofu-001`
- 图片暂时使用占位符 emoji 或纯色背景

### 推荐原则
- 保持代码简洁，一个组件不超过 200 行
- 优先用 Vue 响应式特性，避免直接操作 DOM
- 每次提交保证项目能正常运行（`npm run dev` 不报错）
