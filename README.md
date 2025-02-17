<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChuwuBookmarks</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .center {
            text-align: center;
            margin-top: 20px;
        }
        .center img {
            max-width: 100%;
            height: auto;
        }
        .content {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        h1, h2, h3 {
            text-align: center;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="center">
        <img src="https://github.com/user-attachments/assets/6e42f062-8cf9-4332-8d86-38ae92864233" alt="Bocchi">
        <h1>ChuwuBookmarks</h1>
    </div>
    <div class="content">
        <h2>项目概述</h2>
        <p>这是一个基于浏览器的书签导航网页，旨在将书签数据（以 JSON 格式存储）转换为一个美观且功能丰富的网页应用。可以通过该网页方便地访问自己的书签，支持多级文件夹的展开和折叠、搜索、面包屑导航等功能。</p>
        <p>Json格式的书签树由我开发的这个browser拓展程序 <a href="https://github.com/HatsuChuwu/BookmarksPortal">BookmarksPortal</a> 导出：</p>
        <p>本人技术目前仅限于此，只做了这个静态部署的网页项目(仅学了一点点前端)，小bug真的修不完，抱歉😥</p>
        <p>要求高建议看一下Pintree和TabMark，是两个个成熟项目了（前者开源有付费模式，后者闭源）</p>
        <h3>PC：</h3>
        <img src="https://github.com/user-attachments/assets/1432c882-c63b-47f2-b9ca-db3199253dee" alt="PC Screenshot 1">
        <img src="https://github.com/user-attachments/assets/26f70f91-5ec9-4585-a94f-52c690f5f0bc" alt="PC Screenshot 2">
        <h3>移动端：</h3>
        <img src="https://github.com/user-attachments/assets/a8302f6e-0dca-49bc-80ee-8792ba725fca" alt="Mobile Screenshot 1">
        <img src="https://github.com/user-attachments/assets/7267e7e6-5ff6-423e-85ef-ac670c1d2f31" alt="Mobile Screenshot 2">
        <hr>
        <h2>核心功能</h2>
        <ul>
            <li>
                <strong>侧边栏导航</strong>:
                <ul>
                    <li>显示一级文件夹。</li>
                    <li>点击一级文件夹时，在右侧主内容区显示子文件夹和书签。</li>
                    <li>支持多级文件夹的嵌套展开和折叠。</li>
                </ul>
            </li>
            <li>
                <strong>主内容区</strong>:
                <ul>
                    <li>显示当前文件夹的子文件夹和书签。</li>
                    <li>书签以卡片形式展示，支持点击跳转。</li>
                    <li>文件夹以图标形式展示，支持点击进入子文件夹。</li>
                </ul>
            </li>
            <li>
                <strong>面包屑导航</strong>:
                <ul>
                    <li>显示当前路径（点击的文件夹层级）。</li>
                    <li>支持通过面包屑导航返回上一级。</li>
                </ul>
            </li>
            <li>
                <strong>搜索功能</strong>:
                <ul>
                    <li>支持按标题搜索书签。</li>
                    <li>搜索结果会替换主内容区的内容。</li>
                    <li>支持实时渲染。</li>
                </ul>
            </li>
            <li>
                <strong>主题切换</strong>:
                <ul>
                    <li>支持深色模式和浅色模式切换。</li>
                    <li>按钮几乎都支持了鼠标悬停动效。</li>
                </ul>
            </li>
            <li>
                <strong>移动端支持</strong>:
                <ul>
                    <li>支持移动端响应式布局。</li>
                    <li>移动端自动收起侧边栏。</li>
                </ul>
            </li>
        </ul>
        <hr>
        <h2>未来改进方向</h2>
        <ul>
            <li>
                <strong>用户自定义</strong>:
                <ul>
                    <li>允许用户自定义主题颜色和布局。</li>
                    <li>支持用户添加自定义图标和描述。</li>
                </ul>
            </li>
        </ul>
        <hr>
        <h2>未完成的功能</h2>
        <ul>
            <li>自动获取网页的icon或缩略图</li>
        </ul>
    </div>
</body>
</html>
