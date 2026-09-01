#!/usr/bin/env node
/**
 * CoSpace — Cloudflare Quick Tunnel Runner
 * Automatically creates a public HTTPS Cloudflare Tunnel URL
 * (e.g. https://xxx.trycloudflare.com) without any manual installation or login.
 */

const { startTunnel } = require('untun');

const targetService = process.argv[2] || 'client';

const portMap = {
  client: 5173,
  admin: 5174,
};

const port = portMap[targetService] || 5173;

async function launch() {
  console.log('\n================================================================');
  console.log('🌐 COSPACE — CLOUDFLARE PUBLIC TUNNEL');
  console.log('================================================================');
  console.log(`Connecting http://localhost:${port} to Cloudflare Global Edge...\n`);

  try {
    const tunnel = await startTunnel({ port });
    const publicUrl = await tunnel.getURL();

    console.log('✨ Cloudflare Tunnel is LIVE!');
    console.log('----------------------------------------------------------------');
    console.log(`🔗 Public Shareable URL : ${publicUrl}`);
    console.log(`🏠 Local Forward Target : http://localhost:${port}`);
    console.log('----------------------------------------------------------------');
    console.log('Share this public HTTPS URL with anyone to test CoSpace publicly.\n');

    // Keep process alive until user presses Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\nClosing Cloudflare Tunnel...');
      await tunnel.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error starting Cloudflare Tunnel:', err.message || err);
    process.exit(1);
  }
}

launch();
