import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "法引 · Citation CN",
    template: "%s | 法引",
  },
  description: "依据《法学引注手册》（2019）的本地参考文献格式转换工具。",
  applicationName: "法引",
  keywords: ["法学引注", "参考文献", "引注格式", "法学引注手册"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
