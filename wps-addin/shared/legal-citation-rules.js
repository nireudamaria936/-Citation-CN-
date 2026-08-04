/**
 * 《法学引注手册》（2019）的可执行规则目录。
 *
 * 这里保存的是经过压缩、可供程序读取的规则摘要，不替代手册原文。
 * checker 会用 ruleId 把发现的问题映射回本目录，便于 WPS 批注说明依据。
 */
export const RULE_VERSION = "《法学引注手册》2019";

export const RULE_SECTIONS = [
  {
    id: "general",
    title: "一般规范",
    rules: [
      { id: "G01", title: "必要、适度、可核查", detail: "只为需要交代出处的观点、法律文件、案例、事件和统计数据引注；优先真实、相关、权威的原初来源。" },
      { id: "G02", title: "页下注与连续编码", detail: "注释原则上采用页下脚注，文章建议连续编码；图书各篇章可连续编码。" },
      { id: "G03", title: "引注符号位置", detail: "全句引用置于句号、问号等标点之后；句中局部引用置于对应部分之后；直接引语的符号紧接引号并置于其他标点之前。" },
      { id: "G04", title: "引领词", detail: "概括引用用“参见”，直接引用可用“见”或省略；互证用“又见”，补充相关观点用“另见”，未核实原初文献用“转引自”，来源载体前用“载”。" },
      { id: "G05", title: "标点与空格", detail: "遵循 GB/T 15834-2011；中文引注使用中文标点，中文标点前后不留多余空格；并列文献用分号分隔。" },
      { id: "G06", title: "多次引用与多来源", detail: "首次完整著录；后续可用前注序号、作者、题名和页码简写；相邻且完全相同的文献可用“同上注”或外文习惯表达。原则上引用最早、最权威来源。" },
      { id: "G07", title: "图表与文中夹注", detail: "图表可页下注或置于图表下方，分别用图形来源、数据来源等引领；古籍简短出处可用《书名·篇名》夹注，外文人名和术语首次出现可夹注原文。" },
      { id: "G08", title: "结尾标点", detail: "中文引注以中文句号收束；英文、法文、德文、日文引注以西文句号收束。" },
    ],
  },
  {
    id: "chinese-publication",
    title: "中文纸质出版物",
    rules: [
      { id: "CN01", title: "作者与贡献者", detail: "原创作者置于题名前；主编、编、编著、译注、整理、点校等按版权页标明并置于题名后；外籍作者前用方括号标国籍。" },
      { id: "CN02", title: "合作作者与省略", detail: "两人全部列明；三人以上首次可全部列明，后续可首作者加“等”；常用古籍、辞书、个人文集在不引起误解时可省略作者。" },
      { id: "CN03", title: "题名与书名号", detail: "文章、图书、期刊、法律文件用书名号；首次使用全称；主副标题依原文，缺少分隔时用冒号；不同主题并列用空格。" },
      { id: "CN04", title: "图书版本与出版信息", detail: "出版社名称完整且不写城市；只写年份，初版不标“第1版”，再版标修订版、增订版或第X版；联合出版机构用顿号。" },
      { id: "CN05", title: "期刊与文集", detail: "期刊为《刊名》YYYY年第X期；文集文章用“载+编者+《文集》+出版社+年份”；连续出版物用第X卷/第X辑。" },
      { id: "CN06", title: "报纸与网络", detail: "报纸标载、刊名、年月日，必要时标版次；网络文献标网站、上传日期和 URL，缺日期或动态页面时标访问日期。" },
      { id: "CN07", title: "页码与章节", detail: "特定内容标第X页；不连续页码用顿号，连续页码用短横线；必要时可用卷、章、节、条目替代页码。" },
      { id: "CN08", title: "学位、会议、档案与未发表材料", detail: "学位论文标学校、年份、学位层级；会议论文标会议、时间、地点并确认可引用；档案标形成时间、保管机构和档案号；访谈、私人通讯、内部资料应谨慎并尽量获同意。" },
      { id: "CN09", title: "网络、电视、音像", detail: "纸质版本存在时优先引用纸质来源；博客/公众号仅谨慎引用原创；电视节目标电视台、栏目和播出时间；CD/DVD 标名称、制作单位和发行时间。" },
    ],
  },
  {
    id: "chinese-law",
    title: "中文法律文件",
    rules: [
      { id: "LAW01", title: "法律名称", detail: "法律文件名称加书名号；试行、草案和刑法修正案序号属于名称组成部分。中华人民共和国通常可在不引起误解时省略。" },
      { id: "LAW02", title: "法律版本与效力", detail: "修改法律标明制定/修改年份；已经失效的文件标明“已废止”，除非正文已交代。" },
      { id: "LAW03", title: "条款序数", detail: "著录式引用的条、款、项、目使用阿拉伯数字；原文引述可保留汉字条款序数；文件名称内部的条款序数不得改写。" },
      { id: "LAW04", title: "法律、法规、规章", detail: "法律一般只写名称和条文序数；法规规章必要时写制定机关和年份；完整引用法条时保留原文款项层级。" },
      { id: "LAW05", title: "规范性文件", detail: "名称后写制定机关文件号，年份使用六角括号〔〕；必要时标发布日期和可查载体；附件名称与通知名称区分。" },
      { id: "LAW06", title: "国家标准、立法说明、会议决议", detail: "国家标准写发布机关、名称、标准号；立法说明写报告人、报告名称和场合；会议决议写名称、机关和日期。" },
      { id: "LAW07", title: "外国法、国际公约、台湾地区文件", detail: "中文译本可标国别/国际组织和年份；必要时标外文和译者；外国法条款通常用阿拉伯数字；台湾地区法律按语境加必要限定和引号。" },
    ],
  },
  {
    id: "chinese-case",
    title: "中文司法案例与统计",
    rules: [
      { id: "CASE01", title: "案例名称", detail: "民事/行政案件为原告诉被告案由案；刑事案件为被告人罪名案；正式案例一般不加引号，非正式名称谨慎加引号。" },
      { id: "CASE02", title: "案号与法院", detail: "写全审判法院、文书名称和案号；年份用圆括号；法院代码开头的0原则上保留；案号中的“字”按现行规则省略。" },
      { id: "CASE03", title: "案例来源与时间", detail: "指导性案例标发布机关、序号和年份；公报案例可只引公报；裁判时间通常不写，只有有辨识需要时标注。" },
      { id: "STAT01", title: "统计数据与图表", detail: "统计数据标可靠来源；作者自算说明数据来源；避免样本不足时过度精确；图表先文后图，图题在下、表题在上并连续编号。" },
    ],
  },
  {
    id: "english",
    title: "英文文献与法律",
    rules: [
      { id: "EN01", title: "一般原则与人名", detail: "有合适中文译本时优先中文译本或同时提示；英文人名原则上全名、名在前姓在后；华人署名尊重原文，参考文献列举时姓可置前。" },
      { id: "EN02", title: "学术期刊", detail: "文章题名实词首字母大写并使用斜体；刊名全称、首字母大写且不斜体；卷号、首页、年份按期刊体例；特定页码逗号后直接写。" },
      { id: "EN03", title: "报刊、书籍与文集", detail: "报刊标年月日、版次或页码；书名斜体，出版社前不写地址，译者用 translated by；文集文章用 in、编辑者和 eds.。" },
      { id: "EN04", title: "美国联邦法规", detail: "Stat. 体例标 Pub. L. No.、条款、卷号、首页和年份；U.S.C. 体例标法名条款、卷号、U.S.C.、条号和版本年份；法律名省略定冠词 The。" },
      { id: "EN05", title: "美国与英国案例", detail: "美国案例用当事人 v. 当事人、报告系统、卷页和法院年份；英国案例按 AC、QB、Ch、WLR、All ER 等报告系统著录。" },
      { id: "EN06", title: "英文网络文献", detail: "标作者、文章名、网站、上传日期或访问日期和 URL；不易查找的纸质来源可在正式来源后补网络链接。" },
    ],
  },
  {
    id: "french-german-japanese",
    title: "法文、德文、日文文献",
    rules: [
      { id: "FR01", title: "法文学术、法律与判决", detail: "书名斜体、作者首字母大写；论文题名用法式双尖引号；法律标规范类型、编号和日期；判决标法院、审判庭、日期、案名和案号。" },
      { id: "FR02", title: "法文网络与重复引用", detail: "网络信息标上传日期或访问日期；同一文献后续可用 Ibid.、op. cit. 等法文习惯简写。" },
      { id: "DE01", title: "德文学术与法规", detail: "期刊作者全名，文章题名不加引号；页码用 S.，相邻两页用 f.、多页用 ff.；法规用 §、Art.、罗马数字和 Nr.。" },
      { id: "DE02", title: "德文案例与网络", detail: "判例标案例集/期刊、卷年、首页和具体页；网络文章原则上少用，必要时标作者、题名、URL 和访问日期。" },
      { id: "JA01", title: "日文书籍、论文与文集", detail: "书名用『』、论文名用「」；出版信息置于括号内，作者合作用＝，文集编者标編；年份统一公元纪年。" },
      { id: "JA02", title: "日文案例、法规与网络", detail: "案例写全法院、公元日期、判决和判例集；法规首次写全称；官方文件名称用「」并接による；纯网络文献仅在无正式来源时使用。" },
    ],
  },
];

