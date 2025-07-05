<div align="center">
    <img src="https://github.com/user-attachments/assets/6e42f062-8cf9-4332-8d86-38ae92864233" alt="Bocchi" width="150" height="150">
    <h1>ChuwuBookmarks</h1>
    <a href="../../README.md">简体中文</a> | <a href="README_EN.md">English</a>
</div>

---
Project Overview

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ChuwuYo/ChuwuBookmarks)
---

This is a browser-based bookmark navigation webpage designed to convert bookmark data (stored in JSON format) into a visually appealing and feature-rich webpage. Through this webpage, you can easily access your bookmarks, with support for expanding and collapsing multi-level folders, searching, breadcrumb navigation, and more.

For users outside mainland China, you can experience the website through the following links:

[CloudFlare](https://chuwubookmarks.pages.dev/)

[Vercel](https://chuwubookmarks.vercel.app/)

[Netlify](https://chuwubookmarks.netlify.app/)

[GithubPages](https://chuwuyo.github.io/ChuwuBookmarks/)

[Surge](https://chuwubookmarks.surge.sh/) (version may be ahead or behind)

***

## Exporting JSON-Format Bookmark Tree

The JSON-format bookmark tree is exported using a browser extension I developed called [BookmarksPortal](https://github.com/HatsuChuwu/BookmarksPortal).

Note that the bookmark file name should be changed to: `bookmarks.json`

***

## Other Reference Projects

If you don't mind closed-source or paid options, you can refer to the following projects:

[Pintree](https://github.com/Pintree-io/pintree) (open-source + paid model)

[TabMark](https://www.ainewtab.app) (closed-source)

***

## Screenshots
### PC:

<div align="center">
    <img src="https://github.com/user-attachments/assets/775145ba-d14d-4b6f-af1e-22172b11f248" alt="PC Light">
    <img src="https://github.com/user-attachments/assets/51f50f97-278f-44cf-a4c7-b01660f6e72b" alt="PC Dark">
</div>

### Mobile:

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

### **Core Features**

1. **Sidebar Navigation**:

   * Displays first-level folders.

   * Clicking a first-level folder displays subfolders and bookmarks in the main content area.

   * Supports expanding and collapsing nested multi-level folders.

2. **Main Content Area**:

   * Displays subfolders and bookmarks of the current folder.

   * Bookmarks are displayed as cards, supporting click-to-navigate.

   * Folders are displayed as icons, supporting click-to-enter subfolders.

3. **Breadcrumb Navigation**:

   * Displays the current path (level of clicked folders).

   * Supports returning to the previous level via breadcrumb navigation.

4. **Search Functionality**:

   * Supports searching bookmarks by title.

   * Search results replace the content in the main content area.

   * Supports real-time rendering.

5. **Theme Switching**:

   * Supports switching between dark and light modes.

   * PC supports hover effects, mobile optimized for touch interaction.

6. **Responsive Design**:

   * Supports responsive layout for mobile and desktop devices.

   * Automatically hides sidebar on mobile (including landscape), keeps it open on desktop.
   
   * Unified breakpoint system ensures touch devices use mobile experience.

7. **GSAP Animation Support**:

   * Homepage messages include GSAP animations.

8. **Keyboard Focus Support**:

   * Supports focusing on webpage content using the `Tab` key.

   * Supports focusing on the search box using the `Ctrl + K` shortcut.

* * *


## Technical Features

* **Unified Breakpoint System**: Mobile (<1024px), Desktop (≥1024px)
* **Optimized Interaction**: PC hover effects, mobile touch optimization
* **Performance Optimization**: Web Worker search, lazy image loading, animation optimization
* **Accessibility Support**: Keyboard navigation, focus management, semantic markup

---



## Thanks to all contributors for their efforts
<a href="https://github.com/HatsuChuwu/ChuwuBookmarks/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=HatsuChuwu/ChuwuBookmarks" />
</a>
