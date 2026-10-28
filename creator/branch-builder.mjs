// Creator's Branch builder: the website's version of Cedar's New Branch page. Content first, then
// Build Your Own with Refine Results, then Layout, Branch Title and Devices. It edits a "build":
// {title, titleMode, style, platforms, source: {dataSource, query, filters}}.
import * as o from './branch-options.mjs';
import {renderBranchPreview} from './home-preview.mjs';

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,action,cls='text-button')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
function select(options,value,action,label){const s=el('select');s.setAttribute('aria-label',label);for(const x of options)s.append(new Option(x.title,x.id));s.value=value??'';s.addEventListener('change',()=>action(s.value));return s;}
function input(value,action,{label,placeholder='',type='text',commit='change'}={}){const i=el('input');i.type=type;i.value=value??'';i.placeholder=placeholder;i.setAttribute('aria-label',label);i.addEventListener(commit,()=>action(i.value));return i;}
const card=(title,subtitle)=>{const c=el('section','builder-card'),h=el('header');h.append(el('h3','',title));if(subtitle)h.append(el('p','',subtitle));c.append(h);return c;};
/** A "Show me / that are / sorted by" line, as Cedar's sentence rows. */
function line(prompt,control,filtered=false){const l=el('div',`builder-line${filtered?' filtered':''}`);l.append(el('span','builder-prompt',prompt),control);return l;}
const summary=(ids,list,fallback,labels={},kind)=>{const named=ids.map(id=>list.find(x=>x.id===id)?.title||labels[`${kind}:${id}`]||`#${id}`);return !named.length?fallback:named.length<=2?named.join(', '):`${named[0]}, ${named[1]} +${named.length-2}`;};

let dialog,state,ui,finish;

/**
 * Opens the builder. mode "branch" edits a whole Home Branch; "source" edits one row inside a
 * Branch Group folder, so it has no layout or devices. `onSave(build)` receives the result.
 */
export function openBranchBuilder({mode='branch',build=o.newBuild(),creating=true,onSave}){
 dialog=document.getElementById('branch-dialog');
 state=structuredClone(build);state.source.filters=o.cleanFilters(state.source.filters);
 ui={mode,creating,contentOpen:creating,refine:false,picker:null,listError:'',customPeriod:false};
 finish=onSave;render();dialog.showModal();
}

function update(change){change();render();}
const src=()=>state.source,filters=()=>state.source.filters;
function setFilters(f){state.source.filters=f;}
function setParam(key,value){const p={...src().query.parameters};if(value)p[key]=value;else delete p[key];src().query.parameters=p;}

function render(){
 const scroll=dialog.querySelector('.builder-body')?.scrollTop||0;
 const body=el('div','builder-body'),head=el('div','dialog-header'),titles=el('div');
 titles.append(el('p','eyebrow',ui.mode==='source'?'BRANCH GROUP ROW':ui.creating?'NEW BRANCH':'EDIT BRANCH'),el('h2','',ui.mode==='source'?(ui.creating?'Add a row':'Edit row'):(ui.creating?'New Branch':'Edit Branch')));
 const close=button('×',()=>dialog.close(),'icon-button');close.setAttribute('aria-label','Close Branch builder');head.append(titles,close);
 body.append(el('p','quiet',ui.mode==='source'?'Choose what this row shows on its folder page.':'Choose the content, refine it if needed, then decide how it appears on Home.'));
 body.append(contentCard());
 const specific=specificCard();if(specific)body.append(specific);
 if(o.isDiscovery(src())&&!['anime','seasonal','curatedList','metadataCollection'].includes(src().query.kind))body.append(discoveryCard());
 else body.append(orderCard());
 if(ui.mode==='branch')body.append(layoutCard());
 body.append(titleCard());
 if(ui.mode==='branch')body.append(devicesCard());
 const issue=o.sourceIssue(src())||(state.platforms&&!state.platforms.length?'Turn on at least one device.':''),foot=el('div','builder-footer');
 foot.append(el('p','builder-issue',issue),button('Cancel',()=>dialog.close(),'button'),button(ui.creating?(ui.mode==='source'?'Add row':'Create'):'Save',save,'button primary'));
 foot.lastChild.disabled=!!issue;
 dialog.replaceChildren(head,body,foot);
 body.scrollTop=scroll;
}

function save(){
 if(o.sourceIssue(src())||(state.platforms&&!state.platforms.length))return;
 const auto=o.automaticTitle(src()),result=structuredClone(state);
 result.title=result.titleMode==='custom'&&result.title.trim()?result.title.trim().slice(0,200):auto;
 if(result.titleMode!=='custom')result.titleMode='automatic';
 dialog.close();finish(result);
}

