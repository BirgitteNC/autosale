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
  
  // Start Vite i baggrunden på en specifik port og host
  const server = spawn('npx', ['vite', '--port', '5180', '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore', shell: true });

  // Vent på at serveren svarer
  const isUp = await waitForServer('http://127.0.0.1:5180');
  if (!isUp) {
    console.error("Fejl: Kunne ikke starte den lokale server.");
    server.kill();
    process.exit(1);
  }

  console.log("Server kører. Starter test suite...");

  let totalErrors = 0;

  const tests = [
    'scripts/team_qa_verify_full_system.cjs',
    'e2e/smoke_test.js',
    'e2e/comprehension_test.js'
  ];

  for (const test of tests) {
    try {
      await runTest(test);
    } catch (err) {
      console.error(`\n❌ TEST FEJLEDE: ${test} - ${err.message}`);
      totalErrors++;
    }
  }

  if (totalErrors === 0) {
    console.log("\n✅ ALLE TESTS BESTÅET! Systemet er stabilt og klar til deploy.");
  } else {
    console.error(`\n❌ E2E SUITE FEJLEDE: ${totalErrors} tests fejlede.`);
  }

  server.kill();
  process.exit(totalErrors > 0 ? 1 : 0);
}

runAll();
