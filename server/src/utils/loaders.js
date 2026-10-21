import * as cheerio from "cheerio";
import { chromium } from "playwright";
import mammoth from "mammoth";

import { extractText, getDocumentProxy } from "unpdf";

// ওয়েবপেজ থেকে লেখা
export async function readUrl(url) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    return await page.evaluate(() => document.body.innerText); // only the visible text
  } catch (err) {
    throw new Error(`Could not load the page: ${err.message}`);
  } finally {
    await browser.close();
  }
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
