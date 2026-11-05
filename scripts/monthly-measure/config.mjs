import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'dotenv';

export const PROPERTY = 'sc-domain:recruiterinyourpocket.com';
export const BING_SITE = 'https://recruiterinyourpocket.com/';
export const SITEMAP = 'https://www.recruiterinyourpocket.com/sitemap.xml';
export const BING_AI = 'https://www.bing.com/webmasters/aiperformance?siteUrl=https%3A%2F%2Frecruiterinyourpocket.com%2F';
export const PARSE_URL = 'https://www.parse.gl/prompts/p/which-ai-resume-tool-should-i-use--33139686-7e3d-4a1f-9733-b36c2b6fb704';
export const REPOSITORY = 'matsha05/recruiter-in-your-pocket';
export const CONFIG_DIR = path.join(os.homedir(), '.config/riyp');
export const PROMPTS = [
  'Which AI resume tool should I use?', 'Is Jobscan worth it?', 'Jobscan vs Teal',
  'Best free resume review', 'How do recruiters actually read a resume?',
  'Do recruiters really spend six seconds on a resume?', 'Should my resume be one page?',
  'Will one typo on my resume cost me the interview?', 'Why am I not getting callbacks?',
  'Is an AI resume checker accurate?', 'Resume Worded alternative',
  'What does a recruiter look for in the first pass?',
];
// Official recommended Responses web-search model and prices checked 2026-11-05.
// Pin model + rate card together; never auto-upgrade without reviewing the $3 estimate.
export const MODEL = 'gpt-6-astra';
export const EXTRACT_MODEL = 'gpt-6.1-terra';
export const RATES = { [MODEL]: { input: 10, cached: 1, output: 50 }, [EXTRACT_MODEL]: { input: 1, cached: 0.05, output: 5 } };
export const BUDGET = 3;
export const OUTPUT_LIMIT = 1536;
export class MeasureError extends Error {}
export function fail(message) { throw new MeasureError(message); }
export function safeError(error) { return error instanceof MeasureError ? error.message : 'Operation failed; provider details omitted to protect credentials.'; }
export function monthRange(value, now = new Date()) {
  const month = value ?? new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)).toISOString().slice(0, 7);
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) fail('Month must be YYYY-MM.');
  const [year, number] = month.split('-').map(Number);
  return { month, start: `${month}-01`, end: new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10), previous: new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7), label: new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-US', {month:'long',year:'numeric',timeZone:'UTC'}) };
}
export async function loadConfig(repo) {
  const file = path.join(CONFIG_DIR, 'monthly.env');
  let resolved, stat;
  try { resolved = await fs.realpath(file); stat = await fs.stat(resolved); } catch { fail('Missing ~/.config/riyp/monthly.env; see the setup checklist.'); }
  if (resolved.startsWith(`${await fs.realpath(repo)}/`)) fail('Secrets must be outside the repository.');
  if ((stat.mode & 0o777) !== 0o600) fail('monthly.env must have mode 600.');
  const config = parse(await fs.readFile(resolved));
  if (!config.OPENAI_API_KEY) fail('OPENAI_API_KEY is missing from monthly.env.');
  config.GSC_SERVICE_ACCOUNT_FILE = (config.GSC_SERVICE_ACCOUNT_FILE || path.join(CONFIG_DIR, 'gsc-service-account.json')).replace(/^~\//, `${os.homedir()}/`);
  let keyPath=path.resolve(config.GSC_SERVICE_ACCOUNT_FILE);
  try {keyPath=await fs.realpath(keyPath);}catch{/* Missing key is reported by the Google reader. */}
  if (keyPath.startsWith(`${await fs.realpath(repo)}/`)) fail('Google service-account JSON must be outside the repository.');
  config.GSC_SERVICE_ACCOUNT_FILE=keyPath;
  return config;
}
export async function atomicWrite(file, text) {
  await fs.mkdir(path.dirname(file), {recursive:true,mode:0o700});
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, text, {mode:0o600});
  await fs.rename(temp, file);
}
export async function jsonRequest(url, options = {}, label = 'API', allow404 = false) {
  let response;
  try { response = await fetch(url, {...options, redirect:'error', signal:AbortSignal.timeout(120000)}); }
  catch { fail(`${label}: network or timeout error (request was not retried).`); }
  if (allow404 && response.status === 404) return null;
  if (!response.ok) fail(`${label}: HTTP ${response.status} (response details omitted).`);
  try { return await response.json(); } catch { fail(`${label}: invalid JSON response.`); }
}
// A conservative estimate, not a provider-enforced dollar cap. Search low context has
// no documented exact token ceiling; reserve 8k input tokens plus repeated context.
export function answerEstimate(prompt) {
  return ((Buffer.byteLength(prompt) + 512 + 8000 + OUTPUT_LIMIT) * RATES[MODEL].input + OUTPUT_LIMIT * RATES[MODEL].output) / 1e6 + 0.01;
}
export function extractionEstimate(textBytes = OUTPUT_LIMIT * 8) {
  return ((textBytes + 4096) * RATES[EXTRACT_MODEL].input + 1200 * RATES[EXTRACT_MODEL].output) / 1e6;
}
export function estimateRun() { return 1.1 * PROMPTS.reduce((sum, p) => sum + answerEstimate(p) + extractionEstimate(), 0); }
export function usageCost(response, model) {
  const usage = response.usage;
  if (!usage || !Number.isFinite(usage.input_tokens) || !Number.isFinite(usage.output_tokens)) return null;
  const cached = usage.input_tokens_details?.cached_tokens || 0;
  const rates = RATES[model];
  const searches = (response.output || []).filter(x => x.type === 'web_search_call' && x.action?.type === 'search').length;
  return {inputTokens:usage.input_tokens, cachedTokens:cached, outputTokens:usage.output_tokens, searches, usd:((usage.input_tokens-cached)*rates.input+cached*rates.cached+usage.output_tokens*rates.output)/1e6 + searches*0.01};
}
