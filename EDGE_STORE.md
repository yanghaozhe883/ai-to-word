# Edge 加载项商店提交材料(ai-to-word v0.1.0)

提交地址:https://partner.microsoft.com/dashboard/microsoftedge/
(免费注册微软开发者账户,无需付费)

---

## 打包

- 提交文件:`ai-to-word-0.1.0.zip`(已生成,zip 内文件位于根目录,无外层文件夹)
- 打包内容:manifest.json / background.js / content.js / content.css / md2html.js / popup.html / icons/
- 重新打包(在扩展目录下执行,自动排除文档/截图):
  ```
  python -c "import zipfile,os; skip={'README.md','EDGE_STORE.md','LICENSE','.gitignore','screenshots','icon-master.png'}; z=zipfile.ZipFile('ai-to-word-0.1.0.zip','w',zipfile.ZIP_DEFLATED); [z.write(os.path.join(r,f),os.path.relpath(os.path.join(r,f),'.')) for r,_,fs in os.walk('.') for f in fs if os.path.relpath(os.path.join(r,f),'.') not in skip and not f.endswith('.zip')]; z.close()"
  ```

---

## 商店资料(可直接复制)

**名称(≤ 45 字符)**
```
AI 转 Word 助手 (AI to Word)
```

**短描述(≤ 100 字符)**
```
在 DeepSeek/ChatGPT/豆包/Kimi 等 AI 网页选中回复,一键复制为 Word/WPS 友好格式:标题、列表、表格、加粗全保留。
```

**详细描述(≤ 4000 字符)**

```
AI 转 Word 助手:AI 回复 → Word 排版,一键搞定

在 DeepSeek、ChatGPT、豆包、Kimi、通义千问、文心一言、Gemini、Claude 等 AI 网站上,
选中 AI 生成的回复内容,点击「复制为 Word 格式」按钮(或右键菜单),
粘贴到 Word 中就是整齐排版(兼容 WPS)——标题、列表、表格、加粗、代码块全部保留,
不用再手动清理 #、*、| 等 Markdown 符号。

【为什么需要它】
- AI 内容默认是 Markdown,直接复制到 Word/WPS 会格式全乱
- 现有工具多为桌面安装包,要下载、可能被杀毒软件误报
- 本插件零安装负担、跨平台,直接在网页上完成转换

【功能特性】
- 选区即转:只转换你选中的内容,不影响其他部分
- 格式保真:标题层级、无序/有序列表、表格、加粗、斜体、行内代码、代码块、引用、链接全部保留
- 双通道剪贴板:同时写入 HTML 与纯文本,兼容 Word / 记事本
- 智能降级:纯文本场景自动回退为 Markdown 解析
- 右键菜单:选中内容 → 右键 →「复制为 Word 格式」

【使用方法】
1. 打开任一支持的 AI 网站,让 AI 生成内容
2. 选中回复内容 → 点击出现的「复制为 Word 格式」按钮
3. 打开 Word(或 WPS),Ctrl+V 粘贴 → 完成

【隐私】
- 本插件完全本地运行,不收集、不上传任何用户数据
- 所有转换在浏览器内完成,无服务器、无外部依赖、无网络请求
- 仅在你主动点击复制按钮时读取选中内容并写入剪贴板
```

**类别**:工具(Productivity)
**语言**:中文(简体)(可选再加 English)

**隐私声明表单**
- "Does your extension collect or transmit data?" → 选 **No**(不收集任何数据,因此无需提供隐私政策 URL)

---

## 截图(需真实截图,不要用示意图)

- 尺寸:1280×800 或 640×400(建议 1280×800)
- 数量:建议 3 张,必须是插件真实运行截图(商店审核会核对截图与插件行为是否一致)
- **请按以下步骤自行截取**(本材料不附带任何伪造截图):

1. 截图 1 — 网页选中效果:Edge 加载插件 → 打开任一支持站点(如 chat.deepseek.com)→ 让 AI 生成一段含标题/列表/表格的内容 → 选中回复 → 出现「📋 复制为 Word 格式」按钮 → 截取浏览器窗口
2. 截图 2 — Word 粘贴效果:选中后点按钮复制 → 打开 Word → Ctrl+V 粘贴 → 截取 Word 窗口
3. 截图 3 — 右键菜单:选中回复内容 → 右键 → 显示「复制为 Word 格式」菜单项 → 截取

> ⚠️ 不要提交演示/渲染/拼贴图,商店审核可能因此拒绝。

---

## 提交流程

1. 打开 https://partner.microsoft.com/dashboard/microsoftedge/ 并用微软账户登录
2. 首次使用需完成开发者资料(邮箱、电话验证,免费)
3. 点击「Create new extension」→ 上传 `ai-to-word-0.1.0.zip`
4. 填入上述名称、描述、类别、隐私选项
5. 上传图标(128×128,已生成)与截图(1280×800)
6. 保存并提交审核,审核通常 1–7 个工作日
7. 审核通过后即可在 https://microsoftedge.microsoft.com/addons/ 发布

## 注意事项

- 若商店要求提供隐私政策 URL:可在 GitHub 仓库的 README「隐私」一节
  (https://github.com/yanghaozhe883/ai-to-word#隐私)作为隐私政策页
- 版本更新:修改 manifest.json 中的 version 后重新打包提交即可
