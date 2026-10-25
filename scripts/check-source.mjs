// High-confidence checks on tracked source; never prints matched secret values.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const files=execFileSync('git',['-c',`safe.directory=${process.cwd().replaceAll('\\','/')}`,'ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
if(!files.length)throw Error('No tracked source files found. Stage source before checking.');
const forbidden=/(^|\/)(?:node_modules|dist|release|work|\.wrangler|\.gradle|test-results|playwright-report)(\/|$)|(^|\/)\.env(?:\.|$)|(^|\/)\.dev\.vars(?:\.|$)|\.(?:apk|aab|keystore|jks|pem|p12|pfx|key)$/i;
const patterns=[['private key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['assigned provider secret',/(?:CLOUDFLARE_API_TOKEN|GITHUB_TOKEN|GH_TOKEN|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["'][^"'\s]{16,}["']/]];
const issues=[];
for(const file of files){if(forbidden.test(file)&&!file.endsWith('.env.example'))issues.push(`${file}: excluded file category`);if(file==='deploy/cloudflare/wrangler.jsonc'||file==='android/local.properties'||file.startsWith('android/app/src/main/assets/public/'))issues.push(`${file}: local/generated configuration`);const data=readFileSync(file);if(data.includes(0))continue;const text=data.toString('utf8');for(const [name,pattern]of patterns)if(pattern.test(text))issues.push(`${file}: possible ${name}`);}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`Source checks passed for ${files.length} tracked files. No high-confidence secret patterns or excluded artifact paths found.`);
