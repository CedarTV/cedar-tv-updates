import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseInvitation, makeCredentials, decodeSnapshot, commandEnvelope, editableRows, RELAY } from '../public/setup/model.mjs';
import { bytesToBase64URL, sealEnvelope, openEnvelope } from '../public/link/cedar-sync.mjs';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const key = bytesToBase64URL(new Uint8Array(32).fill(4));
function fixture() {
  const owner = { relayBaseURL: RELAY, spaceID: randomUUID(), deviceID: randomUUID(), deviceToken: key, profileKey: key };
  const profileID = randomUUID(), now = Date.now();
  const snapshot = { schemaVersion: 1, profileID, revision: 'a'.repeat(64), expiresAt: now + 120000,
    configuration: { profileID, profileName: 'Fixture', pages: [{ groups: [{ items: [{id:'home-layout',editable:true}, {id:'parental-enabled',editable:false}] }] }] } };
  return {owner, snapshot, browser:{...owner, deviceID:randomUUID(), ownerDeviceID:owner.deviceID}, now};
}
test('invitation is strict, expiring and restricted to the configured relay',()=>{
  const params=new URLSearchParams({v:'1',scope:'companion',relay:RELAY,space:randomUUID(),owner:randomUUID(),invitation:randomUUID(),enrollment:key,key,expires:String(Date.now()+60000)});
  assert.equal(parseInvitation('#'+params).relayBaseURL,RELAY);
  for(const [field,value] of [['relay','https://attacker.example'],['expires','1'],['expires',String(Date.now()+9999999)],['scope','profile']]){
    const invalid=new URLSearchParams(params);invalid.set(field,value);assert.throws(()=>parseInvitation('#'+invalid));
  }
  assert.throws(()=>parseInvitation('#'+params+'&key='+key));
});
test('browser trusts only the invitation-bound owner snapshot',async()=>{
  const {owner,snapshot,browser,now}=fixture();
  const change={schemaVersion:1,profileID:snapshot.profileID,entityKind:'android-setup-snapshot',entityID:snapshot.profileID,operation:'upsert',revision:1,modifiedAtEpochMilliseconds:now,payload:new TextEncoder().encode(JSON.stringify(snapshot))};
  const envelope=await sealEnvelope(change,owner,1);
  assert.deepEqual(await decodeSnapshot({envelope},browser),snapshot);
  assert.equal(await decodeSnapshot({envelope:{...envelope,deviceID:randomUUID()}},browser),null);
  await assert.rejects(()=>decodeSnapshot({envelope},browser, snapshot.expiresAt));
});
test('edits authenticate profile, request identity, current revision and deadline',async()=>{
  const {owner,snapshot,browser,now}=fixture();
  const {requestID,envelope}=await commandEnvelope(browser,snapshot,'setting',{id:'home-layout',value:'Detailed'},1,now);
  const change=await openEnvelope(envelope,owner);
  const command=JSON.parse(new TextDecoder().decode(change.payload));
  assert.equal(change.entityKind,'android-setup-command');assert.equal(change.entityID,requestID);
  assert.equal(command.profileID,snapshot.profileID);assert.equal(command.baseRevision,snapshot.revision);
  assert.ok(command.expiresAt<=snapshot.expiresAt);assert.equal(command.payload.value,'Detailed');
  assert.equal(editableRows(snapshot.configuration).length,1);
  assert.ok(!JSON.stringify(envelope).includes('Detailed'));
});
test('the editor avoids persistent secrets and renders untrusted values as text',async()=>{
  const js=await readFile(new URL('../public/setup/setup.mjs',import.meta.url),'utf8');
  const html=await readFile(new URL('../public/setup/index.html',import.meta.url),'utf8');
  assert.ok(!/localStorage|sessionStorage|indexedDB|innerHTML|insertAdjacentHTML/.test(js));
  assert.match(js,/history\.replaceState/);assert.match(html,/no-referrer/);assert.match(html,/script-src 'self'/);
});
