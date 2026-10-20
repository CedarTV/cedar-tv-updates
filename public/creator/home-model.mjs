// Creator's Home: setups picked from the catalog plus the person's own Branches, read from other
// apps' collection JSON or built by hand. It writes Cedar's native .cedar files: a Branches file to
// share, or a sealed profile file that keeps the owner's Tobacco Ties.
import {branchesFile,profileFile,cedarDate,findTobaccoTies,addonFamily} from '../shared/cedar-file.mjs';
import {cleanCedarSource,sourceIssue,families} from './branch-options.mjs';
import {creatorBundleID,maximumCartItems,isItemID,isAvatarPath,avatarURL,isBadgePackID,badgePackURL,setupOf} from './creator-model.mjs';
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
 // Built in Creator's Branch builder: Cedar's own dataSource, query and filters.
 if(s.provider==='cedar'){try{s.cedar=cleanCedarSource(v.cedar);}catch{delete s.cedar;}}
 return s;
}
export function sourceProblem(s,direct=false){
 if(s.provider==='tmdb'){
  if(!kinds.includes(s.tmdbSourceType))return `Cedar does not support TMDB ${s.tmdbSourceType}.`;
  if(['LIST','COLLECTION','COMPANY','NETWORK','PERSON','DIRECTOR'].includes(s.tmdbSourceType)&&!positive(s.tmdbId))return 'A numeric TMDB ID is required.';
  return '';
 }
 if(s.provider==='trakt')return !positive(s.traktListId)||!['movie','movies','tv','series','show','shows'].includes(s.mediaType) ? 'A public Trakt list ID and media type are required.' : '';
 if(s.provider==='cedar')return s.cedar?sourceIssue(s.cedar):'This source can’t be read.';
 if(s.provider==='addon')return ['trakt.upnext','trakt.watchlist.movies','trakt.watchlist.series'].includes(s.catalogId) ? '' : 'Tobacco Tie catalogs can’t travel in a .cedar file, so Cedar leaves this source out.';
 return `Cedar does not support the ${s.provider||'unknown'} source provider.`;
}
export function makeBranch(title='Trending',kind='TRENDING',type='movie',filters={}){return {id:uid(),kind:'branch',title,enabled:true,source:sanitizeSource({title,provider:'tmdb',tmdbSourceType:kind,mediaType:type,filters})};}
export function makeGroup(title='New Branch Group'){return {id:uid(),kind:'group',title,enabled:true,deviceLayout:newDeviceLayout(),branches:[]};}
export function makeChild(title='New branch',shape){const b={id:uid(),title,enabled:true,sources:[makeBranch(title).source]};if(shape&&shape!=='landscape')b.tileShape=shape;return b;}
// Rows made in the Branch builder (branch-builder.mjs). A "build" is {title, titleMode, style,
// platforms, source: {dataSource, query, filters}}; rows keep it as a `cedar` source.
const styleOf=row=>row.rowStyle==='wide'?'landscape':row.rowStyle==='feature'?'feature':row.posterLook==='critic'?'ratings':'poster';
/** A source as the builder edits it. Imported TMDB and Trakt sources convert; Tobacco Tie ones can't. */
export function buildSource(s){const problem=sourceProblem(s,true);if(problem&&s.provider!=='cedar')throw Error(problem);return cleanCedarSource(cedarSource(s));}
export function buildFromRow(row){return {title:row.title,titleMode:row.titleMode==='automatic'?'automatic':'custom',style:styleOf(row),platforms:row.platforms?[...row.platforms]:null,source:buildSource(row.source)};}
export function buildFromChild(s){return {title:s.title,titleMode:'custom',style:'poster',platforms:null,source:buildSource(s)};}
export function sourceFromBuild(build,id=uid()){return {id,title:name(build.title,'Untitled source'),enabled:true,provider:'cedar',cedar:cleanCedarSource(build.source)};}
/** Writes a build onto a direct Branch row (made with `rowFromBuild` or opened with `buildFromRow`). */
export function applyBuild(row,build){
 row.title=name(build.title,'Untitled branch');row.source=sourceFromBuild(build,row.source?.id);
 if(build.style==='landscape')row.rowStyle='wide';else if(build.style==='feature')row.rowStyle='feature';else delete row.rowStyle;
 if(build.style==='ratings')row.posterLook='critic';else delete row.posterLook;
 if(build.titleMode==='automatic')row.titleMode='automatic';else delete row.titleMode;
 const platforms=Array.isArray(build.platforms)?families.filter(f=>build.platforms.includes(f)):[];
 if(platforms.length&&platforms.length<families.length)row.platforms=platforms;else delete row.platforms;
 return row;
}
export function rowFromBuild(build){return applyBuild({id:uid(),kind:'branch',title:'',enabled:true},build);}
/** Home row styles: Cedar's poster, wide backdrop and featured rows. */
export const rowStyles=['classic','wide','feature'];
export const cardShapes=['landscape','poster','square'];
/** A Branch Group shows every folder card in one shape, its first folder's (as Cedar does). */
export function groupCardShape(row){return row.branches[0]?.tileShape||'landscape';}
export function setGroupCardShape(row,shape){if(!cardShapes.includes(shape))throw Error('Unknown card shape.');for(const b of row.branches){if(shape==='landscape')delete b.tileShape;else b.tileShape=shape;}}
export const presets=[{title:'Trending movies',kind:'TRENDING',media:'movie'},{title:'Trending TV shows',kind:'TRENDING',media:'tv'},{title:'Popular movies',kind:'POPULAR',media:'movie'},{title:'Top rated movies',kind:'TOP_RATED',media:'movie'},{title:'Science fiction',kind:'DISCOVER',media:'movie',genre:'878'},{title:'Documentaries',kind:'DISCOVER',media:'movie',genre:'99'},{title:'Family movies',kind:'DISCOVER',media:'movie',genre:'10751'}];
export function newDraft(){return {version:2,title:'My Home',rows:[makeBranch('Trending movies'),makeBranch('Popular movies','POPULAR'),makeBranch('Top rated movies','TOP_RATED')]};}
function cleanChild(v){if(!obj(v)||!Array.isArray(v.sources)||v.sources.length>1000)throw Error('Invalid branch sources.');const b={id:text(v.id,uid()),title:name(v.title,'Untitled branch'),enabled:v.enabled!==false,sources:v.sources.map(sanitizeSource)};for(const k of ['coverImageUrl','customCoverImageUrl','heroBackdropUrl','focusGifUrl','titleLogoUrl']){const u=safeArtworkURL(v[k]);if(u)b[k]=u;}if(typeof v.focusGifEnabled==='boolean')b.focusGifEnabled=v.focusGifEnabled;if(['landscape','poster','square'].includes(String(v.tileShape).toLowerCase()))b.tileShape=v.tileShape.toLowerCase();return b;}
/** A setup or one of its groups from the Creator catalog. Its Branches are exported exactly as published. */
function cleanPick(v){if(!obj(v)||!['setup','group'].includes(v.type)||!isItemID(v.id)||(v.type==='group')!==v.id.includes('.'))throw Error('Invalid Creator pick.');return {type:v.type,id:v.id};}
export function makePick(item,title){return {id:`pick.${item.id}`,kind:'pick',title:name(title,'Creator setup'),enabled:true,item:cleanPick(item)};}
/** The picks as a Creator cart, so a Home made only of enabled picks can still be shared as a link. */
export function draftCart(draft){if(!draft.rows.length||draft.rows.some(r=>r.kind!=='pick'||!r.enabled))return null;const cart=draft.rows.map(r=>({...r.item}));if(draft.avatar)cart.push({type:'avatar',id:draft.avatar});if(draft.badgePack)cart.push({type:'badges',id:draft.badgePack});return cart;}
/** Adds a catalog pick. A whole setup replaces any of its groups already on Home; a group already inside a picked setup is not added again. */
export function addPick(draft,item,title){const picks=draft.rows.filter(r=>r.kind==='pick');if(picks.some(r=>r.item.id===item.id))return 'duplicate';if(item.type==='group'&&picks.some(r=>r.item.type==='setup'&&r.item.id===setupOf(item.id)))return 'included';const row=makePick(item,title);if(item.type==='setup'){const isGroupOf=r=>r.kind==='pick'&&r.item.type==='group'&&setupOf(r.item.id)===item.id;const first=draft.rows.findIndex(isGroupOf);if(first>=0){draft.rows=draft.rows.flatMap((r,i)=>i===first?[row]:isGroupOf(r)?[]:[r]);return 'replaced';}}if(picks.length>=maximumCartItems)return 'full';draft.rows.push(row);return 'added';}
export function pickState(draft,item){const picks=draft.rows.filter(r=>r.kind==='pick');if(picks.some(r=>r.item.id===item.id))return 'added';if(item.type==='group'&&picks.some(r=>r.item.type==='setup'&&r.item.id===setupOf(item.id)))return 'included';return 'available';}
export function validateDraft(v){
 if(!obj(v)||v.version!==2||!Array.isArray(v.rows)||v.rows.length>1000)throw Error('Choose a supported collection or saved Creator draft.');
 let total=0;const ids=new Set();const rows=v.rows.map(r=>{if(!obj(r)||!['branch','group','pick'].includes(r.kind))throw Error('Invalid Home row.');const row={id:text(r.id,uid()),kind:r.kind,title:name(r.title,'Untitled branch'),enabled:r.enabled!==false};if(ids.has(row.id))throw Error('The draft contains duplicate Home row IDs.');ids.add(row.id);if(r.kind==='branch'){row.source=sanitizeSource(r.source);if(rowStyles.includes(r.rowStyle))row.rowStyle=r.rowStyle;if(r.posterLook==='critic')row.posterLook='critic';if(r.titleMode==='automatic')row.titleMode='automatic';const platforms=Array.isArray(r.platforms)?families.filter(f=>r.platforms.includes(f)):[];if(platforms.length&&platforms.length<families.length)row.platforms=platforms;total++;}else if(r.kind==='pick'){row.item=cleanPick(r.item);}else{if(!Array.isArray(r.branches)||r.branches.length>2000)throw Error('Too many branches in this group.');row.branches=r.branches.map(cleanChild);row.deviceLayout=validateDeviceLayout(r.deviceLayout||newDeviceLayout());const childIDs=new Set();for(const b of row.branches){if(childIDs.has(b.id))throw Error('The group contains duplicate branch IDs.');childIDs.add(b.id);const sourceIDs=new Set();for(const s of b.sources){if(sourceIDs.has(s.id))s.id=uid();sourceIDs.add(s.id);}total+=b.sources.length;}}return row;});
 if(total>15000)throw Error('Choose a collection with fewer than 15,000 sources.');const draft={version:2,title:name(v.title,'My Home'),rows};if(isAvatarPath(v.avatar))draft.avatar=v.avatar;if(isBadgePackID(v.badgePack))draft.badgePack=v.badgePack;if(typeof v.bundleID==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.bundleID))draft.bundleID=v.bundleID.toUpperCase();return draft;
}
const builtin={trending_movies:'TRENDING',trending_series:'TRENDING',trending_shows:'TRENDING',popular_movies:'POPULAR',popular_series:'POPULAR',popular_shows:'POPULAR',top_rated_movies:'TOP_RATED',toprated_movies:'TOP_RATED',top_rated_series:'TOP_RATED',top_rated_shows:'TOP_RATED',toprated_series:'TOP_RATED',toprated_shows:'TOP_RATED',upcoming_movies:'UPCOMING',now_playing_movies:'NOW_PLAYING',nowplaying_movies:'NOW_PLAYING',airing_today_series:'AIRING_TODAY',airing_today_shows:'AIRING_TODAY',on_the_air_series:'ON_THE_AIR',on_the_air_shows:'ON_THE_AIR'};
function resolveCatalog(ref,config){const id=ref.catalogId||'',type=ref.type||(/series|shows/.test(id)?'series':'movie'),label=config.catalog_name_overrides?.[id]||config.custom_lists?.find(l=>l.id===id)?.label||id.replaceAll('_',' ');const common={id:`catalog:${id}`,title:label,mediaType:type};const discover=config.discover_catalogs?.[id];if(discover)return {...common,provider:'tmdb',tmdbSourceType:'DISCOVER',filters:discover.filters,sortBy:discover.sort_by};if(builtin[id])return {...common,provider:'tmdb',tmdbSourceType:builtin[id]};const list=config.custom_lists?.find(l=>l.id===id);if(list){const n=Number(id.match(/^(?:tmdb|trakt)_list_(\d+)/)?.[1]);return {...common,provider:list.provider,mediaType:list.kind||type,...(list.provider==='tmdb'?{tmdbSourceType:'LIST',tmdbId:n}:{traktListId:n})};}return {...ref,title:label,provider:ref.provider||'addon'};}
export function parseImport(input){
 const serialized=typeof input==='string'?input:JSON.stringify(input);if(new TextEncoder().encode(serialized).length>MAX_BYTES)throw Error('Choose a JSON file smaller than 10 MB.');
 let data;try{data=typeof input==='string'?JSON.parse(input):input;}catch{throw Error('This is not valid JSON. Your current Home has not changed.');}
 if(data?.version===2)return {draft:validateDraft(data),issues:[],format:'Saved Creator draft'};
 if(data?.version===1&&Array.isArray(data.folders)){
  const g=makeGroup(name(data.title,'Imported group'));g.id=text(data.id,uid());g.deviceLayout=validateDeviceLayout(data.deviceLayout||newDeviceLayout());g.branches=data.folders.map(f=>({id:text(f.id,uid()),title:name(f.title,'Untitled branch'),enabled:f.enabled!==false,sources:[sanitizeSource({title:f.title,provider:'tmdb',tmdbSourceType:f.kind,mediaType:f.media,tmdbId:f.tmdbID,filters:f.genre?{withGenres:f.genre}:{}})]}));return {draft:validateDraft({version:2,title:'My Home',rows:[g]}),issues:[],format:'Earlier saved draft'};
 }
 if(data?.formatIdentifier==='app.cedar.home-branches'||data?.formatIdentifier==='app.cedar.bundle')throw Error('This is already a Cedar file. Open it in Cedar. To keep editing here, open a saved Creator draft instead.');
 const config=obj(data?.config)?data.config:obj(data)?data:{};const collections=Array.isArray(data)?data:Array.isArray(config.collections)?config.collections:obj(data)&&Array.isArray(data.folders)?[data]:[];
 if(!collections.length&&!config.home_rows?.length)throw Error('No collections found. Choose collection JSON, a Nuvio profile export, or a saved Creator draft.');
 const rows=[],issues=[];const rowIDs=new Set();const byExternal=new Map();
 for(const c of collections){if(!obj(c)||!Array.isArray(c.folders))throw Error('A collection has no branch list.');const g=makeGroup(name(c.title,'Imported group'));g.id=text(c.id,uid());if(rowIDs.has(g.id)){issues.push(`Duplicate group ID in ${g.title}; a fresh ID was assigned.`);g.id=uid();}rowIDs.add(g.id);g.deviceLayout=validateDeviceLayout(c.cedarLayout||newDeviceLayout());const childIDs=new Set();g.branches=c.folders.map(f=>{const sources=Array.isArray(f.sources)?f.sources:Array.isArray(f.catalogSources)?f.catalogSources.map(s=>resolveCatalog(s,config)):[];const b=cleanChild({...f,sources});if(childIDs.has(b.id))b.id=uid();childIDs.add(b.id);return b;});rows.push(g);byExternal.set(`collection:${c.id}`,g);}
 for(const h of config.home_rows||[]){const refs=collections.flatMap(c=>c.folders||[]).flatMap(f=>f.catalogSources||[]);const ref=refs.find(s=>s.catalogId===h.catalog_id)||{catalogId:h.catalog_id};const s=sanitizeSource(resolveCatalog(ref,config));const b={id:uid(),kind:'branch',title:name(config.catalog_name_overrides?.[h.catalog_id]||s.title,'Imported branch'),enabled:h.enabled!==false,source:s};rows.push(b);byExternal.set(`catalog:${h.catalog_id}`,b);}
 const ordered=[];for(const entry of config.home_order||[]){const row=byExternal.get(`${entry.kind}:${entry.id}`);if(row&&!ordered.includes(row))ordered.push(row);}for(const row of rows)if(!ordered.includes(row))ordered.push(row);
 const draft=validateDraft({version:2,title:'Imported Home',rows:ordered});
 for(const r of draft.rows){const pairs=r.kind==='branch'?[[r.title,r.source,true]]:r.branches.flatMap(b=>b.sources.map(s=>[`${r.title} / ${b.title}`,s,false]));for(const [path,s,direct] of pairs){const problem=sourceProblem(s,direct);if(problem)issues.push(`${path} / ${s.title}: ${problem}`);}if(r.kind==='group'&&r.branches.some(b=>b.sources.length===0))issues.push(`${r.title}: branches without sources cannot be exported.`);}
 return {draft,issues,format:data?.config?'Nuvio profile export':'Collection JSON',ties:findTobaccoTies(data)};
}
export function mergeImport(current,incoming,mode='append',selectedIDs=incoming.rows.map(r=>r.id)){
 const next=mode==='replace'?{version:2,title:current.title,bundleID:current.bundleID,avatar:current.avatar,badgePack:current.badgePack,rows:[]}:validateDraft(current);const chosen=validateDraft(incoming).rows.filter(r=>selectedIDs.includes(r.id));
 if(!chosen.length)throw Error('Select at least one Branch or Branch Group.');
 const signature=s=>JSON.stringify({...s,id:undefined,title:undefined,enabled:undefined});
 for(const row of chosen){const existing=next.rows.find(r=>r.kind===row.kind&&(r.id===row.id||r.title.toLowerCase()===row.title.toLowerCase()));if(mode==='missing'&&existing){if(row.kind==='group'){for(const child of row.branches){const match=existing.branches.find(b=>b.id===child.id||b.title.toLowerCase()===child.title.toLowerCase());if(!match)existing.branches.push(child);else for(const source of child.sources)if(!match.sources.some(s=>s.id===source.id||signature(s)===signature(source)))match.sources.push(source);}}continue;}if(next.rows.some(r=>r.id===row.id))row.id=uid();next.rows.push(row);}
 return validateDraft(next);
}
export function moveItem(items,id,position){const index=items.findIndex(i=>i.id===id);if(index<0||position<0||position>=items.length)return;items.splice(position,0,...items.splice(index,1));}
export function counts(draft){let branches=0,sources=0,unsupported=0;let picks=0;for(const r of draft.rows){if(r.kind==='pick'){picks++;continue;}if(r.kind==='branch'){branches++;sources++;if(sourceProblem(r.source,true))unsupported++;}else for(const b of r.branches){branches++;sources+=b.sources.length;unsupported+=b.sources.filter(s=>sourceProblem(s)).length;}}return {rows:draft.rows.length,picks,branches,sources,unsupported};}
// Creator writes Cedar's own `.cedar` Branches file (CEDAR_FILE_FORMAT.md in the Cedar repo).
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fnv=(input,seed)=>{let h=seed;for(const byte of new TextEncoder().encode(input))h=BigInt.asUintN(64,(h^BigInt(byte))*1099511628211n);return h;};
export function stableUUID(namespace,value){if(uuidPattern.test(value))return value.toUpperCase();const input=`${namespace.toLowerCase()}|studio.row.${value}`,high=fnv(input,14695981039346656037n),low=fnv(input,1099511628211n),hex=(v,n)=>v.toString(16).padStart(n,'0').toUpperCase();return `${hex((high>>32n)&0xffffffffn,8)}-${hex((high>>16n)&0xffffn,4)}-${hex((high&0xfffn)|0x5000n,4)}-${hex(((low>>48n)&0x3fffn)|0x8000n,4)}-${hex(low&0xffffffffffffn,12)}`;}
const cedarContent=x=>['movie','movies'].includes(x)?'movies':['tv','series','show','shows'].includes(x)?'shows':'both';
const ids=x=>typeof x==='string'?x.split(/[,|]/).map(v=>v.trim()).filter(Boolean):[];
const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)?`${x}T00:00:00Z`:undefined;
const tmdbSorts={'popularity':'popularity','vote_average':'topRated','vote_count':'voteCount','revenue':'revenue','runtime':'runtime'};
function tmdbSort(v){const [field,dir]=String(v||'').toLowerCase().split('.');if(tmdbSorts[field])return tmdbSorts[field];if(['primary_release_date','first_air_date'].includes(field))return dir==='asc'?'releaseDateOldest':'releaseDate';if(['title','name'].includes(field))return dir==='desc'?'alphabeticalDescending':'alphabetical';return undefined;}
function traktSort(v,how){const d=String(how||'').toLowerCase()==='desc';return {title:d?'alphabeticalDescending':'alphabetical',released:d?'releaseDate':'releaseDateOldest',added:d?'releaseDate':'releaseDateOldest',runtime:'runtime',popularity:'popularity',percentage:'topRated',votes:'voteCount'}[String(v||'').toLowerCase()];}
export function cedarFilters(contentType,f={},sortOrder){const out={contentType,genreIDs:ids(f.withGenres),originalLanguageCodes:ids(f.withOriginalLanguage),countryCodes:ids(f.withOriginCountry),streamingProviderIDs:ids(f.withWatchProviders),networkIDs:ids(f.withNetworks),productionCompanyIDs:ids(f.withCompanies)};const keywords=ids(f.withKeywords);if(keywords.length)out.keywordIDs=keywords;if(Number.isSafeInteger(f.year))out.releaseYear=f.year;else{const start=day(f.releaseDateGte),end=day(f.releaseDateLte);if(start)out.releaseDateStart=start;if(end)out.releaseDateEnd=end;}if(typeof f.voteAverageGte==='number')out.minimumVoteAverage=f.voteAverageGte;if(typeof f.voteAverageLte==='number')out.maximumVoteAverage=f.voteAverageLte;if(Number.isSafeInteger(f.voteCountGte))out.minimumVoteCount=f.voteCountGte;if(sortOrder)out.sortOrder=sortOrder;return out;}
const feeds={TRENDING:'trending',POPULAR:'popular',TOP_RATED:'topRated',UPCOMING:'upcoming',NOW_PLAYING:'nowPlaying',AIRING_TODAY:'airingToday',ON_THE_AIR:'onTheAir',DISCOVER:'popular'};
const metadata={kind:'preferredMetadata',parameters:{}};
/** One Studio source as Cedar's `dataSource`, `query` and `filters`. Call only after `sourceProblem` passes. */
export function cedarSource(s){
 if(s.provider==='cedar')return structuredClone(s.cedar);
 if(s.provider==='trakt'){const type=cedarContent(s.mediaType);return {dataSource:{kind:'trackingService',identifier:'trakt-public',parameters:{}},query:{kind:'curatedList',identifier:`global:${s.traktListId}:${type==='shows'?'show':'movie'}`,parameters:{}},filters:cedarFilters(type,{},traktSort(s.sortBy,s.sortHow))};}
 if(s.provider==='addon')return {dataSource:{kind:'local',parameters:{}},query:{kind:s.catalogId==='trakt.upnext'?'upNext':'watchlist',parameters:{}},filters:cedarFilters(cedarContent(s.type||s.mediaType))};
 const k=s.tmdbSourceType,parameters={};if(s.filters?.watchRegion)parameters.region=s.filters.watchRegion;let query;
 if(feeds[k])query={kind:feeds[k],parameters};
 else if(k==='LIST')query={kind:'curatedList',identifier:String(s.tmdbId),parameters:{provider:'tmdb'}};
 else if(k==='COLLECTION')query={kind:'metadataCollection',identifier:String(s.tmdbId),parameters};
 else if(k==='COMPANY')query={kind:'productionCompany',identifier:String(s.tmdbId),parameters};
 else if(k==='NETWORK')query={kind:'network',identifier:String(s.tmdbId),parameters};
 else query={kind:'personCredits',identifier:String(s.tmdbId),parameters:{...parameters,role:k==='DIRECTOR'?'director':'actor'}};
 const type=['LIST','COLLECTION'].includes(k)?'movies':cedarContent(s.mediaType||s.type);
 return {dataSource:metadata,query,filters:cedarFilters(type,s.filters,tmdbSort(s.sortBy))};
}
const templates={classic:'poster-carousel',wide:'wide-backdrop-carousel',feature:'list-preview-full-width'};
const presentation=(templateID,posterLook)=>({templateID,enhancedPostersEnabled:false,ratings:{isEnabled:false,providerIDs:[]},...(posterLook?{posterLook}:{})});
const groupContent=sources=>{const types=new Set(sources.map(s=>s.filters.contentType));return types.size===1?[...types][0]:'both';};
const empty=contentType=>cedarFilters(contentType);
/** Studio's per-device appearance becomes `platformConfiguration` (CEDAR_FILE_FORMAT.md §7.3). */
function platformConfiguration(row){const shared=row.deviceLayout.shared,overrides={},platforms=[];
 for(const family of deviceFamilies){const a=appearanceFor(row,family),o={};if(a.enabled)platforms.push(family);if(a.rowStyle!==shared.rowStyle)o.presentation=presentation(templates[a.rowStyle]);if(a.cardStyle!=='backdrop')o.leafCardStyle=a.cardStyle;if(a.browseLayout!==shared.browseLayout)o.leafBrowseLayout=a.browseLayout;if(Object.keys(o).length)overrides[family]=o;}
 const config={overrides};if(platforms.length<deviceFamilies.length)config.platforms=platforms;return platforms.length&&(config.platforms||Object.keys(overrides).length)?config:platforms.length?null:false;}
