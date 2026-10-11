# Deployment and test status

Deployment succeeded on 2026-10-11.
URL: https://blook-address-form.garmentblookjersey.workers.dev
Version: 50843c30-af9e-47b9-b2f5-c8e173e9bc7c

- npm run deploy: passed, including TypeScript and both Vite builds.
- HTTPS homepage: HTTP 200.
- /api/config: passed; submissionEnabled=false and liffId empty.
- Geography API for 100101: returned Bangkok / Phra Nakhon / Phra Borom Maha Ratchawang / 10200.
- Previous implementation checks: 32 automated app tests and 10 simulated n8n Code checks passed.
- Previous MCP scenarios: simulated identity and geography; storage, replay, expiry and storage-error handling checked. These are not real LINE integration tests.
- Real LIFF sign-in, LINE token verification and LINE Push: pending LINE configuration.
- n8n workflows have not been published as part of this deployment.

The original Windows compiler error was resolved by pinning TypeScript 5.9.3. Vite config bundling encountered EPERM, resolved by --configLoader native. The bundle-size warning does not prevent deployment.
