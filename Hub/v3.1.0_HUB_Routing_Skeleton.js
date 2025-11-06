// Worldforge HUB — Routing Skeleton (v3.1.0)
// Bridge: v3.1.0 | Canon: v3.1.0
// Purpose: Capsule handoff logic + health/version verification.
// Note: This is a framework-agnostic ESM module. Wire these functions into your runtime.

/** @typedef {'PASS'|'WARN'|'FAIL'|'UNKNOWN'|'PENDING'} Health */
/** @typedef {'INIT'|'PASS'|'WARN'|'FAIL'} HubStatus */

/**
 * Minimal client for ecosystem endpoints. Replace `baseUrl` per GPT service.
 */
export class WFClient {
  /**
   * @param {string} baseUrl - e.g., https://api.worldforge.example/ops
   * @param {(input: RequestInfo, init?: RequestInit) => Promise<Response>} fetchImpl
   */
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fetch = fetchImpl;
  }

  async get(path) {
    const res = await this.fetch(`${this.baseUrl}${path}`, { method: 'GET' });
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res.json();
  }
}

/**
 * Check /version and /health for a service.
 * @param {WFClient} client
 */
export async function verifyService(client) {
  const [version, health] = await Promise.allSettled([
    client.get('/version'),
    client.get('/health'),
  ]);

  /** @type {{version:string, health:Health, ok:boolean, error?:string}} */
  const out = {
    version: version.status === 'fulfilled' ? version.value?.version ?? 'UNKNOWN' : 'UNKNOWN',
    health: health.status === 'fulfilled' ? (health.value?.status ?? 'UNKNOWN') : 'UNKNOWN',
    ok: version.status === 'fulfilled' && health.status === 'fulfilled' && (health.value?.status === 'PASS' || health.value?.status === 'WARN'),
    error: undefined
  };

  if (!out.ok) {
    out.error = [
      version.status === 'rejected' ? `version:${version.reason}` : null,
      health.status === 'rejected' ? `health:${health.reason}` : null,
      health.status === 'fulfilled' && !['PASS','WARN'].includes(health.value?.status) ? `health:${health.value?.status}` : null,
    ].filter(Boolean).join('; ') || 'Verification failed';
  }
  return out;
}

/**
 * Build Loader Report object from live checks.
 * Matches v3.1.0_HUB_Loader_Report_Template.json schema.
 * @param {object} opts
 * @param {string} opts.username
 * @param {string} opts.capsuleToken
 * @param {{OPS: WFClient, DM: WFClient, Creator?: WFClient, Atelier?: WFClient}} opts.services
 * @param {boolean} [opts.resumeAvailable=false]
 * @returns {Promise<object>}
 */
export async function buildLoaderReport(opts) {
  const ts = new Date().toISOString();
  const svc = opts.services;

  const [ops, dm, creator, atelier] = await Promise.all([
    verifyService(svc.OPS),
    verifyService(svc.DM),
    svc.Creator ? verifyService(svc.Creator) : Promise.resolve({ version: 'PENDING', health: 'PENDING', ok: false }),
    svc.Atelier ? verifyService(svc.Atelier) : Promise.resolve({ version: 'PENDING', health: 'PENDING', ok: false }),
  ]);

  /** @type {HubStatus} */
  const hubStatus = (ops.ok && dm.ok) ? 'PASS' : (ops.ok || dm.ok ? 'WARN' : 'FAIL');

  return {
    bridge_version: 'v3.1.0',
    canon_version: 'v3.1.0',
    hub: {
      name: 'Worldforge HUB GPT',
      version: 'v3.1.0',
      timestamp_utc: ts,
      status: hubStatus
    },
    user: {
      username: opts.username,
      capsule_token: opts.capsuleToken,
      resume_available: Boolean(opts.resumeAvailable)
    },
    gpts: {
      OPS: {
        version: ops.version,
        health: ops.health,
        endpoints: { version: '/version', health: '/health', qgate_status: '/qgate/status' }
      },
      DM: {
        version: dm.version,
        health: dm.health,
        endpoints: { version: '/version', health: '/health', capsule_resume: '/capsule/resume' }
      },
      Creator: {
        version: creator.version,
        health: /** @type {Health} */ (creator.health ?? 'PENDING'),
        endpoints: { version: '/version', health: '/health', staging_open: '/staging/open' }
      },
      Atelier: {
        version: atelier.version,
        health: /** @type {Health} */ (atelier.health ?? 'PENDING'),
        endpoints: { version: '/version', health: '/health', visuals_ingest: '/visuals/ingest' }
      }
    },
    ops_mode: null,
    ops_audit: {
      tone_status: 'PASS',     // to be set by OPS
      schema_status: 'PASS',   // to be set by OPS
      notes: ''
    },
    safe_mode: hubStatus === 'FAIL'
  };
}

