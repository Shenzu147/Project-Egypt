// Sonda CDP para bloque I1+6 (Actividades/Kanban)
// Adaptar puertos/paths segun entorno local.

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file:///C:/Users/jdeb1/Project Egypt/Maatly/Maatly1.html');

  // Boot en español
  await page.waitForSelector('#kanbanBoard');
  const cols = await page.$$('.kanban-col');
  console.log('BOOT ES: columnas =', cols.length);
  // TODO: asertos de textos base del Kanban en ES

  // Cambiar idioma a inglés sin recarga (invocar funcion de cambio)
  // TODO: await page.evaluate(() => cambiarIdioma('en')); o equivalente
  console.log('CAMBIO A EN');
  // TODO: asertos de textos clave en inglés (board, modales, chips, toasts)

  // Volver a español
  // TODO: await page.evaluate(() => cambiarIdioma('es'));
  console.log('VUELTA A ES');
  // TODO: asertos de textos en español

  // Persistencia tras recarga
  await page.reload();
  await page.waitForSelector('#kanbanBoard');
  console.log('RECARGA OK');

  // Captura
  await page.screenshot({ path: 'probe_v053_actividades_en.png' });

  await browser.close();
  console.log('SONDA OK');
})();
