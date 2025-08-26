<div align="center">
    <img src="assets\icon\bocchi.png" alt="Bocchi" width="150" height="150">
    <h1>ChuwuBookmarks</h1>
    <a href="README.md">简体中文</a> | <a href="docs/README/README_EN.md">English</a>
</div>

---
项目概述

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ChuwuYo/ChuwuBookmarks)
---

这是一个基于浏览器的书签导航网页，旨在将JSON书签数据转换为一个美观且功能丰富的网页应用，支持多级文件夹、搜索、面包屑导航等。

非中国大陆可访问以下链接进行体验：

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

2. **导出书签**：使用 [BookmarksPortal](https://github.com/ChuwuYo/BookmarksPortal) 导出您的书签数据JSON文件

3. **替换文件**：将导出的书签文件重命名为 `bookmarks.json`，替换项目根目录下的同名文件

4. **部署使用**：将项目部署到您喜欢的静态网站托管服务（如 GitHub Pages、Vercel、Netlify、Cloudflare、Edgeone 等）

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
   
   * 显示一级文件夹。
   
   * 点击一级文件夹时，在右侧主内容区显示子文件夹和书签。
   
   * 支持多级文件夹的嵌套展开和折叠。

2. **主内容区**：
   
   * 显示当前文件夹的子文件夹和书签。
   
   * 书签以卡片形式展示，支持点击跳转。
   
   * 文件夹以图标形式展示，支持点击进入子文件夹。

3. **面包屑导航**：
   
   * 显示当前路径（点击的文件夹层级）。
   
   * 支持通过面包屑导航返回上一级。

4. **搜索功能**：
   
   * 支持按标题搜索书签。
   
   * 搜索结果会替换主内容区的内容。
  
   * 支持实时渲染。

   * 搜索结果分页。

5. **主题切换**：
   
   * 支持深色模式和浅色模式切换。
  
   * PC端支持鼠标悬停动效，移动端优化触屏交互。

6. **响应式设计**：
   
   * 支持移动端和PC端的响应式布局。
  
   * 小于1024px屏幕自动收起侧边栏，大于等于1024px屏幕默认展开。
   
   * 统一的断点系统确保在不同设备上的最佳体验。

   * 移动端进行了一些样式优化，便于使用。

7. **GSAP动画支持**：

   * 主页消息加入GSAP动画内容。

8. **键盘聚焦支持**：

   * 支持 `Tab` 键聚焦网页内容。

   * 支持 `Ctrl + K` 快捷键聚焦搜索框。

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

***

## 其他参考项目

若不介意闭源或付费，可参考以下项目：

[Pintree](https://github.com/Pintree-io/pintree)（开源 + 付费模式 + 广告）

[TabMark](https://github.com/Alanrk/TabMark-Bookmark-New-Tab)（开源的浏览器拓展）

---

~虽然代码屎山堆积，但好在性能还是不错的~
