#!/usr/bin/env node
const axios = require('axios');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3011';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3101';
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 7000);

function shortPreview(data) {
  try {
    if (Array.isArray(data)) return `array[len=${data.length}]`;
    if (data && typeof data === 'object') {
      const keys = Object.keys(data).slice(0, 5);
      return `object{${keys.join(',')}}`;
    }
    return typeof data;
  } catch {
    return 'unknown';
  }
}

async function hit(method, url, label) {
  const start = Date.now();
  try {
    const res = await axios({ method, url, timeout: TIMEOUT_MS, validateStatus: () => true });
    const ms = Date.now() - start;
    let preview = '';
    try { preview = shortPreview(res.data); } catch { preview = 'n/a'; }
    console.log(`OK  ${label.padEnd(34)} ${res.status}  ${ms}ms  ${preview}`);
    return { label, ok: true, status: res.status, ms };
  } catch (err) {
    const ms = Date.now() - start;
    const status = err.response?.status;
    console.log(`ERR ${label.padEnd(34)} ${status ?? '-'}  ${ms}ms  ${err.message}`);
    return { label, ok: false, status, ms, error: err.message };
  }
}

async function main() {
  console.log('=== Smoke Test: Backend ===');
  const backendTests = [
    ['GET', `${BACKEND_URL}/health`, 'backend /health'],
    ['GET', `${BACKEND_URL}/api/work-plans`, 'backend /api/work-plans'],
    ['GET', `${BACKEND_URL}/api/new-jobs`, 'backend /api/new-jobs'],
    ['GET', `${BACKEND_URL}/api/production-logs?limit=1`, 'backend /api/production-logs?limit=1'],
  ];
  for (const [m,u,l] of backendTests) await hit(m,u,l);

  console.log('\n=== Smoke Test: Frontend Proxy ===');
  const frontendTests = [
    ['GET', `${FRONTEND_URL}/api/work-plans`, 'frontend /api/work-plans'],
    ['GET', `${FRONTEND_URL}/api/new-jobs`, 'frontend /api/new-jobs'],
    ['GET', `${FRONTEND_URL}/api/production-logs?limit=1`, 'frontend /api/production-logs?limit=1'],
  ];
  for (const [m,u,l] of frontendTests) await hit(m,u,l);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Smoke test failed with unexpected error:', err);
  process.exitCode = 1;
});

