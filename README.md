# FanYiyang's World

个人网站 / Personal Website

基于 Butterfly 主题风格，使用纯静态 HTML/CSS/JS 构建，部署在 GitHub Pages。

## ✨ 特性

- 🎨 Butterfly 主题风格还原
- 🌸 四季主题自动切换（春🌸/夏☀️/秋🍂/冬❄️）
- ✨ 季节粒子特效（蝴蝶/萤火虫·风/落叶/雪花）
- 🌙 深色/浅色模式切换（支持自动/手动）
- ⌨️ Typed.js 打字动画效果
- 📱 完整响应式设计
- 🖼️ 视差滚动效果
- ⚡ GitHub Pages 直接部署，无需后端

## 🚀 部署

1. Fork 或上传到 GitHub 仓库
2. 进入 **Settings → Pages**
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/ (root)`
5. 保存后等待部署完成

## 📝 如何发表文章

### 第一步：创建文章 HTML 文件

在项目根目录创建一个新的 HTML 文件，例如 `post-my-article.html`。

**推荐方式：** 复制已有的文章文件作为模板：

```bash
cp post-ai-thoughts.html post-my-article.html
```

然后修改以下内容：

- `<title>` 标签 → 改成你的文章标题
- `<h1 id="site-title">` → 改成你的文章标题
- `<span>日期 · 分类</span>` → 改成你的发布日期和分类
- 文章正文内容 → 替换成你自己的内容

**示例：**

```html
<title>我的第一篇文章 - FanYiyang's World</title>
...
<h1 id="site-title">我的第一篇文章</h1>
<div id="site-subtitle">
  <span>2026-06-05 · 日记本</span>
</div>
```

### 第二步：更新文章列表

编辑 `data/posts.json` 文件，在数组中添加一条新记录：

```json
{
  "title": "我的第一篇文章",
  "date": "2026-06-05",
  "updated": "2026-06-05",
  "category": "日记本",
  "tags": ["日志", "随笔"],
  "excerpt": "这是文章摘要，会显示在首页卡片中。",
  "cover": "img/posts/my-cover.jpg",
  "url": "post-my-article.html"
}
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期 (YYYY-MM-DD) |
| `updated` | ❌ | 更新日期，不填则不显示 |
| `category` | ✅ | 分类名称（如：技术、思考、日记本） |
| `tags` | ❌ | 标签数组，如 `["前端", "GitHub"]` |
| `excerpt` | ✅ | 文章摘要，显示在首页卡片中 |
| `cover` | ❌ | 封面图片路径，留空则不显示封面 |
| `url` | ✅ | 文章页面的文件名 |
| `sticky` | ❌ | 是否置顶，填 `true` 表示置顶 |

### 第三步：提交并推送

```bash
git add .
git commit -m "发布新文章：我的第一篇文章"
git push origin main
```

推送后 GitHub Pages 会自动部署，通常 1-2 分钟后即可在网站上看到新文章。

## 🖼️ 如何在文章中添加图片

### 方法一：使用本地图片（推荐）

1. 将图片放入 `img/` 目录（建议创建子目录 `img/posts/` 来管理文章图片）：

```bash
mkdir -p img/posts
# 将你的图片复制到 img/posts/ 目录
```

2. 在文章 HTML 中引用：

```html
<img src="img/posts/my-image.jpg" alt="图片描述" 
     style="max-width: 100%; border-radius: 8px; margin: 1em 0;">
```

### 方法二：使用外部图片链接

```html
<img src="https://example.com/image.jpg" alt="图片描述" 
     style="max-width: 100%; border-radius: 8px; margin: 1em 0;">
```

### 方法三：带图片说明的格式

```html
<figure style="text-align: center; margin: 1.5em 0;">
  <img src="img/posts/my-image.jpg" alt="图片描述" 
       style="max-width: 100%; border-radius: 8px;">
  <figcaption style="color: var(--dark-grey); font-size: 0.9em; margin-top: 0.5em;">
    图片说明文字
  </figcaption>
</figure>
```

### 📸 封面图设置

文章封面图会显示在首页文章卡片上方。在 `data/posts.json` 中设置 `cover` 字段：

```json
{
  "title": "文章标题",
  "cover": "img/posts/my-cover.jpg",
  ...
}
```

**推荐封面图尺寸：** 800×400 像素（2:1 比例），支持常见图片格式（jpg/png/webp/gif）。

> 💡 **提示：** 如果不设置封面图（`cover` 留空 `""`），首页卡片将不显示封面区域，文章列表会更紧凑。

## 🎨 自定义

| 内容 | 文件位置 | 说明 |
|------|----------|------|
| 头像 | `img/avatar.png` | 替换即可 |
| 默认背景 | `img/banner.png` | 未匹配季节时的默认背景 |
| 春季背景 | `img/banner-spring.jpg` | 3-5月显示 |
| 夏季背景 | `img/banner-summer.jpg` | 6-8月显示 |
| 秋季背景 | `img/banner-autumn.jpg` | 9-11月显示 |
| 冬季背景 | `img/banner-winter.jpg` | 12-2月显示 |
| 打字动画 | `js/main.js` 中的 `strings` 数组 | 修改打字内容 |
| 站点标题 | `index.html` 中 `<h1>` | 改站点名称 |
| 公告内容 | `index.html` 中 `.announcement_content` | 改公告文字 |
| 侧边栏信息 | `index.html` 中 `.card-info` | 改个人介绍 |

## 🌸 季节主题说明

网站会根据当前日期自动切换季节主题：

- 🌸 **春季**（3-5月）：蝴蝶粒子特效 + 绿色调
- ☀️ **夏季**（6-8月）：风线 + 萤火虫特效 + 暖色调
- 🍂 **秋季**（9-11月）：落叶粒子特效 + 橙色调
- ❄️ **冬季**（12-2月）：雪花粒子特效 + 蓝色调

点击右下角的季节按钮可以手动切换，🔄 按钮恢复自动模式。

## 📂 项目结构

```
├── index.html              # 首页
├── post-*.html             # 文章页面
├── about.html              # 关于页面
├── treasure-box.html       # 百宝箱页面
├── data/
│   └── posts.json          # 文章列表数据
├── css/
│   ├── style.css           # 主样式
│   └── season-theme.css    # 季节主题样式
├── js/
│   ├── main.js             # 主脚本（主题/动画/文章加载）
│   ├── season-module.js    # 季节切换模块
│   └── season-particles.js # 季节粒子特效
├── img/
│   ├── avatar.png          # 头像
│   ├── banner.png          # 默认背景
│   ├── banner-spring.jpg   # 春季背景
│   ├── banner-summer.jpg   # 夏季背景
│   ├── banner-autumn.jpg   # 秋季背景
│   ├── banner-winter.jpg   # 冬季背景
│   └── favicon.svg         # 网站图标
└── README.md
```

## 📄 License

MIT
