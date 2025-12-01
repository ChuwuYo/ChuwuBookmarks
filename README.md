<div align="center">
    <img src="assets\icon\bocchi.webp" alt="CWBocchi" width="150" height="150">
    <h1>ChuwuBookmarks</h1>
    <h3><a href="README.md">简体中文</a> | <a href="docs/README/README_EN.md">English</a></h3>

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ChuwuYo/ChuwuBookmarks)
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/ChuwuYo/ChuwuBookmarks)

</div>

---

项目概述
---

这是一个基于浏览器的书签导航网页模板，旨在将JSON书签数据转换为一个美观且功能丰富的网页应用，支持多级文件夹、搜索、面包屑导航等。

访问[初五的书签回廊](https://tabs.chuwu.top/)查看示例部署。

也可访问以下链接进行体验：

[CloudFlare](https://chuwubookmarks.pages.dev/)

[Vercel](https://chuwubookmarks.vercel.app/)

[Netlify](https://chuwubookmarks.netlify.app/)

[GithubPages](https://chuwuyo.github.io/ChuwuBookmarks/)

***

## 快速开始

1. **获取项目**：Fork 或克隆本仓库到本地
   ```bash
   git clone https://github.com/ChuwuYo/ChuwuBookmarks.git
   ```

2. **导出书签**：使用 [BookmarksPortal](https://github.com/ChuwuYo/BookmarksPortal) 导出您的书签数据文件和目录结构文件两个JSON文件

3. **导入文件**：将导出的书签文件重命名为 `bookmarks.json`，与目录结构文件 `structure.json` 一同放在根目录下

4. **部署使用**：将项目部署到您喜欢的静态网站托管服务（如 GitHub Pages、Vercel、Netlify、Cloudflare、Edgeone 等）

5. **SEO配置**（可选）：项目包含完整的SEO优化文件，部署时可根据需要修改以下文件中的配置：
   - `index.html`：修改meta标签、canonical链接和结构化数据
   - `sitemap.xml`：更新网站URL和最后修改日期
   - `robots.txt`：调整爬虫规则和sitemap链接
   - `manifest.json`：自定义PWA应用信息
   - `structured-data.json`：结构化数据
   - 所有配置文件都包含清晰的注释提示，标明了必填和可选字段

***

## 界面截图
### PC：

<div align="center">
    <img src="https://github.com/user-attachments/assets/775145ba-d14d-4b6f-af1e-22172b11f248" alt="PC Light">
    <img src="https://github.com/user-attachments/assets/51f50f97-278f-44cf-a4c7-b01660f6e72b" alt="PC Dark">
</div>

### 移动端：

<table>
    <tr>
        <td>
            <img src="https://github.com/user-attachments/assets/ef1388b7-47d0-485c-af06-83b4ee823023" alt="Mobile Light">
        </td>
        <td>
            <img src="https://github.com/user-attachments/assets/3d647648-2f7c-40ad-a28c-3382992291a8" alt="Mobile Dark">
        </td>
    </tr>
</table>

---

### **核心功能**

1. **侧边栏导航**：
   
   * 显示一级文件夹
   
   * 点击一级文件夹时，在右侧主内容区显示子文件夹和书签
   
   * 支持多级文件夹的嵌套展开和折叠

2. **主内容区**：
   
   * 显示当前文件夹的子文件夹和书签

   * 书签以卡片形式展示，支持点击跳转
   
   * 文件夹以图标形式展示，支持点击进入子文件夹

3. **面包屑导航**：
   
   * 显示当前路径（点击的文件夹层级）
   
   * 支持通过面包屑导航返回上一级

4. **搜索功能**：
   
   * 支持按标题搜索书签
   
   * 搜索结果会替换主内容区的内容
  
   * 支持实时渲染

   * 搜索结果分页
 
   * 文件夹类型结果显示完整路径

5. **主题切换**：
   
   * 支持深色模式和浅色模式切换
  
   * PC端支持鼠标悬停动效，移动端优化触屏交互

6. **响应式设计**：
   
   * 支持移动端(<480px)和PC端的响应式布局
  
   * 小于1024px屏幕自动收起侧边栏，大于等于1024px屏幕默认展开
   
   * 统一的断点系统确保在不同设备上的最佳体验

   * 移动端进行了一些样式优化，便于使用

7. **GSAP动画支持**：

   * 主页消息加入GSAP动画内容

8. **键盘聚焦支持**：

   * 支持 `Tab` 键聚焦网页内容

   * 支持 `Ctrl + K` 快捷键聚焦搜索框

* * *


## 技术特性

* **统一断点系统**：移动端(<1024px)、桌面端(≥1024px)
* **优化的交互体验**：PC端悬停效果，移动端触屏优化
* **性能优化**：Web Worker搜索、懒加载图片、动画优化
* **无障碍支持**：键盘导航、焦点管理、语义化标签

---

## 感谢所有贡献者作出的努力
<a href="https://github.com/ChuwuYo/ChuwuBookmarks/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=ChuwuYo/ChuwuBookmarks" />
</a>

### 谁都能成为“造物主”

***

## 其他参考项目

若不介意闭源或付费，可参考以下项目：

[Pintree](https://github.com/Pintree-io/pintree)（开源 + 付费模式 + 广告）

[TabMark](https://github.com/Alanrk/TabMark-Bookmark-New-Tab)（开源的浏览器扩展）
