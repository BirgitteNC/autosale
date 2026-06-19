import { spawn } from 'child_process';

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(url);
      return true; // Server er oppe!
    } catch (e) {
      // Vent 1 sekund og prøv igen
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

async function runTest(file) {
  return new Promise((resolve, reject) => {
    console.log(`\n--- Starter test: ${file} ---`);
    const proc = spawn('node', [file], { stdio: 'inherit' });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Test fejlede med kode ${code}`));
    });
  });
}

async function runAll() {
  console.log("Starter lokal udviklingsserver til test...");
  
  // Start Vite i baggrunden
  const server = spawn('npm', ['run', 'dev'], { stdio: 'ignore', shell: true });

  // Vent på at serveren svarer
  const isUp = await waitForServer('http://localhost:5173');
  if (!isUp) {
    console.error("Fejl: Kunne ikke starte den lokale server.");
    server.kill();
    process.exit(1);
  }

  console.log("Server kører. Starter test suite...");

  try {
    await runTest('scripts/audit_database.js');
    await runTest('e2e/smoke_test.js');
    await runTest('e2e/comprehension_test.js');
    console.log("\n✅ ALLE TESTS BESTÅET! Systemet er stabilt og klar til deploy.");
    server.kill();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TESTS FEJLEDE:", err.message);
    console.error("Vercel Deployment Blokeret af Nørde-Niels!");
    server.kill();
    process.exit(1);
  }
}

runAll();
