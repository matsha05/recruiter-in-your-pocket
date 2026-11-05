#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { CONFIG_DIR, BUDGET, PROMPTS, monthRange, loadConfig, estimateRun, atomicWrite, safeError, fail } from './monthly-measure/config.mjs';
import { readGoogle, readBing, capture, bingRows } from './monthly-measure/search.mjs';
import { readAnswers, readParse, parsePercentages } from './monthly-measure/answers.mjs';
import { renderSearch, renderAnswers, previousSnapshot, mergeReport } from './monthly-measure/reports.mjs';
import { githubClient, existingPr, publish, readPrevious } from './monthly-measure/publish.mjs';

export async function run(args = process.argv.slice(2)) {
  const {values}=parseArgs({args,options:{'dry-run':{type:'boolean'},month:{type:'string'},fixtures:{type:'string'},'output-dir':{type:'string'}}});
  if(process.env.npm_config_dry_run==='true')values['dry-run']=true;
  const repo=path.resolve(process.env.RIYP_MEASURE_REPO||fileURLToPath(new URL('..',import.meta.url)));
  const range=monthRange(values.month);
  const fixture=Boolean(values.fixtures);
  if(fixture&&!values['dry-run'])fail('Fixtures may only be used with --dry-run.');
  if(values['output-dir']&&!values['dry-run'])fail('--output-dir is allowed only with --dry-run.');
  const output=path.resolve(values['output-dir']||repo);
  const stateRoot=fixture?path.join(output,'.fixture-state'):path.join(CONFIG_DIR,'monthly-state');
  await fs.mkdir(stateRoot,{recursive:true,mode:0o700});
  const lockFile=path.join(stateRoot,'run.lock');
  let lock;
  try {lock=await fs.open(lockFile,'wx',0o600);}catch{fail('Another measurement run or stale run.lock exists; inspect it before removing the lock.');}
  await lock.writeFile(`${process.pid}\n${new Date().toISOString()}\n`);await lock.close();
  try {
    const estimate=estimateRun();
    if(estimate>BUDGET)fail(`Estimated spend $${estimate.toFixed(4)} exceeds the $3 run limit; no paid calls made.`);
    console.log(`Monthly measurement ${range.month}: estimated planned spend $${estimate.toFixed(4)} (guard $3).`);
    const stateDir=path.join(stateRoot,range.month);
    const pendingPublish=path.join(stateDir,'publish.json');
    const config=fixture?{OPENAI_API_KEY:'fixture-only'}:await loadConfig(repo);
    let api;
    if(!values['dry-run']){
      api=githubClient(config.GITHUB_TOKEN);
      const old=await existingPr(api,range.month);
      if(old){console.log(`Already recorded: ${old.html_url} (${old.state}); no calls made.`);return;}
      let saved;
      try {saved=JSON.parse(await fs.readFile(pendingPublish,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
      if(saved){
        const pr=await publish(api,saved.data,saved.files,saved.previous);
        await fs.unlink(pendingPublish);
        console.log(`Recovered ${pr.html_url}; no new measurement calls made.`);return;
      }
    }
    let google,bing,answers,parse;
    if(fixture){
      // Fixture mode has no live clients and fails closed if anything calls fetch.
      globalThis.fetch=()=>{throw new Error('Network is forbidden in fixture mode');};
      const recordings=JSON.parse(await fs.readFile(path.resolve(values.fixtures),'utf8'));
      let queryIndex=0;
      google=await readGoogle({},range,async()=>recordings.google[queryIndex++]);
      google.sitemap=recordings.sitemap;
      bing={status:'ok',queries:bingRows(recordings.bingQueries,range),pages:bingRows(recordings.bingPages,range)};
      answers=await readAnswers(config,stateDir,async(_url,options)=>{
        const body=JSON.parse(options.body);
        if(PROMPTS.includes(body.input))return recordings.answers[PROMPTS.indexOf(body.input)];
        const index=recordings.answers.findIndex(r=>body.input.includes(r.output.find(x=>x.type==='message').content[0].text));
        if(index<0)fail('No recorded extraction matches this request.');
        return recordings.extractions[index];
      });
      parse={status:'parsed',url:'https://www.parse.gl/',percentages:parsePercentages(recordings.parseHtml)};
    }else{
      google=await capture(()=>readGoogle(config,range));
      bing=await capture(()=>readBing(config,range));
      parse=await readParse();
      answers=await readAnswers(config,stateDir);
    }
    const data={range,generatedAt:new Date().toISOString(),fixture,google,bing,answers,parse};
    let previousText;
    try { previousText=await fs.readFile(path.join(output,`docs/growth/search/${range.previous}.md`),'utf8'); }catch(e){if(e.code!=='ENOENT')throw e;}
    if(!previousText&&api)previousText=await readPrevious(api,range.previous);
    const previous=previousSnapshot(previousText);
    const files={
      [`docs/growth/search/${range.month}.md`]:renderSearch(data,previous),
      [`docs/growth/ai-answers/${range.month}.md`]:renderAnswers(data),
      ...Object.fromEntries(Object.entries(answers.rawFiles).map(([name,content])=>[`docs/growth/ai-answers/raw/${range.month}/${name}`,content])),
    };
    // Preserve manual observations; replace only our explicitly marked API block.
    for(const file of Object.keys(files).filter(x=>x.endsWith('.md'))){
      let old='';
      if(api){
        const remote=await api(`contents/${file}?ref=main`,undefined,true);
        if(remote?.content)old=Buffer.from(remote.content,'base64').toString('utf8');
      }else{
        try {old=await fs.readFile(path.join(output,file),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
      }
      files[file]=mergeReport(old,files[file]);
    }
    const secrets=Object.entries(config).filter(([key])=>/KEY|TOKEN/.test(key)).map(([,value])=>value).filter(value=>value.length>12);
    if(Object.values(files).some(text=>secrets.some(secret=>text.includes(secret))))fail('Secret detected in generated output; nothing written or published.');
    for(const [file,text] of Object.entries(files))await atomicWrite(path.join(output,file),text);
    console.log(`Wrote ${Object.keys(files).length} measurement documents. Usage-priced spend: $${answers.cost.usd.toFixed(6)}${answers.cost.unknown?' + unknown usage':''}.`);
    if(values['dry-run'])console.log('Dry run: no commit, branch push, or PR.');
    else {
      await atomicWrite(pendingPublish,JSON.stringify({data,files,previous}));
      const pr=await publish(api,data,files,previous);
      await fs.unlink(pendingPublish);
      console.log(`Opened ${pr.html_url}; never merged or enabled auto-merge.`);
    }
    if(google.status!=='ok'||bing.status!=='ok'||answers.rows.some(r=>r.status!=='complete'||!r.metadata)){
      console.log(`Incomplete sources: Google ${google.status}; Bing ${bing.status}; OpenAI ${answers.rows.filter(r=>r.status==='complete').length}/12 complete. See report reasons.`);
      process.exitCode=2;
    }
    return data;
  } finally {await fs.unlink(lockFile);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run().catch(error=>{console.error(safeError(error));process.exitCode=1;});
