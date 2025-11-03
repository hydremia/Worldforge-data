[hub_worker_endpoints.md](https://github.com/user-attachments/files/23294753/hub_worker_endpoints.md)
# Worldforge Hub Worker API — v3.1

**Date:** 2025-11-02

This document defines the Cloudflare Worker endpoints used by the Worldforge Hub (v3.1)
for service discovery, capsule persistence, session logging, and OPS audits.

Schemas are TypeScript- and JSON-Schema-friendly (TypeBox-style).

---

## GET /version
**Response 200**
{
  "service": "HUB_WORKER",
  "version": "v3.1.0-dev",
  "timestamp": "YYYY-MM-DDTHH:mm:ssZ"
}

## GET /health
**Query:** status=PASS|WARN|FAIL
**Response 200**
{ "status": "PASS", "details": "ok" }

## POST /auth/issue
**Body**
{ "session_id": "string", "username": "string" }
**Response 200**
{ "capsule_token": "wf_opaque...", "issued_at": "ISO8601" }

## POST /capsule/save
**Body**
{ "capsule_token": "string", "username": "string", "state": { "resume_available": true, "last_route": "DM" } }
**Response 200**
{ "ok": true }

## POST /capsule/load
**Body**
{ "capsule_token": "string" }
**Response 200**
{ "ok": true, "username": "Taemen", "state": { "resume_available": true, "last_route": "DM" } }

## POST /sandbox/new
**Body**
{ "capsule_token": "string", "ttl_s": 1200 }
**Response 200**
{ "sandbox_id": "sbx_...", "expires_at": "ISO8601" }

## POST /session/log
**Body**
{ "capsule_token": "string", "event": "INIT|ROUTE|SAFE|ERROR", "payload": {}, "ts": "ISO8601" }
**Response 202**
{ "ok": true }

## POST /audit/qgate
**Body**
{ "bundle": "hub_v3.0.2", "hashes": { "file": "sha256hex" } }
**Response 200**
{ "status": "OPS_PASS", "drift_pct": 0.7, "notes": "Hotfix 01 baseline" }
