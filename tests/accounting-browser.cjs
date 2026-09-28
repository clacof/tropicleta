// Run against an isolated production instance; needs Playwright installed or PLAYWRIGHT_MODULE set.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const fs = require('node:fs');

async function main() {
  const password = randomUUID();
  const port = 3101;
  const base = `http://localhost:${port}`;
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', String(port)], {
    env: { ...process.env, DATABASE_URL: '', PGLITE_DIR: `./.data/test-${randomUUID()}`, ADMIN_PASSWORD: password, SESSION_SECRET: randomUUID() },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  let output = '';
  server.stdout.on('data', b => { output += b; });
  server.stderr.on('data', b => { output += b; });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 120; i++) {
      try { if ((await fetch(base + '/admin/login/')).ok) { ready = true; break; } } catch {}
      if (server.exitCode !== null) throw new Error(output);
      await new Promise(r => setTimeout(r, 1000));
    }
    assert.ok(ready, output);
    console.log('Server ready');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(90000);
    page.setDefaultNavigationTimeout(120000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/admin/contabilidad/', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/admin/login/');
    assert.equal((await page.request.get(base + '/admin/contabilidad/exportar/')).status(), 401);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await page.waitForURL('**/admin/');
    console.log('Login and access protection passed');
    await page.getByRole('link', { name: 'Contabilidad', exact: true }).click();
    await page.getByRole('heading', { name: 'Contabilidad', exact: true }).waitFor();
    await page.getByLabel('Monto en CLP').fill('25000');
    await page.getByLabel('Descripción', { exact: true }).fill('Ingreso de verificación');
    await page.getByRole('button', { name: 'Registrar movimiento' }).click();
    await page.getByText('Movimiento registrado correctamente.').waitFor();
    await page.getByRole('cell', { name: 'Ingreso de verificación', exact: true }).waitFor();
    await page.reload();
    await page.getByRole('cell', { name: 'Ingreso de verificación', exact: true }).waitFor();
    console.log('Income persisted after reload');
    await page.locator('select[name="type"]').selectOption('gasto');
    await page.getByLabel('Monto en CLP').fill('4000');
    await page.getByLabel('Descripción', { exact: true }).fill('Gasto de verificación');
    await page.getByRole('button', { name: 'Registrar movimiento' }).click();
    await page.getByRole('cell', { name: 'Gasto de verificación', exact: true }).waitFor();
    const row = page.getByRole('row').filter({ hasText: 'Gasto de verificación' });
    await row.getByText('Anular', { exact: true }).click();
    await row.getByLabel('Motivo de anulación').fill('Corrección de prueba');
    await row.getByRole('button', { name: 'Confirmar anulación' }).click();
    await row.getByText('Corrección de prueba').waitFor();
    const csv = await page.request.get(new URL(await page.getByRole('link', { name: 'Descargar CSV' }).getAttribute('href'), base).href);
    assert.equal(csv.status(), 200);
    assert.match(await csv.text(), /Ingreso de verificación/);
    fs.mkdirSync('.data', { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: '.data/accounting-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '.data/accounting-mobile.png', fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile horizontal overflow');
    await page.getByRole('button', { name: 'Salir', exact: true }).click();
    await page.waitForURL('**/admin/login/');
    assert.equal((await page.request.get(base + '/admin/contabilidad/exportar/')).status(), 401);
    assert.deepEqual(errors, []);
    console.log('PASS: authentication, protected export, login, income, expense, persistence, void, CSV, mobile overflow, logout, no browser exceptions');
  } finally {
    server.kill();
    if (browser) await browser.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
