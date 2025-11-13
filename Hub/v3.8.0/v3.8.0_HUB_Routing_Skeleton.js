// Worldforge HUB — Routing Skeleton (v3.8.0)
// Bridge: v3.8.0 | Canon: v3.8.0
// Purpose: Capsule handoff logic + health/version verification for all eight GPTs.

export class WFClient {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$, '');
    this.fetch = fetchImpl;
  }

  async get(path) {
    const res = await this.fetch(`${this.baseUrl}${path}`, { method: 'GET' });
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res.json();
  }
}

export async function verifyService(client) {
  const [version, health] = await Promise.allSettled([
    client.get('/version'),
    client.get('/health'),
  ]);

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

export async function buildLoaderReport(opts) {
  const ts = new Date().toISOString();
  const svc = opts.services;

  const results = await Promise.all([
    verifyService(svc.OPS),
    verifyService(svc.DM),
    verifyService(svc.Creator),
    verifyService(svc.Atelier),
    verifyService(svc.Archivist),
    verifyService(svc.Cartographer)
  ]);

  const [ops, dm, creator, atelier, archivist, cartographer] = results;
  const hubStatus = results.every(r => r.ok) ? 'PASS' : results.some(r => r.ok) ? 'WARN' : 'FAIL';

  return {
    bridge_version: 'v3.8.0',
    canon_version: 'v3.8.0',
    hub: {
      name: 'Worldforge HUB GPT',
      version: 'v3.8.0',
      timestamp_utc: ts,
      status: hubStatus
    },
    user: {
      username: opts.username,
      capsule_token: opts.capsuleToken,
      resume_available: Boolean(opts.resumeAvailable)
    },
    gpts: { ops, dm, creator, atelier, archivist, cartographer },
    ops_mode: null,
    ops_audit: { tone_status: 'PASS', schema_status: 'PASS', notes: '' },
    safe_mode: hubStatus === 'FAIL'
  };
}

export function routeTo(target, baseUrl, context = {}) {
  const url = `${baseUrl.replace(/\/+$, '')}`;
  const lines = {
    DM: 'The sigil brightens; the Storyweaver lifts the veil.',
    OPS: 'The ledger opens; the Auditor weighs the threads.',
    Creator: 'Quills stir; the Shaper lays fresh vellum on the desk.',
    Atelier: 'Light fractures into color; the Vision takes form.',
    Archivist: 'Ink settles in the ledger; the Truthkeeper aligns the canon.',
    Cartographer: 'Grids unfold across parchment; the Mapwright traces the world anew.'
  };
  return { target, url, context, transition: lines[target] || 'The lattice shifts. A new path opens.' };
}

export function safeMode(lastReport) {
  return {
    message: 'The threads waver. The forge dims — the Archivist steadies the light, preserving what can be held.',
    last_report: lastReport || null,
    action: 'Retry or open OPS to diagnose.',
    hint: 'From here, you may attempt reconnection, or ask OPS to run QGate.'
  };
}

export async function hubInitFlow({ username, capsuleToken, services, resumeAvailable, targets }) {
  const report = await buildLoaderReport({ username, capsuleToken, services, resumeAvailable });
  if (report.safe_mode) return { mode: 'SAFE', payload: safeMode(report) };

  if (report.gpts.DM.health === 'PASS' || report.gpts.DM.health === 'WARN')
    return { mode: 'ROUTE', payload: routeTo('DM', targets.DM, { capsuleToken }) };
  if (report.gpts.OPS.health === 'PASS' || report.gpts.OPS.health === 'WARN')
    return { mode: 'ROUTE', payload: routeTo('OPS', targets.OPS, { capsuleToken }) };
  if (report.gpts.Archivist.health === 'PASS' || report.gpts.Archivist.health === 'WARN')
    return { mode: 'ROUTE', payload: routeTo('Archivist', targets.Archivist, { capsuleToken }) };
  return { mode: 'SAFE', payload: safeMode(report) };
}