const branch=(id,title,base,template,folderOptions=[],{posterLook,titleMode='custom'}={})=>({id,profileID:'00000000-0000-0000-0000-000000000000',schemaVersion:2,title,titleMode,dataSource:base.dataSource,query:base.query,defaultFilters:base.filters,presentation:presentation(template,posterLook),folderOptions,position:0,isEnabled:true});
/** Every enabled row as Cedar Branches. `tieFor(source)` returns the profile file's Tobacco Tie for
 an add-on source, so a profile export keeps rows a Branches file has to leave out. `items` holds the
 downloaded catalog file of each pick, by item ID; a pick's Branches are copied as published. */
function cedarBranches(draft,bundleID,tieFor=()=>null,items={}){
 const branches=[],issues=[],credits=[],titles=[],seen=new Set();let groups=0;
 const convert=(s,direct)=>{const tie=s.provider==='addon'?tieFor(s):null;if(tie)return tieSource(s,tie);const p=sourceProblem(s,direct);return p?{problem:p}:cedarSource(s);};
 for(const row of draft.rows){if(!row.enabled)continue;
  if(row.kind==='pick'){const file=items[row.item.id];if(!obj(file)||!Array.isArray(file.branches)){issues.push(`${row.title}: this setup could not be downloaded.`);continue;}titles.push(file.title||row.title);if(file.credits&&!credits.some(c=>JSON.stringify(c)===JSON.stringify(file.credits)))credits.push(file.credits);for(const b of file.branches){if(!obj(b)||seen.has(b.id))continue;seen.add(b.id);branches.push(structuredClone(b));if(isBranchGroupJSON(b))groups++;}continue;}
  const id=stableUUID(bundleID,row.id);
  if(row.kind==='group'){
   const folders=[];for(const b of row.branches){if(!b.enabled)continue;const sources=[];for(const s of b.sources){if(!s.enabled)continue;const c=convert(s,false);if(c.problem){issues.push(`${row.title} / ${b.title} / ${s.title}: ${c.problem}`);continue;}sources.push({id:s.id,title:s.title,...c});}
    if(!sources.length){issues.push(`${row.title} / ${b.title}: no compatible enabled sources.`);continue;}
    const folder={id:b.id,title:b.title,dataSource:sources[0].dataSource,query:sources[0].query,filters:sources[0].filters,sources,tileShape:b.tileShape||'landscape',hidesTitle:false};const cover=b.customCoverImageUrl||b.coverImageUrl;if(cover)folder.coverImageURL=cover;if(b.heroBackdropUrl)folder.heroBackdropURL=b.heroBackdropUrl;if(b.focusGifEnabled&&b.focusGifUrl)folder.focusedCoverImageURL=b.focusGifUrl;if(b.titleLogoUrl)folder.titleLogoURL=b.titleLogoUrl;folders.push(folder);}
   if(!folders.length){issues.push(`${row.title}: no compatible enabled branches.`);continue;}
   const platforms=platformConfiguration(row);if(platforms===false){issues.push(`${row.title}: turned off on every device.`);continue;}
   const shared=row.deviceLayout.shared,base={dataSource:{kind:'custom',identifier:'cedar.branch-group',parameters:{'cedar.home.displaysFolderCards':'true','cedar.home.folderRole':'folder','cedar.home.leafBrowseLayout':shared.browseLayout}},query:{kind:'custom',identifier:'cedar.branch-group',parameters:{}},filters:empty(groupContent(folders.flatMap(f=>f.sources)))};
   const b=branch(id,row.title,base,templates[shared.rowStyle],folders);if(platforms)b.platformConfiguration=platforms;branches.push(b);groups++;
  }else{
   const s=row.source;if(!s.enabled)continue;const c=convert(s,true);if(c.problem){issues.push(`${row.title}: ${c.problem}`);continue;}const b=branch(id,row.title,c,templates[row.rowStyle]||'poster-carousel',[],{posterLook:row.posterLook,titleMode:row.titleMode});if(row.platforms)b.platformConfiguration={platforms:row.platforms,overrides:{}};branches.push(b);
  }
 }
 if(!branches.length)throw Error('Enable at least one compatible branch or source before exporting.');
 return {branches,issues,groups,credits,titles};
}
/** The Cedar Branches one Home row becomes, exactly as export writes them: a pick's published
 Branches (shared, not copied: read them only), or the row converted. null while a pick's file
 isn't in `items` yet. */
