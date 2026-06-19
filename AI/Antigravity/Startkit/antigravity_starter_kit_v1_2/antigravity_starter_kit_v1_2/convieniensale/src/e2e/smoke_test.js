import puppeteer from 'puppeteer';

async function runSmokeTest() {
  console.log("=== Nørde-Niels Smoke Test ===");
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  let errors = 0;

  page.on('pageerror', err => {
    console.error('❌ BROWSER ERROR (Crash):', err.toString());
    errors++;
  });

  const routesToTest = [
    '/staff',
    '/signage',
    '/recipe/rec_dk_1' // En af vores Dagrofa opskrifter
  ];

  for (const route of routesToTest) {
    console.log(`Tester rute: ${route}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
    
    // Check for "Opskrift ikke fundet" text som indikator for fejl på route
    const content = await page.content();
    if (content.includes('Opskrift ikke fundet')) {
       console.error(`❌ Fejl: Rute ${route} sagde "Opskrift ikke fundet".`);
       errors++;
    }
  }

  await browser.close();

  if (errors > 0) {
    console.error(`❌ Smoke testen fejlede med ${errors} fejl! Deployment afbrudt.`);
    process.exit(1);
  } else {
    console.log("✅ SUCCES! Ingen hvide skærme eller crashes fundet på nogen af siderne.");
    process.exit(0);
  }
}

runSmokeTest();
