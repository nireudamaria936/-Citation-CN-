const TYPE_LABELS = {
  book: "中文图书",
  journal: "中文期刊文章",
  chapter: "中文文集文章",
  newspaper: "中文报纸文章",
  web: "中文网络文章",
  thesis: "学位论文",
  law: "法律文件",
  regulation: "规范性文件",
  case: "司法案例",
  enJournal: "英文期刊文章",
  enNewspaper: "英文报刊文章",
  enBook: "英文图书",
  enChapter: "英文文集文章",
  enStatute: "英文法规",
  enCase: "英文司法案例",
  enWeb: "英文网络文章",
  frAcademic: "法文学术文献",
  frLaw: "法国法律",
  frCase: "法国法院判决",
  frWeb: "法文网络信息",
  deAcademic: "德文学术文献",
  deLaw: "德文法规",
  deCase: "德文案例",
  deWeb: "德文网络文章",
  jaAcademic: "日文学术文献",
  jaLaw: "日文法规",
  jaCase: "日文案例",
  jaWeb: "日文网络文献",
  cnStatistics: "中文统计数据",
};

export { TYPE_LABELS };

const clean = (value = "") => String(value).trim().replace(/\s+/g, " ");
const stripOuter = (value = "") => clean(value).replace(/^[《“「『\"']|[》”」』\"']$/g, "");
const finalStop = (value) => (/[。.]$/.test(value) ? value : `${value}。`);
const cnPages = (pages = "") => {
  const value = clean(pages).replace(/^(第|p\.?|pp\.?)/i, "").replace(/页$/u, "");
  return value ? `，第${value.replace(/[–—]/g, "-")}页` : "";
};
const enPages = (pages = "") => {
  const value = clean(pages).replace(/^pp?\.?\s*/i, "").replace(/[–—]/g, "-");
  return value ? `, p.${value}` : "";
};
const cnDate = (value = "") => {
  const match = clean(value).match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : clean(value);
};
const joinAuthorsCn = (value = "") => clean(value)
  .split(/\s*(?:,|，|;|；|、|\band\b|&)\s*/i)
  .filter(Boolean)
  .join("、");
const joinAuthorsEn = (value = "") => clean(value)
  .split(/\s*(?:;|；|\band\b|&)\s*/i)
  .filter(Boolean)
  .reduce((result, author, index, list) => {
    if (index === 0) return author;
    return `${result}${index === list.length - 1 ? " & " : ", "}${author}`;
  }, "");

function validate(record) {
  const required = {
    book: ["author", "title", "publisher", "year"],
    journal: ["author", "title", "container", "year", "issue"],
    chapter: ["author", "title", "editor", "container", "publisher", "year"],
    newspaper: ["title", "container", "date"],
    web: ["title", "site", "url"],
    thesis: ["author", "title", "institution", "year", "degree"],
    law: ["title"],
    regulation: ["title", "documentNumber"],
    case: ["caseName", "court", "docket"],
    enJournal: ["author", "title", "container", "volume", "firstPage", "year"],
    enNewspaper: ["author", "title", "container", "date"],
    enBook: ["author", "title", "publisher", "year"],
    enChapter: ["author", "title", "editor", "container", "publisher", "year"],
    enStatute: ["title", "section", "reporter", "year"],
    enCase: ["caseName", "reporter", "year"],
    enWeb: ["author", "title", "site", "url"],
  }[record.type] || [];
  return required.filter((field) => !clean(record[field])).map((field) => field);
}

export function formatCitation(record) {
  const r = { ...record };
  let output = "";
  switch (r.type) {
    case "book": {
      const author = joinAuthorsCn(r.author);
      const role = clean(r.role);
      const creator = author ? `${author}${role}：` : "";
      const edition = clean(r.edition) && !/^(第?1版|初版)$/u.test(clean(r.edition))
        ? `（${clean(r.edition)}）` : "";
      const contributor = clean(r.translator) ? `，${joinAuthorsCn(r.translator)}译` : "";
      output = `${creator}《${stripOuter(r.title)}》${edition}${contributor}，${clean(r.publisher)}${clean(r.year)}年版${cnPages(r.pages)}`;
      break;
    }
    case "journal":
      output = `${joinAuthorsCn(r.author)}：《${stripOuter(r.title)}》，载《${stripOuter(r.container)}》${clean(r.year)}年第${clean(r.issue)}期${cnPages(r.pages)}`;
      break;
    case "chapter":
      output = `${joinAuthorsCn(r.author)}：《${stripOuter(r.title)}》，载${joinAuthorsCn(r.editor)}${clean(r.editorRole) || "主编"}：《${stripOuter(r.container)}》，${clean(r.publisher)}${clean(r.year)}年版${cnPages(r.pages)}`;
      break;
    case "newspaper": {
      const author = clean(r.author) ? `${joinAuthorsCn(r.author)}：` : "";
      const edition = clean(r.edition) ? `，第${clean(r.edition).replace(/^第|版$/g, "")}版` : "";
      output = `${author}《${stripOuter(r.title)}》，载《${stripOuter(r.container)}》${cnDate(r.date)}${edition}`;
      break;
    }
    case "web": {
      const author = clean(r.author) ? `${joinAuthorsCn(r.author)}：` : "";
      const date = clean(r.date) ? cnDate(r.date) : "";
      const access = clean(r.accessed) ? `，${cnDate(r.accessed)}访问` : "";
      output = `${author}《${stripOuter(r.title)}》，载${clean(r.site)}${date ? `，${date}` : ""}，${clean(r.url)}${access}`;
      break;
    }
    case "thesis":
      output = `${joinAuthorsCn(r.author)}：《${stripOuter(r.title)}》，${clean(r.institution)}${clean(r.year)}年${clean(r.degree)}学位论文${cnPages(r.pages)}`;
      break;
    case "law": {
      const version = clean(r.version) ? `（${clean(r.version)}）` : "";
      const article = clean(r.article) ? `第${clean(r.article).replace(/^第|条$/g, "")}条` : "";
      const paragraph = clean(r.paragraph) ? `第${clean(r.paragraph).replace(/^第|款$/g, "")}款` : "";
      const item = clean(r.item) ? `第${clean(r.item).replace(/^第|项$/g, "")}项` : "";
      output = `《${stripOuter(r.title).replace(/^中华人民共和国/u, "")}》${version}${article}${paragraph}${item}`;
      break;
    }
    case "regulation": {
      const issued = clean(r.date) ? `，${cnDate(r.date)}发布` : "";
      const article = clean(r.article) ? `，第${clean(r.article).replace(/^第|条$/g, "")}条` : "";
      output = `《${stripOuter(r.title)}》，${normalizeDocumentNumber(r.documentNumber)}${issued}${article}`;
      break;
    }
    case "case": {
      const date = clean(r.date) ? `，${cnDate(r.date)}` : "";
      output = `${clean(r.caseName)}，${clean(r.court)}${normalizeDocket(r.docket)}${clean(r.documentType) || "判决书"}${date}`;
      break;
    }
    case "enJournal": {
      const pinpoint = clean(r.pages) ? `, ${clean(r.pages).replace(/^p+\.?\s*/i, "").replace(/[–—]/g, "-")}` : "";
      output = `${joinAuthorsEn(r.author)}, ${clean(r.title)}, ${clean(r.volume)} ${clean(r.container)} ${clean(r.firstPage)}${pinpoint} (${clean(r.year)})`;
      return `${output}.`;
    }
    case "enBook": {
      const translator = clean(r.translator) ? `, translated by ${clean(r.translator)}` : "";
      output = `${joinAuthorsEn(r.author)}, ${clean(r.title)}${translator}, ${clean(r.publisher)}, ${clean(r.year)}${enPages(r.pages)}`;
      return `${output}.`;
    }
    case "enNewspaper": {
      const edition = clean(r.edition) ? `, at ${clean(r.edition)}` : "";
      const page = clean(r.pages) ? `, p.${clean(r.pages).replace(/^p\.?\s*/i, "")}` : "";
      output = `${joinAuthorsEn(r.author)}, ${clean(r.title)}, ${clean(r.container)}, ${clean(r.date)}${edition}${page}`;
      return `${output}.`;
    }
    case "enChapter": {
      const editors = joinAuthorsEn(r.editor);
      const editorRole = editors ? `${editors} ${editors.includes(" & ") || editors.includes(", ") ? "eds." : "ed."}` : "";
      output = `${joinAuthorsEn(r.author)}, ${clean(r.title)}, in ${editorRole ? `${editorRole}, ` : ""}${clean(r.container)}, ${clean(r.publisher)}, ${clean(r.year)}${enPages(r.pages)}`;
      return `${output}.`;
    }
    case "enStatute": {
      const section = clean(r.section) ? ` § ${clean(r.section)}` : "";
      const reporter = clean(r.reporter) ? `, ${clean(r.reporter)}` : "";
      output = `${clean(r.title)}${section}${reporter} (${clean(r.year)})`;
      return `${output}.`;
    }
    case "enCase": {
      const court = clean(r.court) ? ` (${clean(r.court)} ${clean(r.year)})` : ` (${clean(r.year)})`;
      output = `${clean(r.caseName)}, ${clean(r.reporter)}${court}`;
      return `${output}.`;
    }
    case "enWeb": {
      const date = clean(r.date) ? ` (${clean(r.date)})` : "";
      const accessed = clean(r.accessed) ? ` (accessed ${clean(r.accessed)})` : "";
      output = `${joinAuthorsEn(r.author)}, ${clean(r.title)}, ${clean(r.site)}${date}, ${clean(r.url)}${accessed}`;
      return `${output}.`;
    }
    case "frAcademic":
      output = `${clean(r.author)}, ${clean(r.title)}, ${clean(r.container) ? `${clean(r.container)}, ` : ""}${clean(r.publisher) ? `${clean(r.publisher)}, ` : ""}${clean(r.year)}${clean(r.pages) ? `, p. ${clean(r.pages)}` : ""}`;
      return `${output}.`;
    case "frLaw":
      output = `${clean(r.kind)}${clean(r.number) ? ` n° ${clean(r.number)}` : ""}${clean(r.date) ? ` du ${clean(r.date)}` : ""}${clean(r.title) ? ` ${clean(r.title)}` : ""}`;
      return `${output}.`;
    case "frCase":
      output = `${clean(r.court)}, ${clean(r.date)}, ${clean(r.caseName)}${clean(r.number) ? `, n° ${clean(r.number)}` : ""}`;
      return `${output}.`;
    case "frWeb":
      output = `${clean(r.author) ? `${clean(r.author)}, ` : ""}${clean(r.title)}, [En ligne: ${clean(r.url)}]${clean(r.accessed) ? `, consulté le ${clean(r.accessed)}` : ""}`;
      return `${output}.`;
    case "deAcademic":
      output = `${clean(r.author)}, ${clean(r.title)}, ${clean(r.container)}${clean(r.volume) ? ` ${clean(r.volume)}` : ""}${clean(r.year) ? ` (${clean(r.year)})` : ""}${clean(r.pages) ? `, S. ${clean(r.pages)}` : ""}`;
      return `${output}.`;
    case "deLaw":
      output = `${clean(r.section) ? `${clean(r.section)} ` : ""}${clean(r.title)}`;
      return `${output}.`;
    case "deCase":
      output = `${clean(r.court)} ${clean(r.reporter)}${clean(r.year) ? ` ${clean(r.year)}` : ""}, ${clean(r.pages) ? clean(r.pages) : ""}`.replace(/, $/u, "");
      return `${output}.`;
    case "deWeb":
      output = `${clean(r.author) ? `${clean(r.author)}, ` : ""}${clean(r.title)}, URL: ${clean(r.url)}${clean(r.accessed) ? ` (abgerufen am ${clean(r.accessed)})` : ""}`;
      return `${output}.`;
    case "jaAcademic":
      output = `${clean(r.author)}『${stripOuter(r.title)}』${clean(r.container) ? `${clean(r.container)}` : ""}${clean(r.publisher) ? `（${clean(r.publisher)}，${clean(r.year)}年）` : ""}${clean(r.pages) ? `${clean(r.pages)}頁` : ""}`;
      return `${output}。`;
    case "jaLaw":
      output = clean(r.title);
      return `${output}。`;
    case "jaCase":
      output = `${clean(r.court)}${clean(r.date) ? clean(r.date) : ""}判決${clean(r.reporter) ? `，${clean(r.reporter)}` : ""}`;
      return `${output}。`;
    case "jaWeb":
      output = `${clean(r.title)}，${clean(r.url)}${clean(r.date) ? `，${clean(r.date)}` : ""}`;
      return `${output}。`;
    default:
      return clean(r.raw);
  }
  return finalStop(output.replace(/，+/g, "，").replace(/，。$/u, "。"));
}

function normalizeDocumentNumber(value = "") {
  return clean(value).replace(/[\[【](\d{4})[\]】]/g, "〔$1〕");
}

function normalizeDocket(value = "") {
  const docket = clean(value).replace(/[\[【](\d{4})[\]】]/g, "（$1）");
  return docket && !/^（/.test(docket) ? `，${docket}，` : docket;
}

function record(type, fields, raw, confidence = "medium", warnings = []) {
  const value = { type, ...fields, raw, confidence, warnings };
  const missing = validate(value);
  if (missing.length) value.warnings.push(`缺少必要字段：${missing.join("、")}`);
  return value;
}

function parseBibTeX(text) {
  const entries = [];
  const chunks = [];
  let start = -1;
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (start < 0 && text[index] === "@") start = index;
    if (start < 0) continue;
    if (text[index] === "{") depth += 1;
    if (text[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        chunks.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }
  for (const chunk of chunks) {
    const match = chunk.match(/^@(\w+)\s*\{[^,]*,([\s\S]*)\}$/);
    if (!match) continue;
    const fields = {};
    const fieldPattern = /(\w+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)")\s*,?/g;
    let field;
    while ((field = fieldPattern.exec(match[2]))) fields[field[1].toLowerCase()] = clean(field[2] ?? field[3]);
    const author = (fields.author || "").replace(/\s+and\s+/gi, "; ");
    const kind = match[1].toLowerCase();
    if (["article"].includes(kind)) {
      entries.push(record(/^[\x00-\x7F]*$/.test(fields.title || "") ? "enJournal" : "journal", {
        author, title: fields.title, container: fields.journal, year: fields.year,
        issue: fields.number, volume: fields.volume, firstPage: (fields.pages || "").split(/[-–—]/)[0], pages: fields.pages,
      }, chunk, "high"));
    } else if (["phdthesis", "mastersthesis"].includes(kind)) {
      entries.push(record("thesis", { author, title: fields.title, institution: fields.school, year: fields.year, degree: kind === "phdthesis" ? "博士" : "硕士", pages: fields.pages }, chunk, "high"));
    } else if (["incollection", "inbook"].includes(kind)) {
      entries.push(record("chapter", { author, title: fields.title, editor: fields.editor, container: fields.booktitle, publisher: fields.publisher, year: fields.year, pages: fields.pages }, chunk, "high"));
    } else {
      entries.push(record(/^[\x00-\x7F]*$/.test(fields.title || "") ? "enBook" : "book", { author, title: fields.title, publisher: fields.publisher, year: fields.year, edition: fields.edition, translator: fields.translator, pages: fields.pages }, chunk, "high"));
    }
  }
  return entries;
}

function parseRIS(text) {
  return text.split(/\nER\s{0,2}-\s*/).map((block) => clean(block)).filter(Boolean).map((block) => {
    const fields = {};
    for (const line of block.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9]{2})\s{0,2}-\s?(.*)$/);
      if (!match) continue;
      fields[match[1]] = fields[match[1]] ? `${fields[match[1]]}; ${match[2]}` : match[2];
    }
    const risType = fields.TY;
    const author = fields.AU || fields.A1 || "";
    const ascii = /^[\x00-\x7F]*$/.test(fields.T1 || fields.TI || "");
    if (["JOUR", "JFULL"].includes(risType)) return record(ascii ? "enJournal" : "journal", {
      author, title: fields.T1 || fields.TI, container: fields.JO || fields.JF || fields.T2,
      year: (fields.PY || fields.Y1 || "").slice(0, 4), issue: fields.IS, volume: fields.VL,
      firstPage: fields.SP, pages: fields.EP ? `${fields.SP}-${fields.EP}` : fields.SP,
    }, block, "high");
    if (["THES"].includes(risType)) return record("thesis", { author, title: fields.T1 || fields.TI, institution: fields.PB, year: (fields.PY || "").slice(0, 4), degree: "博士/硕士" }, block, "medium", ["请核对学位层级"]);
    return record(ascii ? "enBook" : "book", { author, title: fields.T1 || fields.TI, publisher: fields.PB, year: (fields.PY || fields.Y1 || "").slice(0, 4), pages: fields.SP }, block, "high");
  });
}

