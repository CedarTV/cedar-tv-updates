// What Creator's Branch builder offers, kept to what Cedar's own New Branch editor offers
// (ShelvesSettingsView.swift: BranchBuilderView and BranchSourcePicker; ExploreFilter.swift and
// HomeBranchEntityNames.swift for the pick lists). A built Branch is plain Cedar JSON (§4 and §5 of
// CEDAR_FILE_FORMAT.md), so export writes it as it is.
const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const opts=list=>list.map(([id,title,note])=>({id:String(id),title,...(note?{note}:{})}));

export const families=['phone','tablet','desktop','television'];
export const familyNames={phone:'iPhone',tablet:'iPad',desktop:'Mac',television:'Apple TV'};
export const contentTypes=opts([['movies','Movies'],['shows','TV Shows'],['both','Movies & TV']]);
const alpha=(a,b)=>a.title.localeCompare(b.title);
export const genres=opts([[28,'Action'],[12,'Adventure'],[16,'Animation'],[35,'Comedy'],[80,'Crime'],[99,'Documentary'],[18,'Drama'],[10751,'Family'],[14,'Fantasy'],[36,'History','Movies only'],[27,'Horror','Movies only'],[10402,'Music','Movies only'],[9648,'Mystery'],[10749,'Romance','Movies only'],[878,'Science Fiction'],[10770,'TV Movie','Movies only'],[53,'Thriller','Movies only'],[10752,'War'],[37,'Western'],[10762,'Kids','TV only'],[10763,'News','TV only'],[10764,'Reality','TV only'],[10766,'Soap','TV only'],[10767,'Talk','TV only']]).sort(alpha);
export const keywords=opts([[9715,'Superhero'],[12377,'Space Opera'],[4565,'Dystopia'],[12190,'Cyberpunk'],[10235,'Family Drama'],[9663,'Sequel'],[9748,'Revenge'],[10714,'Heist'],[1701,'Hero'],[10349,'Survival'],[15060,'Coming of Age'],[9951,'Alien'],[3133,'Zombie'],[10292,'Serial Killer'],[6152,'Post-Apocalyptic'],[9882,'Time Travel'],[818,'Based on Novel'],[9672,'Based on True Story']]);
export const studios=opts([[2,'Disney'],[3,'Pixar'],[420,'Marvel Studios'],[174,'Warner Bros.'],[33,'Universal'],[4,'Paramount'],[25,'20th Century'],[34,'Sony Pictures'],[1632,'Lionsgate'],[10342,'Studio Ghibli'],[521,'DreamWorks'],[41077,'A24'],[178464,'Netflix'],[3268,'HBO'],[3172,'Blumhouse'],[923,'Legendary']]);
export const services=opts([[8,'Netflix'],[9,'Prime Video'],[337,'Disney+'],[1899,'HBO Max'],[350,'Apple TV+'],[15,'Hulu'],[531,'Paramount+'],[386,'Peacock'],[283,'Crunchyroll'],[230,'Crave'],[11,'MUBI'],[192,'YouTube']]);
export const regions=opts([['AU','Australia'],['BR','Brazil'],['CA','Canada'],['DK','Denmark'],['FI','Finland'],['FR','France'],['DE','Germany'],['IN','India'],['IT','Italy'],['JP','Japan'],['MX','Mexico'],['NL','Netherlands'],['NZ','New Zealand'],['NO','Norway'],['KR','South Korea'],['ES','Spain'],['SE','Sweden'],['GB','United Kingdom'],['US','United States']]);
/** TV networks for "aired on". BBC also searches BBC Two, as in Cedar. */
export const networks=[['2','ABC'],['6','NBC'],['16','CBS'],['19','FOX'],['21','The WB'],['71','The CW'],['49','HBO'],['174','AMC'],['88','FX'],['67','Showtime'],['318','Starz'],['359','Cinemax'],['4','BBC',['332']],['332','BBC Two'],['9','ITV'],['26','Channel 4'],['14','PBS'],['47','Comedy Central'],['56','Cartoon Network'],['13','Nickelodeon'],['54','Disney Channel'],['33','MTV'],['77','Syfy'],['30','USA Network'],['41','TNT'],['68','TBS'],['80','Adult Swim'],['1267','Freeform'],['34','Lifetime'],['74','Bravo'],['84','TLC'],['210','HGTV'],['64','Discovery Channel'],['65','History Channel'],['129','A&E'],['24','BET'],['384','Hallmark Channel'],['43','National Geographic']].map(([id,title,more=[]])=>({id,title,ids:[id,...more]})).sort(alpha);
/** "One TV Network" picks from the streaming networks Cedar suggests; any TMDB network ID also works. */
export const homeNetworks=opts([['213','Netflix'],['2739','Disney+'],['49','HBO'],['2552','Apple TV+'],['4330','Paramount+'],['1024','Prime Video'],['453','Hulu']]);
export const curatedLists=opts([['best','Best Movies & TV'],['award-winners','Award Winners'],['highest-rated-year','Highest Rated This Year'],['hidden-gems','Hidden Gems'],['family-favorites','Family Favorites'],['critically-acclaimed','Critically Acclaimed']]);
export const animePresets=opts([['today','Today’s Anime'],['week','Airing This Week'],['trending','Trending Anime'],['upcoming','Upcoming Anime'],['top-rated','Top Rated Anime']]);
export const seasonalPresets=opts([['christmas','Christmas'],['halloween','Halloween'],['valentines','Valentine’s Day'],['summer','Summer Blockbusters'],['oscars','Oscar Winners']]);
export const trendingWindows=opts([['day','Today'],['week','This Week']]);
export const sortOrders=opts([['popularity','Most Popular'],['topRated','Highest Rated'],['newest','Newest First'],['releaseDateOldest','Oldest First'],['alphabetical','Alphabetical'],['random','Random']]);
export const ratings=[{id:'',title:'Any Rating'},...[5,6,7,8,9].map(n=>({id:String(n),title:`${n}+ ★`}))];
export const voteCounts=opts([['','Any Number of Ratings'],['50','50+ Ratings'],['100','100+ Ratings'],['250','250+ Ratings'],['500','500+ Ratings'],['1000','1,000+ Ratings'],['5000','5,000+ Ratings']]);
export const statuses=opts([['any','Any Status'],['upcoming','Upcoming'],['nowPlaying','Now Playing'],['airingToday','Airing Today'],['onTheAir','On the Air']]);
const languageCodes=['en','es','fr','de','it','pt','ja','ko','zh','hi','ar','ru','nl','sv','no','da','fi','pl','tr','he','th','id','vi','cs','ro','hu','uk'];
const countryCodes='AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'.split(' ');
function names(type,codes){let d;try{d=new Intl.DisplayNames(['en'],{type});}catch{d=null;}return codes.map(id=>({id,title:(d&&d.of(id))||id.toUpperCase()})).sort(alpha);}
export const languages=names('language',languageCodes);
export const countries=names('region',countryCodes);