/**
 * Route to a target GPT, returning a diegetic transition message + target URL.
 * This is where you would open the target GPT or pass control in your UI.
 * @param {'DM'|'OPS'|'Creator'|'Atelier'} target
 * @param {string} baseUrl - base URL for the target GPT
 * @param {object} context - arbitrary capsule context to pass through
 */
export function routeTo(target, baseUrl, context = {}) {
  const url = `${baseUrl.replace(/\/+$/, '')}`;
  const lines = {
    DM: 'The sigil brightens; the Storyweaver lifts the veil.',
    OPS: 'The ledger opens; the Auditor weighs the threads.',
    Creator: 'Quills stir; the Shaper lays fresh vellum on the desk.',
    Atelier: 'Light fractures into color; the Vision takes form.'
  };
  return {
    target,
    url,
    context,
    transition: lines[target] || 'The lattice shifts. A new path opens.'
  };
}

/**
 * Safe Mode fallback payload.
 * @param {object} lastReport - previous loader report (optional)
 */
export function safeMode(lastReport) {
  return {
    message:
      'The threads waver. The forge dims — a fracture in the lattice. The Archivist steadies the light, preserving what can be held.',
    last_report: lastReport || null,
    action: 'Retry or open OPS to diagnose.',
    hint: 'From here, you may attempt reconnection, or ask OPS to run QGate.'
  };
}

/**
 * Example orchestration: full init → loader → branch.
 * This is a sample and should be adapted to your app framework.
 */
export async function hubInitFlow_UI(report) { username, capsuleToken, services, resumeAvailable, targets } {
  const report = await buildLoaderReport({
    username,
    capsuleToken,
    services,
    resumeAvailable
  });

  if (report.safe_mode) {
    return { mode: 'SAFE', payload: safeMode(report) };
  }

  // Choose default route: DM if healthy, else OPS, else Safe Mode.
  if (report.gpts.DM.health === 'PASS' || report.gpts.DM.health === 'WARN') {
    return { mode: 'ROUTE', payload: routeTo('DM', targets.DM, { capsuleToken }) };
  }
  if (report.gpts.OPS.health === 'PASS' || report.gpts.OPS.health === 'WARN') {
    return { mode: 'ROUTE', payload: routeTo('OPS', targets.OPS, { capsuleToken }) };
  }
  return { mode: 'SAFE', payload: safeMode(report) };
}

// End of v3.1.0 HUB Routing Skeleton

// v3.1.0 additions
import { buildStartersFromConfig } from './v3.1.0_HUB_Routing_Helper.js';

async function loadStartersConfig() {
  // In GPT, this would read the knowledge file contents; here we assume fetch or injected JSON.
  return CONFIG_301; // placeholder symbol to be replaced by actual config injection
}

export async function hubInitFlow(report) {
  const config = await loadStartersConfig();
  const starters = await buildStartersFromConfig(config, 'top_level');
  renderStarters(starters.visible); // assumed existing UI fn
}
