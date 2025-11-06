// Worldforge HUB — Dashboard Runtime (v3.2.0)
// Phase: Tier-2 Refinement
// Purpose: Live GPT + Capsule telemetry from OPS feed
// Layout: Flat root install (runtime/, tools/, schema/ only)
// Author: Worldforge HUB GPT
// Updated: 2025-11-05

console.log("DEBUG: running HUB dashboard script");
console.log("import.meta.url:", import.meta.url);
console.log("process.argv[1]:", `file://${process.argv[1]}`);

import { verifyService, WFClient } from './v3.2.0_HUB_Routing_Skeleton.js';
import fs from 'fs/promises';
import path from "path";
import url from "url";

const configPath = path.resolve("./dev_local_env.json");

if (await fs.stat(configPath).catch(() => false)) {
  const envData = JSON.parse(await fs.readFile(configPath, "utf8"));
  for (const [key, val] of Object.entries(envData)) {
    process.env[key] = process.env[key] || val;
  }
}

/* --------------------------------------
   Utility: Load OPS Promotion Feed
   -------------------------------------- */
async function loadMockFeed(path = './ops_promotion_feed.json') {
  try {
    const raw = await fs.readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    console.warn('[Dashboard] No promotion feed found — using empty placeholder.');
    return { promotions: [], updated_utc: new Date().toISOString() };
  }
}

/* --------------------------------------
   Builder: Dashboard Manifest Object
   -------------------------------------- */
export async function buildDashboardManifest({ services, feed }) {
  const ts = new Date().toISOString();
  const [creator, atelier, ops, archivist] = await Promise.all([
    verifyService(services.Creator),
    verifyService(services.Atelier),
    verifyService(services.OPS),
    Promise.resolve({ version: 'v3.2.0', health: 'PASS' }) // HUB self-status
  ]);

  return {
    bridge_version: 'v3.2.0',
    canon_version: 'v3.2.0',
    dashboard: {
      timestamp_utc: ts,
      feed_source: 'OPS',
      gpt_status: {
        Creator: { version: creator.version, health: creator.health },
        Atelier: { version: atelier.version, health: atelier.health },
        OPS: { version: ops.version, health: ops.health },
        Archivist: { version: archivist.version, health: archivist.health }
      },
      capsule_activity: (feed.promotions || []).map(evt => ({
        capsule_id: evt.capsule_id,
        event: evt.type,
        timestamp: evt.timestamp
      })),
      notes: `Feed updated: ${feed.updated_utc}`
    }
  };
}

/* --------------------------------------
   Route: /dashboard  →  Returns Live Manifest
   -------------------------------------- */
export async function dashboardRoute(req, res) {
  const feed = await loadMockFeed();
  const services = {
    Creator: new WFClient(process.env.CREATOR_URL),
    Atelier: new WFClient(process.env.ATELIER_URL),
    OPS: new WFClient(process.env.OPS_URL)
  };

  const manifest = await buildDashboardManifest({ services, feed });
  res.json(manifest);
}

/* --------------------------------------
   Route: /dashboard/manifest  →  Saves Manifest to File
   -------------------------------------- */
export async function manifestRoute(req, res) {
  const feed = await loadMockFeed();
  const services = {
    Creator: new WFClient(process.env.CREATOR_URL),
    Atelier: new WFClient(process.env.ATELIER_URL),
    OPS: new WFClient(process.env.OPS_URL)
  };

  const manifest = await buildDashboardManifest({ services, feed });
  await fs.writeFile('./hub_dashboard_manifest.json', JSON.stringify(manifest, null, 2));
  res.json({ status: 'OK', saved: true, path: './hub_dashboard_manifest.json' });
}

/* --------------------------------------
   Standalone Local Runner (Optional)
   -------------------------------------- */
import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const express = await import('express');
  const app = express.default();

  app.locals.WFClient = WFClient;
  app.get('/dashboard', dashboardRoute);
  app.get('/dashboard/manifest', manifestRoute);

  const port = process.env.PORT || 8080;
  app.listen(port, () =>
    console.log(`🌐 HUB Dashboard v3.2 active → http://localhost:${port}/dashboard`)
  );
}