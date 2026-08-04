import assert from "node:assert/strict";
import test from "node:test";
import { analyzeCitation, checkDocumentText, isLikelyCitation } from "../lib/citation-checker.js";

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
