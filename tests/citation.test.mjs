import assert from "node:assert/strict";
import test from "node:test";
import { formatCitation, parseInput } from "../lib/citation.js";

test("formats a Chinese book without city or first-edition marker", () => {
  assert.equal(
    formatCitation({ type: "book", author: "王名扬", title: "美国行政法", publisher: "北京大学出版社", year: "2007" }),
    "王名扬：《美国行政法》，北京大学出版社2007年版。",
  );
});

test("formats edition and continuous pages", () => {
  assert.equal(
    formatCitation({ type: "book", author: "张新宝", title: "侵权责任法", edition: "第4版", publisher: "中国人民大学出版社", year: "2016", pages: "73—75" }),
    "张新宝：《侵权责任法》（第4版），中国人民大学出版社2016年版，第73-75页。",
  );
});

test("formats a translated book", () => {
  assert.equal(
    formatCitation({ type: "book", author: "[美]富勒", title: "法律的道德性", translator: "郑戈", publisher: "商务印书馆", year: "2005" }),
    "[美]富勒：《法律的道德性》，郑戈译，商务印书馆2005年版。",
  );
});

test("formats a Chinese journal article", () => {
  assert.equal(
    formatCitation({ type: "journal", author: "季卫东", title: "法律程序的意义：对中国法制建设的另一种思考", container: "中国社会科学", year: "1993", issue: "1" }),
    "季卫东：《法律程序的意义：对中国法制建设的另一种思考》，载《中国社会科学》1993年第1期。",
  );
});

test("formats a newspaper article", () => {
  assert.equal(
    formatCitation({ type: "newspaper", author: "何海波", title: "判决书上网", container: "法制日报", date: "2000-05-21", edition: "2" }),
    "何海波：《判决书上网》，载《法制日报》2000年5月21日，第2版。",
  );
});

test("formats law article paragraph and item with Arabic numerals", () => {
  assert.equal(
    formatCitation({ type: "law", title: "中华人民共和国民法总则", article: "27", paragraph: "2", item: "3" }),
    "《民法总则》第27条第2款第3项。",
  );
});

test("normalizes document-number brackets", () => {
  assert.equal(
    formatCitation({ type: "regulation", title: "国务院关于在全国建立农村最低生活保障制度的通知", documentNumber: "国发[2007]19号", date: "2007-07-11" }),
    "《国务院关于在全国建立农村最低生活保障制度的通知》，国发〔2007〕19号，2007年7月11日发布。",
  );
});

test("formats an English law-journal article", () => {
  assert.equal(
    formatCitation({ type: "enJournal", author: "Charles A. Reich", title: "The New Property", container: "Yale Law Journal", volume: "73", firstPage: "733", pages: "737-738", year: "1964" }),
    "Charles A. Reich, The New Property, 73 Yale Law Journal 733, 737-738 (1964).",
  );
});

test("parses common GB/T entries", () => {
  const parsed = parseInput("[1] 王名扬. 美国行政法[M]. 北京: 北京大学出版社, 2007.\n[2] 季卫东. 法律程序的意义[J]. 中国社会科学, 1993(1).");
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].type, "book");
  assert.equal(parsed[1].type, "journal");
  assert.equal(formatCitation(parsed[0]), "王名扬：《美国行政法》，北京大学出版社2007年版。");
});

test("parses BibTeX article records", () => {
  const [parsed] = parseInput(`@article{reich1964,
    author = {Charles A. Reich},
    title = {The New Property},
    journal = {Yale Law Journal},
    volume = {73},
    pages = {733--778},
    year = {1964}
  }`);
  assert.equal(parsed.type, "enJournal");
  assert.equal(parsed.container, "Yale Law Journal");
});
