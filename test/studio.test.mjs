import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import {newDraft,validateDraft,exportCollection,moveFolder,safeAssetURL} from '../public/customize/model.mjs';
test('collection export preserves enabled order and importer fields',()=>{const d=newDraft();d.folders[1].enabled=false;moveFolder(d,d.folders[2].id,0);const output=exportCollection(d);assert.deepEqual(output.collections[0].folders.map(f=>f.title),['Science fiction','Movie night']);assert.equal(output.collections[0].folders[0].sources[0].filters.withGenres,'878');assert.equal(output.collections[0].folders[0].sources[0].provider,'tmdb');assert.equal(output.collections[0].folders[1].sources[0].tmdbSourceType,'POPULAR');assert.ok(output.collections[0].folders.every(f=>!Object.hasOwn(f,'enabled')));});
test('draft validation rejects corrupt data and strips undeclared credentials',()=>{const d=newDraft();assert.throws(()=>validateDraft({...d,folders:[d.folders[0],d.folders[0]]}));assert.throws(()=>validateDraft({...d,title:' '}));assert.throws(()=>validateDraft({...d,folders:[{...d.folders[0],kind:'LIST',tmdbID:-1}]}));assert.throws(()=>validateDraft({...d,folders:[{...d.folders[0],genre:'unknown'}]}));assert.equal(validateDraft({...d,apiKey:'secret'}).apiKey,undefined);assert.throws(()=>exportCollection({...d,folders:[]}));assert.deepEqual(validateDraft(JSON.parse(JSON.stringify(d))),d);});
test('TMDB lists retain IDs and movie collections reject series',()=>{const d=newDraft();d.folders=[{...d.folders[0],kind:'LIST',tmdbID:123}];assert.equal(exportCollection(d).collections[0].folders[0].sources[0].tmdbId,123);d.folders[0].kind='COLLECTION';d.folders[0].media='tv';assert.throws(()=>exportCollection(d));});
test('artwork URLs respect the GitHub Pages project boundary',()=>{const base='https://cedartv.github.io/cedar-tv-updates/';assert.equal(safeAssetURL('/avatars/custom/example.webp',base),base+'avatars/custom/example.webp');for(const url of ['https://evil.example/avatars/a.webp','../../avatars/a.webp','javascript:alert(1)'])assert.throws(()=>safeAssetURL(url,base));});
test('all gallery artwork and pack manifests exist locally',async()=>{const avatars=JSON.parse(await readFile('public/catalogs/avatars.json','utf8'));const badges=JSON.parse(await readFile('public/catalogs/badges.json','utf8'));const paths=[...avatars.avatars.map(a=>'public'+a.url),...badges.sets.flatMap(s=>['public/badge-packs/'+s.id+'.json',...s.badges.map(b=>'public'+b.imageURL)])];await Promise.all([...new Set(paths)].map(p=>access(decodeURIComponent(p))));});

test('device appearance isolates, inherits, resets and survives export',async()=>{
 const {appearanceFor,setAppearance,resetAppearance}=await import('../public/customize/model.mjs');
 const d=newDraft();setAppearance(d,'phone',{rowStyle:'classic',browseLayout:'chips-and-grid'});setAppearance(d,'desktop',{enabled:false});setAppearance(d,'shared',{cardStyle:'poster-wall'});
 assert.equal(appearanceFor(d,'television').cardStyle,'poster-wall');assert.equal(appearanceFor(d,'phone').rowStyle,'classic');assert.equal(appearanceFor(d,'phone').cardStyle,'backdrop');assert.equal(appearanceFor(d,'desktop').enabled,false);assert.equal(appearanceFor(d,'tablet').enabled,true);
 assert.deepEqual(validateDraft(JSON.parse(JSON.stringify(d))),d);
 const output=exportCollection(d).collections[0].cedarLayout;assert.equal(output.overrides.phone.rowStyle,'classic');assert.equal(output.overrides.desktop.enabled,false);assert.equal(output.shared.cardStyle,'poster-wall');
 resetAppearance(d,'phone');assert.equal(appearanceFor(d,'phone').cardStyle,'poster-wall');assert.ok(!exportCollection(d).collections[0].cedarLayout.overrides.phone);
});
test('legacy drafts inherit defaults; malformed device choices fail without mutation',async()=>{
 const {appearanceFor,setAppearance}=await import('../public/customize/model.mjs');const d=newDraft();delete d.deviceLayout;
 assert.equal(appearanceFor(validateDraft(d),'phone').rowStyle,'wide');assert.ok(!exportCollection(d).collections[0].cedarLayout);
 const before=JSON.stringify(d);assert.throws(()=>setAppearance(d,'phone',{rowStyle:'bad'}));assert.equal(JSON.stringify(d),before);assert.throws(()=>validateDraft({...d,deviceLayout:{version:2}}));assert.throws(()=>validateDraft({...d,deviceLayout:{version:1,shared:{},overrides:[]}}));
});
