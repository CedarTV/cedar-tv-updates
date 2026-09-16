// This export vocabulary is consumed by CedarCore/ExternalCollectionImport.swift.
export const presets = [
  { title: 'Movie night', emoji: '🎬', kind: 'POPULAR', media: 'movie' },
  { title: 'One more episode', emoji: '🍿', kind: 'TRENDING', media: 'tv' },
  { title: 'Science fiction', emoji: '🚀', kind: 'DISCOVER', media: 'movie', genre: '878' },
  { title: 'Family favourites', emoji: '✨', kind: 'DISCOVER', media: 'movie', genre: '10751' },
  { title: 'Documentaries', emoji: '🌎', kind: 'DISCOVER', media: 'movie', genre: '99' },
  { title: 'Highly rated', emoji: '🎭', kind: 'TOP_RATED', media: 'movie' },
];
export const genres = {
  movie: [['28','Action'],['12','Adventure'],['16','Animation'],['35','Comedy'],['80','Crime'],['99','Documentary'],['18','Drama'],['10751','Family'],['14','Fantasy'],['27','Horror'],['9648','Mystery'],['10749','Romance'],['878','Science fiction'],['53','Thriller']],
  tv: [['10759','Action & Adventure'],['16','Animation'],['35','Comedy'],['80','Crime'],['99','Documentary'],['18','Drama'],['10751','Family'],['10762','Kids'],['9648','Mystery'],['10764','Reality'],['10765','Sci-Fi & Fantasy']],
};
export function folderFromPreset(preset, id = crypto.randomUUID()) { return { ...preset, id, enabled: true, genre: preset.genre || '' }; }
export function newDraft() { return { version: 1, id: crypto.randomUUID(), title: 'My movie nights', folders: presets.slice(0,3).map(p => folderFromPreset(p)), deviceLayout: newDeviceLayout() }; }
export function validateDraft(value) {
  const kinds = ['POPULAR','TRENDING','TOP_RATED','DISCOVER','LIST','COLLECTION'];
  if (!value || value.version !== 1 || typeof value.id !== 'string' || !value.id || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 80 || !Array.isArray(value.folders) || value.folders.length > 100) throw new Error('Choose a Cedar Studio draft with up to 100 folders.');
  const ids = new Set();
  for (const f of value.folders) {
    if (!f || typeof f.id !== 'string' || !f.id || ids.has(f.id) || typeof f.title !== 'string' || !f.title.trim() || f.title.length > 80 || !kinds.includes(f.kind) || !['movie','tv'].includes(f.media) || typeof f.emoji !== 'string' || f.emoji.length > 12 || typeof f.genre !== 'string' || (f.genre && !genres[f.media].some(g => g[0] === f.genre)) || typeof f.enabled !== 'boolean') throw new Error('This draft contains an invalid folder. Your current draft has not changed.');
    if (['LIST','COLLECTION'].includes(f.kind) && (!Number.isSafeInteger(f.tmdbID) || f.tmdbID < 1 || f.tmdbID > 2147483647)) throw new Error('A TMDB list or collection needs a valid numeric ID.');
    if (f.kind === 'COLLECTION' && f.media !== 'movie') throw new Error('TMDB collections contain movies.');
    ids.add(f.id);
  }
  // Only retain the studio's declared fields. Drafts contain no service credentials.
  return { version: 1, id: value.id, title: value.title.trim(), ...(value.deviceLayout ? {deviceLayout:validateDeviceLayout(value.deviceLayout)} : {}), folders: value.folders.map(f => ({id:f.id,title:f.title.trim(),kind:f.kind,media:f.media,emoji:f.emoji,genre:f.genre,enabled:f.enabled,...(['LIST','COLLECTION'].includes(f.kind)?{tmdbID:f.tmdbID}:{})})) };
}
export function exportCollection(value) {
  const draft = validateDraft(value);
  const selected = draft.folders.filter(f => f.enabled);
  if (!selected.length) throw new Error('Add or enable at least one folder to export.');
  return { collections: [{ id: draft.id, title: draft.title, ...(draft.deviceLayout ? {cedarLayout:validateDeviceLayout(draft.deviceLayout)} : {}), folders: selected.map(f => ({ id: f.id, title: f.title, coverEmoji: f.emoji, tileShape: 'landscape', sources: [{id:`${f.id}-source`,title:f.title,provider:'tmdb',tmdbSourceType:f.kind,mediaType:f.media,...(['LIST','COLLECTION'].includes(f.kind)?{tmdbId:f.tmdbID}:{}),...(f.kind==='DISCOVER'&&f.genre?{filters:{withGenres:f.genre}}:{})}] })) }] };
}
export function moveFolder(draft, id, target) {
  const index = draft.folders.findIndex(f => f.id === id);
  if(index<0 || target<0 || target>=draft.folders.length) return;
  draft.folders.splice(target,0,...draft.folders.splice(index,1));
}
export function safeAssetURL(path, base) {
  const url = new URL(path.replace(/^\//,''),base);
  const expected = new URL(base);
  if (url.origin !== expected.origin || !url.pathname.startsWith(expected.pathname) || !/\/(avatars|badges)\//.test(url.pathname)) throw new Error('Invalid artwork URL');
  return url.href;
}


export const deviceFamilies = ['phone', 'tablet', 'desktop', 'television'];
export const deviceNames = { shared: 'Shared layout', phone: 'iPhone', tablet: 'iPad', desktop: 'Mac', television: 'TV' };
export const defaultAppearance = Object.freeze({ enabled: true, rowStyle: 'wide', cardStyle: 'backdrop', browseLayout: 'rows' });
export function newDeviceLayout() { return { version: 1, shared: {...defaultAppearance}, overrides: {} }; }
function validateAppearance(value) {
  if (!value || typeof value.enabled !== 'boolean' || !['classic','wide','feature'].includes(value.rowStyle)
    || !['backdrop','poster-wall'].includes(value.cardStyle) || !['rows','chips-and-grid'].includes(value.browseLayout)) {
    throw new Error('This draft contains an unsupported device layout.');
  }
  return { enabled:value.enabled, rowStyle:value.rowStyle, cardStyle:value.cardStyle, browseLayout:value.browseLayout };
}
export function validateDeviceLayout(value) {
  if (!value || value.version !== 1 || !value.overrides || typeof value.overrides !== 'object' || Array.isArray(value.overrides)) throw new Error('Unsupported device layout version.');
  const overrides = {};
  for (const [family, appearance] of Object.entries(value.overrides)) {
    if (!deviceFamilies.includes(family)) throw new Error('Unknown device family in this draft.');
    overrides[family] = validateAppearance(appearance);
  }
  return { version:1, shared:validateAppearance(value.shared), overrides };
}
export function appearanceFor(draft, family) {
  const layout = draft.deviceLayout || newDeviceLayout();
  return {...(layout.overrides[family] || layout.shared)};
}
export function setAppearance(draft, family, patch) {
  if (family !== 'shared' && !deviceFamilies.includes(family)) throw new Error('Unknown device family.');
  const value = validateAppearance({...appearanceFor(draft, family), ...patch});
  draft.deviceLayout ||= newDeviceLayout();
  if (family === 'shared') draft.deviceLayout.shared = value;
  else draft.deviceLayout.overrides[family] = value;
}
export function resetAppearance(draft, family) {
  if (!deviceFamilies.includes(family)) throw new Error('Choose a device to reset.');
  if (draft.deviceLayout) delete draft.deviceLayout.overrides[family];
}
