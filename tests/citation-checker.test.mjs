import assert from "node:assert/strict";
import test from "node:test";
import { analyzeCitation, checkDocumentText, classifyCitation, isLikelyCitation } from "../lib/citation-checker.js";
import { RULE_CATALOG } from "../lib/legal-citation-rules.js";

test("converts a GB/T book citation into legal citation style", () => {
  const issue = analyzeCitation("王名扬. 美国行政法[M]. 北京: 北京大学出版社, 2007.");
  assert.equal(issue.suggestion, "王名扬：《美国行政法》，北京大学出版社2007年版。");
  assert.equal(issue.type, "book");
});

test("does not flag a valid Chinese book citation", () => {
  assert.equal(analyzeCitation("王名扬：《美国行政法》，北京大学出版社2007年版。"), null);
});

test("normalizes document-number brackets", () => {
  const issue = analyzeCitation("《某行政规范》，国发[2007]19号，2007年7月11日发布。");
  assert.equal(issue.suggestion, "《某行政规范》，国发〔2007〕19号，2007年7月11日发布。");
  assert.ok(issue.reasons.includes("文件号年份应使用六角括号〔〕"));
});

test("normalizes continuous-page punctuation and final stop", () => {
  const issue = analyzeCitation("张新宝：《侵权责任法》，中国人民大学出版社2016年版，第73—75页");
  assert.equal(issue.suggestion, "张新宝：《侵权责任法》，中国人民大学出版社2016年版，第73-75页。");
});

test("preserves document offsets for WPS ranges", () => {
  const text = "正文第一段。\r王名扬. 美国行政法[M]. 北京: 北京大学出版社, 2007.\r正文第三段。";
  const [issue] = checkDocumentText(text, { baseStart: 100, source: "selection" });
  assert.equal(issue.start, 107);
  assert.equal(issue.end, 140);
});

test("ignores ordinary prose", () => {
  assert.equal(isLikelyCitation("本文讨论行政法的基本原则。"), false);
  assert.deepEqual(checkDocumentText("本文讨论行政法的基本原则。"), []);
});

test("installs the handbook rule catalog", () => {
  assert.ok(RULE_CATALOG.length >= 40);
  assert.ok(RULE_CATALOG.some((rule) => rule.id === "LAW05"));
  assert.ok(RULE_CATALOG.some((rule) => rule.id === "EN04"));
  assert.ok(RULE_CATALOG.some((rule) => rule.id === "JA02"));
});

test("recognizes Chinese law, regulation, and case rules", () => {
  assert.equal(classifyCitation("《民法典》第三条"), "law");
  assert.equal(classifyCitation("《国务院关于建立制度的通知》，国发〔2007〕19号"), "regulation");
  assert.equal(classifyCitation("包郑照诉苍南县人民政府强制拆除房屋案，浙江省高级人民法院（1988）浙法民上字7号民事判决书"), "case");
  assert.ok(analyzeCitation("《民法典》第三条")?.ruleIds.includes("LAW03"));
});

test("recognizes English statutes and cases", () => {
  const statute = analyzeCitation("Department of Transportation Act, Pub. L. No. 89-670, § 9, 80 Stat. 931 (1966)");
  const legalCase = analyzeCitation("Natural Resources Defense Council v. Gorsuch, 685 F.2d 718 (D.C. Cir. 1982)");
  assert.equal(statute?.type, "enStatute");
  assert.equal(legalCase?.type, "enCase");
  assert.equal(statute?.suggestion.endsWith("."), true);
  assert.ok(statute?.ruleIds.includes("EN04"));
  assert.ok(legalCase?.ruleIds.includes("EN05"));
});

test("recognizes French, German, and Japanese citation forms", () => {
  assert.equal(classifyCitation("Marc Chevallier, L’État de droit, Montchrestien, 4e éd., Paris, 2003, p. 16-29"), "frAcademic");
  assert.equal(classifyCitation("BVerfGE 75, 369 (380)"), "deCase");
  assert.equal(classifyCitation("我妻栄『新訂担保物権法（民法講義Ⅲ）』（有斐閣，1971年）50頁"), "jaAcademic");
});
