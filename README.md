# AI 转 Word 助手 (AI to Word)

> 把 AI 回复一键复制成 **Word/WPS 友好格式** 的浏览器扩展。

在 **DeepSeek / ChatGPT / 豆包 / Kimi** 等 AI 网页上选中回复内容,一键复制为 Word/WPS 友好格式 ——
标题、列表、表格、加粗、代码块全部保留,粘贴进 Word 就是整齐排版,不用再手动清理 `#`、`*`、`|` 等 Markdown 符号。

![license](https://img.shields.io/badge/license-MIT-blue) ![version](https://img.shields.io/badge/version-0.1.0-green) ![MV3](https://img.shields.io/badge/Manifest-V3-orange)

## 功能特性

- **选区即转**:只转换你选中的内容,不影响页面其他部分
- **格式保真**:标题层级、无序/有序列表、表格、加粗、斜体、行内代码、代码块、引用、链接全部保留
- **双通道剪贴板**:同时写入 HTML 与纯文本,兼容 Word / WPS / 记事本
- **智能降级**:纯文本场景自动回退为 Markdown 解析
- **右键菜单**:选中内容 → 右键 →「复制为 Word 格式」
- **本地运行**:无服务器、无外部依赖、不收集任何用户数据

## 支持站点

DeepSeek · ChatGPT · 豆包 · Kimi · 通义千问 · 文心一言 · Gemini · Claude

## 使用方法

1. 安装插件(见下方「安装」)
2. 打开任一支持的 AI 网站,让 AI 生成内容
3. **选中**回复内容 → 点击出现的 **「📋 复制为 Word 格式」** 按钮
4. 打开 Word / WPS,**Ctrl+V** 粘贴 → 完成

> 也可以:选中内容后右键 →「复制为 Word 格式」

## 安装

### 方式一:Edge 加载项商店(推荐)

待商店审核通过后,可直接从 [Edge 加载项商店](https://microsoftedge.microsoft.com/addons/) 搜索「AI 转 Word 助手」安装。

### 方式二:开发者模式加载

1. 克隆/下载本仓库
2. 打开浏览器扩展管理页:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 打开右上角「开发者模式」
4. 点「加载已解压的扩展程序」,选择本文件夹
5. 完成,去 AI 网站试试吧

## 为什么做这个

- AI 生成内容默认是 Markdown,直接复制粘贴到 Word/WPS 会格式全乱(公式乱码、表格错位、代码缩进丢失)
- 现有方案(PasteMD 等)都是桌面安装包:要下载、可能被杀毒软件误报、Mac 支持差
- 浏览器插件**零安装、跨平台**,在 AI 网页上就能直接复制

## 技术栈

- Manifest V3 浏览器扩展(纯前端,无服务器,无外部依赖)
- `md2html.js`: 自研轻量 Markdown → HTML 转换器(内联样式,粘贴保真)
- `content.js`: 选区 DOM 克隆 → 剥离网页样式 → 重施 Word 友好内联样式 → 写入剪贴板
- 剪贴板写入:ClipboardItem (`text/html` + `text/plain`),自动降级

## 隐私

- 本插件**不收集、不上传任何用户数据**
- 所有转换在浏览器本地完成,无服务器、无外部依赖、无网络请求
- 仅在你主动点击复制按钮时读取选中内容并写入剪贴板

## 开发路线

- [x] 骨架 + 核心复制链路
- [x] v0.1 选区 DOM 克隆 → Word 富文本粘贴保真
- [ ] 数学公式 LaTeX → Word 公式(MVP 保留原样)
- [ ] 图片下载并转为 Word 内嵌图片
- [ ] 设置页(自定义站点/按钮开关)

## 协议

[MIT](LICENSE)