const metadata={kind:'preferredMetadata',parameters:{}};
const choice=(kind,title,subtitle,contentType='both')=>({id:`discovery:${kind}`,title,subtitle,dataSource:metadata,query:{kind},contentType});
/** Cedar's content choices that don't depend on the person's own servers or Tobacco Ties. */
export const sourceGroups=[
 {title:'Discover',choices:[
  choice('trending','Trending','Today or this week'),choice('popular','Popular','Popular movies and television'),choice('topRated','Top Rated','Highest-rated titles'),
  choice('comingSoon','Coming Soon','Movies and series arriving in the next 90 days'),choice('nowPlaying','Now Playing','Now in cinemas and airing'),
  choice('airingToday','Airing Today','Television airing today','shows'),choice('onTheAir','On the Air','Television currently on the air','shows'),
  choice('genre','One Genre','Choose a movie or television genre'),choice('network','One TV Network','Choose one network and show its titles','shows'),
  choice('productionCompany','One Studio or Company','Choose one company and show its titles'),choice('streamingProvider','One Streaming Service','Choose one service and show titles available in a region'),
  choice('metadataCollection','TMDB Collection','An official TMDB film collection','movies'),choice('curatedList','Curated List','Editorial and algorithmic discovery'),
  choice('year','Year','Browse one release year'),choice('decade','One Decade','Choose one ten-year range'),choice('country','Country','Browse by production country'),
  choice('originalLanguage','Original Language','Browse titles in their original language'),choice('anime','Anime','Animation originally produced in Japan'),choice('seasonal','Seasonal','A seasonal discovery branch')]},
 {title:'Your Library',note:'Reads each viewer’s own Cedar library.',choices:[
  {id:'local:continue',title:'Continue Watching',subtitle:'Movies, episodes, and optional Live TV progress',dataSource:{kind:'local',parameters:{}},query:{kind:'continueWatching'}},
  {id:'local:up-next',title:'Next Up',subtitle:'Released next episodes from the viewer’s tracking service or history',dataSource:{kind:'local',parameters:{}},query:{kind:'upNext'}},
  {id:'local:favorites',title:'Favorites',subtitle:'Favorites in the viewer’s profile',dataSource:{kind:'local',parameters:{}},query:{kind:'favorites'}},
  {id:'local:recent',title:'Recently Watched',subtitle:'Recently completed or played titles',dataSource:{kind:'local',parameters:{}},query:{kind:'recentlyWatched'}},
  {id:'local:calendar',title:'Upcoming',subtitle:'What’s next on the viewer’s Calendar',dataSource:{kind:'local',parameters:{}},query:{kind:'calendar'}}]},
 {title:'Saved & Tracked',note:'Reads the viewer’s own tracking account.',choices:[
  {id:'tracking:watchlist',title:'Watchlist',subtitle:'The viewer’s watchlist provider',dataSource:{kind:'trackingService',parameters:{}},query:{kind:'watchlist'}},
  {id:'tracking:collection',title:'Collection',subtitle:'Titles marked as owned on the tracking service',dataSource:{kind:'trackingService',parameters:{}},query:{kind:'collection'}}]},
];
const allChoices=sourceGroups.flatMap(g=>g.choices);
/** Discovery kinds that read one thing, named by `query.identifier`. */
export const identifiedKinds=['genre','network','productionCompany','streamingProvider','metadataCollection','curatedList','year','decade','country','originalLanguage'];
const feedKinds=['trending','popular','topRated','upcoming','comingSoon','nowPlaying','airingToday','onTheAir'];

