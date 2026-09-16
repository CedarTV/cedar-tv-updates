// Portable collection vocabulary mirrors CedarCore/ExternalCollectionImport.swift.
export const MAX_BYTES = 10 * 1024 * 1024;
export const deviceFamilies = ['phone','tablet','desktop','television'];
export const deviceNames = {shared:'All devices',phone:'iPhone',tablet:'iPad',desktop:'Mac',television:'TV'};
export const kinds = ['TRENDING','POPULAR','TOP_RATED','DISCOVER','UPCOMING','NOW_PLAYING','AIRING_TODAY','ON_THE_AIR','LIST','COLLECTION','COMPANY','NETWORK','PERSON','DIRECTOR'];
export const directKinds = kinds.slice(0,9);
export const genres = {movie:[['28','Action'],['12','Adventure'],['16','Animation'],['35','Comedy'],['80','Crime'],['99','Documentary'],['18','Drama'],['10751','Family'],['14','Fantasy'],['27','Horror'],['9648','Mystery'],['10749','Romance'],['878','Science fiction'],['53','Thriller']],tv:[['10759','Action & Adventure'],['16','Animation'],['35','Comedy'],['80','Crime'],['99','Documentary'],['18','Drama'],['10751','Family'],['10762','Kids'],['9648','Mystery'],['10764','Reality'],['10765','Sci-Fi & Fantasy']]};
const uid = () => crypto.randomUUID();
const obj = x => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x,fallback='') => typeof x === 'string' ? x.trim().slice(0,500) : fallback;
const name = (x,fallback) => text(x,fallback).slice(0,200) || fallback;
const positive = x => Number.isSafeInteger(x) && x>0;
const media = x => ['tv','series','show','shows'].includes(x) ? 'tv' : x==='both' ? 'both' : 'movie';
export function safeArtworkURL(value) {try {let u=new URL(value);if(u.hostname==='github.com'&&u.pathname.includes('/blob/')&&u.search==='?raw=true'){u=new URL('https://raw.githubusercontent.com'+u.pathname.replace('/blob/','/'));}return u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash ? u.href : '';}catch{return '';}}
export function safeAssetURL(path,base) {const u=new URL(path.replace(/^\//,''),base),b=new URL(base);if(u.origin!==b.origin || !u.pathname.startsWith(b.pathname) || !/\/(avatars|badges)\//.test(u.pathname))throw Error('Invalid artwork URL');return u.href;}
export const defaultAppearance = Object.freeze({enabled:true,rowStyle:'wide',cardStyle:'backdrop',browseLayout:'rows'});
export function newDeviceLayout(){return {version:1,shared:{...defaultAppearance},overrides:{}};}
function appearance(v){if(!obj(v)||typeof v.enabled!=='boolean'||!['classic','wide','feature'].includes(v.rowStyle)||!['backdrop','poster-wall'].includes(v.cardStyle)||!['rows','chips-and-grid'].includes(v.browseLayout))throw Error('Unsupported device appearance.');return {enabled:v.enabled,rowStyle:v.rowStyle,cardStyle:v.cardStyle,browseLayout:v.browseLayout};}
export function validateDeviceLayout(v){if(!obj(v)||v.version!==1||!obj(v.overrides)||Object.keys(v.overrides).some(k=>!deviceFamilies.includes(k)))throw Error('Unsupported device layout.');return {version:1,shared:appearance(v.shared),overrides:Object.fromEntries(Object.entries(v.overrides).map(([k,a])=>[k,appearance(a)]))};}
export function appearanceFor(row,family){const l=row.deviceLayout||newDeviceLayout();return {...(l.overrides[family]||l.shared)};}
export function setAppearance(row,family,patch){if(family!=='shared'&&!deviceFamilies.includes(family))throw Error('Unknown device.');const a=appearance({...appearanceFor(row,family),...patch});row.deviceLayout ||= newDeviceLayout();if(family==='shared')row.deviceLayout.shared=a;else row.deviceLayout.overrides[family]=a;}
export function resetAppearance(row,family){if(row.deviceLayout)delete row.deviceLayout.overrides[family];}
const stringFilters=['withGenres','releaseDateGte','releaseDateLte','withOriginalLanguage','withOriginCountry','withKeywords','withCompanies','withNetworks','watchRegion','withWatchProviders'];
const numberFilters=['voteAverageGte','voteAverageLte','voteCountGte','year'];
export function sanitizeSource(v){
 if(!obj(v))throw Error('A source is not a JSON object.');
 const s={id:text(v.id,uid()),title:name(v.title||v.name||v.genre,'Untitled source'),enabled:v.enabled!==false,provider:text(v.provider,'addon').toLowerCase()};
 for(const k of ['addonId','type','catalogId','genre','tmdbSourceType','mediaType','sortBy','sortHow'])if(typeof v[k]==='string')s[k]=text(v[k]);
 for(const k of ['tmdbId','traktListId'])if(positive(v[k]))s[k]=v[k];
 if(obj(v.filters)){s.filters={};for(const k of stringFilters)if(typeof v.filters[k]==='string')s.filters[k]=text(v.filters[k]);for(const k of numberFilters)if(typeof v.filters[k]==='number'&&Number.isFinite(v.filters[k])){if(['year','voteCountGte'].includes(k)&&!Number.isSafeInteger(v.filters[k]))continue;s.filters[k]=v.filters[k];}if(!Object.hasOwn(s.filters,'voteCountGte')&&Number.isSafeInteger(v.filters['vote_count.gte']))s.filters.voteCountGte=v.filters['vote_count.gte'];}
 if(s.provider==='tmdb')s.tmdbSourceType=(s.tmdbSourceType||'DISCOVER').toUpperCase();
 return s;
}
export function sourceProblem(s,direct=false){
 if(direct&&!['movie','movies','tv','series','show','shows'].includes(s.mediaType||s.type))return 'Choose Movies or TV shows for a direct Branch. Mixed-media sources belong in a Branch Group.';
 if(s.provider==='tmdb'){
  if(!kinds.includes(s.tmdbSourceType))return `Cedar does not support TMDB ${s.tmdbSourceType}.`;
  if(['LIST','COLLECTION','COMPANY','NETWORK','PERSON','DIRECTOR'].includes(s.tmdbSourceType)&&!positive(s.tmdbId))return 'A numeric TMDB ID is required.';
  if(direct&&!directKinds.includes(s.tmdbSourceType))return 'This source is supported inside a Branch Group. Move it into a group before exporting.';
  return '';
 }
 if(s.provider==='trakt')return !positive(s.traktListId)||!['movie','movies','tv','series','show','shows'].includes(s.mediaType) ? 'A public Trakt list ID and media type are required.' : '';
 if(s.provider==='addon'){
  if(direct)return 'This account source needs a Branch Group in the current Cedar importer.';
  if(['trakt.upnext','trakt.watchlist.movies','trakt.watchlist.series'].includes(s.catalogId))return '';
  if(s.catalogId&&/(?:^|[.:/])[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:$|[.:/])/i.test(s.addonId||''))return '';
  return 'This add-on cannot be matched to an installed Cedar Tobacco Tie.';
 }
 return `Cedar does not support the ${s.provider||'unknown'} source provider.`;
}
export function makeBranch(title='Trending',kind='TRENDING',type='movie',filters={}){return {id:uid(),kind:'branch',title,enabled:true,source:sanitizeSource({title,provider:'tmdb',tmdbSourceType:kind,mediaType:type,filters})};}
export function makeGroup(title='New Branch Group'){return {id:uid(),kind:'group',title,enabled:true,deviceLayout:newDeviceLayout(),branches:[]};}
export function makeChild(title='New branch'){return {id:uid(),title,enabled:true,sources:[makeBranch(title).source]};}
export const presets=[{title:'Trending movies',kind:'TRENDING',media:'movie'},{title:'Trending TV shows',kind:'TRENDING',media:'tv'},{title:'Popular movies',kind:'POPULAR',media:'movie'},{title:'Top rated movies',kind:'TOP_RATED',media:'movie'},{title:'Science fiction',kind:'DISCOVER',media:'movie',genre:'878'},{title:'Documentaries',kind:'DISCOVER',media:'movie',genre:'99'},{title:'Family movies',kind:'DISCOVER',media:'movie',genre:'10751'}];
export function newDraft(){return {version:2,title:'My Home',rows:[makeBranch('Trending movies'),makeBranch('Popular movies','POPULAR'),makeBranch('Top rated movies','TOP_RATED')]};}
function cleanChild(v){if(!obj(v)||!Array.isArray(v.sources)||v.sources.length>1000)throw Error('Invalid branch sources.');const b={id:text(v.id,uid()),title:name(v.title,'Untitled branch'),enabled:v.enabled!==false,sources:v.sources.map(sanitizeSource)};for(const k of ['coverImageUrl','customCoverImageUrl','heroBackdropUrl','focusGifUrl','titleLogoUrl']){const u=safeArtworkURL(v[k]);if(u)b[k]=u;}if(typeof v.focusGifEnabled==='boolean')b.focusGifEnabled=v.focusGifEnabled;if(['landscape','poster','square'].includes(String(v.tileShape).toLowerCase()))b.tileShape=v.tileShape.toLowerCase();return b;}
export function validateDraft(v){
 if(!obj(v)||v.version!==2||!Array.isArray(v.rows)||v.rows.length>1000)throw Error('Choose a supported collection or Cedar Studio draft.');
 let total=0;const ids=new Set();const rows=v.rows.map(r=>{if(!obj(r)||!['branch','group'].includes(r.kind))throw Error('Invalid Home row.');const row={id:text(r.id,uid()),kind:r.kind,title:name(r.title,'Untitled branch'),enabled:r.enabled!==false};if(ids.has(row.id))throw Error('The draft contains duplicate Home row IDs.');ids.add(row.id);if(r.kind==='branch'){row.source=sanitizeSource(r.source);total++;}else{if(!Array.isArray(r.branches)||r.branches.length>2000)throw Error('Too many branches in this group.');row.branches=r.branches.map(cleanChild);row.deviceLayout=validateDeviceLayout(r.deviceLayout||newDeviceLayout());const childIDs=new Set();for(const b of row.branches){if(childIDs.has(b.id))throw Error('The group contains duplicate branch IDs.');childIDs.add(b.id);const sourceIDs=new Set();for(const s of b.sources){if(sourceIDs.has(s.id))s.id=uid();sourceIDs.add(s.id);}total+=b.sources.length;}}return row;});
 if(total>15000)throw Error('Choose a collection with fewer than 15,000 sources.');return {version:2,title:name(v.title,'My Home'),rows};
}
const builtin={trending_movies:'TRENDING',trending_series:'TRENDING',trending_shows:'TRENDING',popular_movies:'POPULAR',popular_series:'POPULAR',popular_shows:'POPULAR',top_rated_movies:'TOP_RATED',toprated_movies:'TOP_RATED',top_rated_series:'TOP_RATED',top_rated_shows:'TOP_RATED',toprated_series:'TOP_RATED',toprated_shows:'TOP_RATED',upcoming_movies:'UPCOMING',now_playing_movies:'NOW_PLAYING',nowplaying_movies:'NOW_PLAYING',airing_today_series:'AIRING_TODAY',airing_today_shows:'AIRING_TODAY',on_the_air_series:'ON_THE_AIR',on_the_air_shows:'ON_THE_AIR'};
function resolveCatalog(ref,config){const id=ref.catalogId||'',type=ref.type||(/series|shows/.test(id)?'series':'movie'),label=config.catalog_name_overrides?.[id]||config.custom_lists?.find(l=>l.id===id)?.label||id.replaceAll('_',' ');const common={id:`catalog:${id}`,title:label,mediaType:type};const discover=config.discover_catalogs?.[id];if(discover)return {...common,provider:'tmdb',tmdbSourceType:'DISCOVER',filters:discover.filters,sortBy:discover.sort_by};if(builtin[id])return {...common,provider:'tmdb',tmdbSourceType:builtin[id]};const list=config.custom_lists?.find(l=>l.id===id);if(list){const n=Number(id.match(/^(?:tmdb|trakt)_list_(\d+)/)?.[1]);return {...common,provider:list.provider,mediaType:list.kind||type,...(list.provider==='tmdb'?{tmdbSourceType:'LIST',tmdbId:n}:{traktListId:n})};}return {...ref,title:label,provider:ref.provider||'addon'};}
export function parseImport(input){
 const serialized=typeof input==='string'?input:JSON.stringify(input);if(new TextEncoder().encode(serialized).length>MAX_BYTES)throw Error('Choose a JSON file smaller than 10 MB.');
 let data;try{data=typeof input==='string'?JSON.parse(input):input;}catch{throw Error('This is not valid JSON. Your current Home has not changed.');}
 if(data?.version===2)return {draft:validateDraft(data),issues:[],format:'Cedar Studio draft'};
 if(data?.version===1&&Array.isArray(data.folders)){
  const g=makeGroup(name(data.title,'Imported group'));g.id=text(data.id,uid());g.deviceLayout=validateDeviceLayout(data.deviceLayout||newDeviceLayout());g.branches=data.folders.map(f=>({id:text(f.id,uid()),title:name(f.title,'Untitled branch'),enabled:f.enabled!==false,sources:[sanitizeSource({title:f.title,provider:'tmdb',tmdbSourceType:f.kind,mediaType:f.media,tmdbId:f.tmdbID,filters:f.genre?{withGenres:f.genre}:{}})]}));return {draft:validateDraft({version:2,title:'My Home',rows:[g]}),issues:[],format:'Earlier Studio draft'};
 }
 if(data?.formatIdentifier==='app.cedar.home-branches')throw Error('This is a native Cedar share export. The current collection importer cannot restore these source bindings. Import collection JSON or a Studio draft instead.');
 const config=obj(data?.config)?data.config:obj(data)?data:{};const collections=Array.isArray(data)?data:Array.isArray(config.collections)?config.collections:obj(data)&&Array.isArray(data.folders)?[data]:[];
 if(!collections.length&&!config.home_rows?.length)throw Error('No collections found. Choose collection JSON, a Nuvio profile export, or a Cedar Studio draft.');
 const rows=[],issues=[];const rowIDs=new Set();const byExternal=new Map();
 for(const c of collections){if(!obj(c)||!Array.isArray(c.folders))throw Error('A collection has no branch list.');const g=makeGroup(name(c.title,'Imported group'));g.id=text(c.id,uid());if(rowIDs.has(g.id)){issues.push(`Duplicate group ID in ${g.title}; a fresh ID was assigned.`);g.id=uid();}rowIDs.add(g.id);g.deviceLayout=validateDeviceLayout(c.cedarLayout||newDeviceLayout());const childIDs=new Set();g.branches=c.folders.map(f=>{const sources=Array.isArray(f.sources)?f.sources:Array.isArray(f.catalogSources)?f.catalogSources.map(s=>resolveCatalog(s,config)):[];const b=cleanChild({...f,sources});if(childIDs.has(b.id))b.id=uid();childIDs.add(b.id);return b;});rows.push(g);byExternal.set(`collection:${c.id}`,g);}
 for(const h of config.home_rows||[]){const refs=collections.flatMap(c=>c.folders||[]).flatMap(f=>f.catalogSources||[]);const ref=refs.find(s=>s.catalogId===h.catalog_id)||{catalogId:h.catalog_id};const s=sanitizeSource(resolveCatalog(ref,config));const b={id:uid(),kind:'branch',title:name(config.catalog_name_overrides?.[h.catalog_id]||s.title,'Imported branch'),enabled:h.enabled!==false,source:s};rows.push(b);byExternal.set(`catalog:${h.catalog_id}`,b);}
 const ordered=[];for(const entry of config.home_order||[]){const row=byExternal.get(`${entry.kind}:${entry.id}`);if(row&&!ordered.includes(row))ordered.push(row);}for(const row of rows)if(!ordered.includes(row))ordered.push(row);
 const draft=validateDraft({version:2,title:'Imported Home',rows:ordered});
 for(const r of draft.rows){const pairs=r.kind==='branch'?[[r.title,r.source,true]]:r.branches.flatMap(b=>b.sources.map(s=>[`${r.title} / ${b.title}`,s,false]));for(const [path,s,direct] of pairs){const problem=sourceProblem(s,direct);if(problem)issues.push(`${path} / ${s.title}: ${problem}`);}if(r.kind==='group'&&r.branches.some(b=>b.sources.length===0))issues.push(`${r.title}: branches without sources cannot be exported.`);}
 return {draft,issues,format:data?.config?'Nuvio profile export':'Collection JSON'};
}
export function mergeImport(current,incoming,mode='append',selectedIDs=incoming.rows.map(r=>r.id)){
 const next=mode==='replace'?{version:2,title:current.title,rows:[]}:validateDraft(current);const chosen=validateDraft(incoming).rows.filter(r=>selectedIDs.includes(r.id));
 if(!chosen.length)throw Error('Select at least one Branch or Branch Group.');
 const signature=s=>JSON.stringify({...s,id:undefined,title:undefined,enabled:undefined});
 for(const row of chosen){const existing=next.rows.find(r=>r.kind===row.kind&&(r.id===row.id||r.title.toLowerCase()===row.title.toLowerCase()));if(mode==='missing'&&existing){if(row.kind==='group'){for(const child of row.branches){const match=existing.branches.find(b=>b.id===child.id||b.title.toLowerCase()===child.title.toLowerCase());if(!match)existing.branches.push(child);else for(const source of child.sources)if(!match.sources.some(s=>signature(s)===signature(source)))match.sources.push(source);}}continue;}if(next.rows.some(r=>r.id===row.id))row.id=uid();next.rows.push(row);}
 return validateDraft(next);
}
export function moveItem(items,id,position){const index=items.findIndex(i=>i.id===id);if(index<0||position<0||position>=items.length)return;items.splice(position,0,...items.splice(index,1));}
export function counts(draft){let branches=0,sources=0,unsupported=0;for(const r of draft.rows){if(r.kind==='branch'){branches++;sources++;if(sourceProblem(r.source,true))unsupported++;}else for(const b of r.branches){branches++;sources+=b.sources.length;unsupported+=b.sources.filter(s=>sourceProblem(s)).length;}}return {rows:draft.rows.length,branches,sources,unsupported};}
export function exportCollection(value){
 const draft=validateDraft(value),config={collections:[],home_rows:[],home_order:[],discover_catalogs:{},custom_lists:[],catalog_name_overrides:{}},issues=[];const directIDs=new Set();
 const clean=s=>{const {enabled,...source}=s;return source;};
 for(const row of draft.rows){if(!row.enabled)continue;
  if(row.kind==='group'){
   const folders=[];for(const b of row.branches){if(!b.enabled)continue;const sources=b.sources.filter(s=>{if(!s.enabled)return false;const p=sourceProblem(s);if(p)issues.push(`${b.title} / ${s.title}: ${p}`);return !p;});if(!sources.length){issues.push(`${b.title}: no compatible enabled sources.`);continue;}const {enabled,...folder}=b;folders.push({...folder,hideTitle:false,sources:sources.map(clean)});}
   if(!folders.length){issues.push(`${row.title}: no compatible enabled branches.`);continue;}
   config.collections.push({id:row.id,title:row.title,folders,cedarLayout:row.deviceLayout});config.home_order.push({kind:'collection',id:row.id});
  }else{
   const s=row.source;if(!s.enabled)continue;const problem=sourceProblem(s,true);if(problem){issues.push(`${row.title}: ${problem}`);continue;}let id;const type=media(s.mediaType)==='tv'?'series':'movie';
   if(s.provider==='trakt'||s.tmdbSourceType==='LIST'){if(s.sortBy||s.sortHow||Object.keys(s.filters||{}).length)issues.push(`${row.title}: direct list filters and sorting are not supported by Cedar’s profile import format; the list imports in its default order. Use a Branch Group to retain source filters.`);const provider=s.provider,idNumber=provider==='trakt'?s.traktListId:s.tmdbId;id=`${provider}_list_${idNumber}_${row.id}`;config.custom_lists.push({id,label:row.title,provider,kind:type});}
   else if(s.tmdbSourceType==='DISCOVER'||Object.keys(s.filters||{}).length||s.sortBy){id=`studio_${row.id}_${type==='series'?'series':'movies'}`;config.discover_catalogs[id]={filters:s.filters||{},...(s.sortBy?{sort_by:s.sortBy}:{})};}
   else{const stem={TRENDING:'trending',POPULAR:'popular',TOP_RATED:'top_rated',UPCOMING:'upcoming',NOW_PLAYING:'now_playing',AIRING_TODAY:'airing_today',ON_THE_AIR:'on_the_air'}[s.tmdbSourceType];id=`${stem}_${type==='series'?'series':'movies'}`;if(!builtin[id])throw Error(`${row.title}: choose a feed that supports this media type.`);}
   if(directIDs.has(id))throw Error(`Two Home branches use the same ${s.tmdbSourceType.toLowerCase()} feed. Keep one, or add discovery filters to distinguish them.`);directIDs.add(id);config.home_rows.push({catalog_id:id,enabled:true});config.home_order.push({kind:'catalog',id});config.catalog_name_overrides[id]=row.title;
  }
 }
 if(!config.home_order.length)throw Error('Enable at least one compatible branch or source before exporting.');return {document:{config},issues};
}
