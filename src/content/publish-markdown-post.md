---
title: "如何一键创建和发布 Markdown 文章"
date: "2026-07-13"
updated: "2026-07-20"
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

所有文章都位于下面的目录及其公开子目录：

```text
D:\26012\document\Claude_Code\src\content\
```

例如，这篇教程对应的文件是：

```text
src/content/publish-markdown-post.md
```

文件名去掉 `.md` 后就是文章 slug，因此线上地址为：

```text
https://blog.072419.xyz/posts/publish-markdown-post/
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

### 5. 发布脚本提示存在其他改动

发布脚本只会暂存目标 Markdown 及其引用图片，其他未暂存文件会保持原状。可以运行：

```powershell
git status
```

如果暂存区中已经存在与目标文章无关的文件，脚本会停止；应先提交或取消暂存这些文件。脚本不会执行强制推送。

## 第二部分：添加新文章并发布到线上

新文章建议通过模板命令创建。这样可以自动生成合法文件名、日期和完整 Frontmatter，减少遗漏字段导致的构建失败。

### 1. 确定文章 slug、标题和分类

slug 会成为 Markdown 文件名和文章网址。建议只使用小写英文字母、数字和连字符：

```text
fpga-learning-note
```

当前支持五个一级分类：

- `技术`
- `生活`
- `娱乐`
- `学习`
- `杂项`

当前还支持文件夹子分类：

- `src/content/AAT` → `学习 / AAT`
- `src/content/SystemVerilog` → `技术 / SystemVerilog`

### 2. 创建新文章模板

执行：

```powershell
npm run new-post -- fpga-learning-note --title "FPGA 学习笔记" --category 技术
```

在子分类文件夹创建文章时，分类会自动填写：

```powershell
npm run new-post -- AAT/verbal-reasoning --title "行测言语理解"
npm run new-post -- SystemVerilog/sv-interface --title "SystemVerilog interface"
```

命令会创建：

```text
src/content/fpga-learning-note.md
```

对应的线上地址将是：

```text
https://blog.072419.xyz/posts/fpga-learning-note/
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
- `category` 必须属于五个已有一级分类。
- 子目录文章还需填写与文件夹配置一致的 `subcategory`。
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
- **提示分类无效**：只使用 `技术`、`生活`、`娱乐`、`学习` 或 `杂项`。
- **提示暂存区存在无关文件**：通过 `git status` 检查并先提交或取消暂存。
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

如果希望图片同时在 Obsidian 和网站中显示，请从当前 Markdown 文件位置写到仓库根目录下的 `public/images`。例如文章位于
`src/content/SystemVerilog/SV章节学习笔记/` 时：

```markdown
![基本数据类型](../../../../public/images/posts/sv_learning_note/basic-data-type.png)
```

`../` 的数量随文章目录深度变化。网站和一键发布脚本会自动识别任意层级的
`../public/images/`，并转换为下面的线上路径：

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
https://blog.072419.xyz/images/posts/sv_learning_note/example.png
```

提交前可以执行以下检查：
```powershell
npm run validate:content
npm run build
```

注意使用指定路径执行`git add`，避免`git add.`意外提交`.history`等无关文件。

## 第四部分：一次提交多个文件并自动部署

当一次修改了多篇 Markdown、多个图片文件以及网站代码时，可以把所有有效改动放在同一次 Git 提交中。推送到 `master` 后，Cloudflare Pages 会自动开始生产部署，不需要再手动上传 `dist`。

### 1. 提交前检查全部改动

在 PowerShell 中进入项目目录并查看待提交文件：

```powershell
Set-Location "D:\26012\document\Claude_Code"

git status --short
```

确认列表中没有密码、Token、`.history`、临时文件或误创建的空文件。`.obsidian`、`dist` 和自动生成的响应式图片已经通过 `.gitignore` 排除。

### 2. 校验全部文章和网站

依次执行：

```powershell
npm run validate:content
npm run test
npm run build
```

只有三条命令全部通过后才继续提交。任何一条出现错误，都应先修正对应文章或代码。

### 3. 一次暂存多个文件

如果 `git status --short` 中的所有改动都需要发布，可以执行：

```powershell
git add -A
git diff --cached --stat
```

`git add -A` 会暂存新增、修改、移动和删除的文件。第二条命令用于再次检查即将提交的文件范围。

如果存在不需要发布的本地文件，不要使用 `git add -A`，改为明确指定目录：

```powershell
git add "src/content"
git add "public/images/posts"
git add "src"
git add "scripts"
git add "build"
```

### 4. 创建一次提交

提交说明应概括这批改动，例如：

```powershell
git commit -m "Update blog articles, images and website"
```

修改双引号中的文字只会改变 GitHub 提交记录的说明，不会改变网页内容。

### 5. 推送并自动部署

当前网络曾出现 GitHub HTTPS 连接被重置的问题，可以先为本仓库固定使用 HTTP/1.1：

```powershell
git config --local http.version HTTP/1.1
git push origin master
```

推送成功时会出现类似结果：

```text
旧提交..新提交  master -> master
```

GitHub 收到 `master` 的新提交后，Cloudflare Pages 会自动执行 `npm run build` 并部署到：

```text
https://blog.072419.xyz/
```

### 6. 确认提交和部署

先确认本地与 GitHub 已同步：

```powershell
git status
git log -1 --oneline
```

`git status` 显示分支与 `origin/master` 一致，表示 GitHub 推送成功。随后进入 Cloudflare Pages 的“部署”页面，确认最新生产部署对应刚才的提交哈希。部署完成后刷新线上博客并检查修改过的文章、图片和分类页面。

以后批量更新时，可以重复执行以下核心流程：

```powershell
Set-Location "D:\26012\document\Claude_Code"

git status --short
npm run validate:content
npm run test
npm run build

git add -A
git diff --cached --stat
git commit -m "Update blog articles, images and website"
git push origin master
```
