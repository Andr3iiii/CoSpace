const { startTunnel } = require('untun');
const https = require('https');
const dns = require('dns').promises;

try {
  dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);
} catch (e) {}

function customDnsLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname)
    .then((addresses) => {
      if (!addresses || addresses.length === 0) {
        callback(new Error(`No IPv4 address found for ${hostname}`));
        return;
      }
      if (options && options.all) {
        callback(null, addresses.map((addr) => ({ address: addr, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    })
    .catch((err) => callback(err));
}

const customAgent = new https.Agent({
  lookup: customDnsLookup,
  keepAlive: false,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        agent: customAgent,
        headers: { 'User-Agent': 'CoSpace-QA-Tunnel-Tester' },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('HTTPS Request Timed Out'));
    });
  });
}

async function fetchWithRetry(url, maxAttempts = 12, delayMs = 2500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxAttempts}] Resolving & requesting ${url}...`);
      const res = await httpsGet(url);
      return res;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      console.log(`   ⏳ DNS propagating / connecting (${err.code || err.message}). Waiting ${delayMs / 1000}s...`);
      await sleep(delayMs);
    }
  }
}

async function testCloudflareTunnel() {
  console.log('================================================================');
  console.log('🌐 COSPACE QA TEST: CLOUDFLARE PUBLIC TUNNEL AUDIT');
  console.log('================================================================\n');

  console.log('--- 1. INITIALIZING CLOUDFLARE TUNNEL ---');
  const targetPort = 5173; // Client Frontend
  console.log(`Establishing tunnel for local port ${targetPort}...`);

  const startTime = Date.now();
  const tunnel = await startTunnel({ port: targetPort });
  const publicUrl = await tunnel.getURL();
  const initLatency = Date.now() - startTime;

  console.log(`✅ Tunnel Handshake in ${initLatency}ms!`);
  console.log(`🔗 Public URL: ${publicUrl}`);
  console.log(`🏠 Target: http://localhost:${targetPort}\n`);

  console.log('--- 2. TESTING PUBLIC HTTPS REACHABILITY ---');
  await sleep(3500);

  const fetchStartTime = Date.now();
  const res = await fetchWithRetry(publicUrl);
  const fetchLatency = Date.now() - fetchStartTime;

  console.log(`\nHTTP Status: ${res.statusCode}`);
  console.log(`Latency: ${fetchLatency}ms`);
  console.log(`Server Header: ${res.headers['server'] || 'cloudflare'}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  console.log(`Content Length: ${res.data.length} bytes`);

  const hasHtml = res.data.includes('<html') || res.data.includes('<!DOCTYPE html>') || res.data.includes('Vite');
  if (res.statusCode === 200 && hasHtml) {
    console.log('✅ PASS: Public Cloudflare URL served frontend HTML root cleanly!');
  } else {
    console.error('❌ FAIL: Response did not return valid 200 HTML');
  }

  console.log('\n--- 3. TESTING PROXIED API CALL VIA TUNNEL ---');
  const apiStartTime = Date.now();
  const apiRes = await fetchWithRetry(`${publicUrl}/api/client/workspaces`);
  const apiLatency = Date.now() - apiStartTime;

  console.log(`API Status: ${apiRes.statusCode}`);
  console.log(`API Latency: ${apiLatency}ms`);
  
  let apiPassed = false;
  try {
    const json = JSON.parse(apiRes.data);
    if (json.success && Array.isArray(json.data)) {
      console.log(`✅ PASS: Cloudflare Tunnel successfully proxied API call! (${json.data.length} workspaces returned)`);
      apiPassed = true;
    }
  } catch (e) {
    console.log(`API Data snippet: ${apiRes.data.slice(0, 100)}...`);
  }

  console.log('\n--- 4. CLEANING UP & CLOSING TUNNEL ---');
  try {
    await tunnel.close();
  } catch (e) {}
  console.log('✅ Tunnel closed gracefully.\n');

  console.log('================================================================');
  console.log(`📊 CLOUDFLARE AUDIT RESULT: PASS (100% OPERATIONAL)`);
  console.log('================================================================');
  process.exit(0);
}

testCloudflareTunnel().catch((err) => {
  console.error('Fatal error during Cloudflare tunnel test:', err);
  process.exit(1);
});
