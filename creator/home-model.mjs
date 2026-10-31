// Creator's Home: setups picked from the catalog plus the person's own Branches, read from other
// apps' collection JSON or built by hand. It writes Cedar's native .cedar files: a Branches file to
// share, or a sealed profile file that keeps the owner's Tobacco Ties and, from a setup export, their logins.
import {branchesFile,profileFile,cedarDate,findTobaccoTies,addonFamily} from '../shared/cedar-file.mjs';
import {cleanCedarSource,cleanFilters,sourceIssue,families,traktChartPattern,services} from './branch-options.mjs';
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
 // Read from a manifest link (parseManifest): Cedar's catalog-link Branch.
 if(s.provider==='catalog'){const base=linkBase(v.base);if(base)s.base=base;s.addonName=name(v.addonName,'Catalog');s.extras={};if(obj(v.extras))for(const [k,x] of Object.entries(v.extras).slice(0,8))if(/^[A-Za-z0-9_.-]{1,80}$/.test(k)&&typeof x==='string'&&x)s.extras[k]=x.slice(0,200);if(v.pageable===true)s.pageable=true;}
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
 if(s.provider==='catalog')return s.base&&s.catalogId&&['movie','series'].includes(String(s.type).toLowerCase())?'':'This catalog link is incomplete.';
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
function cleanChild(v){if(!obj(v)||!Array.isArray(v.sources)||v.sources.length>1000)throw Error('Invalid branch sources.');const b={id:text(v.id,uid()),title:name(v.title,'Untitled branch'),enabled:v.enabled!==false,sources:v.sources.map(sanitizeSource)};for(const k of ['coverImageUrl','customCoverImageUrl','heroBackdropUrl','focusGifUrl','titleLogoUrl']){const u=safeArtworkURL(v[k]);if(u)b[k]=u;}if(typeof v.focusGifEnabled==='boolean')b.focusGifEnabled=v.focusGifEnabled;if(v.hidesTitle===true)b.hidesTitle=true;if(['landscape','poster','square'].includes(String(v.tileShape).toLowerCase()))b.tileShape=v.tileShape.toLowerCase();return b;}
/** A setup or one of its groups from the Creator catalog. Its Branches are exported exactly as published. */
function cleanPick(v){if(!obj(v)||!['setup','group'].includes(v.type)||!isItemID(v.id)||(v.type==='group')!==v.id.includes('.'))throw Error('Invalid Creator pick.');return {type:v.type,id:v.id};}
export function makePick(item,title){return {id:`pick.${item.id}`,kind:'pick',title:name(title,'Creator setup'),enabled:true,item:cleanPick(item)};}
/** The picks as a Creator cart, so a Home made only of enabled picks can still be shared as a link. */
export function draftCart(draft){if(draft.hero||!draft.rows.length||draft.rows.some(r=>r.kind!=='pick'||!r.enabled))return null;const cart=draft.rows.map(r=>({...r.item}));if(draft.avatar)cart.push({type:'avatar',id:draft.avatar});if(draft.badgePack)cart.push({type:'badges',id:draft.badgePack});return cart;}
/** Adds a catalog pick. A whole setup replaces any of its groups already on Home; a group already inside a picked setup is not added again. */
export function addPick(draft,item,title){const picks=draft.rows.filter(r=>r.kind==='pick');if(picks.some(r=>r.item.id===item.id))return 'duplicate';if(item.type==='group'&&picks.some(r=>r.item.type==='setup'&&r.item.id===setupOf(item.id)))return 'included';const row=makePick(item,title);if(item.type==='setup'){const isGroupOf=r=>r.kind==='pick'&&r.item.type==='group'&&setupOf(r.item.id)===item.id;const first=draft.rows.findIndex(isGroupOf);if(first>=0){draft.rows=draft.rows.flatMap((r,i)=>i===first?[row]:isGroupOf(r)?[]:[r]);return 'replaced';}}if(picks.length>=maximumCartItems)return 'full';draft.rows.push(row);return 'added';}
export function pickState(draft,item){const picks=draft.rows.filter(r=>r.kind==='pick');if(picks.some(r=>r.item.id===item.id))return 'added';if(item.type==='group'&&picks.some(r=>r.item.type==='setup'&&r.item.id===setupOf(item.id)))return 'included';return 'available';}
// MARK: Hero
// The hero is the carousel at the top of Home. A draft without one leaves the viewer's own hero
// alone. Exported, it's a hero-carousel Branch (CEDAR_FILE_FORMAT.md §7.1): one source, a style,
// the details it shows and how many titles it pages through.
export const heroStyles=['card','fullscreen','fade'];
export const heroStyleNames={card:'Card',fullscreen:'Fullscreen',fade:'Fade'};
export const heroFields=['genre','description','ratings','ageRating','releaseDate','mediaType'];
export const heroFieldNames={genre:'Genre',description:'Description',ratings:'Ratings',ageRating:'Age rating',releaseDate:'Year',mediaType:'Movie or show'};
const metadataSource={kind:'preferredMetadata',parameters:{}};
/** The title feeds a hero can read. Cedar's own default is Trending this week. */
export const heroFeeds={
 'trending-week':{title:'Trending this week',dataSource:metadataSource,query:{kind:'trending',parameters:{window:'week'}}},
 'trending-day':{title:'Trending today',dataSource:metadataSource,query:{kind:'trending',parameters:{window:'day'}}},
 popular:{title:'Popular movies & shows',dataSource:metadataSource,query:{kind:'popular',parameters:{}}},
 'top-rated':{title:'Top rated',dataSource:metadataSource,query:{kind:'topRated',parameters:{}}},
 watchlist:{title:'The viewer’s watchlist',dataSource:{kind:'trackingService',parameters:{}},query:{kind:'watchlist',parameters:{}}},
 'up-next':{title:'The viewer’s Up Next',dataSource:{kind:'local',parameters:{}},query:{kind:'upNext',parameters:{}}},
};
export const heroLimits={min:1,max:20,default:10};
export function newHero(){return {style:'fullscreen',fields:[...heroFields],limit:heroLimits.default,source:{kind:'feed',feed:'trending-week'}};}
/** Mirrors Cedar's ShelfSource.isHeroEligible: the hero needs titles it can look up, never playback rows. */
export function heroEligible(src){const ds=src?.dataSource?.kind;if(['preferredMetadata','metadataProvider','trackingService','custom'].includes(ds))return true;return ds==='local'&&['upNext','watchlist','collection'].includes(src.query?.kind);}
function cleanHero(v){
 if(!obj(v))return null;
 const h={style:heroStyles.includes(v.style)?v.style:'fullscreen',fields:heroFields.filter(f=>Array.isArray(v.fields)&&v.fields.includes(f)),limit:Number.isSafeInteger(v.limit)?Math.min(Math.max(v.limit,heroLimits.min),heroLimits.max):heroLimits.default};
 const s=obj(v.source)?v.source:{};
 if(s.kind==='row'&&typeof s.rowId==='string')h.source={kind:'row',rowId:text(s.rowId)};
 else if(s.kind==='custom'){try{const cedar=cleanCedarSource(s.cedar);h.source=heroEligible(cedar)?{kind:'custom',title:name(s.title,'Custom source'),cedar}:{kind:'feed',feed:'trending-week'};}catch{h.source={kind:'feed',feed:'trending-week'};}}
 else h.source={kind:'feed',feed:heroFeeds[s.feed]?s.feed:'trending-week'};
 return h;
}
/** What the hero reads, as Cedar's dataSource/query/filters, or {problem}. */
export function heroSource(draft,links=true){
 const s=draft.hero?.source;if(!s)return {problem:'No hero source.'};
 if(s.kind==='feed'){const f=heroFeeds[s.feed];return {dataSource:structuredClone(f.dataSource),query:structuredClone(f.query),filters:cleanFilters({contentType:'both'})};}
 if(s.kind==='custom')return structuredClone(s.cedar);
 const r=draft.rows.find(x=>x.id===s.rowId);
 if(!r||r.kind!=='branch')return {problem:'The row the hero followed is no longer on Your Home.'};
 const p=sourceProblem(r.source,true);if(p)return {problem:p};
 if(r.source.provider==='catalog'&&!links)return {problem:catalogLinkNote};
 const c=cedarSource(r.source);return heroEligible(c)?c:{problem:`${r.title} plays from a source the hero can’t show.`};
}
/** A short name for what the hero reads. */
export function heroSourceName(draft){const s=draft.hero?.source;if(!s)return '';if(s.kind==='feed')return heroFeeds[s.feed].title;if(s.kind==='custom')return s.title||'Custom source';return draft.rows.find(r=>r.id===s.rowId)?.title||'A removed row';}
function heroBranch(draft,bundleID,links=true){
 const h=draft.hero,src=heroSource(draft,links);if(src.problem)return src;
 const ratings={isEnabled:h.fields.includes('ratings'),providerIDs:[]};
 // Fade travels as Fullscreen plus fadesArtwork, which older Cedar versions read as Fullscreen.
 const hero={style:h.style==='fade'?'fullscreen':h.style,...(h.style==='fade'?{fadesArtwork:true}:{}),metadataFields:[...h.fields].sort(),ratings,automaticallyPlaysTrailer:false,trailerDelay:5,trailerAudioEnabled:false};
 return {id:stableUUID(bundleID,'hero'),profileID:'00000000-0000-0000-0000-000000000000',schemaVersion:2,title:'Featured',titleMode:'custom',dataSource:src.dataSource,query:src.query,defaultFilters:src.filters,presentation:{templateID:'hero-carousel',enhancedPostersEnabled:false,ratings,hero},folderOptions:[],position:0,isEnabled:true,pageSize:h.limit};
}
export function validateDraft(v){
 if(!obj(v)||v.version!==2||!Array.isArray(v.rows)||v.rows.length>1000)throw Error('Choose a supported collection or saved Creator draft.');
 let total=0;const ids=new Set();const rows=v.rows.map(r=>{if(!obj(r)||!['branch','group','pick'].includes(r.kind))throw Error('Invalid Home row.');const row={id:text(r.id,uid()),kind:r.kind,title:name(r.title,'Untitled branch'),enabled:r.enabled!==false};if(ids.has(row.id))throw Error('The draft contains duplicate Home row IDs.');ids.add(row.id);if(r.kind==='branch'){row.source=sanitizeSource(r.source);if(rowStyles.includes(r.rowStyle))row.rowStyle=r.rowStyle;if(r.posterLook==='critic')row.posterLook='critic';if(r.titleMode==='automatic')row.titleMode='automatic';const platforms=Array.isArray(r.platforms)?families.filter(f=>r.platforms.includes(f)):[];if(platforms.length&&platforms.length<families.length)row.platforms=platforms;total++;}else if(r.kind==='pick'){row.item=cleanPick(r.item);}else{if(!Array.isArray(r.branches)||r.branches.length>2000)throw Error('Too many branches in this group.');row.branches=r.branches.map(cleanChild);row.deviceLayout=validateDeviceLayout(r.deviceLayout||newDeviceLayout());const childIDs=new Set();for(const b of row.branches){if(childIDs.has(b.id))throw Error('The group contains duplicate branch IDs.');childIDs.add(b.id);const sourceIDs=new Set();for(const s of b.sources){if(sourceIDs.has(s.id))s.id=uid();sourceIDs.add(s.id);}total+=b.sources.length;}}return row;});
 if(total>15000)throw Error('Choose a collection with fewer than 15,000 sources.');const draft={version:2,title:name(v.title,'My Home'),rows};if(isAvatarPath(v.avatar))draft.avatar=v.avatar;if(isBadgePackID(v.badgePack))draft.badgePack=v.badgePack;{const hero=cleanHero(v.hero);if(hero)draft.hero=hero;}if(typeof v.bundleID==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.bundleID))draft.bundleID=v.bundleID.toUpperCase();return draft;
}
const builtin={trending_movies:'TRENDING',trending_series:'TRENDING',trending_shows:'TRENDING',popular_movies:'POPULAR',popular_series:'POPULAR',popular_shows:'POPULAR',top_rated_movies:'TOP_RATED',toprated_movies:'TOP_RATED',top_rated_series:'TOP_RATED',top_rated_shows:'TOP_RATED',toprated_series:'TOP_RATED',toprated_shows:'TOP_RATED',upcoming_movies:'UPCOMING',now_playing_movies:'NOW_PLAYING',nowplaying_movies:'NOW_PLAYING',airing_today_series:'AIRING_TODAY',airing_today_shows:'AIRING_TODAY',on_the_air_series:'ON_THE_AIR',on_the_air_shows:'ON_THE_AIR'};
function resolveCatalog(ref,config){const id=ref.catalogId||'',type=ref.type||(/series|shows/.test(id)?'series':'movie'),label=config.catalog_name_overrides?.[id]||config.custom_lists?.find(l=>l.id===id)?.label||id.replaceAll('_',' ');const common={id:`catalog:${id}`,title:label,mediaType:type};const discover=config.discover_catalogs?.[id];if(discover)return {...common,provider:'tmdb',tmdbSourceType:'DISCOVER',filters:discover.filters,sortBy:discover.sort_by};if(builtin[id])return {...common,provider:'tmdb',tmdbSourceType:builtin[id]};const list=config.custom_lists?.find(l=>l.id===id);if(list){const n=Number(id.match(/^(?:tmdb|trakt)_list_(\d+)/)?.[1]);return {...common,provider:list.provider,mediaType:list.kind||type,...(list.provider==='tmdb'?{tmdbSourceType:'LIST',tmdbId:n}:{traktListId:n})};}return {...ref,title:label,provider:ref.provider||'addon'};}
// Home shelf exports: an array of rows shaped {title, style, isEnabled, sortOrder, source:{<kind>:{_0:…}}}.
// A `group` row holds its folders in `contentSources`, each with its own art and list of sources.
const one=v=>obj(v)&&Object.keys(v).length===1?Object.keys(v)[0]:'';
const payload=v=>obj(v?._0)?v._0:obj(v)?v:{};
const isShelfExport=data=>Array.isArray(data?.shelves)?isShelfExport(data.shelves):Array.isArray(data)&&data.length>0&&data.every(r=>obj(r)&&obj(r.source)&&!Array.isArray(r.folders))&&data.some(r=>typeof r.style==='string'&&one(r.source));
const idList=v=>Array.isArray(v)?v.filter(positive).join(','):'';
const shelfShape=v=>v==='poster'?'poster':v==='square'?'square':undefined;
const shelfRowStyle=v=>/wide|landscape|backdrop/i.test(v||'')?'wide':/feature|hero|spotlight/i.test(v||'')?'feature':undefined;
const shelfContent=v=>['movie','movies'].includes(v)?'movies':['tv','show','shows','series'].includes(v)?'shows':'both';
const built=(title,dataSource,query,contentType='both')=>({title,provider:'cedar',cedar:{dataSource,query,filters:{contentType}}});
// A media server collection only exists on its owner's server, so a folder named after a streaming
// service is rebuilt from TMDB: that service's titles, in the order and type the collection's name gives.
const serviceKey=v=>String(v||'').toLowerCase().replace(/\bplus\b/g,'+').replace(/[^a-z0-9+]/g,'');
const serviceAliases={max:'1899',hbo:'1899',amazonprimevideo:'9',amazonprime:'9',prime:'9',appletv:'350',disney:'337',paramount:'531'};
const serviceID=v=>services.find(x=>serviceKey(x.title)===serviceKey(v))?.id||serviceAliases[serviceKey(v)];
function serverCollection(p,folderTitle,notes){
 const collection=text(p.collectionName).replace(/[:\s]+$/,''),id=serviceID(folderTitle)||serviceID(collection);
 if(!id){notes.serverDropped++;return null;}
 notes.serverRebuilt++;
 const contentType=/\b(series|shows?|tv|serie|séries|serien)\b/i.test(collection)?'shows':/\b(films?|movies?|pel[ií]culas?|filme)\b/i.test(collection)?'movies':'both';
 const filters={contentType};if(/\b(new|newest|latest|recent|nieuw\w*|neu\w*|nouveau\w*|nuev\w*)\b/i.test(collection))filters.sortOrder='newest';
 return {title:collection,provider:'cedar',cedar:{dataSource:{kind:'preferredMetadata',parameters:{}},query:{kind:'streamingProvider',identifier:id,parameters:{}},filters}};
}
const shelfFeeds={trending:'trending',popular:'popular',top_rated:'topRated',upcoming:'upcoming',now_playing:'nowPlaying',airing_today:'airingToday',on_the_air:'onTheAir'};
/** MDBList serves anonymous lists by owner and slug, and its slugs are made from the list's name. */
export const mdbListSlug=name=>String(name||'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
/** One shelf source as a Creator source, or a note when Cedar has nothing like it. */
function shelfSource(entry,folderTitle,notes){
 const kind=one(entry),p=payload(entry[kind]);
 if(kind==='tmdbDiscover'){
  const filters={};for(const [from,to] of [['genres','withGenres'],['keywords','withKeywords'],['companies','withCompanies'],['networks','withNetworks']]){const v=idList(p[from]);if(v)filters[to]=v;}
  if(typeof p.originalLanguage==='string'&&p.originalLanguage)filters.withOriginalLanguage=p.originalLanguage;
  for(const k of ['releaseDateGte','releaseDateLte'])if(typeof p[k]==='string')filters[k]=p[k];
  if(positive(p.year))filters.year=p.year;if(Number.isSafeInteger(p.voteCountGte))filters.voteCountGte=p.voteCountGte;if(typeof p.voteAverageGte==='number'&&p.voteAverageGte>0)filters.voteAverageGte=p.voteAverageGte;
  if(idList(p.excludeGenres)||idList(p.excludeKeywords))notes.excluded++;
  return {title:p.name,provider:'tmdb',tmdbSourceType:'DISCOVER',mediaType:media(p.mediaType),sortBy:p.sortBy,filters};
 }
 if(kind==='tmdbList')return {title:p.listName,provider:'tmdb',tmdbSourceType:'LIST',tmdbId:Number(p.listId),mediaType:media(p.mediaType)};
 if(kind==='tmdbCollection')return {title:p.name,provider:'tmdb',tmdbSourceType:'COLLECTION',tmdbId:Number(p.collectionId)};
 if(kind==='traktList'){
  const user=text(p.username),slug=text(p.listSlug);
  if(user&&slug&&!/^\d+$/.test(slug))return built(p.listName,{kind:'trackingService',identifier:'trakt-public',parameters:{}},{kind:'curatedList',identifier:`${user}|${slug}`,parameters:{}});
  // A list without its owner is read by ID, one media type at a time; the folder's name says which.
  return {title:p.listName,provider:'trakt',traktListId:Number(p.listId),mediaType:/series|shows?\b|\btv\b/i.test(folderTitle)?'tv':'movie'};
 }
 if(kind==='mdbListList'){
  const owner=text(p.username).toLowerCase(),slug=mdbListSlug(p.listName),listID=positive(p.listId)?String(p.listId):'';
  if(!owner||!slug)return {title:p.listName,provider:'mdblist'};
  notes.mdbList++;
  return built(p.listName,{kind:'trackingService',identifier:'mdblist-public',parameters:{}},{kind:'curatedList',identifier:`${owner}|${slug}`,parameters:listID?{listID}:{}},shelfContent(p.mediatype));
 }
 if(kind==='mediaServer')return serverCollection(p,folderTitle,notes);
 if(kind==='continueWatching')return built('Continue Watching',{kind:'local',parameters:{}},{kind:'continueWatching',parameters:{}});
 if(/watchlist$/i.test(kind))return built('Watchlist',{kind:'trackingService',parameters:{}},{kind:'watchlist',parameters:{}});
 if(kind==='tmdbCatalog'){
  const m=/^tmdb_(trending|popular|top_rated|upcoming|now_playing|airing_today|on_the_air)_(movies?|shows?|tv|series)(?:_(day|week))?$/.exec(typeof entry[kind]?._0==='string'?entry[kind]._0:'');
  if(m)return built('',{kind:'preferredMetadata',parameters:{}},{kind:shelfFeeds[m[1]],parameters:m[1]==='trending'?{window:m[3]||'week'}:{}},shelfContent(m[2]));
 }
 // Trakt's own charts, read publicly in Cedar (`chart:<chart>:<movie|show>[:<period>]`).
 if(kind==='traktBuiltIn'){
  const m=/^(trending|popular|anticipated|box_?office|(?:most_)?(?:watched|played|collected|favorited))_(movies|shows)(?:_(daily|weekly|monthly|yearly|all))?$/.exec(typeof entry[kind]?._0==='string'?entry[kind]._0:''),chart=m&&m[1].replace(/^most_/,'').replace('_',''),id=m&&`chart:${chart}:${m[2]==='movies'?'movie':'show'}${m[3]?`:${m[3]}`:''}`;
  if(id&&traktChartPattern.test(id))return built('',{kind:'trackingService',identifier:'trakt-public',parameters:{}},{kind:'curatedList',identifier:id,parameters:{}},shelfContent(m[2]));
 }
 return {title:kind||'Unknown source',provider:kind||'unknown'};
}
function parseShelves(data){
 const rows=[],notes={excluded:0,mdbList:0,serverRebuilt:0,serverDropped:0},rowIDs=new Set();
 const shelves=(Array.isArray(data?.shelves)?data.shelves:data).map((r,i)=>({r,i})).sort((a,b)=>(Number.isFinite(a.r.sortOrder)?a.r.sortOrder:a.i)-(Number.isFinite(b.r.sortOrder)?b.r.sortOrder:b.i)).map(x=>x.r);
 for(const shelf of shelves){
  const kind=one(shelf.source),title=name(shelf.title,'Imported branch');let id=text(shelf.id,uid());if(rowIDs.has(id))id=uid();rowIDs.add(id);
  if(kind==='group'){
   const group=payload(shelf.source.group),g={...makeGroup(name(shelf.title||group.title,'Imported group')),id,enabled:shelf.isEnabled!==false},childIDs=new Set();
   g.branches=(Array.isArray(group.contentSources)?group.contentSources:[]).filter(obj).map(c=>{
    const b={id:text(c.id,uid()),title:name(c.title,'Untitled branch'),enabled:c.enabled!==false,sources:(Array.isArray(c.sources)?c.sources:[]).filter(obj).map((s,i)=>{const r=shelfSource(s,c.title||'',notes);return r&&{id:`${one(s)||'source'}.${i}`,...r};}).filter(Boolean)};
    if(childIDs.has(b.id))b.id=uid();childIDs.add(b.id);
    const cover=safeArtworkURL(c.coverImageURL),backdrop=safeArtworkURL(c.backgroundImageURL),shape=shelfShape(c.tileShape??group.tileShape);
    if(cover)b.coverImageUrl=cover;if(backdrop)b.heroBackdropUrl=backdrop;if(shape)b.tileShape=shape;if(c.hideTitle===true&&cover)b.hidesTitle=true;
    return b;});
   rows.push(g);
  }else{
   const s=shelfSource(shelf.source,title,notes);if(!s)continue;
   const row={id,kind:'branch',title,enabled:shelf.isEnabled!==false,source:{id:`${kind||'source'}.0`,...s,title:s.title||title}},style=shelfRowStyle(shelf.style);
   if(style)row.rowStyle=style;rows.push(row);
  }
 }
 const draft=validateDraft({version:2,title:'Imported Home',rows}),issues=sourceIssues(draft);
 if(notes.serverRebuilt)issues.push(`${notes.serverRebuilt} media server ${notes.serverRebuilt===1?'collection was':'collections were'} rebuilt from TMDB as titles on the streaming service ${notes.serverRebuilt===1?'its folder is':'their folders are'} named after. A server’s collections only work on that server.`);
 if(notes.serverDropped)issues.push(`${notes.serverDropped} media server ${notes.serverDropped===1?'collection was':'collections were'} left out because ${notes.serverDropped===1?'it isn’t':'they aren’t'} named after a streaming service. Add server collections in Cedar.`);
 if(notes.excluded)issues.push(`${notes.excluded} discover ${notes.excluded===1?'source excludes':'sources exclude'} genres or keywords. Cedar doesn’t filter by exclusion, so those titles can appear.`);
 if(notes.mdbList)issues.push(`${notes.mdbList} MDBList ${notes.mdbList===1?'list is':'lists are'} matched by name. If one shows nothing in Cedar, paste its MDBList link into that Branch.`);
 return {draft,issues,format:'Home shelf export',ties:[]};
}
// A setup export wraps a Home shelf export with the owner's logins. They're kept apart from the
// draft (which is saved in the browser) and only ever go into a locked profile file, in the
// shapes Cedar keeps them (CEDAR_FILE_FORMAT.md §9.2).
const isSetupExport=data=>obj(data)&&Array.isArray(data.shelves)&&(Array.isArray(data.iptvProviders)||Array.isArray(data.mediaServers)||obj(data.apiKeys));
const utf8Base64=s=>{let out='';for(const b of new TextEncoder().encode(s))out+=String.fromCharCode(b);return btoa(out);};
const fileID=v=>uuidPattern.test(String(v))?String(v).toUpperCase():uid().toUpperCase();
function webAddress(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&u.hostname&&!u.username&&!u.password&&!u.search&&!u.hash?u:null;}catch{return null;}}
const bare=u=>u.href.replace(/\/+$/,'');
const setupKeys={tmdbCustom:'metadata.tmdb.key',tmdb:'metadata.tmdb.key',fanart:'metadata.fanart.key',fanartTV:'metadata.fanart.key',rpdb:'metadata.rpdb.key'};
const setupServerKinds=['plex','jellyfin','emby'];
function setupProvider(p,notes){
 const label=name(p.name,'IPTV provider'),address=webAddress(p.url),username=text(p.username),password=typeof p.password==='string'?p.password:'';
 if(p.type!=='xtream_codes'){notes.push(`${label}: Cedar can’t read this kind of provider from the file. Add it in Cedar.`);return null;}
 if(!address||!username||!password){notes.push(`${label}: the provider’s address or login is missing, so it was left out.`);return null;}
 return {id:fileID(p.id),displayName:label,kind:'xtream',endpoint:bare(address),host:address.hostname,isEnabled:p.isEnabled!==false,enabledSections:['live','movies','series'],userAgent:null,categoryPreferences:[],credential:utf8Base64(JSON.stringify({username,password,requestHeaders:{}}))};
}
function setupServer(s,notes){
 const c=obj(s.config)?s.config:s,kind=String(c.serverType||'').toLowerCase(),label=name(c.name,'Media server'),token=text(c.accessToken)||text(s.accessToken);
 if(!setupServerKinds.includes(kind)){notes.push(`${label}: Cedar can’t read this kind of server from the file. Add it in Cedar.`);return null;}
 // Cedar keeps one address per server. The remote one also works away from home, and https comes first.
 const addresses=(c.reachability==='local'?[c.serverUrl,c.remoteUrl]:[c.remoteUrl,c.serverUrl]).map(webAddress).filter(Boolean),address=addresses.find(u=>u.protocol==='https:')||addresses[0];
 if(!address||!token){notes.push(`${label}: the server’s address or sign-in is missing, so it was left out.`);return null;}
 return {id:fileID(c.id),kind,displayName:label,endpoint:bare(address),isEnabled:c.isEnabled!==false,credential:{username:'',password:'',accessToken:token,userID:kind==='plex'?'':text(c.userId),apiKey:''}};
}
function parseSetup(data){
 const result=parseShelves(data.shelves),notes=[];
 const sources=(Array.isArray(data.iptvProviders)?data.iptvProviders:[]).filter(obj).map(p=>setupProvider(p,notes)).filter(Boolean);
 const mediaServers=(Array.isArray(data.mediaServers)?data.mediaServers:[]).filter(obj).map(s=>setupServer(s,notes)).filter(Boolean);
 const apiKeys={};let unknownKeys=0;
 for(const [k,v] of Object.entries(obj(data.apiKeys)?data.apiKeys:{})){const key=text(v);if(!key)continue;if(setupKeys[k])apiKeys[setupKeys[k]]=utf8Base64(key);else unknownKeys++;}
 if(unknownKeys)notes.push(`${unknownKeys} API ${unknownKeys===1?'key is':'keys are'} for services Cedar doesn’t use, so ${unknownKeys===1?'it was':'they were'} left out.`);
 const settings=[obj(data.subtitles)&&'subtitle style',obj(data.playback)&&'playback settings',obj(data.sourceOrdering)&&'source ordering'].filter(Boolean);
 if(settings.length)notes.push(`${settings.length>1?`${settings.slice(0,-1).join(', ')} and ${settings.at(-1)}`:settings[0]} ${settings.length===1?'doesn’t':'don’t'} carry over. Set ${settings.length===1?'it':'them'} in Cedar’s Settings.`.replace(/^./,c=>c.toUpperCase()));
 return {...result,issues:[...result.issues,...notes],format:'Setup export',ties:findTobaccoTies(data),setup:{sources,mediaServers,apiKeys}};
}
/** What a setup export's logins add up to, for the person to choose from. */
export function setupSections(setup){
 if(!setup)return [];
 const list=items=>items.length>1?`${items.slice(0,-1).join(', ')} and ${items.at(-1)}`:items[0],servers=setup.mediaServers||[],keys=Object.keys(setup.apiKeys||{});
 const keyNames={'metadata.tmdb.key':'TMDB','metadata.fanart.key':'Fanart.tv','metadata.rpdb.key':'RPDB'};
 return [
  setup.sources?.length&&{id:'sources',title:`${setup.sources.length} IPTV ${setup.sources.length===1?'provider':'providers'}`,detail:`${list(setup.sources.map(s=>s.displayName))}, with ${setup.sources.length===1?'its':'their'} login`},
  servers.length&&{id:'mediaServers',title:`${servers.length} media ${servers.length===1?'server':'servers'}`,detail:`${list(servers.map(s=>`${s.displayName} (${s.kind==='plex'?'Plex':s.kind==='jellyfin'?'Jellyfin':'Emby'})`))}, with ${servers.length===1?'its':'their'} sign-in`},
  keys.length&&{id:'apiKeys',title:`${list(keys.map(k=>keyNames[k]||k))} API ${keys.length===1?'key':'keys'}`,detail:'Used for posters, details and artwork'},
 ].filter(Boolean);
}
/** The chosen sections in a sentence: “1 IPTV provider, 2 media servers and a TMDB API key”. */
export function setupSentence(sections){const parts=sections.map(s=>s.id==='apiKeys'&&s.title.endsWith(' key')?`a ${s.title}`:s.title);return parts.length>1?`${parts.slice(0,-1).join(', ')} and ${parts.at(-1)}`:parts[0]||'';}
/** Why each imported source can't be exported yet. */
function sourceIssues(draft){const issues=[];for(const r of draft.rows){if(r.kind==='pick')continue;const pairs=r.kind==='branch'?[[r.title,r.source,true]]:r.branches.flatMap(b=>b.sources.map(s=>[`${r.title} / ${b.title}`,s,false]));for(const [path,s,direct] of pairs){const problem=sourceProblem(s,direct);if(problem)issues.push(`${path} / ${s.title}: ${problem}`);}if(r.kind==='group'&&r.branches.some(b=>b.sources.length===0))issues.push(`${r.title}: branches without sources cannot be exported.`);}return issues;}
// MARK: Catalog links
// A manifest link's catalogs as Cedar's catalog-link Branches (CatalogLinkBranch.swift in the Cedar
// repo): each row reads one catalog straight from the link, and Cedar looks its titles up by IMDb,
// TMDB or TVDB ID. The link can carry its owner's access token, so these rows travel only in a
// locked profile file (CEDAR_FILE_FORMAT.md §4.2).
export const catalogLinkID='cedar.catalog-link';
export const catalogLinkNote='Catalog links can carry your access token, so they travel only in a locked profile file.';
/** A stored catalog-link base: an https address without login, query or fragment. */
function linkBase(v){try{const u=new URL(v);return u.protocol==='https:'&&u.hostname&&!u.username&&!u.password&&!u.search&&!u.hash?u.origin+u.pathname.replace(/\/+$/,''):'';}catch{return '';}}
/** `https://host/path/manifest.json` → `https://host/path`, as Cedar's CatalogLinkBranch.baseURL(ofManifest:); '' otherwise. */
export function catalogBase(value){let u;try{u=new URL(value);}catch{return '';}if(!u.pathname.endsWith('/manifest.json')||u.search||u.hash||u.username||u.password)return '';return linkBase(u.origin+u.pathname.slice(0,-'/manifest.json'.length));}
/** A pasted link as Load URL should fetch it: `stremio://` becomes https and a configure page its manifest. */
export function importLink(value){let v=String(value||'').trim().replace(/^stremio:\/\//i,'https://');try{const u=new URL(v);if(/\/configure\/?$/i.test(u.pathname)){u.pathname=u.pathname.replace(/\/configure\/?$/i,'/manifest.json');v=u.href;}}catch{}return v;}
/** Mirrors the app's manifest check: an ID and a `resources` entry, so other JSON isn't mistaken for one. */
const isManifest=data=>obj(data)&&typeof data.id==='string'&&!!data.id.trim()&&Object.hasOwn(data,'resources')&&!Array.isArray(data.folders)&&!obj(data.config);
export const catalogArrangements=['grouped','group','rows'];
// MARK: Catalog probes
// Before importing, Creator reads one page of a few catalogs, as Cedar does
// (CedarBranchImport.catalogProbes): manifests never describe card shapes, and a choice a
// manifest calls optional is sometimes needed in practice, returning nothing without it.
const emptyProbes=Object.freeze({needsChoice:new Set(),worksWithoutChoice:new Set(),shape:null});
const maximumChoiceProbes=24,shapeSamples=3;
const encodePart=v=>encodeURIComponent(v);
/** A catalog page's address, as Cedar's TobaccoTieProviderClient builds it: extras sorted by name, as one path segment. */
export function catalogPageURL(base,type,id,extras={}){const parts=Object.entries(extras).filter(([k,v])=>k&&v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${encodePart(k)}=${encodePart(v)}`);return `${base}/catalog/${encodePart(type)}/${encodePart(id)}${parts.length?`/${parts.join('&')}`:''}.json`;}
/** The requests to make for a manifest from `sourceURL`: each catalog with an optional choice, read without it, and a few plain ones for the card shape. */
export function catalogProbes(manifest,sourceURL){
 const base=catalogBase(sourceURL);if(!base||!isManifest(manifest))return [];
 const {catalogs}=manifestCatalogs(manifest),choices=[],plain=[],samples=[];
 for(const c of catalogs){
  if(c.choice){if(choices.length<maximumChoiceProbes)choices.push({key:c.key,url:catalogPageURL(base,c.type,c.id,c.fixed),checksChoice:true});if(samples.length<shapeSamples)samples.push({key:c.key,url:catalogPageURL(base,c.type,c.id,{...c.fixed,[c.choice.name]:c.choice.values[0]}),checksChoice:false});}
  else if(plain.length<shapeSamples)plain.push({key:c.key,url:catalogPageURL(base,c.type,c.id,c.fixed),checksChoice:false});
 }
 // A manifest of nothing but choice catalogs learns its shape from their first choices.
 return [...choices,...(plain.length?plain:samples)];
}
/** What the probes found. `outcomes`: [{probe, shapes}] for each probe that answered, `shapes`
 holding every returned title's posterShape (undefined where a title declares none). */
export function probeResult(outcomes){
 const needsChoice=new Set(),worksWithoutChoice=new Set(),votes=new Map();
 for(const {probe,shapes} of outcomes){
  if(probe.checksChoice)(shapes.length?worksWithoutChoice:needsChoice).add(probe.key);
  // The add-on format's default shape is poster.
  for(const v of shapes){const shape=['poster','landscape','square'].includes(String(v).toLowerCase())?String(v).toLowerCase():'poster';votes.set(shape,(votes.get(shape)||0)+1);}
 }
 const shape=[...votes].sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1))[0]?.[0]||null;
 return {needsChoice,worksWithoutChoice,shape};
}
const nameSeparators=[' · ',' | ',' – ',' — ',' - ',': '];
/** "Shahid · Top 10 Movies" → ["Shahid", "Top 10 Movies"]; ["", name] without a prefix. */
function splitName(n){for(const sep of nameSeparators){const i=n.indexOf(sep);if(i>0&&i+sep.length<n.length)return [n.slice(0,i).trim(),n.slice(i+sep.length).trim()];}return ['',n];}
/** Every movie and series catalog Cedar can read without typed input, with what Cedar's importer
 would send: a required extra starts on its first option. `choice` is the first extra with listed
 options, which "grouped" splits into one Branch per option. */
function manifestCatalogs(manifest,probes=emptyProbes){
 const out=[];let typed=0,other=0;
 for(const c of Array.isArray(manifest.catalogs)?manifest.catalogs:[]){
  if(!obj(c)||typeof c.id!=='string'||!c.id||typeof c.type!=='string')continue;
  if(!['movie','series'].includes(c.type.toLowerCase())){other++;continue;}
  const extras=Array.isArray(c.extra)?c.extra.filter(e=>obj(e)&&typeof e.name==='string'&&e.name):[];
  const options=n=>[...new Set((extras.find(e=>e.name===n)?.options||[]).filter(o=>typeof o==='string'&&o))];
  const required=[...new Set([...(Array.isArray(c.extraRequired)?c.extraRequired.filter(n=>typeof n==='string'):[]),...extras.filter(e=>e.isRequired===true).map(e=>e.name)])];
  const fixed={};let needsInput=false;for(const n of required){const first=options(n)[0];if(n==='search'||!first){needsInput=true;break;}fixed[n]=first;}
  if(needsInput){typed++;continue;}
  const pageable=(Array.isArray(c.extraSupported)&&c.extraSupported.includes('skip'))||extras.some(e=>e.name==='skip');
  // Only an optional choice is split into branches; a required one keeps its first option, as
  // Xperience's "None" genre expects (Cedar's AddonManifestImporter does the same).
  const choice=extras.find(e=>!['search','skip'].includes(e.name)&&!required.includes(e.name)&&options(e.name).length>1&&options(e.name).length<=100);
  const key=`${c.type}|${c.id}`,needed=!!choice&&probes.needsChoice.has(key);
  // `fixed` holds the required extras; `start` is what the catalog's rows send. A choice the
  // catalog needs in practice starts on its first option, like a required one.
  const start=needed?{...fixed,[choice.name]:options(choice.name)[0]}:fixed;
  out.push({id:c.id,key,type:c.type,name:name(c.name,c.id),fixed,start,pageable,home:c.showInHome!==false&&!required.length,choice:choice?{name:choice.name,values:options(choice.name),needed}:null});
 }
 return {catalogs:out,typed,other};
}
/** A movie and a series catalog often share a name ("Trending"); keep them apart, as Cedar does. */
function distinctTitles(items){const seen=new Map();for(const i of items)seen.set(i.title,(seen.get(i.title)||0)+1);for(const i of items)if(seen.get(i.title)>1&&i.mediaType)i.title+=i.mediaType==='series'?' Shows':' Movies';return items;}
/**
 * A manifest's catalogs as Home rows. `grouped` (the default) puts catalogs that share a name prefix
 * ("Shahid · …") in one Branch Group, splits a catalog with listed options (countries, genres,
 * years) into a Branch Group of its own, and gathers small prefixes and catalogs the manifest keeps
 * off Home into "More from …" with one folder per prefix. `group` is one Branch Group of every
 * catalog; `rows` is one Branch per catalog.
 */
export function parseManifest(manifest,sourceURL,arrange='grouped',probes=emptyProbes){
 const base=catalogBase(sourceURL);
 if(!base)throw Error('Load this manifest from its https link ending in /manifest.json, without a ?query, so Cedar knows where to read its catalogs.');
 const addonName=name(manifest.name,'Catalogs'),key=text(manifest.id).slice(0,120);
 const {catalogs,typed,other}=manifestCatalogs(manifest,probes);
 if(!catalogs.length)throw Error('This link has no movie or show catalogs Cedar can show as Branches.');
 // Folder cards take the shape the catalog's titles declare; landscape is Cedar's default.
 const tileShape=['poster','square'].includes(probes.shape)?probes.shape:undefined;
 const source=(c,title,extras=c.start,suffix='')=>({id:`${c.type}.${c.id}${suffix}`,title,enabled:true,provider:'catalog',base,addonName,type:c.type,catalogId:c.id,extras:{...extras},...(c.pageable?{pageable:true}:{})});
 const child=(id,title,sources,mediaType)=>({id,title,mediaType,enabled:true,sources,...(tileShape?{tileShape}:{})});
 const group=(id,title)=>{const g={...makeGroup(title),id:`${key}.${id}`};g.deviceLayout.shared.browseLayout='chips-and-grid';return g;};
 const row=c=>({id:`${key}.${c.type}.${c.id}`,kind:'branch',title:c.name,mediaType:c.type,enabled:true,source:source(c,c.name),...(probes.shape==='landscape'?{rowStyle:'wide'}:{})});
 let rows=[];
 if(arrange==='rows')rows=distinctTitles(catalogs.map(row));
 else if(arrange==='group'){const g=group('all',addonName);g.branches=distinctTitles(catalogs.map(c=>child(`${c.type}.${c.id}`,c.name,[source(c,c.name)],c.type)));rows=[g];}
 else{
  const prefixCount=new Map();for(const c of catalogs)if(!c.choice){const [p]=splitName(c.name);if(p)prefixCount.set(p,(prefixCount.get(p)||0)+1);}
  const prefixGroups=new Map(),moreFolders=new Map();let more=null;
  for(const c of catalogs){
   const [p,rest]=splitName(c.name),grouped=p&&prefixCount.get(p)>=3;
   if(c.choice){
    const g=group(`${c.type}.${c.id}`,grouped?rest:c.name),{name:extra,values,needed}=c.choice;
    // All reads the catalog without its choice, so it's left out when that returns nothing.
    if(!needed)g.branches.push(child('all','All',[source(c,'All')],c.type));
    for(const [i,v] of values.entries())g.branches.push(child(`option.${i}`,v,[source(c,v,{...c.fixed,[extra]:v},`.${i}`)],c.type));
    rows.push(g);continue;
   }
   if(grouped){let g=prefixGroups.get(p);if(!g){g=group(`prefix.${p}`,p);prefixGroups.set(p,g);rows.push(g);}g.branches.push(child(`${c.type}.${c.id}`,rest,[source(c,rest)],c.type));continue;}
   if(p||!c.home){
    if(!more){more=group('more',`More from ${addonName}`);rows.push(more);}
    const folder=p||c.name;let f=moreFolders.get(folder);
    if(!f){f=child(`folder.${folder}`,folder,[],c.type);moreFolders.set(folder,f);more.branches.push(f);}
    else if(f.mediaType!==c.type)delete f.mediaType;
    f.sources.push(source(c,c.name));continue;
   }
   rows.push(row(c));
  }
  if(more&&rows.length===1)more.title=addonName;
  for(const g of prefixGroups.values())distinctTitles(g.branches);
  distinctTitles(rows.filter(r=>r.kind==='branch'));
 }
 for(const r of rows){delete r.mediaType;for(const b of r.branches||[])delete b.mediaType;}
 const issues=[];
 if(typed)issues.push(`Left out ${typed} ${typed===1?'catalog that needs':'catalogs that need'} a search term or other typed input.`);
 if(other)issues.push(`Left out ${other} ${other===1?'catalog that isn’t':'catalogs that aren’t'} movies or shows.`);
 issues.push(`These rows read ${addonName} from your link. ${catalogLinkNote} Choose Profile file when you export.`);
 return {draft:validateDraft({version:2,title:addonName,rows}),issues,format:`${addonName} catalogs`,ties:[],catalog:{name:addonName,count:catalogs.length,arrange:catalogArrangements.includes(arrange)?arrange:'grouped'}};
}
// MARK: Collection catalog links
// A Nuvio collection names each source's Tobacco Tie by manifest ID only, which can't travel in a
// .cedar file. Given that tie's manifest link, its sources become catalog links instead, keeping
// each source's genre (the catalog choice behind a genre, decade or season folder).
/** `https://host/path/collection.json` → `https://host/path/manifest.json`, where a tie that publishes its own collection serves its manifest; '' otherwise. */
/** `https://host/path/manifest.json` → `https://host/path/collection.json`, where a tie may publish its author's own collections; '' otherwise. */
export function manifestCollectionLink(value){const base=catalogBase(value);return base?`${base}/collection.json`:'';}
export function collectionManifestLink(value){let u;try{u=new URL(value);}catch{return '';}if(u.protocol!=='https:'||u.search||u.hash||u.username||u.password||!/\/collection\.json$/i.test(u.pathname))return '';u.pathname=u.pathname.replace(/\/collection\.json$/i,'/manifest.json');return u.href;}
/** `{manifest, url}` for `parseImport`'s `catalogLinks`, or an error when `raw` isn't a manifest read from its manifest link. */
export function readCatalogManifest(raw,url){let manifest;try{manifest=JSON.parse(raw);}catch{throw Error('That link isn’t a manifest.');}if(!isManifest(manifest))throw Error('That link isn’t a manifest.');if(!catalogBase(url))throw Error('Use the manifest’s https link ending in /manifest.json, without a ?query.');return {manifest,url};}
const draftSources=draft=>draft.rows.flatMap(r=>r.kind==='branch'?[r.source]:r.kind==='group'?r.branches.flatMap(b=>b.sources):[]);
/** Tobacco Tie IDs whose sources still can't travel, with how many sources name each. */
export function unboundTies(draft){const out=new Map();for(const s of draftSources(draft))if(s.provider==='addon'&&s.addonId&&sourceProblem(s))out.set(s.addonId,(out.get(s.addonId)||0)+1);return [...out].map(([id,count])=>({id,count}));}
/** Turns the sources that name `manifest`'s tie (by family, so per-user IDs match) into catalog links read from `sourceURL`. A catalog the manifest no longer lists stays as it was. */
export function bindCatalogLinks(draft,manifest,sourceURL){
 const base=catalogBase(sourceURL);if(!base||!isManifest(manifest))return {bound:0,missing:0};
 const family=addonFamily(manifest.id),addonName=name(manifest.name,'Catalogs');
 const byKey=new Map(manifestCatalogs(manifest).catalogs.map(c=>[`${c.type.toLowerCase()}|${c.id}`,c]));
 let bound=0,missing=0;
 const bind=s=>{
  if(s.provider!=='addon'||!s.addonId||addonFamily(s.addonId)!==family||!sourceProblem(s))return s;
  const type=String(s.type||(s.mediaType==='tv'?'series':s.mediaType)||'movie').toLowerCase(),c=byKey.get(`${type}|${s.catalogId}`);
  if(!c){missing++;return s;}
  bound++;
  // The collection's genre wins over a required extra's first option; values outside the manifest's listed options still work (decades, seasons).
  const extras={...c.fixed,...(s.genre?{genre:s.genre}:{})};
  return sanitizeSource({id:s.id,title:s.genre?`${c.name} · ${s.genre}`:c.name,enabled:s.enabled,provider:'catalog',base,addonName,type:c.type,catalogId:c.id,extras,...(c.pageable?{pageable:true}:{})});
 };
 for(const r of draft.rows){if(r.kind==='branch')r.source=bind(r.source);else if(r.kind==='group')for(const b of r.branches)b.sources=b.sources.map(bind);}
 return {bound,missing,addonName};
}
/** `sourceURL` is where Load URL read the JSON; a manifest needs it. `arrange` lays out a manifest's catalogs (parseManifest).
 `catalogLinks` ([{manifest, url}], from readCatalogManifest) turns a collection's Tobacco Tie sources into catalog links. */
/** A manifest's own collection (`{raw, url}`, read from manifestCollectionLink) as Home rows bound to the manifest, or null when it isn't a collection of this tie's catalogs. */
function manifestCollection(manifest,sourceURL,collection){
 let result;try{result=parseImport(collection.raw,{sourceURL:collection.url,catalogLinks:[{manifest,url:sourceURL}]});}catch{return null;}
 if(!result.bound)return null;
 const addonName=name(manifest.name,'Catalogs');
 return {...result,format:`${addonName} collections`,catalog:{name:addonName,count:manifestCatalogs(manifest).catalogs.length,arrange:'collections',arrangements:['collections',...catalogArrangements]}};
}
/** `collection` ({raw, url}) is the manifest's own collection: it opens on the `collections` arrangement unless `arrange` names another. */
export function parseImport(input,{sourceURL='',arrange='',probes=emptyProbes,catalogLinks=[],collection=null}={}){
 const serialized=typeof input==='string'?input:JSON.stringify(input);if(new TextEncoder().encode(serialized).length>MAX_BYTES)throw Error('Choose a JSON file smaller than 10 MB.');
 let data;try{data=typeof input==='string'?JSON.parse(input):input;}catch{throw Error('This is not valid JSON. Your current Home has not changed.');}
 if(data?.version===2)return {draft:validateDraft(data),issues:[],format:'Saved Creator draft'};
 if(data?.version===1&&Array.isArray(data.folders)){
  const g=makeGroup(name(data.title,'Imported group'));g.id=text(data.id,uid());g.deviceLayout=validateDeviceLayout(data.deviceLayout||newDeviceLayout());g.branches=data.folders.map(f=>({id:text(f.id,uid()),title:name(f.title,'Untitled branch'),enabled:f.enabled!==false,sources:[sanitizeSource({title:f.title,provider:'tmdb',tmdbSourceType:f.kind,mediaType:f.media,tmdbId:f.tmdbID,filters:f.genre?{withGenres:f.genre}:{}})]}));return {draft:validateDraft({version:2,title:'My Home',rows:[g]}),issues:[],format:'Earlier saved draft'};
 }
 if(data?.formatIdentifier==='app.cedar.home-branches'||data?.formatIdentifier==='app.cedar.bundle')throw Error('This is already a Cedar file. Open it in Cedar. To keep editing here, open a saved Creator draft instead.');
 if(isSetupExport(data))return parseSetup(data);
 if(isShelfExport(data))return parseShelves(data);
 if(isManifest(data)){if(!sourceURL)throw Error('This is a manifest. Paste its link (ending in /manifest.json) into Collection URL and choose Load URL, so Cedar knows where to read its catalogs.');const own=collection?manifestCollection(data,sourceURL,collection):null;if(own&&(!arrange||arrange==='collections'))return own;const result=parseManifest(data,sourceURL,arrange||'grouped',probes);if(own)result.catalog.arrangements=own.catalog.arrangements;return result;}
 const config=obj(data?.config)?data.config:obj(data)?data:{};const collections=Array.isArray(data)?data:Array.isArray(config.collections)?config.collections:obj(data)&&Array.isArray(data.folders)?[data]:[];
 if(!collections.length&&!config.home_rows?.length)throw Error('No collections found. Choose a collection file, a profile export, a setup or Home shelf export, or a saved Creator draft, or load a manifest.json link.');
 const rows=[],issues=[];const rowIDs=new Set();const byExternal=new Map();
 for(const c of collections){if(!obj(c)||!Array.isArray(c.folders))throw Error('A collection has no branch list.');const g=makeGroup(name(c.title,'Imported group'));g.id=text(c.id,uid());if(rowIDs.has(g.id)){issues.push(`Duplicate group ID in ${g.title}; a fresh ID was assigned.`);g.id=uid();}rowIDs.add(g.id);g.deviceLayout=validateDeviceLayout(c.cedarLayout||newDeviceLayout());const childIDs=new Set();g.branches=c.folders.map(f=>{const sources=Array.isArray(f.sources)?f.sources:Array.isArray(f.catalogSources)?f.catalogSources.map(s=>resolveCatalog(s,config)):[];const b=cleanChild({...f,sources});if(childIDs.has(b.id))b.id=uid();childIDs.add(b.id);return b;});rows.push(g);byExternal.set(`collection:${c.id}`,g);}
 for(const h of config.home_rows||[]){const refs=collections.flatMap(c=>c.folders||[]).flatMap(f=>f.catalogSources||[]);const ref=refs.find(s=>s.catalogId===h.catalog_id)||{catalogId:h.catalog_id};const s=sanitizeSource(resolveCatalog(ref,config));const b={id:uid(),kind:'branch',title:name(config.catalog_name_overrides?.[h.catalog_id]||s.title,'Imported branch'),enabled:h.enabled!==false,source:s};rows.push(b);byExternal.set(`catalog:${h.catalog_id}`,b);}
 const ordered=[];for(const entry of config.home_order||[]){const row=byExternal.get(`${entry.kind}:${entry.id}`);if(row&&!ordered.includes(row))ordered.push(row);}for(const row of rows)if(!ordered.includes(row))ordered.push(row);
 const draft=validateDraft({version:2,title:'Imported Home',rows:ordered});
 let bound=0;for(const link of catalogLinks){const r=bindCatalogLinks(draft,link.manifest,link.url);bound+=r.bound;if(r.bound)issues.push(`${r.bound} ${r.bound===1?'source reads':'sources read'} ${r.addonName} from your link. ${catalogLinkNote} Choose Profile file when you export.`);if(r.missing)issues.push(`${r.missing} ${r.missing===1?'source names a catalog':'sources name catalogs'} ${r.addonName} no longer lists.`);}
 issues.push(...sourceIssues(draft));
 return {draft,issues,format:data?.config?'Profile export':'Collection JSON',ties:findTobaccoTies(data),bound,unbound:unboundTies(draft)};
}
export function mergeImport(current,incoming,mode='append',selectedIDs=incoming.rows.map(r=>r.id)){
 const next=mode==='replace'?{version:2,title:current.title,bundleID:current.bundleID,avatar:current.avatar,badgePack:current.badgePack,rows:[]}:validateDraft(current);const chosen=validateDraft(incoming).rows.filter(r=>selectedIDs.includes(r.id));
 if(!chosen.length)throw Error('Select at least one Branch or Branch Group.');
 const signature=s=>JSON.stringify({...s,id:undefined,title:undefined,enabled:undefined});
 for(const row of chosen){const existing=next.rows.find(r=>r.kind===row.kind&&(r.id===row.id||r.title.toLowerCase()===row.title.toLowerCase()));if(mode==='missing'&&existing){if(row.kind==='group'){for(const child of row.branches){const match=existing.branches.find(b=>b.id===child.id||b.title.toLowerCase()===child.title.toLowerCase());if(!match)existing.branches.push(child);else for(const source of child.sources)if(!match.sources.some(s=>s.id===source.id||signature(s)===signature(source)))match.sources.push(source);}}continue;}if(next.rows.some(r=>r.id===row.id))row.id=uid();next.rows.push(row);}
 return validateDraft(next);
}
export function moveItem(items,id,position){const index=items.findIndex(i=>i.id===id);if(index<0||position<0||position>=items.length)return;items.splice(position,0,...items.splice(index,1));}
/** Enabled catalog-link sources on enabled rows: what only a locked profile file can carry. */
export function catalogLinkCount(draft){let n=0;const on=s=>s.enabled&&s.provider==='catalog';for(const r of draft.rows){if(!r.enabled)continue;if(r.kind==='branch'&&on(r.source))n++;else if(r.kind==='group')for(const b of r.branches)if(b.enabled)n+=b.sources.filter(on).length;}return n;}
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
 // CatalogLinkBranch.Reference's dataSource and query.
 if(s.provider==='catalog'){const parameters={type:s.type};if(s.pageable)parameters.pageable='1';for(const [k,v] of Object.entries(s.extras||{}))parameters[`extra.${k}`]=v;return {dataSource:{kind:'custom',identifier:catalogLinkID,parameters:{base:s.base,name:s.addonName||'Catalog'}},query:{kind:'custom',identifier:s.catalogId,parameters},filters:cedarFilters(cedarContent(s.type))};}
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
 downloaded catalog file of each pick, by item ID; a pick's Branches are copied as published.
 `links` keeps catalog-link rows, which only a locked profile file may carry. */
function cedarBranches(draft,bundleID,tieFor=()=>null,items={},links=false){
 const branches=[],issues=[],credits=[],titles=[],seen=new Set();let groups=0,hero=false;
 if(draft.hero){const h=heroBranch(draft,bundleID,links);if(h.problem)issues.push(`Hero: ${h.problem} Cedar keeps the viewer’s own hero.`);else{branches.push(h);hero=true;}}
 const convert=(s,direct)=>{const tie=s.provider==='addon'?tieFor(s):null;if(tie)return tieSource(s,tie);if(s.provider==='catalog'&&!links)return {problem:catalogLinkNote};const p=sourceProblem(s,direct);return p?{problem:p}:cedarSource(s);};
 for(const row of draft.rows){if(!row.enabled)continue;
  if(row.kind==='pick'){const file=items[row.item.id];if(!obj(file)||!Array.isArray(file.branches)){issues.push(`${row.title}: this setup could not be downloaded.`);continue;}titles.push(file.title||row.title);if(file.credits&&!credits.some(c=>JSON.stringify(c)===JSON.stringify(file.credits)))credits.push(file.credits);for(const b of file.branches){if(!obj(b)||seen.has(b.id))continue;seen.add(b.id);branches.push(structuredClone(b));if(isBranchGroupJSON(b))groups++;}continue;}
  const id=stableUUID(bundleID,row.id);
  if(row.kind==='group'){
   const folders=[];for(const b of row.branches){if(!b.enabled)continue;const sources=[];for(const s of b.sources){if(!s.enabled)continue;const c=convert(s,false);if(c.problem){issues.push(`${row.title} / ${b.title} / ${s.title}: ${c.problem}`);continue;}sources.push({id:s.id,title:s.title,...c});}
    if(!sources.length){issues.push(`${row.title} / ${b.title}: no compatible enabled sources.`);continue;}
    const folder={id:b.id,title:b.title,dataSource:sources[0].dataSource,query:sources[0].query,filters:sources[0].filters,sources,tileShape:b.tileShape||'landscape',hidesTitle:b.hidesTitle===true};const cover=b.customCoverImageUrl||b.coverImageUrl;if(cover)folder.coverImageURL=cover;if(b.heroBackdropUrl)folder.heroBackdropURL=b.heroBackdropUrl;if(b.focusGifEnabled&&b.focusGifUrl)folder.focusedCoverImageURL=b.focusGifUrl;if(b.titleLogoUrl)folder.titleLogoURL=b.titleLogoUrl;folders.push(folder);}
   if(!folders.length){issues.push(`${row.title}: no compatible enabled branches.`);continue;}
   const platforms=platformConfiguration(row);if(platforms===false){issues.push(`${row.title}: turned off on every device.`);continue;}
   const shared=row.deviceLayout.shared,base={dataSource:{kind:'custom',identifier:'cedar.branch-group',parameters:{'cedar.home.displaysFolderCards':'true','cedar.home.folderRole':'folder','cedar.home.leafBrowseLayout':shared.browseLayout}},query:{kind:'custom',identifier:'cedar.branch-group',parameters:{}},filters:empty(groupContent(folders.flatMap(f=>f.sources)))};
   const b=branch(id,row.title,base,templates[shared.rowStyle],folders);if(platforms)b.platformConfiguration=platforms;branches.push(b);groups++;
  }else{
   const s=row.source;if(!s.enabled)continue;const c=convert(s,true);if(c.problem){issues.push(`${row.title}: ${c.problem}`);continue;}const b=branch(id,row.title,c,templates[row.rowStyle]||'poster-carousel',[],{posterLook:row.posterLook,titleMode:row.titleMode});if(row.platforms)b.platformConfiguration={platforms:row.platforms,overrides:{}};branches.push(b);
  }
 }
 if(!branches.length)throw Error('Enable at least one compatible branch or source before exporting.');
 return {branches,issues,groups,credits,titles,hero};
}
/** The Cedar Branches one Home row becomes, exactly as export writes them: a pick's published
 Branches (shared, not copied: read them only), or the row converted. null while a pick's file
 isn't in `items` yet. */
export function rowBranches(draft,row,items={}){if(!row.enabled)return [];if(row.kind==='pick'){const file=items[row.item.id];return file?(Array.isArray(file.branches)?file.branches.filter(obj):[]):null;}try{return cedarBranches({...draft,hero:undefined,rows:[row]},draft.bundleID||creatorBundleID,undefined,items,true).branches;}catch{return [];}}
/** What a profile file would leave out. Rows matched to a Tobacco Tie at export are still listed. */
export function profileIssues(value,items={}){try{return cedarBranches(validateDraft(value),creatorBundleID,undefined,items,true).issues;}catch{return [];}}
/** The hero exactly as export writes it, or {problem}; null when the draft keeps the viewer’s hero. */
export function previewHero(draft){return draft.hero?heroBranch(draft,draft.bundleID||creatorBundleID):null;}
const isBranchGroupJSON=b=>b.dataSource?.kind==='custom'&&b.dataSource?.identifier==='cedar.branch-group';
const generator={application:'Cedar Creator'};
const onlyPicks=draft=>!draft.hero&&draft.rows.length>0&&draft.rows.every(r=>r.kind==='pick');
/**
 * The Home as a `.cedar` Branches file. A Home made only of catalog picks is written exactly as
 * Creator's own files are, under Creator's bundle ID, so it updates the same Branches in Cedar as
 * downloading each setup alone would.
 */
export function exportCedar(value,now=new Date(),items={}){
 const draft=validateDraft(value),picksOnly=onlyPicks(draft),bundleID=picksOnly?creatorBundleID:draft.bundleID||uid().toUpperCase();
 const {branches,issues,groups,credits,titles,hero}=cedarBranches(draft,bundleID,undefined,items);
 // A shared file's hero sits beside its rows, not among them. Cedar shows the first hero on Home,
 // so a hero row would only add a second, hidden one; Cedar versions that don't read `hero` skip
 // it, and later ones can ask before replacing the viewer's own (CEDAR_FILE_FORMAT.md §3).
 const heroBranch=hero?branches.shift():null;
 if(!branches.length)throw Error('A shared Branches file needs at least one row besides the hero. To share only a hero, choose the profile file.');
 const title=picksOnly&&titles.length===1?titles[0]:picksOnly&&draft.title==='My Home'?'Cedar Creator selection':draft.title;
 const extra={...(credits.length?{credits:credits.length===1?credits[0]:credits}:{}),...(heroBranch?{hero:heroBranch}:{})};
 const document=branchesFile({bundleID,title,createdAt:cedarDate(now),generator,branches,avatarURL:draft.avatar?avatarURL(draft.avatar):null,badgePackURL:draft.badgePack?badgePackURL(draft.badgePack):null,extra});
 return {document,issues,bundleID:picksOnly?draft.bundleID:bundleID,branchCount:branches.length-groups,groupCount:groups,hero};
}
/** A row that reads one catalog of a Tobacco Tie in the same profile file (CEDAR_FILE_FORMAT.md §9.2). */
function tieSource(s,tie){const type=s.type||(s.mediaType==='tv'?'series':s.mediaType)||'movie';return {dataSource:{kind:'manifestAddon',identifier:tie.id.toLowerCase(),parameters:{}},query:{kind:'addonCatalog',identifier:`${tie.manifestID}|${type}|${s.catalogId}`,parameters:{}},filters:cedarFilters(cedarContent(type))};}
/**
 * The Home as a `.cedar` profile file, optionally with the owner's Tobacco Ties. Ties hold the
 * owner's own addresses, so a file with any tie is always sealed with `passphrase`. Rows from an
 * add-on whose manifest ID (or add-on family) matches a tie read that tie instead of being left out.
 * `ties`: [{url, name?, manifestID?}].
 */
export async function exportCedarProfile(value,{passphrase='',ties=[],now=new Date(),items={},setup=null}={}){
 const draft=validateDraft(value),bundleID=draft.bundleID||uid().toUpperCase();
 const fileTies=ties.map(t=>({...t,id:stableUUID(bundleID,`tie.${t.url}`)}));
 const byID=new Map(),byFamily=new Map();for(const t of fileTies)if(t.manifestID){byID.set(t.manifestID.toLowerCase(),t);if(!byFamily.has(addonFamily(t.manifestID)))byFamily.set(addonFamily(t.manifestID),t);}
 const used=new Set();const tieFor=s=>{if(!s.addonId||!s.catalogId)return null;const t=byID.get(s.addonId.toLowerCase())||byFamily.get(addonFamily(s.addonId));if(t)used.add(t.id);return t||null;};
 const {branches,issues,groups,hero}=cedarBranches(draft,bundleID,tieFor,items,true);
 const catalogRows=branches.flatMap(b=>[b,...b.folderOptions.flatMap(f=>f.sources||[])]).filter(x=>x.dataSource?.identifier===catalogLinkID).length;
 if(catalogRows&&!passphrase)throw Error('Catalog links can carry your access token, so a file with them is always locked. Choose a passphrase.');
 const payload={home:{branches:branches.map((b,position)=>({...b,position})),shelves:[]}};
 // The photo and badge pack travel as the profile's identity. No name, so the profile keeps the one chosen in Cedar.
 if(draft.avatar||draft.badgePack)payload.identity={...(draft.avatar?{avatar:avatarURL(draft.avatar)}:{}),...(draft.badgePack?{badgePackURL:badgePackURL(draft.badgePack)}:{})};
 if(fileTies.length)payload.tobaccoTies={ties:fileTies.map(t=>({id:t.id,url:t.url,...(t.name?{name:t.name}:{}),enabledCatalogIDs:[]})),settings:[]};
 // Logins from a setup export, already in Cedar's shapes. profileFile refuses them without a passphrase.
 if(setup?.sources?.length)payload.sources={providers:setup.sources,guideBindings:[],guideMappingOverrides:[]};
 if(setup?.mediaServers?.length)payload.mediaServers=setup.mediaServers;
 if(setup?.apiKeys&&Object.keys(setup.apiKeys).length)payload.apiKeys=setup.apiKeys;
 const document=await profileFile({bundleID,title:draft.title,createdAt:cedarDate(now),generator,payload,passphrase});
 const linkedRows=branches.flatMap(b=>[b,...b.folderOptions.flatMap(f=>f.sources||[])]).filter(x=>x.dataSource?.kind==='manifestAddon').length;
 return {document,issues,bundleID,branchCount:branches.length-groups-(hero?1:0),groupCount:groups,hero,tieCount:fileTies.length,linkedRows,catalogRows,unusedTies:fileTies.filter(t=>!used.has(t.id)).length};
}
export function cedarFileName(title){return `${String(title||'').replace(/[^A-Za-z0-9 _-]+/g,'').trim().replace(/\s+/g,'-')||'Cedar-Home'}.cedar`;}