// MARK: Validation

const dataSourceKinds={preferredMetadata:[undefined],metadataProvider:['tmdb'],local:[undefined],trackingService:[undefined,'trakt-public','mdblist-public']};
const queryKinds=new Set([...feedKinds,...identifiedKinds,'anime','seasonal','personCredits','continueWatching','upNext','favorites','recentlyWatched','calendar','watchlist','collection','curatedList']);
const sortValues=['popularity','newest','topRated','releaseDate','releaseDateOldest','alphabetical','alphabeticalDescending','voteCount','revenue','runtime','random'];
const arrayKeys=['genreIDs','originalLanguageCodes','countryCodes','streamingProviderIDs','networkIDs','productionCompanyIDs'];
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
function stringMap(v,limit=24,max=500){const out={};if(obj(v))for(const [k,x] of Object.entries(v).slice(0,limit))if(/^[A-Za-z0-9_.:-]{1,80}$/.test(k)&&typeof x==='string')out[k]=x.slice(0,max);return out;}
const ids=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(x)))].slice(0,60):[];
const day=/^\d{4}-\d{2}-\d{2}T00:00:00Z$/;
/** Cedar's filters (§5) with every required array present and nothing it wouldn't read. */
export function cleanFilters(v,fallback='both'){
 const f=obj(v)?v:{},out={contentType:['movies','shows','both'].includes(f.contentType)?f.contentType:fallback};
 for(const k of arrayKeys)out[k]=ids(f[k]);
 for(const k of ['keywordIDs','seriesTypes']){const a=ids(f[k]);if(a.length)out[k]=a;}
 if(sortValues.includes(f.sortOrder))out.sortOrder=f.sortOrder;
 if(Number.isSafeInteger(f.releaseYear)&&f.releaseYear>=1870&&f.releaseYear<=2200)out.releaseYear=f.releaseYear;
 else for(const k of ['releaseDateStart','releaseDateEnd'])if(day.test(f[k]||''))out[k]=f[k];
 if(f.matchesSeriesAirDates===true)out.matchesSeriesAirDates=true;
 for(const k of ['minimumVoteAverage','maximumVoteAverage'])if(typeof f[k]==='number'&&f[k]>=0&&f[k]<=10)out[k]=f[k];
 if(Number.isSafeInteger(f.minimumVoteCount)&&f.minimumVoteCount>=0)out.minimumVoteCount=f.minimumVoteCount;
 const labels=stringMap(f.filterDisplayNames,200,120);if(Object.keys(labels).length)out.filterDisplayNames=labels;
 return out;
}
/** A built Branch's source: `{dataSource, query, filters}` that Cedar can run, or an Error. */
export function cleanCedarSource(v){
 if(!obj(v)||!obj(v.dataSource)||!obj(v.query))throw Error('This Branch has no content.');
 const ds=v.dataSource,q=v.query,allowed=dataSourceKinds[ds.kind];
 if(!allowed||!allowed.includes(ds.identifier??undefined))throw Error('Creator can’t build Branches from this source.');
 if(!queryKinds.has(q.kind))throw Error('Creator can’t build Branches of this kind.');
 const dataSource={kind:ds.kind,parameters:stringMap(ds.parameters)};if(ds.identifier)dataSource.identifier=ds.identifier;
 const query={kind:q.kind,parameters:stringMap(q.parameters)};const id=text(q.identifier,500);if(id)query.identifier=id;
 return {dataSource,query,filters:cleanFilters(v.filters)};
}
/** Why Cedar couldn't run this source yet, or ''. */
export function sourceIssue(s){
 const {dataSource,query}=s;
 if(dataSource.kind==='preferredMetadata'&&identifiedKinds.includes(query.kind)&&!query.identifier)return `Choose ${({genre:'a genre',network:'a network',productionCompany:'a studio or company',streamingProvider:'a streaming service',metadataCollection:'a TMDB collection',curatedList:'a list',year:'a year',decade:'a decade',country:'a country',originalLanguage:'a language'})[query.kind]}.`;
 if(query.kind==='year'&&!/^\d{4}$/.test(query.identifier||''))return 'Enter a four-digit year.';
 if(query.kind==='metadataCollection'&&!/^\d+$/.test(query.identifier||''))return 'Enter a TMDB collection ID or link.';
 if(['productionCompany','network','streamingProvider'].includes(query.kind)&&!/^\d+$/.test(query.identifier||''))return 'Enter a numeric TMDB ID.';
 if(dataSource.identifier==='trakt-public'&&!/^(?:[^|\s]+\|[^|\s]+|global:\d+:(?:movie|show))$/.test(query.identifier||'')&&!traktChartPattern.test(query.identifier||''))return 'Paste a public Trakt list link.';
 if(dataSource.identifier==='mdblist-public'&&!/^[^|\s]+\|[^|\s]+$/.test(query.identifier||''))return 'Paste a public MDBList list link.';
 return '';
}

