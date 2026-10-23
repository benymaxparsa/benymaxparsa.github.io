import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const port of [4321]) {
  const p = await b.newPage(); await p.setViewport({ width: 412, height: 823, isMobile: true, deviceScaleFactor: 2 });
  const c = await p.createCDPSession();
  await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.emulateNetworkConditions({ download: 1.6e6 / 8 * 0.9, upload: 750e3 / 8 * 0.9, latency: 150 });
  await p.evaluateOnNewDocument(() => { window.__ls = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__ls.push({ v: e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources.map((s) => `${s.node?.nodeName}.${s.node?.className} ${JSON.stringify(s.previousRect)}->${JSON.stringify(s.currentRect)}`) }))).observe({ type: 'layout-shift', buffered: true }); });
  await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  console.log(JSON.stringify(await p.evaluate(() => window.__ls), null, 1));
}
await b.close();
