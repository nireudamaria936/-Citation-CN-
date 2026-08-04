"use client";

import { useMemo, useState } from "react";
import { EXAMPLE_INPUT, formatCitation, parseInput, TYPE_LABELS } from "@/lib/citation.js";

type CitationRecord = Record<string, string | string[] | undefined> & {
  type: keyof typeof TYPE_LABELS;
  confidence?: string;
  warnings?: string[];
};

type Field = { key: string; label: string; placeholder?: string; wide?: boolean };

const COMMON_FIELDS: Record<string, Field[]> = {
  book: [
    { key: "author", label: "作者", placeholder: "王名扬" },
    { key: "role", label: "作者角色", placeholder: "主编、编（原创著作留空）" },
    { key: "title", label: "书名", placeholder: "美国行政法", wide: true },
    { key: "edition", label: "版本", placeholder: "第4版（初版留空）" },
    { key: "translator", label: "译者", placeholder: "郑戈" },
    { key: "publisher", label: "出版社", placeholder: "北京大学出版社" },
    { key: "year", label: "出版年", placeholder: "2007" },
    { key: "pages", label: "页码", placeholder: "73-75" },
  ],
  journal: [
    { key: "author", label: "作者", placeholder: "季卫东" },
    { key: "title", label: "文章标题", placeholder: "法律程序的意义", wide: true },
    { key: "container", label: "期刊名称", placeholder: "中国社会科学" },
    { key: "year", label: "年份", placeholder: "1993" },
    { key: "issue", label: "期号", placeholder: "1" },
    { key: "pages", label: "引用页码", placeholder: "163" },
  ],
  chapter: [
    { key: "author", label: "文章作者", placeholder: "王保树" },
    { key: "title", label: "文章标题", placeholder: "股份有限公司机关构造中的董事和董事会", wide: true },
    { key: "editor", label: "文集编者", placeholder: "梁慧星" },
    { key: "editorRole", label: "编者角色", placeholder: "主编" },
    { key: "container", label: "文集名称", placeholder: "民商法论丛》第1卷" },
    { key: "publisher", label: "出版社", placeholder: "法律出版社" },
    { key: "year", label: "出版年", placeholder: "1994" },
    { key: "pages", label: "页码", placeholder: "110" },
  ],
  newspaper: [
    { key: "author", label: "作者", placeholder: "何海波" },
    { key: "title", label: "文章标题", placeholder: "判决书上网", wide: true },
    { key: "container", label: "报纸名称", placeholder: "法制日报" },
    { key: "date", label: "刊发日期", placeholder: "2000-05-21" },
    { key: "edition", label: "版次", placeholder: "2" },
  ],
  web: [
    { key: "author", label: "作者", placeholder: "汪波" },
    { key: "title", label: "文章标题", placeholder: "文章完整标题", wide: true },
    { key: "site", label: "网站名称", placeholder: "人民网" },
    { key: "date", label: "上传日期", placeholder: "2004-01-10" },
    { key: "url", label: "网页地址", placeholder: "https://example.com/article", wide: true },
    { key: "accessed", label: "访问日期（按需）", placeholder: "2026-08-01" },
  ],
  thesis: [
    { key: "author", label: "作者", placeholder: "李松锋" },
    { key: "title", label: "论文题目", placeholder: "游走在上帝与凯撒之间", wide: true },
    { key: "institution", label: "学术单位", placeholder: "中国政法大学" },
    { key: "year", label: "年份", placeholder: "2015" },
    { key: "degree", label: "学位层级", placeholder: "博士" },
    { key: "pages", label: "页码", placeholder: "55-58" },
  ],
  law: [
    { key: "title", label: "法律名称", placeholder: "中华人民共和国民法典", wide: true },
    { key: "version", label: "版本说明", placeholder: "2020年通过（无需说明则留空）" },
    { key: "article", label: "条", placeholder: "27" },
    { key: "paragraph", label: "款", placeholder: "2" },
    { key: "item", label: "项", placeholder: "3" },
  ],
  regulation: [
    { key: "title", label: "文件全称", placeholder: "国务院关于在全国建立农村最低生活保障制度的通知", wide: true },
    { key: "documentNumber", label: "文件号", placeholder: "国发〔2007〕19号" },
    { key: "date", label: "发布日期", placeholder: "2007-07-11" },
    { key: "article", label: "条（按需）", placeholder: "100" },
  ],
  case: [
    { key: "caseName", label: "案例名称", placeholder: "包郑照诉苍南县人民政府强制拆除房屋案", wide: true },
    { key: "court", label: "审判法院", placeholder: "浙江省高级人民法院" },
    { key: "docket", label: "案号", placeholder: "（1988）浙法民上字7号" },
    { key: "documentType", label: "文书类型", placeholder: "民事判决书" },
    { key: "date", label: "裁判日期（按需）", placeholder: "2017-12-16" },
  ],
  enJournal: [
    { key: "author", label: "Author", placeholder: "Charles A. Reich" },
    { key: "title", label: "Article title", placeholder: "The New Property", wide: true },
    { key: "container", label: "Journal", placeholder: "Yale Law Journal" },
    { key: "volume", label: "Volume", placeholder: "73" },
    { key: "firstPage", label: "First page", placeholder: "733" },
    { key: "pages", label: "Pinpoint pages", placeholder: "737-738" },
    { key: "year", label: "Year", placeholder: "1964" },
  ],
  enBook: [
    { key: "author", label: "Author", placeholder: "William P. Alford" },
    { key: "title", label: "Book title", placeholder: "To Steal a Book is an Elegant Offense", wide: true },
    { key: "translator", label: "Translator", placeholder: "William Rehg" },
    { key: "publisher", label: "Publisher", placeholder: "Stanford University Press" },
    { key: "year", label: "Year", placeholder: "1995" },
    { key: "pages", label: "Pages", placeholder: "98" },
  ],
};

