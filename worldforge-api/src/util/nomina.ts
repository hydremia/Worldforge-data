// src/routes/nomina.ts
import { json } from "../util/json";
import { loadManifest, loadNominaIndex, xorshift128plus, pickFromFiles } from "../util/nomina";

export async function handleNominaMeta(_req: Request, env: Env) {
  const manifest = await loadManifest(env);
  const mod = manifest.modules.find(m => m.name.toLowerCase() === "nomina");
  if (!mod) return json(404, { error: "Nomina not found in manifest" });
  return json(200, {
    module: "Nomina",
    current: mod.current,
    versions: mod.versions.map(v => v.v),
    service: mod.service ?? null
  });
}

export async function handleNominaIndex(req: Request, env: Env) {
  const url = new URL(req.url);
  const v = url.searchParams.get("v") || undefined;
  const index = await loadNominaIndex(env, v);
  return json(200, index);
}

export async function handleNominaResolve(req: Request, env: Env) {
  const url = new URL(req.url);

  const species = (url.searchParams.get("species") || "").toLowerCase();
  if (!species) return json(400, { error: "species required" });

  const culture = (url.searchParams.get("culture") || "").toLowerCase() || undefined;
  const gender  = (url.searchParams.get("gender")  || "").toLowerCase() || undefined;
  const count   = Math.min(Math.max(parseInt(url.searchParams.get("count") || "10", 10), 1), 100);
  const seed    = url.searchParams.get("seed") || cryptoRandomSeed();

  const index = await loadNominaIndex(env); // uses current by default
  // naive logical id selection: prefer culture-specific → core
  const logicalIds: string[] = [];

  // culture shard (if present)
  if (culture) {
    const cultureId = `spec:${species}/${culture}`;
    if (index.files.some(f => f.id === cultureId)) logicalIds.push(cultureId);
  }

  // gender shard (if present)
  if (gender) {
    const genderId = `spec:${species}/${gender}`;
    if (index.files.some(f => f.id === genderId)) logicalIds.push(genderId);
  }

  // core shard (fallback)
  const coreId = `spec:${species}/core`;
  if (index.files.some(f => f.id === coreId)) logicalIds.push(coreId);

  if (logicalIds.length === 0) {
    return json(404, { error: "No matching logical IDs", species, culture, gender });
  }

  const rng = xorshift128plus(seed);
  const results = await pickFromFiles(index, logicalIds, count, rng, env);

  return json(200, {
    module: "Nomina",
    version: index.version,
    resolved_from: { logical_ids: logicalIds },
    rng: { seed, algo: "xorshift128+" },
    results,
    provenance: { manifest: `/Nomina/${index.version}/index.json`, sha256_bundle: index.sha256_bundle || null }
  });
}

function cryptoRandomSeed() {
  // Worker-safe quick seed
  return (crypto.getRandomValues(new Uint32Array(4)) as Uint32Array)
    .reduce((s, n) => s + n.toString(16).padStart(8, "0"), "");
}