export const RULE_CATALOG = RULE_SECTIONS.flatMap((section) => section.rules.map((rule) => ({
  ...rule,
  sectionId: section.id,
  sectionTitle: section.title,
})));

export function getRule(ruleId) {
  return RULE_CATALOG.find((rule) => rule.id === ruleId) || null;
}

export function getRulesForType(type) {
  const normalizedType = {
    book: "cnBook",
    journal: "cnJournal",
    chapter: "cnChapter",
    newspaper: "cnNewspaper",
    web: "cnWeb",
    thesis: "cnThesis",
    law: "cnLaw",
    regulation: "cnRegulation",
    case: "cnCase",
  }[type] || type;
  const ids = {
    cnBook: ["G02", "G05", "G08", "CN01", "CN03", "CN04", "CN07"],
    cnJournal: ["G02", "G05", "G08", "CN01", "CN03", "CN05", "CN07"],
    cnChapter: ["G02", "G05", "G08", "CN01", "CN05", "CN07"],
    cnNewspaper: ["G05", "G08", "CN03", "CN06"],
    cnWeb: ["G01", "G05", "G08", "CN06", "CN09"],
    cnThesis: ["G05", "G08", "CN01", "CN03", "CN07", "CN08"],
    cnLaw: ["G05", "G08", "LAW01", "LAW02", "LAW03", "LAW04"],
    cnRegulation: ["G05", "G08", "LAW01", "LAW02", "LAW05"],
    cnCase: ["G05", "G08", "CASE01", "CASE02", "CASE03"],
    cnStatistics: ["G02", "G03", "G05", "G08", "STAT01"],
    enJournal: ["G05", "G08", "EN01", "EN02"],
    enNewspaper: ["G05", "G08", "EN01", "EN03"],
    enBook: ["G05", "G08", "EN01", "EN03"],
    enChapter: ["G05", "G08", "EN01", "EN03"],
    enStatute: ["G05", "G08", "EN04"],
    enCase: ["G05", "G08", "EN05"],
    enWeb: ["G01", "G05", "G08", "EN06"],
    frAcademic: ["G05", "G08", "FR01"],
    frLaw: ["G05", "G08", "FR01"],
    frCase: ["G05", "G08", "FR01"],
    frWeb: ["G01", "G05", "G08", "FR02"],
    deAcademic: ["G05", "G08", "DE01"],
    deLaw: ["G05", "G08", "DE01"],
    deCase: ["G05", "G08", "DE02"],
    deWeb: ["G01", "G05", "G08", "DE02"],
    jaAcademic: ["G05", "G08", "JA01"],
    jaLaw: ["G05", "G08", "JA02"],
    jaCase: ["G05", "G08", "JA02"],
    jaWeb: ["G01", "G05", "G08", "JA02"],
  }[normalizedType] || ["G01", "G05", "G08"];
  return ids.map(getRule).filter(Boolean);
}
