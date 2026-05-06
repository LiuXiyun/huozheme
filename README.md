# 活着么

一个可部署到 Vercel 的静态 H5：用户完成 5 题测试后，生成今日精神存活报告、诊断指标、分享文案和可保存海报。

## 本地运行

```bash
npm run dev
```

打开 `http://127.0.0.1:4173/`。

## 检查

```bash
npm run check
```

## 部署到 Vercel

这是纯静态项目，不需要构建命令。

- Framework Preset: `Other`
- Build Command: 留空
- Output Directory: `.`

### 可选环境变量

配置后会启用 AI 内容池和真实事件落库；不配置也能用本地兜底算法完整运行。

```bash
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
UPSTASH_REDIS_REST_URL=你的 Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN=你的 Upstash Redis REST Token
```

启用后：
- `/api/generate` 会按日期、主题、城市和分数段缓存 AI 生成结果。
- `/api/questions` 会按日期、主题和城市缓存每日 AI 题库池。
- `/api/stats` 会展示每日冷启动基数，并叠加真实完成测试、保存海报、预约内测数据。
- `/api/event` 会记录开始测试、完成测试、复制、保存海报、预约内测等事件。

## 当前 MVP 功能

- 四个剧本：打工人、大学生、独居人、自由职业。
- 本地大题库兜底，并支持部署后每日 AI 题库池。
- 每次从题库池抽 5 题快速测试。
- 精神存活指数、城市/身份排名、今日死因、复活方式。
- 分享图工厂：报告卡、朋友圈、小红书三种模板。
- 毒舌强度切换和分享文案刷新。
- 9.9 隐藏结局内测预约入口。
