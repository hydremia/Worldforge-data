// Worldforge Hub v3.0.1 — Starter Render Harness (ESM)
// Usage: node starter_render_harness.mjs
// Adjust import paths if your files live elsewhere.

import { buildStartersFromConfig } from './v3.0.1_HUB_Routing_Helper.js';
// Optional: if exported
// import { hubRenderStartersInit } from './v3.0.1_HUB_Routing_Skeleton.js';

globalThis.HUB_STARTERS_CONFIG = {
  ui: { max_visible: 4 },
  contexts: {
    top_level: {
      buttons: [
        { id: "GUIDE" },
        { id: "NEW" },
        { id: "RETURN" },
        { id: "OPS" },
        { id: "EXTRA" }
      ],
      overflow: [{ id: "EXTRA" }]
    }
  }
};

function renderStarters(list) {
  console.log('Visible starters:', list.map(b => b.id));
  return list;
}

async function main() {
  const cfg = globalThis.HUB_STARTERS_CONFIG;
  const starters = await buildStartersFromConfig(cfg, 'top_level');
  renderStarters(starters.visible);
  if (starters.overflow?.length) {
    console.log('Overflow starters:', starters.overflow.map(b => b.id));
  }
}

main().catch(e => {
  console.error('Harness error:', e);
  process.exit(1);
});
