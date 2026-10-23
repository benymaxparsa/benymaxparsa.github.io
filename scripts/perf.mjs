// Plan §6 step 6: throttled load (4x CPU, Fast 4G, 390x844). Prints LCP and CLS per run.
// Usage: node scripts/perf.mjs <baseUrl> [path] [runs]
import puppeteer from 'puppeteer-core';
const [base, path = '/', runs = '3'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const rows = [];
for (let i = 0; i < +runs; i++) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 });
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  // DevTools "Fast 4G": 9 Mbps down, 1.5 Mbps up, 60 ms RTT
  await page.emulateNetworkConditions({ download: (9e6 / 8) * 0.9, upload: (1.5e6 / 8) * 0.9, latency: 60 * 2.75 });
  await page.evaluateOnNewDocument(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(base + path, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  rows.push(await page.evaluate(() => [window.__lcp, window.__cls]));
  await page.close();
}
await browser.close();
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
console.log(`${base}${path}: LCP ${rows.map((r) => (r[0] / 1000).toFixed(2)).join(' ')} s (median ${(med(rows.map((r) => r[0])) / 1000).toFixed(2)}), CLS ${rows.map((r) => r[1].toFixed(3)).join(' ')}`);
