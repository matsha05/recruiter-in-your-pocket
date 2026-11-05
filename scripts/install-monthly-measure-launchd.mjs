#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const {values}=parseArgs({options:{repo:{type:'string'},npm:{type:'string'}}});
const source=fileURLToPath(new URL('..',import.meta.url));
const repo=path.resolve(values.repo||source);
const home=os.homedir();
const runtime=path.join(home,'.config/riyp/monthly-runtime');
const node=path.join(runtime,'bin/node');
const label='com.riyp.monthly-measure';
const plist=path.join(home,`Library/LaunchAgents/${label}.plist`);
const log=path.join(home,'Library/Logs/riyp-monthly-measure.log');
const npm=values.npm||process.env.npm_execpath;
if(process.platform!=='darwin')throw Error('This installer is for macOS launchd.');
if(Number(process.versions.node.split('.')[0])!==24)throw Error('Run this installer with Node 24.');
if(!npm||!path.isAbsolute(npm))throw Error('Pass --npm /absolute/path/to/npm-cli.js.');
await fs.access(path.join(repo,'package.json'));
await fs.mkdir(path.join(runtime,'scripts/monthly-measure'),{recursive:true,mode:0o700});
await fs.mkdir(path.dirname(node),{recursive:true,mode:0o700});
// Snapshot only the measurement tool, not the product checkout. Keeps scheduling
// functional before the implementation PR is merged and while the main tree is dirty.
await fs.copyFile(process.execPath,node);await fs.chmod(node,0o700);
await fs.copyFile(path.join(source,'scripts/monthly-measure.mjs'),path.join(runtime,'scripts/monthly-measure.mjs'));
for(const name of await fs.readdir(path.join(source,'scripts/monthly-measure'))){
 if(name.endsWith('.mjs'))await fs.copyFile(path.join(source,'scripts/monthly-measure',name),path.join(runtime,'scripts/monthly-measure',name));
}
await fs.writeFile(path.join(runtime,'package.json'),JSON.stringify({name:'riyp-monthly-measure-runtime',private:true,type:'module',scripts:{'measure:monthly':'node scripts/monthly-measure.mjs'},dependencies:{googleapis:'189.0.0',dotenv:'17.2.3'}},null,2)+'\n',{mode:0o600});
const env={...process.env,PATH:`${path.dirname(node)}:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin`};
execFileSync(node,[npm,'install','--ignore-scripts','--no-audit','--no-fund'],{cwd:runtime,env,stdio:'inherit'});
await fs.mkdir(path.dirname(plist),{recursive:true});await fs.mkdir(path.dirname(log),{recursive:true});
await fs.appendFile(log,'',{mode:0o600});await fs.chmod(log,0o600);
const escape=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const xml=`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${escape(node)}</string><string>${escape(npm)}</string><string>--prefix</string><string>${escape(runtime)}</string><string>run</string><string>measure:monthly</string></array>
<key>WorkingDirectory</key><string>${escape(repo)}</string>
<key>EnvironmentVariables</key><dict><key>PATH</key><string>${escape(env.PATH)}</string><key>RIYP_MEASURE_REPO</key><string>${escape(repo)}</string></dict>
<key>StartCalendarInterval</key><dict><key>Day</key><integer>1</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
<key>StandardOutPath</key><string>${escape(log)}</string>
<key>StandardErrorPath</key><string>${escape(log)}</string>
<key>RunAtLoad</key><false/>
<key>KeepAlive</key><false/>
</dict></plist>
`;
await fs.writeFile(plist,xml,{mode:0o600});
execFileSync('/usr/bin/plutil',['-lint',plist],{stdio:'inherit'});
const domain=`gui/${process.getuid()}`;
try{execFileSync('/bin/launchctl',['bootout',`${domain}/${label}`],{stdio:'ignore'});}catch{/* First install has no existing service. */}
execFileSync('/bin/launchctl',['bootstrap',domain,plist],{stdio:'inherit'});
console.log(execFileSync('/bin/launchctl',['list',label],{encoding:'utf8'}));
console.log('Monthly agent loaded. Runs on day 1 at 09:00 local time; no immediate run triggered.');
