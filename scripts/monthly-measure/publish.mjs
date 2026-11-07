import { REPOSITORY, jsonRequest, fail } from './config.mjs';
import { snapshot, biggestChange } from './reports.mjs';
export function githubClient(token, request = jsonRequest) {
  if(!token)fail('GITHUB_TOKEN is missing from monthly.env.');
  return (route,body,allow404=false) => request(`https://api.github.com/repos/${REPOSITORY}/${route}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})},'GitHub',allow404);
}
export async function existingPr(api,month) {
  const prs=await api(`pulls?state=all&head=matsha05%3Acodex%2Fmonthly-${month}&base=main`);
  return prs[0]||null;
}
export function allowedPath(file,month) {
  return file===`docs/growth/search/${month}.md` || file===`docs/growth/ai-answers/${month}.md` || new RegExp(`^docs/growth/ai-answers/raw/${month}/(?:openai|metadata)-\\d{2}\\.json$`).test(file);
}
export function prBody(data,previous) {
  const stats=snapshot(data);
  return `Monthly API read for ${data.range.label}.\n\n| Metric | Value |\n| --- | --- |\n| Google clicks | ${stats.gsc?.clicks??'unavailable'} |\n| Google impressions | ${stats.gsc?.impressions??'unavailable'} |\n| Bing citations | unavailable: UI only, read by hand |\n| RIYP mentions across the twelve OpenAI answers | ${stats.riypMentions} / ${stats.readable} complete; ${12-stats.readable} unknown |\n\nBiggest change: ${biggestChange(stats,previous)}\n\nPerplexity is disabled at the owner's request. API results differ from consumer apps. See the reports for source limitations, raw answers, and measured usage-priced spend. This PR changes measurement documents only. Review manually; this job never merges or enables auto-merge.`;
}
export async function publish(api,data,files,previous) {
  const branch=`codex/monthly-${data.range.month}`;
  for(const file of Object.keys(files)) if(!allowedPath(file,data.range.month)) fail('Refusing to publish a path outside the monthly document allowlist.');
  const old=await existingPr(api,data.range.month);
  if(old)return old;
  const existing=await api(`git/ref/heads/${branch}`,undefined,true);
  if(existing){
    // Recover only the branch created by this job; a foreign branch needs review.
    const commit=await api(`git/commits/${existing.object.sha}`);
    if(commit.message!==`Monthly measurement ${data.range.month}`)fail('Monthly branch already exists with an unrelated commit; refusing to change it.');
    if(commit.parents?.length!==1)fail('Cannot verify the existing monthly branch parent.');
    const comparison=await api(`compare/${commit.parents[0].sha}...${existing.object.sha}`);
    if(!comparison.files?.length || comparison.files.some(file=>!allowedPath(file.filename,data.range.month)) || comparison.files.length!==Object.keys(files).length)fail('Existing monthly branch is outside the document allowlist; manual review required.');
    for(const [file,content] of Object.entries(files)){
      const remote=await api(`contents/${file}?ref=${branch}`);
      if(!remote?.content||Buffer.from(remote.content,'base64').toString('utf8')!==content)fail('Existing monthly branch differs from this saved run; manual review required.');
    }

  }else{
    const main=await api('git/ref/heads/main');
    const base=await api(`git/commits/${main.object.sha}`);
    const tree=await api('git/trees',{base_tree:base.tree.sha,tree:Object.entries(files).map(([file,content])=>({path:file,mode:'100644',type:'blob',content}))});
    const commit=await api('git/commits',{message:`Monthly measurement ${data.range.month}`,tree:tree.sha,parents:[main.object.sha]});
    await api('git/refs',{ref:`refs/heads/${branch}`,sha:commit.sha});
  }
  return api('pulls',{title:`Monthly search and AI-answer read for ${data.range.label}`,head:branch,base:'main',body:prBody(data,previous),draft:false,maintainer_can_modify:true});
}
export async function readPrevious(api,month) {
  const data=await api(`contents/docs/growth/search/${month}.md?ref=main`,undefined,true);
  return data?.content?Buffer.from(data.content,'base64').toString('utf8'):null;
}
