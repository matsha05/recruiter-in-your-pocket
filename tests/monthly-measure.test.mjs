import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {monthRange,estimateRun,usageCost,MODEL,MeasureError,safeError} from '../scripts/monthly-measure/config.mjs';
import {readGoogle,bingDate,bingRows} from '../scripts/monthly-measure/search.mjs';
import {readAnswers,citedUrls,mentionsRiyp,validateMetadata,parsePercentages} from '../scripts/monthly-measure/answers.mjs';
import {mergeReport,previousSnapshot,deltas} from '../scripts/monthly-measure/reports.mjs';
import {publish,allowedPath,githubClient} from '../scripts/monthly-measure/publish.mjs';
const root=path.resolve(import.meta.dirname,'..');
const fixture=path.join(root,'tests/fixtures/monthly-measure/recorded.json');

test('calendar months handle year rollover and leap years; invalid dates fail',()=>{
 assert.equal(monthRange(undefined,new Date(2026,0,1)).month,'2025-12');
 assert.equal(monthRange('2024-02').end,'2024-02-29');
 assert.throws(()=>monthRange('2026-13'),/YYYY-MM/);
});
test('budget includes search, input, output and extraction; missing usage is unknown',()=>{
 assert.ok(estimateRun()<3&&estimateRun()>2);
 assert.equal(usageCost({},MODEL),null);
 assert.equal(usageCost({usage:{input_tokens:100,output_tokens:20,input_tokens_details:{cached_tokens:50}},output:[{type:'web_search_call',action:{type:'search'}}]},MODEL).usd,0.01155);
});
test('Google pagination retains candidates after the first 25000 rows and boundary values',async()=>{
 const seen=[];const row=(position,impressions=10)=>({keys:['q','https://example.test'],clicks:0,impressions,position,ctr:0});
 const result=await readGoogle({},monthRange('2026-10'),async body=>{
  seen.push(body);
  if(body.dimensions.length!==2)return {rows:[]};
  return {rows:body.startRow===0?Array.from({length:25000},()=>row(16)):[row(4),row(15),row(3.9),row(15.1),row(8,9)]};
 });
 assert.equal(result.queryPageRows,25005);assert.deepEqual(result.candidates.map(x=>x.position),[4,15]);
 assert.deepEqual(seen.filter(x=>x.dimensions.length===2).map(x=>x.startRow),[0,25000]);
 assert.ok(seen.every(x=>x.startDate==='2026-10-01'&&x.endDate==='2026-10-31'&&x.dataState==='all'));
});
test('Bing dates preserve provider timezone at month boundaries; faults are not zero',()=>{
 const epoch=Date.parse('2026-11-01T06:00:00Z');
 assert.equal(bingDate(`/Date(${epoch}-0700)/`),'2026-10-31');
 assert.equal(bingRows({d:[{Date:`/Date(${epoch}-0700)/`,Query:'q',Clicks:1,Impressions:10}]},monthRange('2026-10')).length,1);
 assert.throws(()=>bingRows({d:{ErrorCode:3}},monthRange('2026-10')),/fault/);
});
test('citation order and duplicate citations survive; source-only RIYP counts',()=>{
 const urls=citedUrls({output:[{type:'message',content:[{type:'output_text',annotations:[{type:'url_citation',start_index:10,url:'https://example.test/a'},{type:'url_citation',start_index:3,url:'https://www.recruiterinyourpocket.com/research'},{type:'url_citation',start_index:20,url:'https://example.test/a'}]}]}]});
 assert.equal(urls.length,3);assert.ok(mentionsRiyp('No brand name.',urls));
 assert.equal(mentionsRiyp('none',[{url:'https://recruiterinyourpocket.com.evil.test/'}]),false);
});
test('extraction rejects invented products, evidence quotes and citation indices',()=>{
 const text='Teal and Jobscan help with matching.';const valid={tools:['Jobscan','Teal'],mainClaim:'Tools help with matching.',evidenceQuote:'',evidenceIndices:[]};
 assert.deepEqual(validateMetadata(valid,text,[]).tools,['Teal','Jobscan']);
 assert.throws(()=>validateMetadata({...valid,tools:['Invented']},text,[]),/absent/);
 assert.throws(()=>validateMetadata({...valid,evidenceQuote:'A study proved it.'},text,[]),/absent/);
 assert.throws(()=>validateMetadata({...valid,evidenceIndices:[0]},text,[]),/absent/);
});
test('manual observations survive reruns; only marked API sections are replaced',()=>{
 const manual='# November\n\nConsumer observations.\n';
 const first=mergeReport(manual,'API one');const second=mergeReport(first,'API two');
 assert.ok(second.startsWith(manual.trimEnd()));assert.ok(!second.includes('API one'));assert.ok(second.includes('API two'));
 assert.equal((second.match(/riyp-monthly-api:start/g)||[]).length,1);
 assert.equal(previousSnapshot('manual'),null);
 assert.equal(deltas({gsc:{clicks:10}},{gsc:{clicks:4}})[0].delta,6);
});
test('Parse parser fails closed when percentages are absent',()=>{
 assert.deepEqual(parsePercentages('<p>unavailable</p>'),[]);
 assert.deepEqual(parsePercentages('Brands AI mentions #1 Kickresume 92% description #2 Rezi 78% By AI engine'),[{tool:'Kickresume',percent:92},{tool:'Rezi',percent:78}]);
});
test('publisher creates only allowed documents from main, a named branch and an unmerged PR',async()=>{
 const calls=[];
 const api=async(route,body)=>{calls.push({route,body});
  if(route.startsWith('pulls?'))return [];
  if(route==='git/ref/heads/codex/monthly-2026-10')return null;
  if(route==='git/ref/heads/main')return {object:{sha:'main-sha'}};
  if(route==='git/commits/main-sha')return {tree:{sha:'base-tree'}};
  if(route==='git/trees')return {sha:'new-tree'};
  if(route==='git/commits')return {sha:'new-commit'};
  if(route==='git/refs')return {};
  if(route==='pulls')return {html_url:'https://github.com/example/pr/1'};
  throw Error('unexpected route');
 };
 const data={range:monthRange('2026-10'),google:{status:'ok',totals:{clicks:2,impressions:20}},answers:{rows:[]}};
 const files={'docs/growth/search/2026-10.md':'report'};
 await publish(api,data,files,null);
 assert.equal(calls.find(x=>x.route==='git/trees').body.base_tree,'base-tree');
 assert.equal(calls.find(x=>x.route==='git/refs').body.ref,'refs/heads/codex/monthly-2026-10');
 assert.equal(calls.at(-1).body.title,'Monthly search and AI-answer read for October 2026');
 assert.ok(!calls.some(x=>/merge/.test(x.route)));
 assert.ok(calls.at(-1).body.body.includes('Bing citations | unavailable'));
 await assert.rejects(()=>publish(api,data,{'web/app/page.tsx':'bad'},null),/allowlist/);
 assert.equal(allowedPath('docs/growth/ai-answers/raw/2026-10/../../oops','2026-10'),false);
});
test('HTTP credentials only go to fixed repo; provider errors never echo secrets',async()=>{
 let seen;
 await githubClient('private-token',async(url,options)=>{seen={url,options};return [];} )('pulls?state=open');
 assert.ok(seen.url.startsWith('https://api.github.com/repos/matsha05/recruiter-in-your-pocket/'));
 assert.equal(safeError(new Error('private-token')), 'Operation failed; provider details omitted to protect credentials.');
 assert.equal(safeError(new MeasureError('HTTP 401')),'HTTP 401');
});
test('recorded API fixtures run --dry-run without network and produce both complete report shapes',async()=>{
 const out=await fs.mkdtemp(path.join(os.tmpdir(),'riyp-measure-fixture-'));
 const args=['scripts/monthly-measure.mjs','--dry-run','--month','2026-10','--fixtures',fixture,'--output-dir',out];
 const output=execFileSync(process.execPath,args,{cwd:root,encoding:'utf8'});
 assert.match(output,/Dry run: no commit, branch push, or PR/);
 const search=await fs.readFile(path.join(out,'docs/growth/search/2026-10.md'),'utf8');
 const answers=await fs.readFile(path.join(out,'docs/growth/ai-answers/2026-10.md'),'utf8');
 for(const heading of ['Top 20 queries','Top 20 pages','Anchor candidates','What changed since last month'])assert.ok(search.includes(heading));
 for(const heading of ['Method','The twelve prompts','RIYP count per engine','Parse percentages','What the answers show','To do before next month'])assert.ok(answers.includes(heading));
 assert.equal((answers.match(/\| \d+ \| .*? \| OpenAI API \|/g)||[]).length,12);
 assert.equal((answers.match(/\| \d+ \| .*? \| Perplexity API \|/g)||[]).length,12);
 assert.match(search,/UI only, read by hand/);assert.match(answers,/recorded API fixtures \(not live\)/);
 const raw=await fs.readdir(path.join(out,'docs/growth/ai-answers/raw/2026-10'));
 assert.equal(raw.filter(x=>x.startsWith('openai-')).length,12);
 // Resume with the same checkpoint: offline recordings must not be charged twice.
 execFileSync(process.execPath,args,{cwd:root,encoding:'utf8'});
 assert.equal((await fs.readdir(path.join(out,'.fixture-state/2026-10'))).filter(x=>x.endsWith('.response.json')).length,24);
 await fs.rm(out,{recursive:true,force:true});
});