export function rowBranches(draft,row,items={}){if(!row.enabled)return [];if(row.kind==='pick'){const file=items[row.item.id];return file?(Array.isArray(file.branches)?file.branches.filter(obj):[]):null;}try{return cedarBranches({...draft,rows:[row]},draft.bundleID||creatorBundleID,undefined,items).branches;}catch{return [];}}
const isBranchGroupJSON=b=>b.dataSource?.kind==='custom'&&b.dataSource?.identifier==='cedar.branch-group';
const generator={application:'Cedar Creator'};
const onlyPicks=draft=>draft.rows.length>0&&draft.rows.every(r=>r.kind==='pick');
/**
 * The Home as a `.cedar` Branches file. A Home made only of catalog picks is written exactly as
 * Creator's own files are, under Creator's bundle ID, so it updates the same Branches in Cedar as
 * downloading each setup alone would.
 */
export function exportCedar(value,now=new Date(),items={}){
 const draft=validateDraft(value),picksOnly=onlyPicks(draft),bundleID=picksOnly?creatorBundleID:draft.bundleID||uid().toUpperCase();
 const {branches,issues,groups,credits,titles}=cedarBranches(draft,bundleID,undefined,items);
 const title=picksOnly&&titles.length===1?titles[0]:picksOnly&&draft.title==='My Home'?'Cedar Creator selection':draft.title;
 const document=branchesFile({bundleID,title,createdAt:cedarDate(now),generator,branches,avatarURL:draft.avatar?avatarURL(draft.avatar):null,badgePackURL:draft.badgePack?badgePackURL(draft.badgePack):null,extra:credits.length?{credits:credits.length===1?credits[0]:credits}:{}});
 return {document,issues,bundleID:picksOnly?draft.bundleID:bundleID,branchCount:branches.length-groups,groupCount:groups};
}
/** A row that reads one catalog of a Tobacco Tie in the same profile file (CEDAR_FILE_FORMAT.md §9.2). */
function tieSource(s,tie){const type=s.type||(s.mediaType==='tv'?'series':s.mediaType)||'movie';return {dataSource:{kind:'manifestAddon',identifier:tie.id.toLowerCase(),parameters:{}},query:{kind:'addonCatalog',identifier:`${tie.manifestID}|${type}|${s.catalogId}`,parameters:{}},filters:cedarFilters(cedarContent(type))};}
/**
 * The Home as a `.cedar` profile file, optionally with the owner's Tobacco Ties. Ties hold the
 * owner's own addresses, so a file with any tie is always sealed with `passphrase`. Rows from an
 * add-on whose manifest ID (or add-on family) matches a tie read that tie instead of being left out.
 * `ties`: [{url, name?, manifestID?}].
 */