// MARK: Content

function contentCard(){
 const s=src(),c=card('Content',contentSummary(s)),chosen=o.choiceOf(s);
 const pick=button('',()=>update(()=>ui.contentOpen=!ui.contentOpen),'builder-row');pick.setAttribute('aria-expanded',String(ui.contentOpen));
 pick.append(el('strong','','Choose Content'),el('span','',listName(s)||chosen?.title||'Choose…'),el('span','builder-chevron',ui.contentOpen?'−':'+'));
 c.append(pick);
 if(ui.contentOpen){
  for(const group of o.sourceGroups){
   const d=el('details','builder-group');d.open=group.title==='Discover'||group.choices.includes(chosen);
   const sum=el('summary');sum.append(el('strong','',group.title),el('small','',`${group.choices.length} options`));d.append(sum);
   if(group.note)d.append(el('p','quiet',group.note));
   const grid=el('div','builder-choices');
   for(const choice of group.choices){const b=button('',()=>update(()=>{state.source=o.applyChoice(s,choice);ui.contentOpen=false;}),'builder-choice');b.setAttribute('aria-pressed',String(choice===chosen));b.append(el('strong','',choice.title),el('small','',choice.subtitle));grid.append(b);}
   d.append(grid);c.append(d);
  }
  const lists=el('details','builder-group');lists.open=!!listName(s)||!!ui.listError;
  const sum=el('summary');sum.append(el('strong','','Public Lists'),el('small','','Trakt, MDBList and TMDB'));lists.append(sum);
  const form=el('div','builder-inline');const url=input('',()=>{},{label:'Public list link',placeholder:'https://trakt.tv/users/…/lists/…',type:'url',commit:'input'});
  const use=button('Use this list',()=>update(()=>{try{const found=o.parseListURL(url.value,filters().contentType);state.source={...found.source,filters:o.cleanFilters({...filters(),contentType:found.contentType||filters().contentType})};ui.listError='';ui.contentOpen=false;}catch(e){ui.listError=e.message;}}),'button');
  form.append(url,use);lists.append(el('p','quiet','Paste a public list’s address. Anyone who imports your file sees it without signing in.'),form);
  if(ui.listError)lists.append(el('p','builder-issue',ui.listError));
  c.append(lists);
 }
 if(o.supportsContentType(s)){
  const seg=el('div','segmented builder-segmented');seg.setAttribute('aria-label','Content type');
  for(const t of o.contentTypes){const b=button(t.title,()=>update(()=>setFilters({...filters(),contentType:t.id})));b.setAttribute('aria-pressed',String(filters().contentType===t.id));seg.append(b);}
  c.append(line('Content Type',seg));
 }
 return c;
}
function listName(s){if(s.dataSource.identifier==='trakt-public')return `Trakt · ${s.query.identifier.replace('|','/')}`;if(s.dataSource.identifier==='mdblist-public')return `MDBList · ${s.query.identifier.replace('|','/')}`;if(s.query.parameters?.provider==='tmdb')return `TMDB list · ${s.query.identifier}`;return '';}
function contentSummary(s){const kind={preferredMetadata:'Discover',local:'Your Library',trackingService:'Saved & Tracked'}[s.dataSource.kind]||'Content';return listName(s)?'Public list':`${kind} · ${o.choiceOf(s)?.title||s.query.kind}`;}

