import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starter Vite server...');
const vite = spawn('npx.cmd', ['vite', '--port', '5180'], {
  cwd: path.resolve(__dirname, '..'),
  shell: true,
  stdio: 'ignore'
});

setTimeout(() => {
  console.log('Starter Puppeteer QA test...');
  const test = spawn('node', ['scripts/team_qa_verify_signage_fallback.mjs'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });

  test.on('close', (code) => {
    vite.kill();
    process.exit(code);
  });
}, 8000);
