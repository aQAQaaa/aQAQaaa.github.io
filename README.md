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

当前仓库已启用 GitHub Pages：**提交到 `main` 分支后会自动重新部署**（约 1~3 分钟），无需手动操作。

（如果是从零开始部署一个新仓库：Settings → Pages → Source 选择 `Deploy from a branch` → Branch 选择 `main`、目录 `/ (root)` → 保存）

---

## ✍️ 如何发一篇博客（纯网页操作，不需要安装任何软件）

> 全程在 **GitHub 网页** 上点击操作，不需要本地安装 git，也不需要命令行。

### 第 1 步：创建文章页面（在 GitHub 网页新建一个 HTML 文件）

1. 用浏览器打开你的仓库首页：**https://github.com/aQAQaaa/aQAQaaa.github.io**
2. 点击页面右侧上方的绿色 **`Add file`** 按钮，在弹出的下拉菜单里选择 **`Create new file`**
3. 在页面顶部**输入文件名的输入框**里输入文章文件名，例如：`post-hello-world.html`
   - 建议用英文小写命名，不要有空格（如 `post-my-first-post.html`）
4. 把**空白文章模板**粘贴进编辑框：
   - 在新标签页打开模板文件：**https://github.com/aQAQaaa/aQAQaaa.github.io/blob/main/post-template.html**
   - 点击该页面右上角的 **`Raw`** 按钮（此时浏览器里只有纯文本源码）
   - 全选（Ctrl+A）→ 复制（Ctrl+C）
   - 回到刚才「Create new file」的页面，在编辑框里粘贴（Ctrl+V）
   - 模板里用中文注释标好了 **5 处需要修改的位置**（网页标题、文章大标题、日期·分类、信息行、正文），照着改即可，不用的示例段落直接删掉
5. 修改模板中的这几处内容：
   - **`<title>你的文章标题 - FanYiyang's World</title>`** → 改成你的文章标题
   - **`<h1 id="site-title">你的文章标题</h1>`** → 改成你的文章标题
   - **`<span>2026-06-05 · 分类名</span>`** → 改成你的发布日期和分类名
   - 正文部分（`<div class="post-body">` 里的内容）→ 替换成你自己的文章内容
6. 滚动到页面底部，找到 **`Commit changes`** 区域，在输入框里写一句说明，例如：`发布新文章：你好世界`
7. 点击绿色的 **`Commit changes`** 按钮 ✅ —— 文章文件就保存好了

### 第 2 步：把文章登记到首页列表（编辑 `data/posts.json`）

1. 点击页面左上角的仓库名 **`aQAQaaa.github.io`** 回到仓库首页
2. 点击仓库里的 **`data`** 文件夹，进入后点击 **`posts.json`** 文件
3. 点击文件内容右上角的 **铅笔图标**（编辑此文件 / Edit this file）
4. 滚动到文件末尾，找到最后一条数据的 `}`：
   - 先在它后面加一个**英文逗号** `,`
   - 然后换行，粘贴下面的新条目（把内容改成你的文章信息）：
```json
{
  "title": "你的文章标题",
  "date": "2026-06-05",
  "updated": "2026-06-05",
  "category": "分类名称",
  "tags": ["标签1", "标签2"],
  "excerpt": "文章摘要，会显示在首页卡片中。",
  "cover": "",
  "url": "post-hello-world.html"
}
```
5. **务必检查两件事**：
   - `url` 字段的值**必须**和第 1 步创建的文件名**完全一致**（例如都是 `post-hello-world.html`）
   - JSON 里**最后一条数据后面不能有多余的逗号**
6. 滚动到底部，点击 **`Commit changes`** → 输入说明（如 `添加文章到列表`）→ 再次点击 **`Commit changes`** ✅

### 第 3 步：等待自动部署

- 什么都不用做，GitHub Pages 会在 **1~3 分钟**内自动重新构建并部署
- 打开 **https://aqaqaaa.github.io/** 刷新（或 Ctrl+F5 强制刷新），就能在首页看到新文章卡片了

### 字段说明

| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | 发布日期 (YYYY-MM-DD) |
| `updated` | 更新日期 (可选) |
| `category` | 分类名称 |
| `tags` | 标签数组 |
| `excerpt` | 文章摘要，显示在首页卡片中 |
| `cover` | 封面图片路径 (可选，留空则不显示封面) |
| `url` | 文章页面路径，必须与 HTML 文件名一致 |
| `sticky` | 是否置顶 (可选，`true` 表示置顶) |

---

## 🖼️ 如何在文章中添加图片

### 方法一：上传图片到仓库再引用（网页操作）

1. 回到仓库首页，点击 **`img`** 文件夹
2. 点击右上角的 **`Add file`** 按钮 → 选择 **`Upload files`**
3. 把图片文件**拖拽**进虚线区域（推荐先建子目录：在文件名处输入 `img/posts/` 前缀会自动归入该目录）
4. 滚动到底部，点击 **`Commit changes`** 完成上传
5. 在文章 HTML 中引用（路径就是相对路径）：

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

---

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
├── post-template.html      # 空白文章模板（发文章时复制它）
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