const emptyRecord = (type: CitationRecord["type"] = "book"): CitationRecord => ({ type });

export default function CitationApp() {
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [records, setRecords] = useState<CitationRecord[]>([]);
  const [editor, setEditor] = useState<CitationRecord>({
    type: "book", author: "王名扬", title: "美国行政法", publisher: "北京大学出版社", year: "2007",
  });
  const [numbered, setNumbered] = useState(true);
  const [notice, setNotice] = useState("");

  const editorOutput = useMemo(() => formatCitation(editor), [editor]);
  const outputs = useMemo(() => records.map((item) => formatCitation(item)), [records]);

  const convert = () => {
    const parsed = parseInput(input) as CitationRecord[];
    setRecords(parsed);
    setNotice(parsed.length ? `已识别 ${parsed.length} 条文献` : "请先粘贴参考文献");
  };

  const copy = async (value: string, message = "已复制") => {
    await navigator.clipboard.writeText(value);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const loadEditor = (item: CitationRecord) => {
    setEditor({ ...item });
    document.getElementById("precise-editor")?.scrollIntoView({ behavior: "smooth" });
    setNotice("已载入精准编辑区");
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="法引首页">
          <span className="brand-mark">法</span>
          <span>法引 · Citation CN</span>
        </a>
        <nav aria-label="页面导航">
          <a href="#converter">批量转换</a>
          <a href="#precise-editor">精准录入</a>
          <a href="#rules">规则说明</a>
          <a href="https://github.com/nireudamaria936/-Citation-CN-" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">依据《法学引注手册》（2019）</span>
          <h1>把参考文献，整理成<br /><em>法学引注。</em></h1>
          <p>粘贴 GB/T 7714、BibTeX 或 RIS 文献，自动识别并转换；重要字段始终可回到精准录入区核对。</p>
          <div className="hero-points" aria-label="产品特点">
            <span>本地处理</span><span>批量转换</span><span>明确提示待核对项</span>
          </div>
        </div>
        <aside className="hero-card" aria-label="格式转换示例">
          <span className="sample-label">转换前 · GB/T 7714</span>
          <p>王名扬. 美国行政法[M]. 北京: 北京大学出版社, 2007.</p>
          <div className="turn-arrow">↓</div>
          <span className="sample-label result">转换后 · 法学引注</span>
          <p className="citation-serif">王名扬：《美国行政法》，北京大学出版社2007年版。</p>
        </aside>
      </section>

      <section className="workspace-section" id="converter">
        <div className="section-heading">
          <div><span className="step">01</span><h2>批量转换</h2></div>
          <p>每行一条普通文献；BibTeX 与 RIS 可整段粘贴。</p>
        </div>
        <div className="converter-grid">
          <div className="panel input-panel">
            <div className="panel-head">
              <strong>原始参考文献</strong>
              <button className="text-button" onClick={() => setInput(EXAMPLE_INPUT)}>载入示例</button>
            </div>
            <textarea aria-label="原始参考文献" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} />
            <div className="format-tags"><span>GB/T 7714</span><span>BibTeX</span><span>RIS</span></div>
            <button className="primary-button" onClick={convert}>开始转换 <span>→</span></button>
          </div>

          <div className="panel result-panel" aria-live="polite">
            <div className="panel-head">
              <strong>转换结果</strong>
              <label className="switch-label">
                <input type="checkbox" checked={numbered} onChange={(event) => setNumbered(event.target.checked)} />
                添加序号
              </label>
            </div>
            {!records.length ? (
              <div className="empty-state"><span>引</span><p>点击“开始转换”，结果会显示在这里。</p></div>
            ) : (
              <div className="result-list">
                {records.map((item, index) => (
                  <article className="result-item" key={`${index}-${String(item.raw)}`}>
                    <div className="result-meta">
                      <span>{TYPE_LABELS[item.type]}</span>
                      <span className={`confidence ${item.confidence}`}>{item.confidence === "high" ? "高置信度" : item.confidence === "medium" ? "建议核对" : "需要核对"}</span>
                    </div>
                    <p className="citation-serif">{numbered ? `〔${index + 1}〕` : ""}{outputs[index]}</p>
                    {item.warnings?.length ? <ul className="warnings">{item.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
                    <div className="item-actions">
                      <button onClick={() => loadEditor(item)}>核对字段</button>
                      <button onClick={() => copy(`${numbered ? `〔${index + 1}〕` : ""}${outputs[index]}`)}>复制</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {records.length > 1 ? <button className="secondary-button" onClick={() => copy(outputs.map((line, i) => `${numbered ? `〔${i + 1}〕` : ""}${line}`).join("\n"), "已复制全部引注")}>复制全部</button> : null}
          </div>
        </div>
      </section>

      <section className="editor-section" id="precise-editor">
        <div className="section-heading">
          <div><span className="step">02</span><h2>精准录入</h2></div>
          <p>字段越完整，结果越可靠。页码只填数字和连接号。</p>
        </div>
        <div className="editor-shell">
          <div className="type-rail" role="list" aria-label="文献类型">
            {(Object.keys(TYPE_LABELS) as CitationRecord["type"][]).map((type) => (
              <button key={type} className={editor.type === type ? "active" : ""} onClick={() => setEditor(emptyRecord(type))}>{TYPE_LABELS[type]}</button>
            ))}
          </div>
          <div className="field-area">
            <div className="field-grid">
              {COMMON_FIELDS[editor.type].map((field) => (
                <label key={field.key} className={field.wide ? "wide" : ""}>
                  <span>{field.label}</span>
                  <input value={String(editor[field.key] || "")} placeholder={field.placeholder} onChange={(event) => setEditor({ ...editor, [field.key]: event.target.value })} />
                </label>
              ))}
            </div>
            <div className="live-preview">
              <div><span>实时预览</span><button onClick={() => copy(editorOutput)}>复制结果</button></div>
              <p className="citation-serif">{editorOutput || "填写字段后将在此生成引注。"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rules-section" id="rules">
        <div className="section-heading light">
          <div><span className="step">03</span><h2>程序遵循的关键规则</h2></div>
        </div>
        <div className="rules-grid">
          <article><span>作者与题名</span><h3>作者： 《文献名称》</h3><p>合作作者用顿号；外籍作者可在姓名前标注国籍。</p></article>
          <article><span>出版信息</span><h3>出版社 + 年份 + “版”</h3><p>不写出版社所在城市；初版不标“第1版”。</p></article>
          <article><span>页码</span><h3>第55、64-68页</h3><p>连续页用短横线，多个不连续页用顿号。</p></article>
          <article><span>网页资料</span><h3>优先原始、权威来源</h3><p>通常写网站、上传日期和网址；动态页面加访问日期。</p></article>
        </div>
        <p className="disclaimer">提示：自动转换只能整理已有信息，不能替代对文献真实性、版本、权威性及引注必要性的人工审核。</p>
      </section>

      <footer><span>法引 · Citation CN</span><p>开源工具 · 数据仅在浏览器本地处理</p><p>规则依据：2019年《法学引注手册》</p></footer>
      {notice ? <div className="toast" role="status">{notice}</div> : null}
    </main>
  );
}