test('an ambiguous paid-call failure stops further spending and cannot be replayed',async()=>{
 const state=await fs.mkdtemp(path.join(os.tmpdir(),'riyp-measure-pending-'));let calls=0;
 const request=async()=>{calls++;throw new MeasureError('OpenAI: network or timeout error (request was not retried).');};
 const first=await readAnswers({OPENAI_API_KEY:'not-a-secret'},state,request);
 assert.equal(calls,1);assert.equal(first.cost.unknown,true);assert.equal(first.rows.length,12);
 await readAnswers({OPENAI_API_KEY:'not-a-secret'},state,request);assert.equal(calls,1);
 await fs.rm(state,{recursive:true,force:true});
});
test('a resumed month at the budget stops before a new paid call',async()=>{
 const state=await fs.mkdtemp(path.join(os.tmpdir(),'riyp-measure-budget-'));let calls=0;
 await fs.writeFile(path.join(state,'previous.response.json'),JSON.stringify({model:MODEL,response:{usage:{input_tokens:300000,output_tokens:0},output:[]}}));
 const result=await readAnswers({OPENAI_API_KEY:'not-a-secret'},state,async()=>{calls++;});
 assert.equal(calls,0);assert.equal(result.cost.usd,3);assert.match(result.rows[0].reason,/budget/);
 await fs.rm(state,{recursive:true,force:true});
});
