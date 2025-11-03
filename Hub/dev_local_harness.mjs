// Dev harness (JSON loaded via fs for Node compatibility). Run: node HUB/dev_local_harness.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { applyResumePromotion } from "./tools/resume_promotion_helper.js";

// 1) Load env
const envPath = path.resolve("HUB/dev_local_env.json");
const env = JSON.parse(await fs.readFile(envPath, "utf8"));
const { workerBase, capsuleToken, username } = env;

// 2) Load Post-Ident menu JSON via fs (avoids import assertions)
const menuPath = path.resolve("HUB/v3.0.2_HUB_PostIdent_Menu.json");
const hubMenu = JSON.parse(await fs.readFile(menuPath, "utf8"));

// 3) Minimal Worker client
class WFClient {
  constructor(base) { this.base = base; }
  async post(p, body) {
    const res = await fetch(this.base + p, {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${p}`);
    return await res.json();
  }
}

// 4) Session log helper
async function logEvent(WORKER, token, event, payload={}) {
  try {
    await fetch(WORKER + "/session/log", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ capsule_token: token, event, payload, ts: new Date().toISOString() })
    });
  } catch {}
}

// 5) Run
const WORKER = workerBase;
const client = new WFClient(WORKER);

await logEvent(WORKER, capsuleToken, "INIT", { username });

const loadRes = await client.post("/capsule/load", { capsule_token: capsuleToken });
const resumeAvailable = !!(loadRes?.ok && loadRes?.state?.resume_available === true);

const promotedMenu = applyResumePromotion(hubMenu, resumeAvailable);
const loaderReport = {
  hub: { version:"v3.0.2" },
  dependencies: ["OPS","DM"],
  child_versions: { Creator:null, Atelier:null },
  ops_mode: null
};

await logEvent(WORKER, capsuleToken, "ROUTE", { resumeAvailable });

console.log(JSON.stringify({ username, resumeAvailable, promotedMenu, loaderReport }, null, 2));
