// Creator's Home preview. It draws Cedar Branches the way Cedar's Home does on each device: each
// row in its style, Branch Groups as folder cards in the group's one shape, and the pages a card or
// row opens. It reads the same Branch JSON that export writes, so picks show every published row.
const groupID='cedar.branch-group';
export const isGroup=b=>b?.dataSource?.kind==='custom'&&b?.dataSource?.identifier===groupID;
const templateStyles={'poster-carousel':'poster','wide-backdrop-carousel':'wide','list-preview-full-width':'feature','hero-carousel':'hero'};
/** Older template IDs still decode in Cedar and show as poster rows. */
export const rowStyle=templateID=>templateStyles[templateID]||'poster';
export const styleNames={poster:'Poster row',wide:'Wide backdrop row',feature:'Featured row',hero:'Hero row'};
export const shapeNames={landscape:'Landscape cards',poster:'Poster cards',square:'Square cards'};

/** The Branch as it shows on one device family, or null when it's hidden there (CEDAR_FILE_FORMAT.md §7.3). */
export function resolveBranch(branch,family){
 if(!branch||branch.isEnabled===false)return null;
 const config=branch.platformConfiguration;
 if(Array.isArray(config?.platforms)&&!config.platforms.includes(family))return null;
 const o=config?.overrides?.[family]||{};if(o.isEnabled===false)return null;
 const parameters=branch.dataSource?.parameters||{};
 return {...branch,presentation:o.presentation||branch.presentation,browseLayout:o.leafBrowseLayout||parameters['cedar.home.leafBrowseLayout']||'rows',cardStyle:o.leafCardStyle||null};
}
/** Cedar draws every card of a group in its first folder's shape. */
export function cardShape(node){const s=String(node?.folderOptions?.[0]?.tileShape||'landscape').toLowerCase();return ['poster','square'].includes(s)?s:'landscape';}
/** The folder at an index path inside a Branch, with every folder on the way to it. */
export function folderAt(branch,path){let node=branch;const trail=[];for(const i of path){node=node?.folderOptions?.[i];if(!node)return null;trail.push(node);}return {folder:node,trail};}
/** A folder's rows: its sources, or the folder's own query in older files. */
export const folderSources=f=>f.sources?.length?f.sources:[f];

const providers={8:'Netflix',1796:'Netflix',9:'Prime Video',2100:'Prime Video',119:'Prime Video',350:'Apple TV+',337:'Disney+',2303:'Paramount+',531:'Paramount+',1899:'HBO Max',1825:'HBO Max',384:'HBO Max',15:'Hulu',386:'Peacock',387:'Peacock',551:'MagellanTV',190:'Curiosity Stream',283:'Crunchyroll',99:'Shudder',73:'Tubi',300:'Pluto TV',526:'AMC+',43:'Starz',37:'Showtime',257:'fuboTV',188:'YouTube Premium',192:'YouTube'};
const feeds={trending:'Trending',popular:'Popular',topRated:'Top rated',upcoming:'Upcoming',nowPlaying:'Now playing',airingToday:'Airing today',onTheAir:'On the air'};
const services={trakt:'Trakt',simkl:'Simkl',mdblist:'MDBList',letterboxd:'Letterboxd'};
const listCount=v=>String(v||'').split(',').filter(Boolean).length;
/** Where a row's titles come from, in a few words. */
export function describeSource(s){
 const ds=s?.dataSource||{},q=s?.query||{},f=s?.filters||s?.defaultFilters||{},id=String(q.identifier??'');
 const content=f.contentType==='movies'?'movies':f.contentType==='shows'?'shows':'movies & shows';
 if(ds.identifier==='trakt-public'){const g=/^global:(\d+)/.exec(id);return `Trakt list · ${g?`#${g[1]}`:id.replace('|','/')}`;}
 if(ds.identifier==='mdblist-public')return `MDBList · ${id.replace('|','/')}`;
 if(ds.kind==='trackingService')return `Your ${services[ds.identifier]||'tracking service'} list`;
 if(ds.kind==='manifestAddon')return 'Tobacco Tie catalog';
 if(ds.identifier==='cedar.catalog-link')return `${ds.parameters?.name||'Catalog'} · ${content}`;
 if(q.kind==='upNext')return 'Your Up Next';
 if(q.kind==='watchlist')return 'Your watchlist';
 if(q.kind==='curatedList'){const p=q.parameters||{};if(p.provider==='cedar-titles'){const n=listCount(p.movies)+listCount(p.shows);return `Hand-picked · ${n} ${n===1?'title':'titles'}`;}return p.provider==='tmdb'?`TMDB list · ${id}`:'Curated list';}
 if(q.kind==='metadataCollection')return 'TMDB collection';
 if(q.kind==='personCredits')return q.parameters?.role==='director'?'Director’s films':'Actor’s credits';
 if(q.kind==='productionCompany')return `Studio · ${content}`;
 if(q.kind==='network')return `Network · ${content}`;
 const on=[...new Set((f.streamingProviderIDs||[]).map(i=>providers[i]).filter(Boolean))];
 return `${feeds[q.kind]||'Discover'} ${content}${on.length?` on ${on.join(', ')}`:''}`;
}

// MARK: Drawing

const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,action,cls='text-button')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
/** One image proxy found in imported files refuses other sites (Cross-Origin-Resource-Policy:
 same-origin), though Cedar loads it fine. Its path is the original image URL in base64, which the
 preview loads instead.
 TMDB originals are swapped for a card-sized copy, and art with a Creator thumbnail uses it. */
