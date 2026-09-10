const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file:///Users/volkankockan/Desktop/marmara-yenileniyoruz.html');
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/mb-desktop.png' });
  const p2 = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p2.goto('file:///Users/volkankockan/Desktop/marmara-yenileniyoruz.html');
  await p2.waitForTimeout(2500);
  await p2.screenshot({ path: '/tmp/mb-mobile.png', fullPage: true });
  // sahneyi yakından
  await p.locator('.mb-stage').screenshot({ path: '/tmp/mb-stage.png' });
  await b.close();
})();