// MARK: Editing

export const emptyFilters=(contentType='both')=>cleanFilters({contentType});
/** A new Branch starts as Cedar's does after you pick Popular: movies and TV, most popular first. */
export function newBuild(){return {title:'',titleMode:'automatic',style:'poster',platforms:null,source:{dataSource:{...metadata},query:{kind:'popular',parameters:{}},filters:emptyFilters()}};}
export const isDiscovery=s=>['preferredMetadata','metadataProvider'].includes(s.dataSource.kind);
export const supportsStatus=s=>isDiscovery(s)&&[...feedKinds].includes(s.query.kind);
export const supportsContentType=s=>!isDiscovery(s);
/** The listed choice a source came from, if any. */
export function choiceOf(s){if(s.dataSource.identifier==='trakt-public'||s.dataSource.identifier==='mdblist-public')return null;const kind=s.query.kind==='upcoming'?'comingSoon':s.query.kind;return allChoices.find(c=>c.dataSource.kind===s.dataSource.kind&&c.query.kind===kind)||null;}
/** Picking a choice keeps the filters, as Cedar does, but each kind starts with its own defaults. */
export function applyChoice(s,c){
 const filters={...s.filters};if(c.contentType&&c.contentType!=='both')filters.contentType=c.contentType;
 const query={kind:c.query.kind,parameters:{}};
 if(c.query.kind==='trending')query.parameters.window='week';
 if(c.query.kind==='anime')query.parameters.preset='trending';
 if(c.query.kind==='seasonal'){query.parameters.preset='christmas';query.parameters.year=String(new Date().getFullYear());}
 return {dataSource:{...c.dataSource,parameters:{}},query,filters:isDiscoveryChoice(c)?filters:cleanFilters({contentType:filters.contentType})};
}
const isDiscoveryChoice=c=>c.dataSource.kind==='preferredMetadata';
/** "Currently" changes the feed, as Cedar's status menu does. */
export function statusOf(s){return ['upcoming','comingSoon'].includes(s.query.kind)?'upcoming':['nowPlaying','airingToday','onTheAir'].includes(s.query.kind)?s.query.kind:'any';}
export function setStatus(s,status){return {...s,query:{kind:status==='any'?'popular':status==='upcoming'?'upcoming':status,parameters:s.query.parameters.region?{region:s.query.parameters.region}:{}}};}