export async function exportCedarProfile(value,{passphrase='',ties=[],now=new Date(),items={}}={}){
 const draft=validateDraft(value),bundleID=draft.bundleID||uid().toUpperCase();
 const fileTies=ties.map(t=>({...t,id:stableUUID(bundleID,`tie.${t.url}`)}));
 const byID=new Map(),byFamily=new Map();for(const t of fileTies)if(t.manifestID){byID.set(t.manifestID.toLowerCase(),t);if(!byFamily.has(addonFamily(t.manifestID)))byFamily.set(addonFamily(t.manifestID),t);}
 const used=new Set();const tieFor=s=>{if(!s.addonId||!s.catalogId)return null;const t=byID.get(s.addonId.toLowerCase())||byFamily.get(addonFamily(s.addonId));if(t)used.add(t.id);return t||null;};
 const {branches,issues,groups}=cedarBranches(draft,bundleID,tieFor,items);
 const payload={home:{branches:branches.map((b,position)=>({...b,position})),shelves:[]}};
 // The photo and badge pack travel as the profile's identity. No name, so the profile keeps the one chosen in Cedar.
 if(draft.avatar||draft.badgePack)payload.identity={...(draft.avatar?{avatar:avatarURL(draft.avatar)}:{}),...(draft.badgePack?{badgePackURL:badgePackURL(draft.badgePack)}:{})};
 if(fileTies.length)payload.tobaccoTies={ties:fileTies.map(t=>({id:t.id,url:t.url,...(t.name?{name:t.name}:{}),enabledCatalogIDs:[]})),settings:[]};
 const document=await profileFile({bundleID,title:draft.title,createdAt:cedarDate(now),generator,payload,passphrase});
 const linkedRows=branches.flatMap(b=>[b,...b.folderOptions.flatMap(f=>f.sources||[])]).filter(x=>x.dataSource?.kind==='manifestAddon').length;
 return {document,issues,bundleID,branchCount:branches.length-groups,groupCount:groups,tieCount:fileTies.length,linkedRows,unusedTies:fileTies.filter(t=>!used.has(t.id)).length};
}
export function cedarFileName(title){return `${String(title||'').replace(/[^A-Za-z0-9 _-]+/g,'').trim().replace(/\s+/g,'-')||'Cedar-Home'}.cedar`;}
