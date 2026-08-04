# 法引检查 · WPS 文字加载项

该加载项复用 Citation CN 的规则核心，在 WPS 文字侧边栏中检查选区、全文、脚注和尾注。

## 第一版功能

- 检查 GB/T 7714 文献并给出法学引注格式建议
- 检查文件号括号、连续页码、初版标记、末尾标点等常见问题
- 定位原文
- 添加 WPS 批注
- 复制建议，供用户手动粘贴
- 经用户确认后替换原文，并可开启修订

自动检查只处理格式，不核验文献是否真实、版本是否权威、页码是否准确。

## 调试

WPS 官方加载项开发工具目前明确支持 Windows、Linux。macOS 需先确认所安装的 WPS 是否提供 JavaScript 加载项能力。

```bash
npm install -g wpsjs
cd wps-addin
npm run debug
```

运行前，`sync-core` 会把仓库中的 `lib/citation.js` 和 `lib/citation-checker.js` 同步到 `wps-addin/shared/`。

## 构建与发布

```bash
cd wps-addin
npm run build
npm run publish
```

新版本 WPS 应使用官方推荐的 `wpsjs publish` / `publish.xml` 部署方式，不依赖修改 `oem.ini`。
