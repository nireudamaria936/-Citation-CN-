import type { Metadata } from "next";
import CitationApp from "./CitationApp";

export const metadata: Metadata = {
  title: "法引 · 法学参考文献格式转换",
  description: "将 GB/T 7714、BibTeX、RIS 等参考文献转换为《法学引注手册》确认的格式。",
};

export default function Home() {
  return <CitationApp />;
}
