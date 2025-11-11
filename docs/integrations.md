\# Worldforge Integrations (v3.6)



\## Auth

Use header: `Authorization: Bearer ${OPS\_TOKEN}`



\## OPS Core (worldforge-api)

\- POST `/capsule/create` → `{ user\_id, capsule\_id }`

\- POST `/capsule/{capsule\_id}/put` → `{ key, value }`

\- GET  `/capsule/{capsule\_id}/get?key=...`



\## Archivist Core (worldforge-archivist)

\- GET `/version`

\- GET `/debug/routes`

\- GET `/archivist/export/index`



\## Isolation Model

All KV keys MUST be prefixed:

`capsule:{user\_id}:{capsule\_id}:{namespace}:{key}`



Namespaces: `runtime|staging|canon|sessions|media`



