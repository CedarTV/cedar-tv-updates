import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const script = await readFile('public/theme.js', 'utf8');
function browser({saved=null,dark=false,blocked=false}={}) {
  const events={}, domEvents={}, mediaEvents={}, controlEvents={};
  const root={dataset:{}},select={value:'system',addEventListener:(n,fn)=>controlEvents[n]=fn};
  const media={matches:dark,addEventListener:(n,fn)=>mediaEvents[n]=fn};
  let stored=saved;
  const context={URL,window:{matchMedia:()=>media,addEventListener:(n,fn)=>events[n]=fn,location:{pathname:'/cedar-tv-updates/support/'}},localStorage:{getItem:()=>{if(blocked)throw Error();return stored},setItem:(_,v)=>{if(blocked)throw Error();stored=v}},document:{documentElement:root,querySelector:()=>({setAttribute(){}}),querySelectorAll:s=>s==='[data-theme-select]'?[select]:[],addEventListener:(n,fn)=>domEvents[n]=fn}};
  runInNewContext(script,context);domEvents.DOMContentLoaded();
  return {root,select,stored:()=>stored,choose(v){select.value=v;controlEvents.change()},os(v){media.matches=v;mediaEvents.change()},storage(v){events.storage({key:'cedar-color-theme',newValue:v})}};
}
test('theme respects device defaults, remembers overrides and returns to System',()=>{
 const b=browser({dark:true});assert.equal(b.root.dataset.theme,'dark');b.os(false);assert.equal(b.root.dataset.theme,'light');b.choose('dark');assert.equal(b.stored(),'dark');b.os(false);assert.equal(b.root.dataset.theme,'dark');assert.equal(browser({saved:b.stored()}).root.dataset.theme,'dark');b.choose('system');assert.equal(b.root.dataset.theme,'light');b.os(true);assert.equal(b.root.dataset.theme,'dark');
});
test('theme works without storage and synchronizes changes between tabs',()=>{
 const b=browser({saved:'invalid',blocked:true});b.choose('dark');assert.equal(b.root.dataset.theme,'dark');b.storage('light');assert.equal(b.select.value,'light');assert.equal(b.root.dataset.theme,'light');b.storage(null);assert.equal(b.select.value,'system');
});
test('all routes have identical primary navigation, theme control and Reddit footer',async()=>{
 async function pages(dir){const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?pages(`${dir}/${e.name}`):e.name==='index.html'?[`${dir}/${e.name}`]:[]))).flat()}
 let expected;for(const file of await pages('public')){const html=await readFile(file,'utf8');const header=html.match(/<header class="cedar-header">[\s\S]*?<\/header>/)?.[0];assert.ok(header,file);expected??=header;assert.equal(header,expected,file);assert.equal((html.match(/data-theme-select/g)||[]).length,1);assert.match(html,/<footer[^>]*>[\s\S]*href="https:\/\/www.reddit.com\/r\/CedarApp\/"/);assert.ok(html.indexOf('/theme.js')<html.indexOf('</head>'));}
});
