import { TYPE_LABELS, formatCitation, parseInput } from "./citation.js";

const clean = (value = "") => String(value)
  .replace(/[\u00a0\u3000]/g, " ")
  .replace(/[ \t]+/g, " ")
  .trim();

const comparable = (value = "") => clean(value)
  .replace(/\s*([，。：；、（）《》〔〕])\s*/g, "$1")
  .replace(/[–—]/g, "-");

export function isLikelyCitation(value = "") {
  const text = clean(value);
  if (text.length < 8 || text.length > 1200) return false;
  return /\[[A-Z]+(?:\/[A-Z]+)?\]/i.test(text)
    || /https?:\/\//i.test(text)
    || /《[^》]+》.*(?:出版社|年第?\d+期|学位论文|判决书|裁定书|决定书|发布|访问|第\d+[、,，\d\-–—]*页)/u.test(text)
    || /(?:〔|\[|【)\d{4}(?:〕|\]|】)\d+号/u.test(text)
    || /（\d{4}）[^，。]{1,50}号.*(?:判决书|裁定书|决定书)/u.test(text);
}

function addReason(reasons, condition, message) {
  if (condition && !reasons.includes(message)) reasons.push(message);
}

function normalizeKnownPunctuation(value, reasons) {
  let suggestion = clean(value);

  addReason(reasons, /\[[0-9]{4}\]|【[0-9]{4}】/u.test(suggestion), "文件号年份应使用六角括号〔〕");
  suggestion = suggestion.replace(/[\[【](\d{4})[\]】]/g, "〔$1〕");

  addReason(reasons, /第\d+[–—]\d+页/u.test(suggestion), "连续页码使用短横线连接");
  suggestion = suggestion.replace(/第(\d+)[–—](\d+)页/g, "第$1-$2页");

  addReason(reasons, /^中华人民共和国[^，。]*法/u.test(suggestion.replace(/^《/u, "")), "法律名称通常省略“中华人民共和国”");
  suggestion = suggestion.replace(/^《中华人民共和国/u, "《");

  addReason(reasons, /第(?:1|一)版/u.test(suggestion), "初版不标注“第1版”");
  suggestion = suggestion.replace(/[（(]?第(?:1|一)版[）)]?/gu, "");

  addReason(reasons, /\s+[，。：；、]/u.test(suggestion) || /[，。：；、]\s+/u.test(suggestion), "中文标点前后不留多余空格");
  suggestion = suggestion.replace(/\s*([，。：；、])\s*/g, "$1");

  addReason(reasons, /[.!]$/u.test(suggestion) && /[\u3400-\u9fff]/u.test(suggestion), "中文引注末尾使用中文句号");
  suggestion = suggestion.replace(/[.!]$/u, "。");

  if (!/[。.]$/u.test(suggestion)) {
    reasons.push("引注末尾应有句号");
    suggestion += /[\u3400-\u9fff]/u.test(suggestion) ? "。" : ".";
  }

  return suggestion;
}

export function analyzeCitation(value, context = {}) {
  const original = clean(value);
  if (!isLikelyCitation(original)) return null;

  const reasons = [];
  let suggestion = original;
  let type = "unknown";
  let confidence = "medium";
  let warnings = [];

  if (/\[[A-Z]+(?:\/[A-Z]+)?\]/i.test(original)) {
    const [parsed] = parseInput(original);
    if (parsed) {
      suggestion = formatCitation(parsed);
      type = parsed.type;
      confidence = parsed.confidence || confidence;
      warnings = parsed.warnings || [];
      reasons.push("检测到 GB/T 7714 文献，应转换为《法学引注手册》格式");
    }
  }

  suggestion = normalizeKnownPunctuation(suggestion, reasons);
  if (comparable(suggestion) === comparable(original)) return null;

  return {
    id: `${context.source || "document"}:${context.start || 0}:${context.end || original.length}`,
    source: context.source || "document",
    sourceLabel: context.sourceLabel || "正文",
    sourceKey: context.sourceKey || context.source || "document",
    start: Number(context.start || 0),
    end: Number(context.end ?? ((context.start || 0) + original.length)),
    original,
    suggestion,
    reasons,
    warnings,
    type,
    typeLabel: TYPE_LABELS[type] || "待识别引注",
    confidence,
  };
}

function paragraphRanges(text) {
  const ranges = [];
  const matcher = /[^\r\n]+/g;
  let match;
  while ((match = matcher.exec(String(text)))) {
    const leading = match[0].match(/^\s*/u)?.[0].length || 0;
    const trailing = match[0].match(/\s*$/u)?.[0].length || 0;
    const content = match[0].slice(leading, match[0].length - trailing);
    if (content) ranges.push({ text: content, start: match.index + leading, end: match.index + match[0].length - trailing });
  }
  return ranges;
}

export function checkDocumentText(text, options = {}) {
  const baseStart = Number(options.baseStart || 0);
  return paragraphRanges(text).map((part) => analyzeCitation(part.text, {
    source: options.source || "document",
    sourceLabel: options.sourceLabel || "正文",
    sourceKey: options.sourceKey || options.source || "document",
    start: baseStart + part.start,
    end: baseStart + part.end,
  })).filter(Boolean);
}

export function summarizeIssues(issues = []) {
  return issues.reduce((summary, issue) => {
    summary.total += 1;
    summary.bySource[issue.sourceLabel] = (summary.bySource[issue.sourceLabel] || 0) + 1;
    return summary;
  }, { total: 0, bySource: {} });
}
