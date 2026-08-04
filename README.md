# 法引 · Citation CN

## 项目介绍 · About

法引是一款面向法学写作者、编辑与研究者的开源引注转换工具。它可批量识别 GB/T 7714、BibTeX 和 RIS 文献，并依据 2019 年《法学引注手册》生成规范格式，覆盖图书、期刊、文集、网页、学位论文、法律文件、司法案例及常见英文文献。所有数据仅在浏览器本地处理，同时提供字段核对、实时预览和一键复制，帮助用户更高效、可靠地整理法学引注。

Citation CN is an open-source citation converter for legal writers, editors, and researchers. It transforms GB/T 7714, BibTeX, and RIS records into formats based on the 2019 *Chinese Legal Citation Manual*. The browser-only workflow supports major Chinese and English legal sources, field review, live preview, and one-click copying without uploading citation data.

## 项目地址 · Project Links

- GitHub：[nireudamaria936/-Citation-CN-](https://github.com/nireudamaria936/-Citation-CN-)
- 问题反馈：[GitHub Issues](https://github.com/nireudamaria936/-Citation-CN-/issues)

## 功能

- 批量识别 GB/T 7714 常见文本、BibTeX、RIS
- 精准录入与实时预览
- 支持中文图书、期刊、文集、报纸、网页、学位论文、法律文件、规范性文件、司法案例
- 支持英文期刊和英文图书
- 对低置信度或缺失字段给出明确提示
- 所有转换均在浏览器本地完成，不上传文献数据

> 自动转换只能整理输入中已有的信息。文献真实性、版本、权威性、页码与引注必要性仍需作者核对。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可使用。

## 测试与构建

```bash
npm test
```

测试包含核心引注规则的单元测试、生产构建和服务端页面渲染检查。

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库并推送本项目。
2. 进入仓库 `Settings → Pages`。
3. 在 `Build and deployment` 中选择 `GitHub Actions`。
4. 推送到 `main` 后，仓库内置的工作流会自动构建并发布。

如需手动生成静态站点：

```bash
npm run build
npm run export:pages
```

静态文件会输出到 `gh-pages-dist/`（已加入 `.gitignore`）。

## WPS 文字加载项

仓库中的 `wps-addin/` 提供“法引检查”第一版，可检查 WPS 文档选区、全文、脚注和尾注，并将规范格式建议添加为批注，或在用户确认后以修订方式替换原文。

```bash
npm run wps:check
cd wps-addin
npm run debug
```

详细说明见 [`wps-addin/README.md`](wps-addin/README.md)。WPS 官方当前明确适配 Windows、Linux；macOS 需要先验证本机 WPS 是否支持 JavaScript 加载项。

## 支持范围与路线图

当前版本聚焦最常用的中文法学文献与英文文献。法文、德文、日文文献的规则已经在手册中，但不同语种对斜体、缩写、法院案例报告体系的要求差异较大，后续应按语种逐步加入专门的结构化编辑器与测试样例。

欢迎通过 Issue 提交无法识别的样例。请删除文献中的个人隐私或未公开信息。

## 规则依据

《法学引注手册》，2019 年 11 月。程序是辅助工具，与手册制定单位无隶属或授权关系。

## 许可证

[MIT](LICENSE)
