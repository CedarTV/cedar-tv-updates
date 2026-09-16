import {presets,genres,folderFromPreset,newDraft,validateDraft,exportCollection,moveFolder,safeAssetURL,deviceFamilies,deviceNames,appearanceFor,setAppearance,resetAppearance} from './model.mjs';
const $ = id => document.getElementById(id);
const base = new URL('../',import.meta.url);
const publicBase = new URL('https://cedartv.github.io/cedar-tv-updates/');
const key='cedar-studio-draft-v1';
const say=message=>{$('status').textContent=message;};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,action,cls='text-button')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
let scope='shared', focusedFolderID=null;
let draft=newDraft(), editID=null, dragging=null, avatarData=null,badgeData=null,avatarLimit=48,selectedAvatar=null;
try{const raw=localStorage.getItem(key);if(raw)draft=validateDraft(JSON.parse(raw));}catch{say('A saved draft could not be restored. You can start fresh or open a draft file.');}
function save(){try{localStorage.setItem(key,JSON.stringify(validateDraft(draft)));$('save-state').textContent='Saved on this browser. Draft files let you keep a separate copy.';}catch{$('save-state').textContent='Not saved on this browser. Use Save draft file to keep your changes.';}}
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function copy(value,message){try{await navigator.clipboard.writeText(value);say(message);}catch{say('Copy is unavailable in this browser. Copy the URL from the field below.');let field=$('copy-fallback');if(!field){field=el('input');field.id='copy-fallback';field.readOnly=true;field.setAttribute('aria-label','URL to copy');$('status').after(field);}field.value=value;field.focus();field.select();}}
function renderPreview() {
 const restorePreviewFocus = document.activeElement?.classList.contains('preview-tile');
 const enabled = draft.folders.filter(f => f.enabled);
 const appearance = appearanceFor(draft, scope);
 const focused = enabled.find(f => f.id === focusedFolderID) || enabled[0];
 focusedFolderID = focused?.id || null;
 $('preview-title').textContent = draft.title || 'Your collection';
 $('preview-screen').dataset.rowStyle = appearance.rowStyle;
 $('preview-screen').dataset.cardStyle = appearance.cardStyle;
 $('preview-screen').dataset.browseLayout = appearance.browseLayout;
 $('preview-hidden').hidden = appearance.enabled;
 document.querySelector('.preview-collection').inert = !appearance.enabled;
 $('preview-folders').replaceChildren(...enabled.map(f => {
  const tile = button('', () => {focusedFolderID=f.id;renderPreview();}, 'preview-tile');
  tile.setAttribute('aria-label', `Preview ${f.title}`);
  tile.setAttribute('aria-pressed', String(f.id === focusedFolderID));
  tile.append(el('span','tile-symbol',f.emoji),el('small','',f.title));
  return tile;
 }));
 if(!enabled.length) $('preview-folders').append(el('p','preview-empty','Add a folder to begin.'));
 $('focused-folder-title').textContent = focused?.title || 'Your next favourite';
 $('focused-folder-subtitle').textContent = focused ? `${focused.media==='movie'?'Movies':'TV series'} · ${focused.kind.toLowerCase().replace('_',' ')}` : 'Build a collection below';
 const leaves = $('preview-leaves');
 leaves.replaceChildren(el('p','',appearance.browseLayout==='rows'?'Inside the folder · Clickable rows':'Inside the folder · Chips & grid'));
 const cards=el('div','leaf-examples');
 for(let i=0;i<6;i++) cards.append(el('span','leaf-example'));
 leaves.append(cards);
 $('export').disabled = !enabled.length || !draft.title.trim();
 if(restorePreviewFocus) $('preview-folders').querySelector('[aria-pressed="true"]')?.focus();
}
function renderDevice() {
 const appearance=appearanceFor(draft,scope);
 const overridden=scope!=='shared' && !!draft.deviceLayout?.overrides[scope];
 document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.device===scope)));
 $('hardware-scene').dataset.family=scope==='shared'?'television':scope;
 $('preview-device-name').textContent=deviceNames[scope];
 $('inspector-title').textContent=deviceNames[scope];
 $('scope-state').textContent=scope==='shared'?'All devices':overridden?'Customized':'Using shared layout';
 $('scope-state').classList.toggle('is-custom',overridden);
 $('scope-description').textContent=scope==='shared'?'Changes apply to devices using the shared layout.':`Changes here apply only to ${deviceNames[scope]}.`;
 $('device-note').textContent=({shared:'One starting point for all your screens. Choose a device to make an exception.',phone:'A portrait canvas, touch-friendly navigation, and a layout for one hand.',tablet:'More space to browse, with a landscape canvas and room for your collection.',desktop:'A window into your collection, with desktop navigation and a wider view.',television:'A cinematic canvas with remote focus. Select a folder to preview its featured state.'})[scope];
 $('device-enabled').checked=appearance.enabled;
 $('device-card-style').value=appearance.cardStyle;
 $('device-browse-layout').value=appearance.browseLayout;
 document.querySelectorAll('button[data-row-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rowStyle===appearance.rowStyle)));
 $('reset-device').hidden=scope==='shared';
 $('reset-device').disabled=!overridden;
 $('device-save-status').textContent=scope==='shared'?'Customized devices keep their own appearance.':overridden?'This device has its own appearance.':'This device follows changes to the shared layout.';
 renderPreview();
}
function chooseDevice(family) {
 if(family!=='shared'&&!deviceFamilies.includes(family))throw new Error('Unknown device.');
 scope=family;renderDevice();
}
function changeAppearance(patch) {
 setAppearance(draft,scope,patch);save();renderDevice();
 say(scope==='shared'?'Shared appearance saved.':`${deviceNames[scope]} appearance saved. Other devices are unchanged.`);
}
document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>chooseDevice(b.dataset.device)));
document.querySelectorAll('button[data-row-style]').forEach(b=>b.addEventListener('click',()=>changeAppearance({rowStyle:b.dataset.rowStyle})));
$('device-enabled').addEventListener('change',e=>changeAppearance({enabled:e.target.checked}));
$('device-card-style').addEventListener('change',e=>changeAppearance({cardStyle:e.target.value}));
$('device-browse-layout').addEventListener('change',e=>changeAppearance({browseLayout:e.target.value}));
$('reset-device').addEventListener('click',()=>{resetAppearance(draft,scope);save();renderDevice();say(`${deviceNames[scope]} now follows the shared layout.`);});
function renderFolders(focusID){$('folder-count').textContent=`${draft.folders.filter(f=>f.enabled).length}/${draft.folders.length}`;$('folder-list').replaceChildren(...draft.folders.map((f,index)=>{
 const row=el('li','folder-row');row.draggable=true;row.dataset.id=f.id;
 const check=el('input');check.type='checkbox';check.checked=f.enabled;check.setAttribute('aria-label',`Include ${f.title}`);check.className='folder-check';check.addEventListener('change',()=>{f.enabled=check.checked;save();renderFolders(f.id+':include');});check.dataset.focus=f.id+':include';
 const symbol=el('span','folder-symbol',f.emoji);symbol.setAttribute('aria-hidden','true');const label=el('div','folder-label');label.append(el('strong','',f.title),el('small','',`${f.media==='movie'?'Movies':'TV series'} · ${f.kind.toLowerCase().replace('_',' ')}`));
 const actions=el('div','row-actions');const edit=button('Edit',()=>openFolder(f.id),'edit-button');edit.dataset.focus=f.id+':edit';edit.setAttribute('aria-label',`Edit ${f.title}`);
 const up=button('↑',()=>reorder(f.id,index-1,f.id+':up'));up.disabled=index===0;up.setAttribute('aria-label',`Move ${f.title} up`);up.dataset.focus=f.id+':up';
 const down=button('↓',()=>reorder(f.id,index+1,f.id+':down'));down.disabled=index===draft.folders.length-1;down.setAttribute('aria-label',`Move ${f.title} down`);down.dataset.focus=f.id+':down';
 const remove=button('×',()=>{draft.folders.splice(index,1);save();renderFolders();say(`${f.title} removed.`);$('add-folder').focus();});remove.setAttribute('aria-label',`Remove ${f.title}`);actions.append(edit,up,down,remove);row.append(check,symbol,label,actions);
 row.addEventListener('dragstart',e=>{dragging=f.id;e.dataTransfer.setData('text/plain',f.id);e.dataTransfer.effectAllowed='move';});row.addEventListener('dragover',e=>{if(dragging){e.preventDefault();row.classList.add('drag-over');}});row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));row.addEventListener('drop',e=>{e.preventDefault();if(dragging)reorder(dragging,index);dragging=null;});row.addEventListener('dragend',()=>{dragging=null;document.querySelectorAll('.drag-over').forEach(n=>n.classList.remove('drag-over'));});return row;
}));if(!draft.folders.length)$('folder-list').append(el('li','empty','A blank canvas. Add a folder or choose a starting point below.'));renderPreview();if(focusID){const target=[...document.querySelectorAll('[data-focus]')].find(n=>n.dataset.focus===focusID&&!n.disabled);(target||$('add-folder')).focus();}}
function reorder(id,index,focus){moveFolder(draft,id,index);save();renderFolders(focus);say('Folder order updated.');}
function setGenres(selected=''){const media=$('folder-media').value;$('folder-genre').replaceChildren(new Option('All genres',''),...genres[media].map(([id,name])=>new Option(name,id)));$('folder-genre').value=selected;}
function updateKind(){const kind=$('folder-kind').value;const needsID=['LIST','COLLECTION'].includes(kind);$('tmdb-label').hidden=!needsID;$('folder-tmdb').required=needsID;$('folder-tmdb').disabled=!needsID;$('genre-label').hidden=kind!=='DISCOVER';if(kind==='COLLECTION'){$('folder-media').value='movie';setGenres();}$('folder-media').disabled=kind==='COLLECTION';}
function openFolder(id){editID=id;const f=draft.folders.find(f=>f.id===id);$('folder-name').value=f.title;$('folder-media').value=f.media;$('folder-kind').value=f.kind;$('folder-tmdb').value=f.tmdbID||'';$('folder-emoji').value=f.emoji;setGenres(f.genre);updateKind();$('folder-dialog').showModal();$('folder-name').focus();}
$('folder-form').addEventListener('submit',e=>{e.preventDefault();const f=draft.folders.find(f=>f.id===editID);if(!f)return;const title=$('folder-name').value.trim();if(!title){$('folder-name').setCustomValidity('Enter a folder name.');$('folder-name').reportValidity();return;}Object.assign(f,{title,media:$('folder-media').value,kind:$('folder-kind').value,genre:$('folder-genre').value,emoji:$('folder-emoji').value,tmdbID:Number($('folder-tmdb').value)});save();$('folder-dialog').close();renderFolders(f.id+':edit');say('Folder updated.');});
$('folder-name').addEventListener('input',()=>$('folder-name').setCustomValidity(''));
$('folder-media').addEventListener('change',()=>setGenres());$('folder-kind').addEventListener('change',updateKind);$('close-folder').addEventListener('click',()=>$('folder-dialog').close());
$('collection-name').value=draft.title;$('collection-name').addEventListener('input',e=>{draft.title=e.target.value;save();renderPreview();});
function add(preset){if(draft.folders.length>=100){say('This draft has reached its 100-folder limit.');return null;}const f=folderFromPreset(preset);draft.folders.push(f);save();renderFolders();say(`${f.title} added.`);return f;}
$('add-folder').addEventListener('click',()=>{const f=add({title:'New folder',emoji:'🌲',kind:'POPULAR',media:'movie'});if(f)openFolder(f.id);});
$('preset-list').append(...presets.map(p=>button(`${p.emoji} ${p.title}`,()=>add(p),'')));
$('export').addEventListener('click',()=>{try{download(exportCollection(draft),'cedar-collection.json');say('Collection exported. In Cedar, choose Import Collection JSON.');}catch(error){say(error.message);}});
$('save-draft').addEventListener('click',()=>{try{download(validateDraft(draft),'cedar-studio-draft.json');say('Draft saved to a file.');}catch(error){say(error.message);}});
$('import-draft').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>500000)throw new Error('Choose a draft smaller than 500 KB.');const incoming=validateDraft(JSON.parse(await file.text()));draft=incoming;$('collection-name').value=draft.title;save();renderFolders();renderDevice();say('Draft opened.');}catch(error){say(error instanceof SyntaxError?'This file is not valid JSON. Your current draft has not changed.':error.message);}finally{e.target.value='';}});
async function catalog(path){const response=await fetch(new URL(`catalogs/${path}.json`,base));if(!response.ok)throw new Error('Artwork could not be loaded. Check your connection and try this section again.');return response.json();}
const friendly=name=>name.replace(/[-_]/g,' ').replace(/\b(profile|avatar|webp)\b/gi,'').replace(/\s+/g,' ').trim();
function image(path,alt){const n=el('img');n.src=safeAssetURL(path,base);n.alt=alt;n.loading='lazy';n.width=100;n.height=100;return n;}
async function loadAvatars(){try{if(!avatarData){avatarData=(await catalog('avatars')).avatars;const categories=[...new Set(avatarData.map(a=>a.category).filter(Boolean))].sort();$('avatar-category').append(...categories.map(c=>new Option(c,c)));}renderAvatars();}catch(error){say(error.message);}}
function renderAvatars(){if(!avatarData)return;const query=$('avatar-search').value.toLowerCase();const category=$('avatar-category').value;const matches=avatarData.filter(a=>(!category||a.category===category)&&`${a.name} ${a.slug} ${a.category||''} ${(a.tags||[]).join(' ')}`.toLowerCase().includes(query));$('avatar-count').textContent=`${matches.length.toLocaleString()} avatars`;
$('avatar-grid').replaceChildren(...matches.slice(0,avatarLimit).map(a=>{const b=button('',()=>selectAvatar(a),'avatar-card');b.setAttribute('aria-pressed',String(selectedAvatar?.id===a.id));b.append(image(a.url,''),el('span','',friendly(a.name)||'Profile avatar'));return b;}));if(!matches.length)$('avatar-grid').append(el('p','empty','No avatars match. Try another name or category.'));$('more-avatars').hidden=matches.length<=avatarLimit;}
function selectAvatar(a){selectedAvatar=a;$('preview-avatar').src=safeAssetURL(a.url,base);const box=$('avatar-selection');box.hidden=false;box.replaceChildren(image(a.url,''),el('p','',`${friendly(a.name)} selected for your preview. Copy its URL to use in Cedar’s profile settings.`),button('Copy avatar URL',()=>copy(safeAssetURL(a.url,publicBase),'Avatar URL copied. Apply it in Cedar’s profile settings or Cedar Link.'),'button primary'));document.querySelectorAll('.avatar-card').forEach((n,i)=>n.setAttribute('aria-pressed',String(n.querySelector('img').src===safeAssetURL(a.url,base))));say('Avatar selected for this preview.');}
$('avatar-search').addEventListener('input',()=>{avatarLimit=48;renderAvatars();});$('avatar-category').addEventListener('change',()=>{avatarLimit=48;renderAvatars();});$('more-avatars').addEventListener('click',()=>{avatarLimit+=48;renderAvatars();});
async function loadBadges(){try{if(!badgeData)badgeData=(await catalog('badges')).sets;renderBadges();}catch(error){say(error.message);}}
function renderBadges(){if(!badgeData)return;const query=$('badge-search').value.toLowerCase();const matches=badgeData.filter(s=>`${s.label} ${s.creator} ${s.style}`.toLowerCase().includes(query));$('badge-count').textContent=`${matches.length} badge sets`;$('badge-grid').replaceChildren(...matches.map(set=>{const card=el('article','badge-card');const preview=el('div','badge-preview');preview.append(...set.badges.slice(0,6).map(b=>image(b.imageURL,b.name)));const copyButton=button('Copy pack URL',()=>copy(new URL(`badge-packs/${encodeURIComponent(set.id)}.json`,publicBase).href,`${set.label} pack URL copied. Add it in Cedar’s Source Badges settings.`),'button secondary');const details=el('details');details.append(el('summary','',`View all ${set.badges.length} badges`));details.addEventListener('toggle',()=>{if(details.open&&!details.dataset.loaded){details.dataset.loaded='true';const items=el('div');items.append(...set.badges.map(b=>image(b.imageURL,b.name)));details.append(items);}});card.append(preview,el('h3','',set.label),el('p','',`By ${set.creator} · ${set.style||'Badge set'}`),copyButton,details);return card;}));if(!matches.length)$('badge-grid').append(el('p','empty','No badge sets match. Try a creator or style.'));}
$('badge-search').addEventListener('input',renderBadges);
function route(){const requested=location.hash.slice(1);const section=['collections','avatars','badges'].includes(requested)?requested:'collections';document.querySelectorAll('[data-tab]').forEach(n=>{if(n.dataset.tab===section)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});for(const s of ['collections','avatars','badges'])$(`${s}-panel`).hidden=s!==section;if(section==='avatars')loadAvatars();if(section==='badges')loadBadges();}
window.addEventListener('hashchange',route);renderFolders();renderDevice();route();

// Optional agent navigation follows the same visible device-selection action.
if (document.modelContext?.registerTool) {
 const lifecycle = new AbortController();
 try {
  Promise.resolve(document.modelContext.registerTool({
   name:'preview_cedar_device', title:'Preview a Cedar device',
   description:'Select a device family in Cedar Studio. Does not change or export the collection.',
   inputSchema:{type:'object',properties:{device:{type:'string',enum:['shared',...deviceFamilies]}},required:['device'],additionalProperties:false},
   annotations:{readOnlyHint:false,untrustedContentHint:false},
   execute(input){if(!input||typeof input.device!=='string')throw new Error('Choose a device.');chooseDevice(input.device);location.hash='collections';return {device:scope,appearance:appearanceFor(draft,scope)};}
  },{signal:lifecycle.signal})).catch(()=>{});
 } catch {}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