/** The one thing an identified kind reads, like Cedar's Genre, Network or Year cards. */
function specificCard(){
 const s=src(),q=s.query,k=q.kind,setID=v=>update(()=>{const next={...q};if(v)next.identifier=String(v).trim();else delete next.identifier;s.query=next;});
 const tmdbField=(kind,label,placeholder)=>input(q.identifier,v=>{const r=o.tmdbID(v,kind);setID(r?.id||v);},{label,placeholder});
 const decades=o.releasePeriods().filter(p=>p.id.endsWith('s')).map(p=>({id:p.id.slice(0,4),title:p.title}));
 const choose=list=>[{id:'',title:'Choose…'},...list];
 const cards={
  trending:()=>['Trending',line('Window',select(o.trendingWindows,q.parameters.window||'week',v=>update(()=>setParam('window',v)),'Trending window'))],
  genre:()=>['Genre',line('Genre',select(choose(o.genres),q.identifier,setID,'Genre'))],
  network:()=>['Network',line('Network',select(choose([...o.homeNetworks,...(q.identifier&&!o.homeNetworks.some(n=>n.id===q.identifier)?[{id:q.identifier,title:`TMDB network ${q.identifier}`}]:[])]),q.identifier,setID,'Network')),line('or TMDB network ID',tmdbField('network','TMDB network ID or link','e.g. 49'))],
  productionCompany:()=>['Production Company',line('Company',select(choose([...o.studios,...(q.identifier&&!o.studios.some(n=>n.id===q.identifier)?[{id:q.identifier,title:`TMDB company ${q.identifier}`}]:[])]),q.identifier,setID,'Company')),line('or TMDB company ID',tmdbField('company','TMDB company ID or link','e.g. 41077'))],
  streamingProvider:()=>['Streaming Provider',line('Provider',select(choose(o.services),q.identifier,setID,'Provider')),line('in',select([{id:'',title:'The viewer’s region'},...o.regions],q.parameters.region||'',v=>update(()=>setParam('region',v)),'Region'))],
  metadataCollection:()=>['TMDB Collection',line('Collection',tmdbField('collection','TMDB collection ID or link','https://www.themoviedb.org/collection/…'))],
  curatedList:()=>q.parameters.provider==='tmdb'?['TMDB List',line('List',el('span','builder-value',`themoviedb.org/list/${q.identifier}`))]:['Curated List',line('List',select(choose(o.curatedLists),q.identifier,setID,'Curated list'))],
  year:()=>['Year',line('Year',input(q.identifier,setID,{label:'Year',placeholder:'YYYY',type:'number'}))],
  decade:()=>['Decade',line('Decade',select(choose(decades),q.identifier,setID,'Decade'))],
  country:()=>['Country',line('Country',select(choose(o.countries),q.identifier,setID,'Country'))],
  originalLanguage:()=>['Original Language',line('Language',select(choose(o.languages),q.identifier,setID,'Original language'))],
  anime:()=>['Anime',line('Discovery',select(o.animePresets,q.parameters.preset||'trending',v=>update(()=>setParam('preset',v)),'Anime discovery'))],
  seasonal:()=>['Seasonal',line('Season',select(o.seasonalPresets,q.parameters.preset||'christmas',v=>update(()=>setParam('preset',v)),'Season')),line('Year',input(q.parameters.year,v=>update(()=>setParam('year',/^\d{4}$/.test(v)?v:'')),{label:'Seasonal year',placeholder:'YYYY',type:'number'}))],
 };
 if(!cards[k]||!o.isDiscovery(s))return null;
 const [title,...rows]=cards[k](),c=card(title);c.append(...rows);return c;
}

// MARK: Build Your Own

