# Worldforge Hub Worker — Quickstart (v3.1.0)

This guide covers **local development**, **endpoint testing**, and **deploy prep** for the Hub Worker.

---

## 1) Prereqs
- Node 18+
- Cloudflare Wrangler (`npm i -g wrangler`) or use `npx wrangler`
- Repo contains: `workers/hub_worker.ts`, `wrangler.toml`

---

## 2) Run locally
```bash
npx wrangler dev
```
Expected: `Listening on http://127.0.0.1:8787`

---

## 3) Smoke tests (PowerShell)

### 3.1 Issue a capsule token
```powershell
$r = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/auth/issue -ContentType 'application/json' -Body '{"session_id":"dev","username":"PlayerOne"}'
$TOKEN = $r.capsule_token
$TOKEN
```

### 3.2 Save & load capsule
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/capsule/save -ContentType 'application/json' -Body ("{""capsule_token"":""$TOKEN"",""username"":""PlayerOne"",""state"":{""resume_available"":true}}")
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/capsule/load -ContentType 'application/json' -Body ("{""capsule_token"":""$TOKEN""}")
```

### 3.3 Session logs
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/session/log -ContentType 'application/json' -Body ("{""capsule_token"":""$TOKEN"",""event"":""INIT"",""ts"":""{0}""}" -f (Get-Date).ToString("o"))
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8787/session/logs
```

### 3.4 OPS audit intake
Send a minimal size-audit report (example):
```powershell
$payload = @{
  source = "HUB"
  bundle = "hub_v3.1.0_routing_patch"
  hashes = @{ routing = "sha256:DEADBEEF" }
  items  = @(
    @{ file="HUB/runtime/HUB_Routing_Skeleton.js"; before=7177; after=6817; delta=-360; pct=-5.02; flagged=$true }
  )
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/audit/qgate -ContentType 'application/json' -Body $payload
```

Expected: `{"status":"OPS_WARN","received":1,"flagged":1,...}`

---

## 4) Hook up the Hub runtime

- Ensure your `HUB/runtime/HUB_Routing_Skeleton.js` calls:
  - `POST /capsule/load` at init
  - `POST /session/log` on INIT/ROUTE/SAFE
  - Applies `applyResumePromotion(...)` to Post-Ident

- Use `HUB/dev_local_harness.mjs` to verify end‑to‑end:
```bash
node HUB/dev_local_harness.mjs
```

---

## 5) Deploy prep (optional)
- Add bindings (KV/D1) in `wrangler.toml` for persistent storage (future step).
- Run `wrangler publish` when ready to stage remotely.

---

## 6) Troubleshooting
- Multi-line paste errors in PowerShell: prefer editing files in VS Code, not pasting long blocks.
- 401 unknown token: re-issue via `/auth/issue` and re-paste into your env config/harness.
- JSON errors: verify bodies match examples (double quotes).

---

_This is the v3.1.0 Quickstart. Keep it in `OPS/Guides/worker_quickstart.md` and link it in PRs._
