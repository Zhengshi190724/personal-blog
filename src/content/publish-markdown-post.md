---
title: "如何一键创建和发布 Markdown 文章"
date: "2026-07-13"
updated: "2026-07-16"
tags: ["Markdown", "Git", "deployment"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "介绍如何修改现有博客文章，以及如何创建新的 Markdown 文件并一键提交到 GitHub、部署到 Cloudflare Pages。"
series: "Markdown 写作与发布"
seriesOrder: "2"
---

博客已经提供文章创建和发布脚本。日常更新不再需要依次执行 `git add`、`git commit`、`git pull` 和 `git push`，只需要完成文章内容，再运行一条发布命令即可。

开始前，在 PowerShell 中进入博客工程目录：

```powershell
Set-Location 'D:\26012\document\Claude_Code'
```

## 第一部分：修改现有文章并更新到线上

修改已经发布的文章时，应继续编辑原来的 Markdown 文件。不要另建同名文件，也不要修改文件名，否则文章网址会随之变化。

### 1. 找到需要修改的文章

所有文章都位于：

```text
D:\26012\document\Claude_Code\src\content\
```

例如，这篇教程对应的文件是：

```text
src/content/publish-markdown-post.md
```

文件名去掉 `.md` 后就是文章 slug，因此线上地址为：

```text
https://personal-blog-ot6.pages.dev/posts/publish-markdown-post/
```

### 2. 修改正文和更新时间

直接编辑正文。如果这次修改改变了文章内容，应更新 Frontmatter 中的 `updated`，但保留原来的 `date`：

```yaml
date: "2026-07-13"
updated: "2026-07-14"
```

- `date` 表示首次发布日期。
- `updated` 表示最近一次内容更新时间。
- 已上线文章应保持 `draft: "false"`。

### 3. 执行发布前检查

发布命令可以接收文章 slug。先使用 `--dry-run` 检查内容：

```powershell
npm run publish -- publish-markdown-post --dry-run
```

检查过程会验证 Frontmatter、正文和生产构建，但不会暂存文件、创建 Git 提交或推送到 GitHub。

### 4. 一键更新线上文章

检查通过后执行：

```powershell
npm run publish -- publish-markdown-post
```

脚本会自动完成：

1. 校验文章格式和必填字段。
2. 执行生产构建。
3. 只暂存当前 Markdown 文件。
4. 创建文章更新提交。
5. 同步远程 `master` 分支。
6. 推送到 GitHub，触发 Cloudflare Pages 部署。

等待部署完成后，刷新原文章地址即可看到更新。浏览器仍显示旧内容时，可以使用 `Ctrl + F5` 强制刷新。

### 5. 发布脚本提示存在无关改动

为避免误提交，发布脚本发现其他未提交文件时会停止。先运行：

```powershell
git status
```

应先完成或单独提交其他代码、图片和文档，再重新执行文章发布命令。脚本不会自动暂存无关文件，也不会执行强制推送。

## 第二部分：添加新文章并发布到线上

新文章建议通过模板命令创建。这样可以自动生成合法文件名、日期和完整 Frontmatter，减少遗漏字段导致的构建失败。

### 1. 确定文章 slug、标题和分类

slug 会成为 Markdown 文件名和文章网址。建议只使用小写英文字母、数字和连字符：

```text
fpga-learning-note
```

当前支持四个分类：

- `技术`
- `生活`
- `娱乐`
- `杂项`

### 2. 创建新文章模板

执行：

```powershell
npm run new-post -- fpga-learning-note --title "FPGA 学习笔记" --category 技术
```

命令会创建：

```text
src/content/fpga-learning-note.md
```

对应的线上地址将是：

```text
https://personal-blog-ot6.pages.dev/posts/fpga-learning-note/
```

如果目标文件已经存在，命令会停止，不会覆盖原文章。

### 3. 完成 Frontmatter 和正文

新模板默认是草稿，并包含待填写内容。发布前至少需要完成以下字段：

```yaml
---
title: "FPGA 学习笔记"
date: "2026-07-14"
updated: "2026-07-14"
tags: ["FPGA", "learning"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "记录 FPGA 学习过程中的重点概念、实验和工程经验。"
---
```

字段说明：

- `tags` 至少填写一个标签，使用数组格式。
- `category` 必须属于四个已有分类。
- `featured: "true"` 会将文章加入首页精选内容。
- 新模板默认使用 `draft: "true"`；完成文章后必须改为 `"false"` 才能正式发布。
- `updated`、`cover` 和 `series` 是可选字段。
- 本地封面路径可以写成 `/images/posts/fpga-learning-note/cover.webp`。

草稿不会出现在文章列表、搜索、归档、RSS 或 Sitemap 中。

### 4. 本地预览

需要检查排版时，启动本地网站：

```powershell
npm run dev
```

然后访问：

```text
http://127.0.0.1:5173/posts/fpga-learning-note/
```

重点检查标题层级、代码块、表格、图片、文章目录、标签和移动端显示。

### 5. 检查并一键发布

先执行无副作用检查：

```powershell
npm run publish -- fpga-learning-note --dry-run
```

检查通过后正式发布：

```powershell
npm run publish -- fpga-learning-note
```

脚本会自动生成类似下面的提交说明：

```text
Add blog post: FPGA 学习笔记
```

推送成功后，Cloudflare Pages 会自动构建并部署网站。部署期间旧版本仍可正常访问，等待片刻后再打开新文章地址。

### 6. 常见失败原因

- **提示缺少标签或摘要**：补全 `tags` 和 `excerpt`，不要保留模板提示文字。
- **提示文章仍是草稿**：将 `draft` 改为 `"false"`。
- **提示分类无效**：只使用 `技术`、`生活`、`娱乐` 或 `杂项`。
- **提示存在无关文件**：通过 `git status` 检查并先处理其他改动。
- **线上文章出现 404**：确认 slug 与文件名一致，并等待 Cloudflare Pages 部署完成。
- **GitHub 推送失败**：保留本地提交，网络恢复后重新执行 `git push origin master`。

通过这两条流程，修改旧文章和发布新文章都只需要维护 Markdown 内容，再执行对应的一键发布命令。

## 第三部分：新增图片到文章并线上部署

后续新增图片时，建议按文章建立独立文件夹，并与 Markdown 文件一起提交。

### 1.存放图片

例如文章名称为`sv_learning_note`

```text
D:\26012\document\Claude_Code\public\images\posts\sv_learning_note\example.png
```

### 2.在 Markdown 中引用图片

```markdown
![example](/images/posts/sv_learning_note/example.png)
```

请勿使用
```markdown
![错误示例](D:\26012\document\Claude_Code\public\images\...)
```

同时确保扩展名和大小写与实际文件完全一致，例如`.png`不能写成`.jpg`。

### 3.提交并推送

在PowerShell中执行：

```powershell
Set-Location "D:\26012\document\Claude_Code"

git status

git add "public/images/posts/sv_learning_note/example.png"
git add "src/content/sv_learning_note.md"

git commit -m "Add images to SystemVerilog learning note"
git push origin master
```

如果需要提交该图片文件夹中的所有新增图片：

```powershell
git add "public/images/posts/sv_learning_note"
git add "src/content/sv_learning_note.md"

git commit -m "Update SystemVerilog article images"
git push origin master
```

推送成功后，Cloudflare Pages 会自动部署。线上图片地址为：
```text
https://personal-blog-ot6.pages.dev/images/posts/sv_learning_note/example.png
```

提交前可以执行以下检查：
```powershell
npm run validate:content
npm run build
```

注意使用指定路径执行`git add`，避免`git add.`意外提交`.history`等无关文件。
