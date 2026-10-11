# B Look Garment Address Form

Form URL: https://blook-address-form.garmentblookjersey.workers.dev

## Commands

```powershell
npm install
npm run dev
npm test
npm run data:check
npm run build
npm run cf:login
npm run deploy
```

TypeScript is pinned to 5.9.3 to avoid the native Windows compiler failure. Production builds use Vite's native config loader.

## LINE setup still required

Create LIFF in a LINE Login channel under the bot's Provider, size Full, scope openid. Use the Form URL above as its endpoint. Set LIFF_ID and LINE_LOGIN_CHANNEL_ID in wrangler.jsonc. Keep SUBMISSION_ENABLED false until the receiving n8n workflow is configured and ready.

Through n8n MCP, set the receiver's formBaseUrl to the Form URL, channelId to the LINE Login Channel ID, and the chat workflow's liffId to the new LIFF ID. Publishing n8n workflows requires separate user confirmation. Do not expose bot credentials in React.

## Validation and data

Required name, address, province, district, subdistrict, postcode and mobile number. Mobile must be 10 digits and start with 06, 08 or 09. Province selections reset dependent fields. Postcodes come from the selected subdistrict. Both browser and API validate inputs.

Geography snapshot: thailand-geography-data/thailand-geography-json commit b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b, MIT. 77 provinces, 928 districts, 7436 subdistrict records. This community snapshot is not an official postal address verification service.

Address storage and LINE notification have separate statuses. A failed LINE push must not discard a saved address. Data Table operations cannot guarantee atomic processing of concurrent duplicate requests. LINE ID tokens are transient in executions, never stored as address fields; configure execution retention appropriately.

Do not share .cloudflare-local, .dev.vars, or authentication files.