function multi(key,prompt,list,selected,apply,{fallback,kind}){
 const f=filters(),open=ui.picker===key,b=button('',()=>update(()=>ui.picker=open?null:key),'builder-row');b.setAttribute('aria-expanded',String(open));
 b.append(el('span','builder-prompt',prompt),el('span',`builder-value${selected.length?' filtered':''}`,summary(selected,list,fallback,f.filterDisplayNames||{},kind)),el('span','builder-chevron',open?'−':'+'));
 const out=[b];
 if(open){const chips=el('div','builder-chips');for(const x of list){const on=selected.includes(x.id),chip=button('',()=>update(()=>apply(on?selected.filter(i=>i!==x.id):[...selected,x.id])),'builder-chip');chip.setAttribute('aria-pressed',String(on));chip.append(el('span','',x.title));if(x.note)chip.append(el('small','',x.note));chips.append(chip);}
  if(selected.length)chips.append(button('Clear',()=>update(()=>apply([])),'text-button'));out.push(chips);}
 return out;
}
function discoveryCard(){
 const s=src(),f=filters(),c=card('Build Your Own','Choose filters. Every row reads TMDB through each viewer’s own Cedar.');
 c.append(line('Show me',select(o.contentTypes,f.contentType,v=>update(()=>setFilters({...f,contentType:v})),'Show me'),f.contentType!=='both'));
 c.append(...multi('genres','that are',o.genres,f.genreIDs,v=>setFilters({...filters(),genreIDs:v}),{fallback:'any genre'}));
 c.append(...multi('services','available on',o.services,f.streamingProviderIDs,v=>{setFilters(o.withLabels({...filters(),streamingProviderIDs:v},'services',o.services.filter(x=>v.includes(x.id))));if(!v.length)setParam('region','');},{fallback:'any service',kind:'services'}));
 if(f.streamingProviderIDs.length&&s.query.kind!=='streamingProvider')c.append(line('in',select([{id:'',title:'The viewer’s region'},...o.regions],s.query.parameters.region||'',v=>update(()=>setParam('region',v)),'Streaming region')));
 c.append(line('sorted by',select(o.sortOrders,f.sortOrder||'popularity',v=>update(()=>setFilters({...filters(),sortOrder:v})),'Sorted by'),true));
 const refine=button('',()=>update(()=>ui.refine=!ui.refine),'builder-row builder-refine');refine.setAttribute('aria-expanded',String(ui.refine));
 refine.append(el('strong','','Refine Results'),el('span','','Optional people, studios, dates, and more'),el('span','builder-chevron',ui.refine?'−':'+'));c.append(refine);
 if(!ui.refine)return c;
 const p=s.query.parameters;
 const person=el('div','builder-inline');
 person.append(input(p.withPersonID?`https://www.themoviedb.org/person/${p.withPersonID}`:'',v=>update(()=>{const r=o.tmdbID(v,'person');if(!v.trim()){setParam('withPersonID','');setParam('personName','');}else if(r){setParam('withPersonID',r.id);if(r.name||!p.personName)setParam('personName',r.name||`Person ${r.id}`);}}),{label:'TMDB person link or ID',placeholder:'TMDB person link or ID'}));
 if(p.withPersonID)person.append(input(p.personName,v=>update(()=>setParam('personName',v.trim().slice(0,120))),{label:'Person’s name',placeholder:'Name'}));
 c.append(line('featuring',person,!!p.withPersonID));
 c.append(...multi('studios','made by',o.studios,f.productionCompanyIDs,v=>setFilters(o.withLabels({...filters(),productionCompanyIDs:v},'studios',o.studios.filter(x=>v.includes(x.id)))),{fallback:'any studio',kind:'studios'}));
 c.append(...multi('keywords','tagged with',o.keywords,f.keywordIDs||[],v=>{const next=o.withLabels({...filters(),keywordIDs:v},'keywords',o.keywords.filter(x=>v.includes(x.id)));if(!v.length)delete next.keywordIDs;setFilters(next);},{fallback:'any keyword',kind:'keywords'}));
 if(f.contentType!=='movies'){const current=o.networks.find(n=>n.ids[0]===f.networkIDs[0]);c.append(line('aired on',select([{id:'',title:'Any Network'},...o.networks],current?.id||'',v=>update(()=>{const n=o.networks.find(x=>x.id===v);setFilters(o.withLabels({...filters(),networkIDs:n?n.ids:[]},'networks',n?[n]:[]));}),'Aired on'),!!f.networkIDs.length));}
 const period=o.releasePeriod(f),periods=o.releasePeriods(),custom=ui.customPeriod||(period&&!periods.some(x=>x.id===period));
 const when=el('div','builder-inline');when.append(select([...periods,{id:'custom',title:'Custom Range…'}],custom?'custom':period,v=>update(()=>{ui.customPeriod=v==='custom';if(v!=='custom')setFilters(o.setReleasePeriod(filters(),v));}),'Release period'));
 if(custom)when.append(input(period,v=>update(()=>setFilters(o.setReleasePeriod(filters(),v))),{label:'Custom release range',placeholder:'1996–2003'}));
 c.append(line('from',when,!!period));
 if(f.contentType!=='movies'&&period)c.append(line('TV shows that',select([{id:'premiered',title:'Premiered Then'},{id:'aired',title:'Aired Then'}],f.matchesSeriesAirDates?'aired':'premiered',v=>update(()=>{const next={...filters()};if(v==='aired')next.matchesSeriesAirDates=true;else delete next.matchesSeriesAirDates;setFilters(next);}),'TV shows that'),!!f.matchesSeriesAirDates));
 c.append(line('rated',select(o.ratings,f.minimumVoteAverage?String(f.minimumVoteAverage):'',v=>update(()=>{const next={...filters()};if(v)next.minimumVoteAverage=Number(v);else delete next.minimumVoteAverage;setFilters(next);}),'Minimum rating'),!!f.minimumVoteAverage));
 c.append(line('in',select([{id:'',title:'Any Language'},...o.languages],f.originalLanguageCodes[0]||'',v=>update(()=>setFilters({...filters(),originalLanguageCodes:v?[v]:[]})),'Original language'),!!f.originalLanguageCodes.length));
 if(o.supportsStatus(s))c.append(line('currently',select(o.statuses,o.statusOf(s),v=>update(()=>{state.source=o.setStatus(s,v);}),'Currently'),o.statusOf(s)!=='any'));
 c.append(line('made in',select([{id:'',title:'Any Country'},...o.countries],f.countryCodes[0]||'',v=>update(()=>setFilters({...filters(),countryCodes:v?[v]:[]})),'Country of origin'),!!f.countryCodes.length));
 const votes=o.voteCounts.map(x=>x.id===''&&f.sortOrder==='topRated'?{...x,title:'Automatic'}:x);
 c.append(line('with at least',select(votes,f.minimumVoteCount!=null?String(f.minimumVoteCount):'',v=>update(()=>{const next={...filters()};if(v)next.minimumVoteCount=Number(v);else delete next.minimumVoteCount;setFilters(next);}),'Minimum number of ratings'),f.minimumVoteCount!=null));
 return c;
}
/** Lists and library rows keep their own order unless a sort is chosen. */
function orderCard(){
 const f=filters(),c=card('Order');
 c.append(line('sorted by',select([{id:'',title:o.isDiscovery(src())?'Most Popular':'Provider Order'},...o.sortOrders.filter(x=>x.id!=='popularity'||!o.isDiscovery(src())),{id:'alphabeticalDescending',title:'Reverse Alphabetical'}],f.sortOrder||'',v=>update(()=>{const next={...filters()};if(v)next.sortOrder=v;else delete next.sortOrder;setFilters(next);}),'Sorted by'),!!f.sortOrder));
 return c;
}