let thumbnails=new Map();
/** Original cover address → thumbnail, from the Creator catalog. */
export function useThumbnails(map){thumbnails=new Map(Object.entries(map||{}));}
export function previewImageURL(url){const tmdb=/^https:\/\/(?:image\.tmdb\.org|media\.themoviedb\.org)\/t\/p\/original\//;if(tmdb.test(url||''))url=url.replace(tmdb,'https://image.tmdb.org/t/p/w780/');if(thumbnails.has(url))return thumbnails.get(url);const m=/^https:\/\/get-stranded\.fabriceleven\.com\/img\/remote\/([A-Za-z0-9_-]+=*)$/.exec(url||'');if(!m)return url;try{const original=atob(m[1].replace(/-/g,'+').replace(/_/g,'/'));return /^https:\/\/[^\s"'<>]+$/.test(original)?original:url;}catch{return url;}}
function image(url,cls,failed){const i=el('img',cls);i.src=previewImageURL(url);i.alt='';i.loading='lazy';i.decoding='async';i.referrerPolicy='no-referrer';i.addEventListener('error',()=>{i.remove();failed?.();},{once:true});return i;}
/** Sample titles from Cedar's own screenshots: the preview shows shapes and order, not each list's titles. */
const sampleTitles=['Mutiny','Toy Story 5','Lanterns','Spider-Man: Brand New Day','The Odyssey','Insidious: Out of the Further'];
function samples(count,cls){const rail=el('div',`sample-rail ${cls}`);rail.setAttribute('aria-hidden','true');for(let i=0;i<count;i++){const item=el('span','sample-item');item.append(el('span',`sample-poster s${i%6}`),el('span','sample-title',sampleTitles[i%6]));rail.append(item);}return rail;}
/** Where card and poster titles sit, as Cedar's Title Position setting: below, on the artwork, or hidden. */
export const titlePositions={below:'Below artwork',on:'On artwork',hidden:'Hidden'};
const sampleCounts={poster:12,wide:7,feature:3};
function heading(title,caption,actions=[]){const h=el('div','preview-row-heading'),text=el('div');text.append(el('h3','',title));if(caption)text.append(el('small','',caption));h.append(text,...actions);return h;}

/** Cedar shows a folder's focus art (often a GIF) while its card is focused. It downloads on the
 first hover or focus, never with the page, and Reduce Motion leaves the regular cover. */
const reducesMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function addFocusArt(card,box,url){
 box.classList.add('has-focus-art');
 const show=()=>{if(reducesMotion()||box.querySelector('.card-focus-art'))return;const art=image(url,'card-focus-art');art.loading='eager';box.insertBefore(art,box.querySelector('.card-overlay-title'));};
 card.addEventListener('pointerenter',show);card.addEventListener('focus',show);
}

function folderCard(folder,shape,cardStyle,open){
 const art=folder.coverImageURL,logo=folder.titleLogoURL;
 const card=button('',open,`group-card shape-${shape}`),box=el('span','card-art');card.setAttribute('aria-label',`Open ${folder.title}`);
 // On the artwork, a hidden title comes back if the artwork that stood in for it doesn't load.
 const overlay=el('span',`card-overlay-title${folder.hidesTitle&&(art||logo)?' title-hidden':''}`,folder.title),reveal=()=>{if(!box.querySelector('img'))overlay.classList.remove('title-hidden');};
 if(art)box.append(image(art,'',reveal));else if(cardStyle==='poster-wall'||folder.categoryCardStyle==='poster-wall')box.classList.add('poster-wall');
 // A folder's title logo is for its page header. Cedar never lays it over a cover, which usually
 // carries the name already; it only stands in for a missing one.
 if(logo&&!art)box.append(image(logo,'card-logo',reveal));
 if(folder.focusedCoverImageURL)addFocusArt(card,box,folder.focusedCoverImageURL);
 box.append(overlay);
 if(folder.folderOptions?.length)box.append(el('small','card-badge',`${folder.folderOptions.length} inside`));
 card.append(box,el('span','card-title',folder.title));
 return card;
}

/** One Branch as a Home row. `open(path)` opens its page: [] for the Branch, [i] for a folder. */
function homeRow(branch,open,edit){
 const row=el('section','preview-row'),style=rowStyle(branch.presentation?.templateID);
 const actions=open?[button('See all',()=>open([]))]:[];if(edit)actions.push(button('Edit',edit));
 if(isGroup(branch)){
  const shape=cardShape(branch),folders=branch.folderOptions||[];
  row.append(heading(branch.title,`Branch Group · ${folders.length} ${folders.length===1?'branch':'branches'} · ${shapeNames[shape]}`,actions));
  const rail=el('div',`group-rail ${style} shape-${shape}`);
  folders.forEach((f,i)=>rail.append(folderCard(f,shape,branch.cardStyle,()=>open?.([i]))));
  if(!folders.length)rail.append(el('p','empty','No branches in this group.'));
  row.append(rail);return row;
 }
 row.append(heading(branch.title,`${styleNames[style]} · ${describeSource(branch)}`,actions));
 if(style==='hero'){const hero=el('div','sample-hero');hero.setAttribute('aria-hidden','true');hero.append(el('strong','','Featured title'),el('span','','Year · Genre · Rating'));row.append(hero);}
 else row.append(samples(sampleCounts[style],style));
 return row;
}

function sourceRows(sources,layout,chip,choose){
 const out=[];
 if(layout==='chips-and-grid'&&sources.length){
  const chosen=Math.min(chip||0,sources.length-1),chips=el('div','source-chips');
  sources.forEach((s,i)=>{const b=button(s.title||`Row ${i+1}`,()=>choose(i));b.setAttribute('aria-pressed',String(i===chosen));chips.append(b);});
  const grid=samples(12,'poster');grid.classList.add('poster-grid');
  const row=el('section','preview-row');row.append(heading(sources[chosen].title||'Titles',describeSource(sources[chosen])),grid);
  out.push(...(sources.length>1?[chips]:[]),row);return out;
 }
 for(const s of sources){const row=el('section','preview-row');row.append(heading(s.title||'Titles',describeSource(s)),samples(12,'poster'));out.push(row);}
 return out;
}

/** The page a card or "See all" opens: a folder's rows, a hub of folders, or a Branch's titles. */
function page(branch,entry,on){
 const out=[],found=folderAt(branch,entry.path);if(!found)return null;
 const {folder,trail}=found,parent=on.parentTitle;
 const bar=el('div','preview-nav');bar.append(button(`← ${parent}`,on.back,'text-button preview-back'));
 const crumbs=el('span','preview-crumbs',[branch.title,...trail.map(f=>f.title)].join(' › '));bar.append(crumbs);out.push(bar);
 if(!trail.length&&!isGroup(branch)){
  const head=el('header','page-head');head.append(el('p','eyebrow-dark',styleNames[rowStyle(branch.presentation?.templateID)]),el('h2','',branch.title),el('p','',describeSource(branch)));
  const grid=samples(18,'poster');grid.classList.add('poster-grid');out.push(head,grid);return out;
 }
 const hero=el('header',`page-hero${trail.length?'':' plain'}`),backdrop=folder.heroBackdropURL||(cardShape({folderOptions:[folder]})==='landscape'?folder.coverImageURL:null);
 // A poster or square cover has no backdrop to give, so it sits beside the title over a blur of itself.
 if(trail.length&&backdrop)hero.append(image(backdrop,'page-hero-art'));
 else if(trail.length&&folder.coverImageURL){hero.classList.add('with-cover');hero.append(image(folder.coverImageURL,'page-hero-art blurred'),image(folder.coverImageURL,`page-hero-cover shape-${cardShape({folderOptions:[folder]})}`));}
 const copy=el('div','page-hero-copy');copy.append(el('p','eyebrow-dark',trail.length?(trail.at(-2)?.title||branch.title):'Branch Group'));
 if(trail.length&&folder.titleLogoURL){const logo=image(folder.titleLogoURL,'page-logo');logo.alt=folder.title;copy.append(logo);}else copy.append(el('h2','',folder.title));
 const children=folder.folderOptions||[];
 const sources=children.length?[]:folderSources(folder);
 copy.append(el('p','',children.length?`${children.length} ${children.length===1?'branch':'branches'} · ${shapeNames[cardShape(folder)]}`:`${sources.length} ${sources.length===1?'row':'rows'} · ${branch.browseLayout==='chips-and-grid'?'Chips & grid':'Rows'}`));
 hero.append(copy);out.push(hero);
 if(children.length){const shape=cardShape(folder),grid=el('div',`folder-grid shape-${shape}`);children.forEach((f,i)=>grid.append(folderCard(f,shape,branch.cardStyle,()=>on.open([...entry.path,i]))));out.push(grid);}
 else out.push(...sourceRows(sources,branch.browseLayout,entry.chip,on.chip));
 return out;
}

/**
 * Draws Home, or the page `entry` opens, into `out`.
 * blocks: [{id, title, label?, selected, hidden?, edit?, branches: [Branch] | null while loading | Error}]
 * entry: {block, branch, path, chip} | null. on: {open(entry), back(), chip(i), select(id)}.
 * Returns false when `entry` no longer exists, so the caller can go back to Home.
 */
export function renderHome(out,{blocks,device,deviceName,entry,parentTitle},on){
 out.replaceChildren();
 if(entry){
  const block=blocks.find(b=>b.id===entry.block),branch=Array.isArray(block?.branches)?resolveBranch(block.branches[entry.branch],device):null;
  const nodes=branch&&page(branch,entry,{parentTitle,back:on.back,chip:on.chip,open:path=>on.open({...entry,path,chip:0})});
  if(nodes){out.append(...nodes);return true;}
  return false;
 }
 for(const block of blocks){
  const box=el('div',`preview-block${block.selected?' selected':''}${block.preview?' previewing':''}`);box.dataset.id=block.id;
  if(block.label){const label=el('div','preview-block-label');label.append(el('span','',block.label));if(!block.preview)label.append(button('Edit',()=>on.select(block.id)));box.append(label);}
  if(block.branches===null)box.append(el('p','empty',`Loading ${block.title}…`));
  else if(block.branches instanceof Error)box.append(el('p','empty',block.branches.message));
  else{
   let shown=0;
   block.branches.forEach((b,i)=>{const branch=resolveBranch(b,device);if(!branch)return;shown++;box.append(homeRow(branch,path=>on.open({block:block.id,branch:i,path,chip:0}),block.label?null:()=>on.select(block.id)));});
   if(!shown)box.append(el('p','empty',block.branches.length?`${block.title} is hidden on ${deviceName}.`:`${block.title} has nothing Cedar can show yet.`));
  }
  out.append(box);
 }
 if(!out.children.length)out.append(el('p','empty','Your Home starts here. Add a setup from the library, import a collection, or build a Branch.'));
 return true;
}

/** One Branch as it would sit on Home, for the Branch builder's Layout preview. */
export function renderBranchPreview(out,branch){out.replaceChildren(homeRow(branch,null,null));}

// MARK: Hero and the other preview screens

const heroFacts={mediaType:'Movie',genre:'Science Fiction',releaseDate:'2026',ageRating:'PG-13'};
/**
 * The hero as Cedar draws it at the top of Home, in its style, with the details it's set to show.
 * hero: {style, fields, limit, source, art: [url], badges: [url]} or null when each viewer keeps
 * their own hero. `edit()` opens the hero's settings.
 */
export function renderHeroPreview(hero,edit){
 if(!hero){const kept=button('',edit,'hero-kept');kept.append(el('strong','','Hero'),el('span','','Each viewer keeps the hero they already have. Give this Home its own'));return kept;}
 const box=button('',edit,`preview-hero hero-${hero.style}`);box.setAttribute('aria-label','Edit the hero');
 const art=hero.art[0];if(art)box.append(image(art,'preview-hero-art'));else box.classList.add('no-art');
 const copy=el('span','preview-hero-copy'),f=new Set(hero.fields);
 copy.append(el('small','preview-hero-kicker',hero.source),el('strong','preview-hero-title','Featured title'));
 const facts=['mediaType','genre','releaseDate','ageRating'].filter(k=>f.has(k)).map(k=>heroFacts[k]);
 if(facts.length||f.has('ratings')){const line=el('span','preview-hero-facts',facts.join(' · '));if(f.has('ratings'))line.append(el('span','preview-hero-rating','★ 7.8'));copy.append(line);}
 if(f.has('description'))copy.append(el('span','preview-hero-description','A short description of the title sits here, the way Cedar shows it.'));
 if(hero.badges.length){const badges=el('span','preview-hero-badges');for(const u of hero.badges.slice(0,3))badges.append(image(u,''));copy.append(badges);}
 const actions=el('span','preview-hero-actions');actions.append(el('span','','▶ Play'),el('span','','More'));copy.append(actions);
 box.append(copy,el('span','preview-hero-edit','✎ Edit hero'));
 const dots=el('span','preview-hero-dots');for(let i=0;i<Math.min(hero.limit,10);i++)dots.append(el('i',i===0?'on':''));box.append(dots);
 return box;
}

const sampleSources=[
 ['Best match','Movie.2026.2160p.UHD.BluRay.REMUX.DV.HDR10Plus.TrueHD.Atmos.7.1',5],
 ['Smaller file','Movie.2026.2160p.WEB-DL.DV.HDR10Plus.DDP5.1.Atmos',4],
 ['Fastest start','Movie.2026.1080p.BluRay.REMUX.TrueHD.Atmos',2],
];
/** A title page's sources with the chosen badges: where Cedar shows them. */
export function renderTitlePage(out,{art,badges,badgeName,chooseBadges}){
 out.replaceChildren();const page=el('div','preview-title-page');
 if(art)page.append(image(art,'preview-title-art'));
 const body=el('div','preview-title-body');body.append(el('p','eyebrow-dark','Title page · Sources'),el('h2','','Choose a source'));
 if(!badges.length){body.append(el('p','',`No source badges yet. Pick a set to see how Cedar marks each source.`),button('Choose source badges',chooseBadges,'button'));}
 else{body.append(el('p','',`${badgeName||'Your badges'}, matched to each source’s name.`));const list=el('div','preview-sources');
  // The sample badges are 4K, Remux, Dolby Vision, HDR10+ and Atmos; each source gets what its name says.
  const picks=[[0,1,2,3,4],[0,2,3,4],[1,4]];
  sampleSources.forEach(([name,file],i)=>{const row=el('div','preview-source'),text=el('span');text.append(el('strong','',name),el('small','',file));const marks=el('span','preview-source-badges');for(const n of picks[i])if(badges[n])marks.append(image(badges[n],''));row.append(text,marks);list.append(row);});
  body.append(list);}
 page.append(body);out.append(page);
}

/** Who's watching, with the profile photo the file brings. */
export function renderWhoIsWatching(out,{avatar,name,choosePhoto}){
 out.replaceChildren();const page=el('div','preview-who');page.append(el('h2','','Who’s watching?'));
 const people=el('div','preview-people'),me=el('span','preview-person you');
 if(avatar)me.append(image(avatar,''));else me.append(el('span','preview-person-empty','?'));me.append(el('span','','You'));
 const add=el('span','preview-person');add.append(el('span','preview-person-empty','+'),el('span','','Add profile'));
 people.append(me,add);page.append(people);
 if(avatar)page.append(el('p','',name||'Your profile photo'));else page.append(button('Choose a profile photo',choosePhoto,'button'));
 out.append(page);
}

/** Rows scroll sideways; arrows page them for people without a trackpad. */
export function addRailArrows(root){
 for(const rail of root.querySelectorAll('.group-rail,.sample-rail:not(.poster-grid)')){
  if(rail.parentElement?.classList.contains('rail-frame'))continue;
  const frame=el('div','rail-frame');rail.replaceWith(frame);frame.append(rail);
  for(const [cls,dir,label] of [['left',-1,'Scroll left'],['right',1,'Scroll right']]){const b=button(dir<0?'‹':'›',()=>rail.scrollBy({left:dir*rail.clientWidth*.8,behavior:'smooth'}),`rail-arrow ${cls}`);b.setAttribute('aria-label',label);b.tabIndex=-1;frame.append(b);}
 }
}
