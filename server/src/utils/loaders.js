import * as cheerio from "cheerio";

import mammoth from "mammoth";

import { extractText, getDocumentProxy } from "unpdf";

// ওয়েবপেজ থেকে লেখা
export async function readUrl(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`পেজ লোড হয়নি (${res.status})`);

  const $ = cheerio.load(await res.text());
  $("script, style, nav, footer, header, noscript").remove(); // অপ্রয়োজনীয় অংশ বাদ
  return $("title").text() + "\n" + $("body").text();
}

// PDF, DOCX, TXT ফাইল থেকে লেখা
export async function readFile(file) {
  const name = file.originalname.toLowerCase();

  if (name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(file.buffer));
    return (await extractText(pdf, { mergePages: true })).text;
  }
  if (name.endsWith(".docx")) {
    return (await mammoth.extractRawText({ buffer: file.buffer })).value;
  }
  if (/\.(txt|md|csv)$/.test(name)) {
    return file.buffer.toString("utf8");
  }
  throw new Error("শুধু PDF, DOCX, TXT, MD, CSV ফাইল চলবে");
}
