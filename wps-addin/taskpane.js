import { checkDocumentText, summarizeIssues } from "./shared/citation-checker.js";

const resultsElement = document.querySelector("#results");
const statusText = document.querySelector("#status-text");
const statusDot = document.querySelector("#status-dot");
const issueTemplate = document.querySelector("#issue-template");
const trackRevisions = document.querySelector("#track-revisions");

let currentIssues = [];
const sourceRanges = new Map();

function getApplication() {
  const app = globalThis.Application || globalThis.wps;
  if (!app || !app.ActiveDocument) throw new Error("未检测到 WPS 文字环境，请从 WPS 的“法引”选项卡打开本窗格。");
  return app;
}

function setStatus(message, state = "") {
  statusText.textContent = message;
  statusDot.className = `status-dot ${state}`.trim();
}

function sourceRangeKey(source, index = 0) {
  return `${source}:${index}`;
}

function scanRange(range, options) {
  const text = String(range.Text || "").replace(/[\u0002\u0003]/g, "");
  const key = options.sourceKey;
  sourceRanges.set(key, range.Duplicate || range);
  return checkDocumentText(text, {
    baseStart: Number(range.Start || 0),
    source: options.source,
    sourceLabel: options.sourceLabel,
    sourceKey: key,
  });
}

function getTargetRange(issue) {
  const source = sourceRanges.get(issue.sourceKey);
  if (!source) throw new Error("原文范围已失效，请重新检查文档。");
  const target = source.Duplicate || source;
  target.Start = issue.start;
  target.End = issue.end;
  return target;
}

function renderIssues(issues) {
  currentIssues = issues;
  resultsElement.replaceChildren();
  const summary = summarizeIssues(issues);
  if (!issues.length) {
    resultsElement.innerHTML = '<div class="empty-state"><span>✓</span><p>未发现可确定的格式问题。仍请人工核对文献真实性、版本和页码。</p></div>';
    setStatus("检查完成，未发现明确的格式问题。", "done");
    return;
  }

  for (const issue of issues) {
    const card = issueTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.issueId = issue.id;
    card.querySelector('[data-field="source"]').textContent = issue.sourceLabel;
    card.querySelector('[data-field="type"]').textContent = issue.typeLabel;
    card.querySelector('[data-field="original"]').textContent = issue.original;
    card.querySelector('[data-field="suggestion"]').textContent = issue.suggestion;
    const reasons = card.querySelector('[data-field="reasons"]');
    for (const reason of [...issue.reasons, ...issue.warnings]) {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.append(item);
    }
    resultsElement.append(card);
  }
  setStatus(`检查完成，发现 ${summary.total} 处需要核对。`, "done");
}

function scanSelection() {
  setStatus("正在检查选区……", "busy");
  const app = getApplication();
  const range = app.Selection.Range;
  if (!range || Number(range.End) <= Number(range.Start)) throw new Error("请先在文档中选择需要检查的引注。");
  renderIssues(scanRange(range, { source: "selection", sourceLabel: "选区", sourceKey: sourceRangeKey("selection") }));
}

function scanDocument() {
  setStatus("正在检查全文……", "busy");
  const app = getApplication();
  const range = app.ActiveDocument.Content;
  renderIssues(scanRange(range, { source: "document", sourceLabel: "正文", sourceKey: sourceRangeKey("document") }));
}

function scanNotes() {
  setStatus("正在检查脚注与尾注……", "busy");
  const app = getApplication();
  const documentObject = app.ActiveDocument;
  const issues = [];
  sourceRanges.clear();

  const collections = [
    { value: documentObject.Footnotes, source: "footnote", label: "脚注" },
    { value: documentObject.Endnotes, source: "endnote", label: "尾注" },
  ];
  for (const collection of collections) {
    const count = Number(collection.value?.Count || 0);
    for (let index = 1; index <= count; index += 1) {
      const note = collection.value.Item(index);
      const range = note.Range;
      const key = sourceRangeKey(collection.source, index);
      issues.push(...scanRange(range, {
        source: collection.source,
        sourceLabel: `${collection.label} ${index}`,
        sourceKey: key,
      }));
    }
  }
  renderIssues(issues);
}

function locateIssue(issue) {
  getTargetRange(issue).Select();
  setStatus(`已定位：${issue.sourceLabel}`, "done");
}

function addComment(issue) {
  const app = getApplication();
  const target = getTargetRange(issue);
  const detail = [
    `法引建议：${issue.suggestion}`,
    ...issue.reasons.map((reason) => `• ${reason}`),
    "请核对文献真实性、版本、页码和引注必要性后手动处理。",
  ].join("\n");
  app.ActiveDocument.Comments.Add(target, detail);
  setStatus("已将建议添加为 WPS 批注。", "done");
}

async function copySuggestion(issue) {
  await navigator.clipboard.writeText(issue.suggestion);
  setStatus("建议格式已复制，可手动粘贴。", "done");
}

function replaceIssue(issue) {
  if (!window.confirm(`确认用以下建议替换原文？\n\n${issue.suggestion}`)) return;
  const app = getApplication();
  const documentObject = app.ActiveDocument;
  if (trackRevisions.checked && "TrackRevisions" in documentObject) documentObject.TrackRevisions = true;
  const target = getTargetRange(issue);
  target.Text = issue.suggestion;
  currentIssues = currentIssues.filter((item) => item.id !== issue.id);
  renderIssues(currentIssues);
  setStatus("已应用建议；如开启修订，可在 WPS 中接受或拒绝该修改。", "done");
}

function withErrorBoundary(action) {
  try {
    action();
  } catch (error) {
    setStatus(error.message || String(error), "error");
  }
}

document.querySelector('[data-action="scan-selection"]').addEventListener("click", () => withErrorBoundary(scanSelection));
document.querySelector('[data-action="scan-document"]').addEventListener("click", () => withErrorBoundary(scanDocument));
document.querySelector('[data-action="scan-notes"]').addEventListener("click", () => withErrorBoundary(scanNotes));

resultsElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  const card = event.target.closest(".issue-card");
  if (!button || !card) return;
  const issue = currentIssues.find((item) => item.id === card.dataset.issueId);
  if (!issue) return;
  const actions = {
    locate: () => locateIssue(issue),
    comment: () => addComment(issue),
    copy: () => copySuggestion(issue).catch((error) => setStatus(error.message, "error")),
    replace: () => replaceIssue(issue),
  };
  withErrorBoundary(actions[button.dataset.action]);
});