const firstYear=1880;
/** "1996", "1990s" or "1996–2003", from the filters' year or date window. */
export function releasePeriod(f){
 if(f.releaseYear)return String(f.releaseYear);
 const a=Number(f.releaseDateStart?.slice(0,4)),b=Number(f.releaseDateEnd?.slice(0,4));
 if(!a||!b||a>b)return '';
 if(a===b)return String(a);
 return a%10===0&&b===a+9?`${a}s`:`${a}–${b}`;
}
/** Reads "1996", "1990s" or "1996-2003". One year uses the exact-year filter, longer ones a window. */
export function setReleasePeriod(f,input){
 const out={...f};delete out.releaseYear;delete out.releaseDateStart;delete out.releaseDateEnd;
 const v=String(input||'').trim().toLowerCase(),max=new Date().getFullYear()+5;let years=null;
 if(/^\d{4}s$/.test(v)&&Number(v.slice(0,4))%10===0)years=[Number(v.slice(0,4)),Number(v.slice(0,4))+9];
 else if(/^\d{4}$/.test(v))years=[Number(v),Number(v)];
 else{const m=/^(\d{4})\s*[-–]\s*(\d{4})$/.exec(v);if(m)years=[Math.min(m[1],m[2]),Math.max(m[1],m[2])].map(Number);}
 if(!years||years[0]<firstYear||years[1]>max)return out;
 if(years[0]===years[1])out.releaseYear=years[0];else{out.releaseDateStart=`${years[0]}-01-01T00:00:00Z`;out.releaseDateEnd=`${years[1]}-12-31T00:00:00Z`;}
 return out;
}
export function releasePeriods(){const now=new Date().getFullYear(),decade=Math.floor(now/10)*10,out=[{id:'',title:'Any Year'}];for(let y=now;y>=now-5;y--)out.push({id:String(y),title:String(y)});for(let d=decade;d>=firstYear;d-=10)out.push({id:`${d}s`,title:`${d}s`});return out;}

/** Keeps the editor's labels for picked studios, keywords, services and networks (filterDisplayNames). */
export function withLabels(f,kind,picked){const labels={...(f.filterDisplayNames||{})};for(const k of Object.keys(labels))if(k.startsWith(`${kind}:`))delete labels[k];for(const p of picked)labels[`${kind}:${p.id}`]=p.title;const out={...f};if(Object.keys(labels).length)out.filterDisplayNames=labels;else delete out.filterDisplayNames;return out;}

