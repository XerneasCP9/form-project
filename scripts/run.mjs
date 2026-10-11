import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const [tool,...args]=process.argv.slice(2);
const entry=tool==='vite'?'node_modules/vite/bin/vite.js':'node_modules/wrangler/bin/wrangler.js';
const child=spawn(process.execPath,['--use-system-ca',join(root,entry),...args],{cwd:root,stdio:'inherit',env:{...process.env,NODE_USE_SYSTEM_CA:'1',XDG_CONFIG_HOME:join(root,'.cloudflare-local'),WRANGLER_LOG_PATH:join(root,'.wrangler','logs'),WRANGLER_SEND_METRICS:'false'}});
child.on('exit',code=>process.exit(code??1));
