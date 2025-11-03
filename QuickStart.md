# Hub Worker Quick Start

## Dev
```bash
npm i -D typescript wrangler
npx wrangler dev
```

## Smoke
```bash
curl -s http://127.0.0.1:8787/version | jq
curl -s http://127.0.0.1:8787/health?status=WARN | jq
TOKEN=$(curl -sX POST http://127.0.0.1:8787/auth/issue -H 'content-type: application/json' -d '{"session_id":"abc","username":"Taemen"}' | jq -r .capsule_token)
curl -sX POST http://127.0.0.1:8787/capsule/save -H 'content-type: application/json' -d '{"capsule_token":"'$TOKEN'","username":"Taemen","state":{"resume_available":true,"last_route":"DM"}}' | jq
curl -sX POST http://127.0.0.1:8787/capsule/load -H 'content-type: application/json' -d '{"capsule_token":"'$TOKEN'"}' | jq
```
