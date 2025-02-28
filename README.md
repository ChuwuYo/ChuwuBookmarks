<div align="center">
    <img src="https://github.com/user-attachments/assets/6e42f062-8cf9-4332-8d86-38ae92864233" alt="Bocchi" width="200" height="200">
    <h1>ChuwuBookmarks</h1>
</div>

## 项目概述

这是一个基于浏览器的书签导航网页，旨在将书签数据（以 JSON 格式存储）转换为一个美观且功能丰富的网页应用。可以通过该网页方便地访问自己的书签，支持多级文件夹的展开和折叠、搜索、面包屑导航等功能。

Json格式的书签树由我开发的这个browser拓展程序 [BookmarksPortal](https://github.com/HatsuChuwu/BookmarksPortal) 导出：

本人技术目前仅限于此，只做了这个静态部署的网页项目(仅学了一点点前端)，小bug真的修不完，抱歉😥
要求高建议看一下Pintree和TabMark，是两个个成熟项目了（前者开源有付费模式，后者闭源）

### PC：

<div align="center">
    <img src="https://github.com/user-attachments/assets/af6ef7fc-7206-4415-9be1-78db45ff3f58" alt="PC Light">
    <img src="https://github.com/user-attachments/assets/c5b3b489-c69e-4156-b232-5679281a9b6a" alt="PC Dark">
</div>

### 移动端：

<table>
    <tr>
        <td>
            <img src="https://github.com/user-attachments/assets/ff81ee43-abf4-4e4b-b2a4-9b3bb5251f32" alt="Mobile Light">
        </td>
        <td>
            <img src="https://github.com/user-attachments/assets/2d4573f0-a5ab-4bab-ad64-a1a98a7a8d31" alt="Mobile Dark">
        </td>
    </tr>
</table>


---

## 核心功能

- **侧边栏导航**：显示一级文件夹，点击一级文件夹时，在右侧主内容区显示子文件夹和书签，支持多级文件夹的嵌套展开和折叠。

- **主内容区**：显示当前文件夹的子文件夹和书签，书签以卡片形式展示，支持点击跳转，文件夹以图标形式展示，支持点击进入子文件夹。

- **面包屑导航**：显示当前路径（点击的文件夹层级），支持通过面包屑导航返回上一级。

- **搜索功能**：支持按标题搜索书签，搜索结果会替换主内容区的内容，支持实时渲染。

- **主题切换**：支持深色模式和浅色模式切换，按钮几乎都支持了鼠标悬停动效。

- **移动端支持**：支持移动端响应式布局，移动端自动收起侧边栏。

---

## 未来改进方向

- **用户自定义**：允许用户自定义主题颜色和布局，支持用户添加自定义图标和描述。

---

## 未完成的功能

- 自动获取网页的icon或缩略图
