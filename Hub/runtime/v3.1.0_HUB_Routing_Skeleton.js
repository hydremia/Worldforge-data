// Worldforge HUB — Routing Skeleton (v3.1.0)
import { applyResumePromotion } from "../tools/resume_promotion_helper.js";

/** @typedef {'PASS'|'WARN'|'FAIL'|'UNKNOWN'|'PENDING'} Health */
/** @typedef {'INIT'|'PASS'|'WARN'|'FAIL'} HubStatus */

class WFClientHTTP {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
    this.fetch = fetchImpl;
  }
  async get(path) {
    const res = await this.fetch(`${this.baseUrl}${path}`, { method: 'GET' });
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res.json();
  }
  async post(path, body) {
    const res = await this.fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
    return res.json();
  }
}

async function logEvent(workerBase, token, event, payload = {}) {
  const base = (workerBase || '').replace(/\/+$/, '');
  try {
    await fetch(`${base}/session/log`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ capsule_token: token, event, payload, ts: new Date().toISOString() })
    });
  } catch {}
}

export class WFClient {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
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
    version: version.status === 'fulfilled' ? (version.value?.version ?? 'UNKNOWN') : 'UNKNOWN',
    health: health.status === 'fulfilled' ? (health.value?.status ?? 'UNKNOWN') : 'UNKNOWN',
    ok: version.status === 'fulfilled' && health.status === 'fulfilled' &&
        (health.value?.status === 'PASS' || health.value?.status === 'WARN'),
    error: undefined
  };
  if (!out.ok) {
    out.error = [
      version.status === 'rejected' ? `version:${version.reason}` : null,
      health.status === 'rejected' ? `health:${health.reason}` : null,
      (health.status === 'fulfilled' && !['PASS','WARN'].includes(health.value?.status)) ? `health:${health.value?.status}` : null,
    ].filter(Boolean).join('; ') || 'Verification failed';
  }
  return out;
}

export async function buildLoaderReport(opts) {
  const ts = new Date().toISOString();
  const svc = opts.services;

  const [ops, dm, creator, atelier] = await Promise.all([
    verifyService(svc.OPS),
    verifyService(svc.DM),
    svc.Creator ? verifyService(svc.Creator) : Promise.resolve({ version: 'PENDING', health: 'PENDING', ok: false }),
    svc.Atelier ? verifyService(svc.Atelier) : Promise.resolve({ version: 'PENDING', health: 'PENDING', ok: false }),
  ]);

  const hubStatus = (ops.ok && dm.ok) ? 'PASS' : ((ops.ok || dm.ok) ? 'WARN' : 'FAIL');

  return {
    bridge_version: 'v3.0.2',
    canon_version: 'v3.0.2',
    hub: { name: 'Worldforge HUB GPT', version: 'v3.0.2', timestamp_utc: ts, status: hubStatus },
    user: { username: opts.username, capsule_token: opts.capsuleToken, resume_available: Boolean(opts.resumeAvailable) },
    gpts: {
      OPS:   { version: ops.version,   health: ops.health,   endpoints: { version: '/version', health: '/health', qgate_status: '/qgate/status' } },
      DM:    { version: dm.version,    health: dm.health,    endpoints: { version: '/version', health: '/health', capsule_resume: '/capsule/resume' } },
      Creator: { version: creator.version, health: creator.health ?? 'PENDING', endpoints: { version: '/version', health: '/health', staging_open: '/staging/open' } },
      Atelier: { version: atelier.version, health: atelier.health ?? 'PENDING', endpoints: { version: '/version', health: '/health', visuals_ingest: '/visuals/ingest' } }
    },
    dependencies: ['OPS','DM'],
    child_versions: { Creator: creator.version ?? null, Atelier: atelier.version ?? null },
    ops_mode: opts.ops_mode ?? null,
    ops_audit: { tone_status: 'PASS', schema_status: 'PASS', notes: '' },
    safe_mode: hubStatus === 'FAIL'
  };
}

export function routeTo(target, baseUrl, context = {}) {
  const url = `${(baseUrl || '').replace(/\/+$/, '')}`;
  const lines = {
    DM: 'The sigil brightens; the Storyweaver lifts the veil.',
    OPS: 'The ledger opens; the Auditor weighs the threads.',
    Creator: 'Quills stir; the Shaper lays fresh vellum on the desk.',
    Atelier: 'Light fractures into color; the Vision takes form.'
  };
  return { target, url, context, transition: lines[target] || 'The lattice shifts. A new path opens.' };
}

export function safeMode(lastReport) {
  return {
    message: 'The threads waver. The forge dims — a fracture in the lattice. The Archivist steadies the light, preserving what can be held.',
    last_report: lastReport || null,
    action: 'Retry or open OPS to diagnose.',
    hint: 'From here, you may attempt reconnection, or ask OPS to run QGate.'
  };
}

export async function hubInitFlow({ username, capsuleToken, services, targets, postIdentMenuJson, WORKER_BASE = 'http://127.0.0.1:8787' }) {
  const workerHttp = new WFClientHTTP(WORKER_BASE);
  await logEvent(WORKER_BASE, capsuleToken, 'INIT', { username });

  let resumeAvailable = false;
  try {
    const cap = await workerHttp.post('/capsule/load', { capsule_token: capsuleToken });
    resumeAvailable = !!(cap?.ok && cap?.state?.resume_available === true);
  } catch (e) {
    await logEvent(WORKER_BASE, capsuleToken, 'SAFE', { reason: 'worker-unreachable', error: String(e) });
  }

  const report = await buildLoaderReport({ username, capsuleToken, services, resumeAvailable });

  if (report.safe_mode) {
    await logEvent(WORKER_BASE, capsuleToken, 'SAFE', { reason: 'services-failed' });
    return { mode: 'SAFE', payload: safeMode(report) };
  }

  const menu = postIdentMenuJson ? applyResumePromotion(postIdentMenuJson, resumeAvailable) : null;

  let route;
  if (['PASS','WARN'].includes(report.gpts.DM.health)) {
    route = { mode: 'ROUTE', payload: routeTo('DM', targets.DM, { capsuleToken }) };
  } else if (['PASS','WARN'].includes(report.gpts.OPS.health)) {
    route = { mode: 'ROUTE', payload: routeTo('OPS', targets.OPS, { capsuleToken }) };
  } else {
    await logEvent(WORKER_BASE, capsuleToken, 'SAFE', { reason: 'no-healthy-services' });
    return { mode: 'SAFE', payload: safeMode(report) };
  }

  await logEvent(WORKER_BASE, capsuleToken, 'ROUTE', { to: route.payload?.target, resumeAvailable });
  return { ...route, postIdentMenu: menu, loaderReport: report };
}
