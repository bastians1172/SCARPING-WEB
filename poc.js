import puppeteer from 'puppeteer';
import fs from 'fs';
import crypto from 'crypto';
import { JSDOM } from 'jsdom';  // Menggunakan jsdom untuk parsing HTML

// Fungsi umum untuk memantau halaman berdasarkan selector yang diberikan
async function scrapePage(url, outputFileName, selector) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // Set user-agent dan viewport
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1280, height: 800 });

    // Akses halaman dan tunggu sampai selesai loading
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Ambil seluruh HTML halaman
    const pageHtml = await page.content();

    // Gunakan jsdom untuk parsing HTML
    const dom = new JSDOM(pageHtml);
    const document = dom.window.document;

    // Hitung hash dari HTML halaman
    const hash = crypto.createHash('sha256').update(pageHtml).digest('hex');

    // Simpan HTML dan hash baru
    const result = {
      html: pageHtml,
      hash: hash
    };

    fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2), 'utf8');
    console.log(`✅ Data and hash saved to ${outputFileName}`);

    // Ekstrak data berdasarkan selector yang diberikan
    const extractedData = [];
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      extractedData.push(element.textContent.trim());
    });

    console.log('Extracted Data:', extractedData);

    await browser.close();
  } catch (error) {
    console.error("Error fetching page details:", error);
  }
}

// Contoh penggunaan untuk berbagai tugas:
const jobPageUrl = 'https://www.upwork.com/nx/search/jobs/?page=1&per_page=50';  // URL halaman lowongan
const newsPageUrl = 'https://news.ycombinator.com/';  // URL berita
const linkedinUrl = 'https://www.linkedin.com/in/someprofile/';  // URL LinkedIn

const outputJobFileName = 'upwork_jobs_with_hash.json';
const outputNewsFileName = 'news_with_hash.json';
const outputLinkedInFileName = 'linkedin_with_hash.json';

// Menjalankan untuk berbagai tugas
scrapePage(jobPageUrl, outputJobFileName, 'div.job-tile-header');  // Memantau lowongan kerja
scrapePage(newsPageUrl, outputNewsFileName, 'a.storylink');  // Memantau berita
scrapePage(linkedinUrl, outputLinkedInFileName, '.pv-entity__secondary-title');  // Memantau LinkedIn
