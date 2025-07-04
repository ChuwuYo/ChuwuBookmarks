<div align="center">
    <img src="https://github.com/user-attachments/assets/6e42f062-8cf9-4332-8d86-38ae92864233" alt="Bocchi" width="150" height="150">
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

[Surge](https://chuwubookmarks.surge.sh/) (版本可能提前或落后)

***

## Json 格式书签树的导出

Json 格式的书签树由我开发的这个 browser 拓展程序 [BookmarksPortal](https://github.com/ChuwuYo/BookmarksPortal) 导出

注意书签文件名要更改为：`bookmarks.json`

***

## 其他参考项目

若不介意闭源或付费，可参考以下项目：

[Pintree](https://github.com/Pintree-io/pintree)（开源 + 付费模式）

[TabMark](https://www.ainewtab.app)（闭源）

***

## 界面截图
### PC：

<div align="center">
    <img src="https://github.com/user-attachments/assets/4eaad285-81d1-4667-a0ae-2212686ff9eb" alt="PC Light">
    <img src="https://github.com/user-attachments/assets/62ff3f49-dee5-468d-af0a-0ea0955f2619" alt="PC Dark">
</div>

### 移动端：

<table>
    <tr>
        <td>
            <img src="https://github.com/user-attachments/assets/31bea867-c0d4-4727-9251-8de7418ca687" alt="Mobile Light">
        </td>
        <td>
            <img src="https://github.com/user-attachments/assets/d852e758-c372-4ed9-b899-05b048c9ad8f" alt="Mobile Dark">
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

5. **主题切换**：
   
   * 支持深色模式和浅色模式切换。
  
   * PC端支持鼠标悬停动效，移动端优化触屏交互。

6. **响应式设计**：
   
   * 支持手机、平板、PC三种设备的响应式布局。
  
   * 手机端自动收起侧边栏，平板和PC端默认展开。
   
   * 统一的断点系统确保在不同设备上的最佳体验。

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
  <img src="https://contrib.rocks/image?repo=HatsuChuwu/ChuwuBookmarks" />
</a>