function parsePlainLine(line) {
  const raw = line;
  const value = clean(line).replace(/^\s*\[?\d+\]?\s*[.、]?\s*/, "").replace(/[。.]$/, "");
  const marker = value.match(/\[([A-Z]+)(?:\/[A-Z]+)?\]/i)?.[1]?.toUpperCase();
  const normalized = value.replace(/\[[A-Z]+(?:\/[A-Z]+)?\]/i, "");
  const parts = normalized.split(/\s*[.。]\s*/).filter(Boolean);
  if (marker === "J" && parts.length >= 3) {
    const info = parts.slice(2).join(" ");
    const year = info.match(/(\d{4})/)?.[1] || "";
    const issue = info.match(/\d{4}\s*[,，]?\s*\(?\s*(\d+)\s*\)?/)?.[1] || "";
    const pages = info.match(/[:：]\s*([\d–—-]+)/)?.[1] || "";
    return record(/^[\x00-\x7F]*$/.test(parts[1]) ? "enJournal" : "journal", { author: parts[0], title: parts[1], container: parts[2].replace(/[,，].*$/, ""), year, issue, pages, volume: info.match(/[,，]\s*(\d+)\s*\(/)?.[1] || "", firstPage: pages.split("-")[0] }, raw, "medium", ["由普通文本推断，请核对期刊卷期与页码"]);
  }
  if (marker === "D" && parts.length >= 3) {
    const info = parts.slice(2).join(" ");
    return record("thesis", { author: parts[0], title: parts[1], institution: parts[2].replace(/[,，].*$/, ""), year: info.match(/\d{4}/)?.[0] || "", degree: "博士/硕士" }, raw, "medium", ["请核对学位层级"]);
  }
  if ((marker === "EB" || /https?:\/\//i.test(value))) {
    const url = value.match(/https?:\/\/\S+/i)?.[0]?.replace(/[。.]$/, "") || "";
    return record("web", { author: parts[0], title: parts[1] || parts[0], site: parts[2]?.replace(/[,，].*$/, "") || "网站", date: value.match(/\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}/)?.[0] || "", url }, raw, "low", ["网页字段为自动推断，请重点核对网站名与日期"]);
  }
  if ((marker === "M" || !marker) && parts.length >= 3) {
    const tail = parts.slice(2).join(" ");
    const publisherInfo = tail.replace(/^.*?[:：]/, "");
    return record(/^[\x00-\x7F]*$/.test(parts[1]) ? "enBook" : "book", { author: parts[0], title: parts[1], publisher: publisherInfo.replace(/[,，]\s*\d{4}.*$/, ""), year: tail.match(/\d{4}/)?.[0] || "", pages: tail.match(/[:：]\s*([\d–—-]+)$/)?.[1] || "" }, raw, marker ? "medium" : "low", marker ? ["由 GB/T 文本推断，请核对出版社"] : ["未发现文献类型标识，暂按图书处理"]);
  }
  return record("book", { title: value }, raw, "low", ["无法可靠识别，请改用精准录入"]);
}

export function parseInput(text) {
  const input = text.trim();
  if (!input) return [];
  if (/^\s*@\w+\s*\{/m.test(input)) return parseBibTeX(input);
  if (/^TY\s{0,2}-/m.test(input)) return parseRIS(input);
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(parsePlainLine);
}

export const EXAMPLE_INPUT = `[1] 王名扬. 美国行政法[M]. 北京: 北京大学出版社, 2007.\n[2] 季卫东. 法律程序的意义：对中国法制建设的另一种思考[J]. 中国社会科学, 1993(1).`;
