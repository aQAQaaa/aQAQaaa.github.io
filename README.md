# FanYiyang's World

个人网站 / Personal Website

基于 Butterfly 主题风格，使用纯静态 HTML/CSS/JS 构建，部署在 GitHub Pages。

## ✨ 特性

- 🎨 Butterfly 主题风格还原
- 🌸 四季主题自动切换（春夏秋冬）
- ✨ 季节粒子特效（蝴蝶/风/落叶/雪花）
- 🌙 深色/浅色模式切换
- ⌨️ Typed.js 打字动画效果
- 📱 完整响应式设计
- 🖼️ 视差滚动效果
- ⚡ GitHub Pages 直接部署

## 🚀 部署

1. Fork 或上传到 GitHub 仓库
2. 进入 Settings → Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/ (root)`
5. 保存后等待部署完成

## 📝 如何发表文章

### 第一步：创建文章 HTML 文件

在项目根目录创建一个新的 HTML 文件，例如 `post-my-article.html`。可以复制已有的文章文件（如 `post-ai-thoughts.html`）作为模板。

修改以下内容：
- `<title>` 标签：改成你的文章标题
- `<h1 id="site-title">`：改成你的文章标题
- `<span>日期 · 分类</span>`：改成你的发布日期和分类
- 文章正文内容

### 第二步：更新文章列表

编辑 `data/posts.json` 文件，在数组中添加一条新记录：

```json
{
  "title": "你的文章标题",
  "date": "2026-06-05",
  "updated": "2026-06-05",
  "category": "分类名称",
  "tags": ["标签1", "标签2"],
  "excerpt": "文章摘要，会显示在首页卡片中。",
  "cover": "img/your-cover.jpg",
  "url": "post-my-article.html"
}
```

**字段说明：**
| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | 发布日期 (YYYY-MM-DD) |
| `updated` | 更新日期 (可选) |
| `category` | 分类名称 |
| `tags` | 标签数组 |
| `excerpt` | 文章摘要 |
| `cover` | 封面图片路径 (可选，留空则不显示封面) |
| `url` | 文章页面路径 |
| `sticky` | 是否置顶 (可选，`true` 表示置顶) |

### 第三步：提交并推送

```bash
git add .
git commit -m "发布新文章：你的文章标题"
git push origin main
```

## 🖼️ 如何在文章中添加图片

### 方法一：使用本地图片

1. 将图片放入 `img/` 目录（推荐创建子目录如 `img/posts/`）
2. 在文章 HTML 中引用：

```html
<img src="img/posts/my-image.jpg" alt="图片描述" style="max-width: 100%; border-radius: 8px; margin: 1em 0;">
```

### 方法二：使用外部图片链接

```html
<img src="https://example.com/image.jpg" alt="图片描述" style="max-width: 100%; border-radius: 8px; margin: 1em 0;">
```

### 方法三：带图片说明的格式

```html
<figure style="text-align: center; margin: 1.5em 0;">
  <img src="img/posts/my-image.jpg" alt="图片描述" style="max-width: 100%; border-radius: 8px;">
  <figcaption style="color: var(--dark-grey); font-size: 0.9em; margin-top: 0.5em;">图片说明文字</figcaption>
</figure>
```

### 封面图设置

文章封面图会显示在首页文章卡片上方。在 `data/posts.json` 中设置 `cover` 字段：

```json
"cover": "img/posts/my-cover.jpg"
```

推荐封面图尺寸：**800×400 像素**或相近比例。

## 🎨 自定义

- **头像**: 替换 `img/avatar.png`
- **背景图**: 替换 `img/banner.png`（默认背景）
- **季节背景**: 替换 `img/banner-spring.jpg`、`banner-summer.jpg`、`banner-autumn.jpg`、`banner-winter.jpg`
- **打字动画**: 编辑 `js/main.js` 中的 `strings` 数组
- **站点信息**: 编辑 `index.html` 中的标题和描述
- **公告内容**: 编辑 `index.html` 中 `.announcement_content` 部分

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
│   ├── main.js             # 主脚本
│   ├── season-module.js    # 季节切换模块
│   └── season-particles.js # 季节粒子特效
├── img/
│   ├── avatar.png          # 头像
│   ├── banner.png          # 默认背景
│   ├── banner-spring.jpg   # 春季背景
│   ├── banner-summer.jpg   # 夏季背景
│   ├── banner-autumn.jpg   # 秋季背景
│   └── banner-winter.jpg   # 冬季背景
└── README.md
```

## 📄 License

MIT