/** A public list from its web address: Trakt, MDBList, a TMDB list or a TMDB collection. */
export function parseListURL(input,contentType='both'){
 let u;try{u=new URL(String(input).trim());}catch{throw Error('Paste the list’s web address.');}
 if(u.protocol!=='https:'&&u.protocol!=='http:')throw Error('Paste the list’s web address.');
 const host=u.hostname.replace(/^www\./,''),parts=u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
 const slugPart=/^[A-Za-z0-9._~-]{1,120}$/;
 if(host==='trakt.tv'||host==='app.trakt.tv'){
  if(parts[0]==='users'&&parts[2]==='lists'&&slugPart.test(parts[1]||'')&&slugPart.test(parts[3]||''))return {kind:'Trakt list',name:parts[3],source:{dataSource:{kind:'trackingService',identifier:'trakt-public',parameters:{}},query:{kind:'curatedList',identifier:`${parts[1]}|${parts[3]}`,parameters:{}}}};
  if(parts[0]==='lists'&&/^\d+$/.test(parts[1]||''))return {kind:'Trakt list',name:`Trakt list ${parts[1]}`,source:{dataSource:{kind:'trackingService',identifier:'trakt-public',parameters:{}},query:{kind:'curatedList',identifier:`global:${parts[1]}:${contentType==='shows'?'show':'movie'}`,parameters:{}}}};
 }
 if(host==='mdblist.com'&&parts[0]==='lists'&&slugPart.test(parts[1]||'')&&slugPart.test(parts[2]||''))return {kind:'MDBList list',name:parts[2],source:{dataSource:{kind:'trackingService',identifier:'mdblist-public',parameters:{}},query:{kind:'curatedList',identifier:`${parts[1].toLowerCase()}|${parts[2]}`,parameters:{}}}};
 if(host==='themoviedb.org'){
  const id=/^(\d+)/.exec(parts[1]||'')?.[1],name=(parts[1]||'').replace(/^\d+-?/,'');
  if(parts[0]==='list'&&id)return {kind:'TMDB list',name:name||`TMDB list ${id}`,source:{dataSource:{...metadata},query:{kind:'curatedList',identifier:id,parameters:{provider:'tmdb'}}},contentType:'movies'};
  if(parts[0]==='collection'&&id)return {kind:'TMDB collection',name:name||`Collection ${id}`,source:{dataSource:{...metadata},query:{kind:'metadataCollection',identifier:id,parameters:{}}},contentType:'movies'};
 }
 throw Error('Use a public list from Trakt, MDBList or TMDB.');
}
/** A TMDB ID from an ID or a themoviedb.org link of that kind ("person", "collection", "company"…). */
export function tmdbID(input,kind){const v=String(input||'').trim();if(/^\d{1,9}$/.test(v))return {id:v};try{const u=new URL(v),parts=u.pathname.split('/').filter(Boolean);if(u.hostname.replace(/^www\./,'')==='themoviedb.org'&&parts[0]===kind){const m=/^(\d+)(?:-(.*))?$/.exec(parts[1]||'');if(m)return {id:m[1],name:m[2]?prettySlug(m[2]):''};}}catch{}return null;}
export const prettySlug=s=>String(s).replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,c=>c.toUpperCase());