// MARK: Layout, title and devices

/** The Branch as Cedar would read it, for the Layout preview. */
export function previewJSON(build){const style=o.styles.find(x=>x.id===build.style)||o.styles[0];return {title:build.titleMode==='custom'&&build.title?build.title:o.automaticTitle(build.source),dataSource:build.source.dataSource,query:build.source.query,defaultFilters:build.source.filters,presentation:{templateID:style.template,...(style.posterLook?{posterLook:style.posterLook}:{})},folderOptions:[],isEnabled:true};}
function layoutCard(){
 const c=card('Layout','How this Branch looks on Home. Titles are samples.'),preview=el('div','builder-preview home-preview');preview.dataset.device='television';preview.dataset.titles=document.getElementById('home-preview')?.dataset.titles||'below';
 renderBranchPreview(preview,previewJSON(state));c.append(preview);
 const styles=el('div','builder-styles');
 for(const s of o.styles){const b=button('',()=>update(()=>state.style=s.id),`builder-style style-${s.id}`);b.setAttribute('aria-pressed',String(state.style===s.id));const sw=el('span','builder-swatch');sw.append(el('span'),el('span'));b.append(sw,el('span','',s.title));styles.append(b);}
 c.append(styles);
 if(state.style==='ratings')c.append(el('p','quiet','Poster + Ratings uses Cedar’s critic posters, with each viewer’s chosen rating sources.'));
 return c;
}
function titleCard(){
 const auto=o.automaticTitle(src());
 if(ui.mode==='source'){const c=card('Row Title');c.append(line('Title',input(state.titleMode==='custom'?state.title:'',v=>update(()=>{state.title=v;state.titleMode=v.trim()?'custom':'automatic';}),{label:'Row title',placeholder:auto})));return c;}
 const c=card('Branch Title','Choose how this Branch is named.'),toggle=el('label','checkbox-label'),box=el('input');box.type='checkbox';box.checked=state.titleMode==='custom';box.setAttribute('aria-label','Custom Title');
 box.addEventListener('change',()=>update(()=>{state.titleMode=box.checked?'custom':'automatic';if(box.checked&&!state.title)state.title=auto;}));toggle.append(box,el('span','','Custom Title'));c.append(toggle);
 if(state.titleMode==='custom')c.append(line('Title',input(state.title,v=>update(()=>state.title=v),{label:'Branch title',placeholder:auto})));
 else c.append(line('Title',el('span','builder-value',auto)));
 c.append(el('p','quiet','Branches keep loading more titles as you scroll. There is no item-count setting.'));
 return c;
}
function devicesCard(){
 const c=card('Devices','Turn a device off to keep this Branch off its Home. Everything else is shared by every device.'),all=el('label','checkbox-label'),box=el('input');box.type='checkbox';box.checked=!state.platforms;box.setAttribute('aria-label','All Devices');
 box.addEventListener('change',()=>update(()=>state.platforms=box.checked?null:[...o.families]));all.append(box,el('span','','All Devices'));c.append(all);
 if(state.platforms){const grid=el('div','builder-devices');for(const f of o.families){const l=el('label','checkbox-label'),b=el('input');b.type='checkbox';b.checked=state.platforms.includes(f);b.setAttribute('aria-label',o.familyNames[f]);b.addEventListener('change',()=>update(()=>{state.platforms=b.checked?[...state.platforms,f]:state.platforms.filter(x=>x!==f);}));l.append(b,el('span','',o.familyNames[f]));grid.append(l);}c.append(grid);
  if(!state.platforms.length)c.append(el('p','builder-issue','Turn on at least one device, or this Branch won’t show anywhere.'));}
 return c;
}
