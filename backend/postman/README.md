# Postman and Newman API tests

The collection is ordered because later requests use the active department and
employee IDs captured by earlier requests. It creates a unique email for every
run, updates the employee, and finishes by deactivating it.

## Run locally

Start the backend on port 8080 with a migrated database, then run from the
`backend` directory:

```bash
npm install --global newman@6.2.1
newman run postman/people-sync-api.postman_collection.json \
  --environment postman/people-sync-ci.postman_environment.json \
  --bail \
  --reporters cli,junit,json \
  --reporter-junit-export build/newman-results.xml \
  --reporter-json-export build/newman-results.json
```

Override the API address without editing the committed environment file:

```bash
newman run postman/people-sync-api.postman_collection.json \
  --environment postman/people-sync-ci.postman_environment.json \
  --env-var baseUrl=http://127.0.0.1:9090/api/v1
```

The environment contains no credentials. Do not add secrets to exported
Postman environments; pass sensitive values through CI secrets and `--env-var`
when authentication is introduced.