const mediaTitle=t=>t==='movies'?'Movies':t==='shows'?'TV Shows':'Movies & TV';
/** Trakt's public charts (CEDAR_FILE_FORMAT.md §4.3), stored as `chart:<chart>:<movie|show|all>[:<period>]`. */
export const traktChartPattern=/^chart:(?:(trending|popular|anticipated):(movie|show|all)|(boxoffice):(movie)|(watched|played|collected|favorited):(movie|show|all)(?::(daily|weekly|monthly|yearly|all))?)$/;
/** The title Cedar gives a chart (TraktChart.title in the app). */
export function traktChartTitle(id){const m=traktChartPattern.exec(id||'');if(!m)return '';const chart=m[1]||m[3]||m[5],media={movie:'Movies',show:'Shows',all:'Movies & Shows'}[m[2]||m[4]||m[6]],when={daily:' Today',weekly:' This Week',monthly:' This Month',yearly:' This Year',all:''}[m[7]||(m[5]?'weekly':'all')];return chart==='boxoffice'?'Box Office':chart==='anticipated'?`Most Anticipated ${media}`:m[5]?`Most ${chart[0].toUpperCase()+chart.slice(1)} ${media}${when}`:`${chart[0].toUpperCase()+chart.slice(1)} ${media}`;}
const nameOf=(list,id)=>list.find(o=>o.id===String(id))?.title;
/** The title Cedar gives a Branch whose title follows its content (automaticTitle in BranchBuilderView). */
export function automaticTitle(s){
 const {dataSource,query}=s,f=s.filters,id=query.identifier,media=mediaTitle(f.contentType);
 if(dataSource.identifier==='trakt-public'&&traktChartPattern.test(id||''))return traktChartTitle(id);
 if(dataSource.identifier==='trakt-public'||dataSource.identifier==='mdblist-public')return prettySlug(String(id||'').split('|').pop().replace(/^global:(\d+):.*/,'Trakt list $1'))||'Public List';
 if(query.kind==='curatedList'&&query.parameters?.provider==='tmdb')return `TMDB List ${id}`;
 const byKind={genre:()=>nameOf(genres,id)&&`${nameOf(genres,id)} ${media}`,productionCompany:()=>nameOf(studios,id)&&`${nameOf(studios,id)} ${media}`,streamingProvider:()=>nameOf(services,id)&&`${media} on ${nameOf(services,id)}`,network:()=>nameOf(homeNetworks,id)&&`${nameOf(homeNetworks,id)} TV Shows`,metadataCollection:()=>id&&`TMDB Collection ${id}`,curatedList:()=>nameOf(curatedLists,id),year:()=>id&&`${id} ${media}`,decade:()=>id&&`${id}s ${media}`,country:()=>nameOf(countries,id)&&`${nameOf(countries,id)} ${media}`,originalLanguage:()=>nameOf(languages,id)&&`${nameOf(languages,id)} ${media}`,anime:()=>nameOf(animePresets,query.parameters?.preset),seasonal:()=>nameOf(seasonalPresets,query.parameters?.preset)};
 const specific=byKind[query.kind]?.();if(specific)return specific;
 if(!isDiscovery(s))return choiceOf(s)?.title||'Branch';
 const person=query.parameters?.personName;if(query.parameters?.withPersonID&&person)return `${media} Featuring ${person}`;
 const words=[{trending:'Trending',topRated:'Top Rated',upcoming:'Upcoming',comingSoon:'Upcoming',nowPlaying:'Now Playing',airingToday:'Airing Today',onTheAir:'On the Air',anime:'Anime'}[query.kind]||({topRated:'Top Rated',newest:'Latest',releaseDate:'Latest',releaseDateOldest:'Classic'}[f.sortOrder]||'Popular')];
 const period=releasePeriod(f);if(period)words.push(period);
 words.push(...genres.filter(g=>f.genreIDs.includes(g.id)).slice(0,2).map(g=>g.title));
 words.push(media);
 let title=words.join(' ');const service=f.streamingProviderIDs[0];if(service){const n=nameOf(services,service)||f.filterDisplayNames?.[`services:${service}`];if(n)title+=` on ${n}`;}
 return title;
}
/** Branch styles from Cedar's Layout picker, as presentation. */
export const styles=[{id:'poster',title:'Poster',template:'poster-carousel'},{id:'ratings',title:'Poster + Ratings',template:'poster-carousel',posterLook:'critic'},{id:'landscape',title:'Landscape',template:'wide-backdrop-carousel'},{id:'feature',title:'Feature',template:'list-preview-full-width'}];
