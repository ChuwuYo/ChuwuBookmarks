<div align="center">
    <img src="https://github.com/user-attachments/assets/6e42f062-8cf9-4332-8d86-38ae92864233" alt="Bocchi" width="200" height="200">
    <h1>ChuwuBookmarks</h1>
</div>

## 项目概述

这是一个基于浏览器的书签导航网页，旨在将书签数据（以 JSON 格式存储）转换为一个美观且功能丰富的网页应用。可以通过该网页方便地访问自己的书签，支持多级文件夹的展开和折叠、搜索、面包屑导航等功能。

Json格式的书签树由我开发的这个browser拓展程序 [BookmarksPortal](https://github.com/HatsuChuwu/BookmarksPortal) 导出：

本人技术目前仅限于此，只做了这个静态部署的网页项目(仅学了一点点前端)，小bug真的修不完，抱歉😥
如果不介意闭源或付费可以看一下Pintree和TabMark这两个项目（前者开源有付费模式，后者闭源）

### PC：

<div align="center">
    <img src="https://github.com/user-attachments/assets/4eaad285-81d1-4667-a0ae-2212686ff9eb" alt="PC Light">
    <img src="https://github.com/user-attachments/assets/62ff3f49-dee5-468d-af0a-0ea0955f2619" alt="PC Dark">
</div>

### 移动端：

<table>
    <tr>
        <td>
            <img src="https://github.com/user-attachments/assets/31bea867-c0d4-4727-9251-8de7418ca687" alt="Mobile Light" width="412" height="888">
        </td>
        <td>
            <img src="https://github.com/user-attachments/assets/d852e758-c372-4ed9-b899-05b048c9ad8f" alt="Mobile Dark" width="412" height="888">
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
  
   * 按钮几乎都支持了鼠标悬停动效。

6. **移动端支持**：
   
   * 支持移动端响应式布局。
  
   * 移动端自动收起侧边栏。

7. **GSAP动画支持**：

   * 主页消息加入GSAP动画内容。

* * *

### **未来改进方向**

1. **书签管理功能**：
   
   * 提供书签导入和导出功能。

2. **用户自定义**：
   
   * 允许用户自定义主题颜色和布局。
   
   * 支持用户添加自定义图标和描述。

4. **性能优化**：
   
   * 降低LCP值
   
   * 实现懒加载，减少初始加载时间。

---

### **需修复的问题**

    修改键盘导航逻辑，实现以下功能：
    1. 修改Tab键的默认聚焦顺序，使其跳过搜索框，首次按Tab键会聚焦到主页按钮
    2. 添加Ctrl+K快捷键功能，按下该组合键可以直接聚焦到搜索框
    3. 在script.js中添加新的initKeyboardNavigation函数，用于初始化键盘导航功能
    4. 将搜索框的tabindex设置为-1，使其在Tab键导航序列中被跳过
    5. 在页面加载时调用initKeyboardNavigation函数以确保功能正常工作
    6. 修改聚焦逻辑，使其能够正确聚焦到面包屑导航与主内容区位置
---

# <s>这个项目其实已经完工了，今后应该只有日常维护了。</s>
