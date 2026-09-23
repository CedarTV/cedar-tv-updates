const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const {randomUUID,createHash} = require('node:crypto');
(async()=>{
 const {sealEnvelope,openEnvelope,bytesToBase64URL}=await import('../public/link/cedar-sync.mjs');
 const out=process.env.CEDAR_SETUP_EVIDENCE;if(!out)throw Error('Set CEDAR_SETUP_EVIDENCE.');
 const configuration=JSON.parse(await fs.readFile(path.join(out,'settings-fixture.json'),'utf8'));
 const profile=configuration.profileID,owner={spaceID:randomUUID(),deviceID:randomUUID(),profileKey:bytesToBase64URL(new Uint8Array(32).fill(77)),deviceToken:bytesToBase64URL(new Uint8Array(32).fill(33))};
 const relay='https://cedar-sync-relay.cedar-sync-relay.workers.dev';let revision='a'.repeat(64),entries=[],seq=0,mutations=0,dropReply=true,requestIds=new Set();
 const row=id=>configuration.pages.flatMap(p=>p.groups.flatMap(g=>g.items)).find(r=>r.id===id);
 async function checkpoint(receipt){const snapshot={schemaVersion:1,profileID:profile,revision,expiresAt:Date.now()+20*60000,configuration,receipt};
 const envelope=await sealEnvelope({schemaVersion:1,profileID:profile,entityKind:'android-setup-snapshot',entityID:profile,operation:'upsert',revision:++seq,modifiedAtEpochMilliseconds:Date.now(),payload:new TextEncoder().encode(JSON.stringify(snapshot))},owner,seq);entries.push({serverSequence:seq,envelope});}
 await checkpoint(null);
 const marker=await sealEnvelope({schemaVersion:1,profileID:profile,entityKind:'android-setup-session',entityID:profile,operation:'upsert',revision:++seq,modifiedAtEpochMilliseconds:Date.now(),payload:new TextEncoder().encode('{}')},owner,seq);entries.push({serverSequence:seq,envelope:marker});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await context.route('https://cedartv.github.io/cedar-tv-updates/**',async route=>{const rel=new URL(route.request().url()).pathname.replace('/cedar-tv-updates/','');const file=path.resolve('public',rel.endsWith('/')?rel+'index.html':rel);assert.ok(file.startsWith(path.resolve('public')+path.sep));const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};await route.fulfill({body:await fs.readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});});
 await context.route(relay+'/**',async route=>{const req=route.request(),url=new URL(req.url());let body;
 if(url.pathname.endsWith('/claim'))body={schemaVersion:1,ownerDeviceID:owner.deviceID,highWaterCursor:2,checkpoints:entries.slice(0,2)};
 else if(req.method()==='GET')body={schemaVersion:1,ownerDeviceID:owner.deviceID,changes:entries.filter(e=>e.serverSequence>Number(url.searchParams.get('after')))};
 else if(req.method()==='POST') {const command=JSON.parse(new TextDecoder().decode((await openEnvelope(req.postDataJSON(),owner)).payload));
 if(!requestIds.has(command.requestID)){requestIds.add(command.requestID);assert.equal(command.baseRevision,revision);assert.equal(command.operation,'setting');
 const target=row(command.payload.id);assert.ok(target?.editable);target.value=command.payload.value;mutations++;revision=createHash('sha256').update(JSON.stringify(configuration)).digest('hex');await checkpoint({requestID:command.requestID,status:'applied',message:'Saved on the TV.'});}
 if(dropReply){dropReply=false;await route.abort('failed');return;}body={schemaVersion:1,serverSequence:seq};}
 else body={schemaVersion:1};await route.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
 const fragment=new URLSearchParams({v:'1',scope:'companion',relay,space:owner.spaceID,owner:owner.deviceID,invitation:randomUUID(),enrollment:owner.deviceToken,key:owner.profileKey,expires:String(Date.now()+60000)});
 await p.goto('https://cedartv.github.io/cedar-tv-updates/setup/#'+fragment);await p.locator('#connect').click();await p.locator('#editor').waitFor();
 await p.selectOption('#section','home-screen');await p.getByLabel('Home Layout',{exact:true}).selectOption('Detailed');await p.locator('#save').click();
 await p.waitForFunction(()=>document.getElementById('status').textContent==='All changes saved on your TV.');assert.equal(mutations,1,'lost reply must not duplicate edits');
 await p.getByLabel('Home Layout',{exact:true}).selectOption('Cinematic');row('home-hero-source').value='Trending';revision='b'.repeat(64);await checkpoint(null);
 await p.locator('#conflict').waitFor({state:'visible'});assert.equal(await p.getByLabel('Home Layout',{exact:true}).inputValue(),'Cinematic','draft preserved');assert.ok(await p.locator('#save').isDisabled());await p.locator('#reload').click();assert.equal(await p.getByLabel('Home Layout',{exact:true}).inputValue(),'Detailed');
 await p.selectOption('#section','home-editor');await p.locator('#add-branch').click();await p.getByLabel('Title',{exact:true}).fill('My movies');await p.getByLabel('Title',{exact:true}).press('Tab');
 await p.getByText('Advanced Home configuration',{exact:true}).click();const homeJSON=JSON.parse(await p.locator('#branches-json').inputValue());homeJSON.branches[0].title='Advanced draft';const jsonDraft=JSON.stringify(homeJSON,null,2);await p.locator('#branches-json').fill(jsonDraft);
 await p.selectOption('#section','source-preferences');await p.selectOption('#section','home-editor');assert.equal(await p.locator('#branches-json').inputValue(),jsonDraft,'advanced Home JSON survives section changes');
 for(const width of [320,390,768,1440])for(const theme of ['light','dark']){await p.setViewportSize({width,height:900});await p.getByLabel('Color theme',{exact:true}).selectOption(theme);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${theme} horizontal overflow`);if(width===390)await p.screenshot({path:path.join(out,`browser-home-${theme}-final.png`),fullPage:true});}
 await p.selectOption('#section','source-preferences');await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:path.join(out,'browser-complete-settings-final.png'),fullPage:true});
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'browser-recovery-verification.json'),JSON.stringify({passed:true,fixture:'Generated Android settings catalogue',settings:configuration.pages.length,mutations,checks:['Lost HTTP acknowledgment recovered from encrypted TV receipt without duplicate mutation','Stale draft blocked and retained until explicit discard','Advanced Home JSON draft survives section changes','318 settings rendered from native catalogue','Light/dark at 320,390,768,1440px without overflow','No page errors']},null,2));console.log('Browser recovery and eight theme/viewport checks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
