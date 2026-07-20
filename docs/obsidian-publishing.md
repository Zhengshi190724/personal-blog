# 使用 Obsidian 编写并发布博客

## 一次性设置

1. 在 Obsidian 中将仓库根目录 `D:\26012\document\Claude_Code` 作为仓库打开，不要单独打开 `src/content`。
2. 当前仓库已将新笔记目录设为 `src/content`，附件目录设为 `public/images/posts`，链接格式设为 Markdown 相对链接。
3. 核心插件“模板”已启用，模板目录为 `templates`，可使用 `blogtemp.md`。
4. `.obsidian` 是本机界面配置，已加入 `.gitignore`，不会发布到网站。

## 推荐的新文章流程

先在 PowerShell 创建一份校验安全的草稿：

```powershell
Set-Location 'D:\26012\document\Claude_Code'
npm run new-post -- sv-interface --title "SystemVerilog interface 学习笔记" --category 技术 --subcategory SystemVerilog
```

然后在 Obsidian 中打开 `src/content/sv-interface.md` 编写。文章文件必须直接位于 `src/content`，文件名使用小写英文、数字、`-` 或 `_`。

也可以在 Obsidian 中新建文件并插入 `blogtemp` 模板，但需要自行保证文件名和 Frontmatter 完整。

## 分类写法

学习类文章：

```yaml
category: "学习"
```

SystemVerilog 技术文章：

```yaml
category: "技术"
subcategory: "SystemVerilog"
```

当前一级分类顺序为：技术、生活、娱乐、学习、杂项。`subcategory` 是可选字段；不属于细分类时不要填写。

当前文件夹映射：

| 文件夹 | 一级分类 | 子分类 |
| --- | --- | --- |
| `src/content/AAT` | 学习 | AAT |
| `src/content/SystemVerilog` | 技术 | SystemVerilog |

这些文件夹会被递归读取，里面还可以继续建立“关键词”“章节学习笔记”等整理目录。发布 URL 会根据完整相对路径自动生成，避免同名文件相互覆盖。

推荐直接按文件夹创建文章，分类会自动填写：

```powershell
npm run new-post -- AAT/verbal-reasoning --title "行测言语理解"
npm run new-post -- SystemVerilog/sv-interface --title "SystemVerilog interface"
```

## 自行增加子分类

例如增加 `MATLAB` 子分类，并归入“技术”：

1. 在 `src/config/navigation.js` 的“技术”对象中找到 `subcategories`。
2. 增加以下配置：

```js
{
  slug: 'matlab',
  name: 'MATLAB',
  contentFolder: 'MATLAB',
  description: 'MATLAB 建模、仿真与数据分析。',
}
```

3. 创建目录 `src/content/MATLAB`。
4. 该目录内文章的 Frontmatter 使用：

```yaml
category: 技术
subcategory: MATLAB
```

`slug` 用于网页 URL，建议只使用小写英文和连字符；`name` 必须与 Frontmatter 的 `subcategory` 完全一致；`contentFolder` 必须与 `src/content` 下的文件夹名完全一致。

Obsidian 会将标签保存成 YAML 列表，网站同时支持这种格式：

```yaml
tags:
  - systemverilog
  - verification
```

## 插入图片

直接粘贴或拖入图片。Obsidian 会把图片保存到 `public/images/posts` 并生成类似下面的相对链接：

```markdown
![interface 示意图](../../public/images/posts/interface.png)
```

网站会自动将其转换为 `/images/posts/interface.png`。文件名建议使用小写英文、数字和连字符，不要使用空格。也可以手动使用线上路径：

```markdown
![interface 示意图](/images/posts/sv-interface/interface.png)
```

## 校验与发布

完成文章后，将 `draft` 改为 `"false"`，再执行：

```powershell
npm run publish -- sv-interface --dry-run
npm run publish -- sv-interface
```

嵌套文件也可以直接使用路径：

```powershell
npm run publish -- "src/content/AAT/关键词/因果.md" --dry-run
npm run publish -- "src/content/AAT/关键词/因果.md"
```

发布命令会完成内容校验、生产构建、暂存目标文章及其引用的本地图片、提交并推送 `master`。其他 Obsidian 私人笔记和未暂存改动会保持原状；如果暂存区已有无关文件，脚本会停止并提示先处理。
