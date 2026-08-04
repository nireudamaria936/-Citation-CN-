import { TYPE_LABELS, formatCitation, parseInput } from "./citation.js";
import { RULE_VERSION, getRulesForType } from "./legal-citation-rules.js";

const clean = (value = "") => String(value)
  .replace(/[\u00a0\u3000]/g, " ")
  .replace(/[ \t]+/g, " ")
  .trim();

const comparable = (value = "") => clean(value)
  .replace(/\s*([，。：；、（）《》〔〕])/gu, "$1")
  .replace(/[–—]/gu, "-");

const foreignType = (type = "") => /^(?:en|fr|de)/u.test(type);
const chineseType = (type = "") => /^(?:book|journal|chapter|newspaper|web|thesis|law|regulation|case|cn)/u.test(type);

/**
 * 按《法学引注手册》2019 的文献形态选择规则组。
 * 这是格式识别，不是对来源真实性、版本和页码的事实核验。
 */
export function classifyCitation(value = "") {
  const text = clean(value);
  if (!text) return "unknown";

  if (/\b(?:Loi|Ord\.|Décret|Art\.|CGCT|CE\.|Cass\.|CJUE|CIJ)\b/u.test(text) || /(?:n°|éd\.|vol\.|p\.\s*\d|consulté le)/u.test(text) || /\b(?:L’État|droit de la mer)\b/u.test(text)) {
    if (/\b(?:CE\.|Cass\.|CJUE|CIJ|Cour d’appel)\b/u.test(text)) return "frCase";
    if (/\b(?:Loi|Ord\.|Décret|Constitution|CGCT|Art\.)\b/u.test(text)) return "frLaw";
    if (/(?:éd\.|vol\.|p\.\s*\d|Thèse|Rapport)/u.test(text)) return "frAcademic";
    return "frWeb";
  }
  if (/\b(?:BVerfGE|BGH|StGB|StPO|GG|Rn\.|Hrsg\.|Aufl\.|abgerufen am|S\.)\b/u.test(text)) {
    if (/\b(?:BVerfGE|BGH|NJW|NStZ|FamRZ)\b/u.test(text)) return "deCase";
    if (/§|\bArt\./u.test(text)) return "deLaw";
    return /URL:|https?:\/\//iu.test(text) ? "deWeb" : "deAcademic";
  }
  if (/『[^』]+』|「[^」]+」|(?:判決|判例集|による|\d+巻\d+号)/u.test(text)) {
    if (/判決|判例集/u.test(text)) return "jaCase";
    if (/法律|法典|規則/u.test(text)) return "jaLaw";
    return /https?:\/\//iu.test(text) ? "jaWeb" : "jaAcademic";
  }

  if (/(?:\bU\.S\.C\.|\bStat\.|\bPub\.\s*L\.\s*No\.|\bAct\s+§)/u.test(text)) return "enStatute";
  if (/\bv\.?\s+/u.test(text) && /\b(?:U\.S\.|F\.?\d+[A-Za-z]*|S\. Ct\.|L\. Ed\.|AC|QB|KB|Ch|WLR|All ER)\b/u.test(text)) return "enCase";
  if (/\b(?:BBC NEWS|New York Times|Washington Post|The Guardian)\b/u.test(text)) return "enNewspaper";
  if (/\b\d+\s+[A-Z][A-Za-z .&'-]+(?:Journal|Review|Law|Quarterly)\s+\d+/u.test(text)) return "enJournal";
  if (/\bin\s+[A-Z][\s\S]+\b(?:eds?\.|editors?)\b/u.test(text) && !/[\u3400-\u9fff]/u.test(text)) return "enChapter";
  if (/\b(?:University Press|Press),?\s*\d{4}\b/u.test(text) && !/[\u3400-\u9fff]/u.test(text)) return "enBook";
  if (/https?:\/\//iu.test(text) && !/[《》]/u.test(text)) return /[\u3400-\u9fff]/u.test(text) ? "web" : "enWeb";

  if (/统计|数据来源|图表来源|表格来源/u.test(text)) return "cnStatistics";
  if (/(?:诉|上诉|再审).{0,60}案/u.test(text) || /(?:判决书|裁定书|调解书|指导性案例|最高人民法院公报)/u.test(text)) return "case";
  if (/〔?\d{4}〕?\d+号|国发|法释|法发|财税|规章|规范性文件/u.test(text)) return "regulation";
  if (/《[^》]*(?:法|条例|办法|规定|决定|公约|宪法)[^》]*》(?:（[^）]+）)?第?\s*(?:\d+|[一二三四五六七八九十百千万]+)条/u.test(text) || /法律文件|第\s*(?:\d+|[一二三四五六七八九十百千万]+)条第/u.test(text)) return "law";
  if (/学位论文|博士论文|硕士论文/u.test(text)) return "thesis";
  if (/载《[^》]+》\s*\d{4}\s年第?\s*\d+期/u.test(text)) return "journal";
  if (/载(?:[^，。]{0,80})(?:主编|编著|编译)[：:《]/u.test(text)) return "chapter";
  if (/载《[^》]+》\s*\d{4}年\s*\d{1,2}月\s*\d{1,2}日|第\s*\d+版/u.test(text)) return "newspaper";
  if (/出版社\s*\d{4}\s*年?版|《[^》]+》/u.test(text)) return "book";
  return "unknown";
}

export function isLikelyCitation(value = "") {
  const text = clean(value);
  if (text.length < 8 || text.length > 1200) return false;
  return classifyCitation(text) !== "unknown"
    || /\[[A-Z]+(?:\/[A-Z]+)?\]/i.test(text)
    || /(?:〔|\[|【)\d{4}(?:〕|\]|】)\d+/u.test(text)
    || /（\d{4}）[^，。]{1,80}(?:号|案)/u.test(text);
}

function addReason(reasons, condition, message) {
  if (condition && !reasons.includes(message)) reasons.push(message);
}

function addFinding(findings, ruleId, message, severity = "warning") {
  if (!findings.some((finding) => finding.ruleId === ruleId && finding.message === message)) {
    findings.push({ ruleId, message, severity });
  }
}

function normalizeKnownPunctuation(value, type, reasons, findings) {
  let suggestion = clean(value);
  const isChinese = chineseType(type) && !foreignType(type);

  if (/(?:\[[0-9]{4}\]|【[0-9]{4}】)/u.test(suggestion) && type === "regulation") {
    addReason(reasons, true, "文件号年份应使用六角括号〔〕");
    addFinding(findings, "LAW05", "文件号年份统一为六角括号〔〕", "error");
    suggestion = suggestion.replace(/[\[【](\d{4})[\]】]/g, "〔$1〕");
  }
  if (/(?:\[[0-9]{4}\]|【[0-9]{4}】)/u.test(suggestion) && type === "case") {
    addReason(reasons, true, "案件年份应使用圆括号（），而非方括号");
    addFinding(findings, "CASE02", "案件年份使用圆括号（ ）", "error");
    suggestion = suggestion.replace(/[\[【](\d{4})[\]】]/g, "（$1）");
  }

  if (/第\d+[–—]\d+页/u.test(suggestion)) {
    addReason(reasons, true, "连续页码使用短横线连接");
    addFinding(findings, "CN07", "连续页码使用短横线 -", "error");
    suggestion = suggestion.replace(/第(\d+)[–—](\d+)页/g, "第$1-$2页");
  }

  if (isChinese && ["law", "regulation"].includes(type) && /^《中华人民共和国/u.test(suggestion)) {
    addReason(reasons, true, "法律文件名称在不引起误解时省略“中华人民共和国”");
    addFinding(findings, "LAW01", "法律名称可省略“中华人民共和国”", "warning");
    suggestion = suggestion.replace(/^《中华人民共和国/u, "《");
  }

  if (["book", "journal", "chapter", "thesis"].includes(type) && /(?:（|\()?第(?:1|一)版(?:）|\))?/u.test(suggestion)) {
    addReason(reasons, true, "初版不标注“第1版”");
    addFinding(findings, "CN04", "删除初版标记，保留再版信息", "error");
    suggestion = suggestion.replace(/[（(]?第(?:1|一)版[）)]?/gu, "");
  }

  if (/\s+[，。：；、]/u.test(suggestion) || /[，。：；、]\s+/u.test(suggestion)) {
    addReason(reasons, true, "中文标点前后不留多余空格");
    addFinding(findings, "G05", "清理中文标点两侧多余空格", "error");
    suggestion = suggestion.replace(/\s*([，。：；、])\s*/g, "$1");
  }
  if (/出版社\s+\d{4}/u.test(suggestion) && isChinese) {
    addReason(reasons, true, "出版社与年份之间不留多余空格");
    addFinding(findings, "CN04", "出版机构与年份紧邻", "error");
    suggestion = suggestion.replace(/出版社\s+(?=\d{4})/gu, "出版社");
  }
  if (["journal", "chapter", "newspaper"].includes(type) && !/\b载/u.test(suggestion) && /《[^》]+》/u.test(suggestion)) {
    addReason(reasons, true, "中文期刊、文集和报纸来源前通常使用“载”");
    addFinding(findings, type === "newspaper" ? "CN06" : "CN05", "来源载体前补充“载”（需人工确认）", "warning");
  }
  if (["enJournal", "enBook", "enChapter"].includes(type) && /[“”"']/u.test(suggestion)) {
    addReason(reasons, true, "英文文章或书名不使用引号，排版时应使用斜体");
    addFinding(findings, "EN02", "去除英文题名引号并在 WPS 中设为斜体", "warning");
    suggestion = suggestion.replace(/[“”"']/gu, "");
  }
  if (type === "frAcademic" && /[“”"']/u.test(suggestion)) {
    addReason(reasons, true, "法文论文题名使用« »，刊名使用斜体");
    addFinding(findings, "FR01", "法文题名应使用« »", "warning");
  }
  if (type === "deAcademic" && /\bpp?\.?\s*\d/iu.test(suggestion)) {
    addReason(reasons, true, "德文页码使用“S.”，连续页使用“f.”或“ff.”");
    addFinding(findings, "DE01", "德文页码标记应核对 S./f./ff.", "warning");
  }

  const stop = foreignType(type) ? "." : "。";
  const wrongStop = (isChinese && /\.$/u.test(suggestion)) || (foreignType(type) && /。$/u.test(suggestion));
  if (!/[。.]$/u.test(suggestion) || wrongStop) {
    addReason(reasons, true, `引注末尾应使用${stop === "。" ? "中文句号" : "西文句号"}`);
    addFinding(findings, "G08", `引注末尾使用${stop}`, "error");
    suggestion = suggestion.replace(/[。.]$/u, "") + stop;
  }
  return suggestion;
}

export function analyzeCitation(value, context = {}) {
  const original = clean(value);
  if (!isLikelyCitation(original)) return null;

  const reasons = [];
  const findings = [];
  let suggestion = original;
  let type = classifyCitation(original);
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

  type = type === "unknown" ? classifyCitation(suggestion) : type;
  suggestion = normalizeKnownPunctuation(suggestion, type, reasons, findings);
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
    ruleVersion: RULE_VERSION,
    ruleIds: getRulesForType(type).map((rule) => rule.id),
    findings,
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
    summary.byType[issue.typeLabel] = (summary.byType[issue.typeLabel] || 0) + 1;
    return summary;
  }, { total: 0, bySource: {}, byType: {} });
}
