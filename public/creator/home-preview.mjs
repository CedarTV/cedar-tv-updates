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
/** Strand's image proxy refuses other sites (Cross-Origin-Resource-Policy: same-origin), though Cedar
 loads it fine. Its path is the original image URL in base64, which the preview loads instead.
 TMDB originals are swapped for a card-sized copy. */
export function previewImageURL(url){const tmdb=/^https:\/\/(?:image\.tmdb\.org|media\.themoviedb\.org)\/t\/p\/original\//;if(tmdb.test(url||''))return url.replace(tmdb,'https://image.tmdb.org/t/p/w780/');const m=/^https:\/\/get-stranded\.fabriceleven\.com\/img\/remote\/([A-Za-z0-9_-]+=*)$/.exec(url||'');if(!m)return url;try{const original=atob(m[1].replace(/-/g,'+').replace(/_/g,'/'));return /^https:\/\/[^\s"'<>]+$/.test(original)?original:url;}catch{return url;}}
function image(url,cls,failed){const i=el('img',cls);i.src=previewImageURL(url);i.alt='';i.loading='lazy';i.decoding='async';i.referrerPolicy='no-referrer';i.addEventListener('error',()=>{i.remove();failed?.();},{once:true});return i;}
/** Sample titles from Cedar's own screenshots: the preview shows shapes and order, not each list's titles. */
function samples(count,cls){const rail=el('div',`sample-rail ${cls}`);rail.setAttribute('aria-hidden','true');for(let i=0;i<count;i++)rail.append(el('span',`sample-poster s${i%6}`));return rail;}
const sampleCounts={poster:12,wide:7,feature:3};
function heading(title,caption,actions=[]){const h=el('div','preview-row-heading'),text=el('div');text.append(el('h3','',title));if(caption)text.append(el('small','',caption));h.append(text,...actions);return h;}

function folderCard(folder,shape,cardStyle,open){
 const art=folder.coverImageURL,logo=folder.titleLogoURL;
 const card=button('',open,`group-card shape-${shape}`);card.setAttribute('aria-label',`Open ${folder.title}`);
 // A hidden title comes back if the artwork that stood in for it doesn't load.
 const title=el('span',folder.hidesTitle&&(art||logo)?'title-hidden':'',folder.title),reveal=()=>{if(!card.querySelector('img'))title.className='';};
 if(art)card.append(image(art,'',reveal));else if(cardStyle==='poster-wall'||folder.categoryCardStyle==='poster-wall')card.classList.add('poster-wall');
 if(logo)card.append(image(logo,'card-logo',reveal));
 card.append(title);
 if(folder.folderOptions?.length)card.append(el('small','card-badge',`${folder.folderOptions.length} inside`));
 return card;
}

/** One Branch as a Home row. `open(path)` opens its page: [] for the Branch, [i] for a folder. */
function homeRow(branch,open,edit){
 const row=el('section','preview-row'),style=rowStyle(branch.presentation?.templateID);
 const actions=[button('See all',()=>open([]))];if(edit)actions.push(button('Edit',edit));
 if(isGroup(branch)){
  const shape=cardShape(branch),folders=branch.folderOptions||[];
  row.append(heading(branch.title,`Branch Group · ${folders.length} ${folders.length===1?'branch':'branches'} · ${shapeNames[shape]}`,actions));
  const rail=el('div',`group-rail ${style} shape-${shape}`);
  folders.forEach((f,i)=>rail.append(folderCard(f,shape,branch.cardStyle,()=>open([i]))));
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
  const box=el('div',`preview-block${block.selected?' selected':''}`);box.dataset.id=block.id;
  if(block.label){const label=el('div','preview-block-label');label.append(el('span','',block.label),button('Edit',()=>on.select(block.id)));box.append(label);}
  if(block.branches===null)box.append(el('p','empty',`Loading ${block.title}…`));
  else if(block.branches instanceof Error)box.append(el('p','empty',block.branches.message));
  else{
   let shown=0;
   block.branches.forEach((b,i)=>{const branch=resolveBranch(b,device);if(!branch)return;shown++;box.append(homeRow(branch,path=>on.open({block:block.id,branch:i,path,chip:0}),block.label?null:()=>on.select(block.id)));});
   if(!shown)box.append(el('p','empty',block.branches.length?`${block.title} is hidden on ${deviceName}.`:`${block.title} has nothing Cedar can show yet.`));
  }
  out.append(box);
 }
 if(!out.children.length)out.append(el('p','empty','Your Home starts here. Add a setup from Setups, import a collection, or add a Branch.'));
 return true;
}
