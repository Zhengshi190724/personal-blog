# 发布 Markdown 文章到博客

这份笔记记录如何将写好的 Markdown 文件添加到博客、同步到 GitHub 仓库，并通过 Cloudflare Pages 部署到线上网站。

## 推荐流程：使用一键发布命令

创建文章模板：

```powershell
Set-Location 'D:\26012\document\Claude_Code'
npm run new-post -- fpga-learning-note --title "FPGA 学习笔记" --category 技术
```

编辑生成的 `src/content/fpga-learning-note.md`，填写标签、摘要和正文。完成后先进行安全检查：

```powershell
npm run publish -- fpga-learning-note --dry-run
```

`--dry-run` 会校验文章并执行生产构建，但不会暂存、提交或推送文件。检查通过后正式发布：

```powershell
npm run publish -- fpga-learning-note
```

正式发布会自动完成：

1. 校验 Frontmatter 和正文。
2. 检查是否存在无关的未提交文件。
3. 执行生产构建。
4. 只暂存指定文章。
5. 自动生成 Git 提交说明。
6. 从 `origin/master` 拉取并变基。
7. 推送到 GitHub，触发 Cloudflare Pages 部署。

脚本不会执行强制推送。如果存在其他未提交文件，真实发布会停止，避免误提交。

下面保留手动发布流程，供排查问题时使用。

## 1. 准备 Markdown 文件

将文章保存到博客项目的内容目录：

```text
D:\26012\document\Claude_Code\src\content\
```

文件名会成为文章网址的一部分，建议使用简短的英文小写名称，并用连字符连接单词。例如：

```text
costas-loop-note.md
```

对应的文章网址为：

```text
https://personal-blog-ot6.pages.dev/posts/costas-loop-note/
```

## 2. 添加文章信息

每篇文章开头需要包含 Frontmatter，用于设置标题、日期、标签、分类、精选状态和摘要：

```markdown
---
title: "文章标题"
date: "2026-07-13"
tags: ["FPGA", "SystemVerilog", "tutorial"]
category: "技术"
featured: "false"
excerpt: "用一两句话概括文章内容，这段文字会显示在文章列表和搜索结果中。"
---

# 文章标题

从这里开始编写正文。
```

当前博客支持以下分类：

- `技术`
- `生活`
- `娱乐`
- `杂项`

将 `featured` 设置为 `"true"` 时，文章会出现在首页精选内容中。

## 3. 本地预览

在 PowerShell 中进入项目目录并启动开发服务器：

```powershell
Set-Location 'D:\26012\document\Claude_Code'
npm run dev
```

打开本地网站：

```text
http://127.0.0.1:5173/
```

检查以下内容：

- 文章是否出现在首页和文章列表中。
- 标题、摘要、日期、标签和分类是否正确。
- Markdown 标题、列表、图片、代码块和表格是否正常显示。
- 文章目录和上一篇、下一篇导航是否正确。

## 4. 执行生产构建

预览没有问题后，执行生产构建：

```powershell
npm run build
```

构建成功后，网站文件会生成到 `dist` 目录，同时自动更新：

- `sitemap.xml`
- `rss.xml`
- `robots.txt`

`dist` 是本地构建产物，不需要提交到 Git 仓库。

## 5. 提交到 Git 仓库

先查看修改内容：

```powershell
git status
git diff -- src/content/costas-loop-note.md
```

只暂存本次新增或修改的文章：

```powershell
git add src/content/costas-loop-note.md
```

创建提交：

```powershell
git commit -m "Add Costas loop article"
```

将提交推送到 GitHub 的 `master` 分支：

```powershell
git pull --rebase origin master
git push origin master
```

如果还修改了图片或网站代码，需要将对应文件一起加入 `git add`，但不要提交密码、访问令牌、`.env` 文件、`node_modules` 或 `dist`。

## 6. 自动部署到线上网站

GitHub 推送成功后，Cloudflare Pages 会自动拉取最新代码并执行生产构建。通常等待片刻后，新文章就会出现在：

```text
https://personal-blog-ot6.pages.dev/
```

也可以直接访问文章地址：

```text
https://personal-blog-ot6.pages.dev/posts/costas-loop-note/
```

如果浏览器仍显示旧内容，可以强制刷新页面：

```text
Windows: Ctrl + F5
```

## 7. 修改已经发布的文章

直接编辑原来的 Markdown 文件，然后重新执行：

```powershell
npm run publish -- costas-loop-note --dry-run
npm run publish -- costas-loop-note
```

推送后 Cloudflare Pages 会重新部署，线上文章会更新。只修改本地文件但不执行 `git push`，线上网站不会发生变化。

## 8. 常见问题

### 文章没有出现在网站中

确认文件位于 `src/content`，扩展名为 `.md`，并且 Frontmatter 前后都使用三个连字符 `---`。

### 分类页面没有文章

确认 `category` 的值严格使用 `技术`、`生活`、`娱乐` 或 `杂项`，不要添加多余空格。

### 文章地址出现 404

确认网址中的文章名称与 Markdown 文件名一致，并保留末尾的 `/`。如果刚完成推送，请等待部署结束后再刷新。

### Git 推送失败

先检查当前分支和远程仓库：

```powershell
git branch --show-current
git remote -v
```

当前博客应推送到 `origin/master`。如果网络暂时无法连接 GitHub，保留本地提交，网络恢复后重新执行 `git push origin master`。

### 一键发布提示存在无关文件

先执行：

```powershell
git status
```

将其他工作提交、暂存到 Git stash，或完成后再发布。发布脚本不会自动处理这些无关文件。
