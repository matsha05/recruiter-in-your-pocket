import fs from 'node:fs/promises';
import { PROPERTY, BING_SITE, SITEMAP, BING_AI, jsonRequest, safeError, fail, MeasureError } from './config.mjs';

export async function readGoogle(config, range, queryOverride) {
  let client;
  if (!queryOverride) {
    try { await fs.access(config.GSC_SERVICE_ACCOUNT_FILE); } catch { fail('Google: service-account JSON is missing; add it and grant Restricted property access.'); }
    const {google} = await import('googleapis');
    const credentials=JSON.parse(await fs.readFile(config.GSC_SERVICE_ACCOUNT_FILE,'utf8'));
    if(credentials.type!=='service_account'||!credentials.client_email||!credentials.private_key)fail('Google: expected a service-account JSON key.');
    const auth = new google.auth.JWT({email:credentials.client_email,key:credentials.private_key,scopes:['https://www.googleapis.com/auth/webmasters.readonly']});
    client = google.webmasters({version:'v3',auth});
  }
  const query = queryOverride || (async requestBody => {
    try { return (await client.searchanalytics.query({siteUrl:PROPERTY,requestBody}, {retry:false,timeout:60000})).data; }
    catch (e) { throw new MeasureError(`Google Search Analytics: HTTP ${Number(e.status || e.code) || 'unknown'}; check API enablement and property access.`); }
  });
  const base = {startDate:range.start,endDate:range.end,type:'web',dataState:'all'};
  const totals = await query({...base,dimensions:[],rowLimit:1});
  const queries = await query({...base,dimensions:['query'],rowLimit:20});
  const pages = await query({...base,dimensions:['page'],rowLimit:20});
  const candidates = [];
  let fetched = 0;
  for (;;) {
    const data = await query({...base,dimensions:['query','page'],rowLimit:25000,startRow:fetched});
    const rows = data.rows || [];
    candidates.push(...rows.filter(r => r.position >= 4 && r.position <= 15 && r.impressions >= 10));
    fetched += rows.length;
    if (rows.length < 25000) break;
    if (fetched >= 1000000) fail('Google query/page pagination exceeded 1,000,000 rows; refusing a truncated candidate report.');
  }
  let sitemap;
  if (!queryOverride) {
    try {
      const {data} = await client.sitemaps.get({siteUrl:PROPERTY,feedpath:SITEMAP},{retry:false,timeout:60000});
      sitemap = {path:data.path,lastDownloaded:data.lastDownloaded,lastSubmitted:data.lastSubmitted,isPending:data.isPending,errors:data.errors,warnings:data.warnings,contents:(data.contents||[]).map(({type,submitted})=>({type,submitted}))};
    } catch { sitemap = {unavailable:'Sitemap metadata unavailable to this credential.'}; }
  }
  return {status:'ok',totals:totals.rows?.[0] || {clicks:0,impressions:0,ctr:0,position:null},queries:queries.rows||[],pages:pages.rows||[],candidates,queryPageRows:fetched,firstIncompleteDate:totals.metadata?.first_incomplete_date || null,sitemap};
}
export function bingDate(value) {
  const ms = /^\/Date\((-?\d+)([+-]\d{4})?\)\/$/.exec(value || '');
  if (ms) {
    const offset=ms[2] ? (ms[2][0]==='-'?-1:1)*(Number(ms[2].slice(1,3))*60+Number(ms[2].slice(3))) : 0;
    return new Date(Number(ms[1])+offset*60000).toISOString().slice(0,10);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(value||'')) return value.slice(0,10);
  fail('Bing returned an unrecognized date; cannot assign it to a month.');
}
export function bingRows(data, range) {
  if (!Array.isArray(data?.d)) fail('Bing returned a fault or unexpected statistics shape.');
  return data.d.map(row=>({...row,date:bingDate(row.Date)})).filter(row=>row.date>=range.start&&row.date<=range.end).sort((a,b)=>b.Clicks-a.Clicks || b.Impressions-a.Impressions || a.date.localeCompare(b.date));
}
export async function readBing(config, range) {
  if (!config.BING_API_KEY) fail('Bing: BING_API_KEY is missing; generate the free Webmaster API key.');
  const read = async method => {
    const url=new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
    url.searchParams.set('siteUrl',BING_SITE);url.searchParams.set('apikey',config.BING_API_KEY);
    return bingRows(await jsonRequest(url,{},`Bing ${method}`),range);
  };
  return {status:'ok',queries:await read('GetQueryStats'),pages:await read('GetPageStats'),ai:{status:'UI only, read by hand',url:BING_AI,citations:null}};
}
export async function capture(read) {
  try { return await read(); } catch (e) { return {status:'unavailable',reason:safeError(e)}; }
}
