# Worldforge Hub Worker API — v3.1

**Date:** 2025-11-03

All examples use neutral placeholders (e.g., `"PlayerOne"`). Do not include real names in requests or logs.

## GET /version
**200**
{ "service":"HUB_WORKER","version":"v3.1.0-dev","timestamp":"ISO8601" }

## GET /health
**Query:** status=PASS|WARN|FAIL
**200**
{ "status":"PASS","details":"ok" }

## POST /auth/issue
**Body**
{ "session_id":"string","username":"PlayerOne" }
**200**
{ "capsule_token":"wf_opaque","issued_at":"ISO8601" }

## POST /capsule/save
**Body**
{ "capsule_token":"wf_opaque","username":"PlayerOne","state":{"resume_available":true,"last_route":"DM"} }
**200**
{ "ok": true }

## POST /capsule/load
**Body**
{ "capsule_token":"wf_opaque" }
**200**
{ "ok":true,"username":"PlayerOne","state":{"resume_available":true,"last_route":"DM"} }
