/** Channel drafts stay in memory and survive unrelated receipts and section changes. */
export function createChannelEditor({ perform, status, configuration, busy, dirtyState }) {
  const $ = id => document.getElementById(id);
  const el = (tag, text, className) => { const value = document.createElement(tag); if (text != null) value.textContent = text; if (className) value.className = className; return value; };
  let draft = null, changed = false, creating = false, deleteArmed = false, download;
  const data = () => configuration()?.customChannels;
  const selected = () => data()?.channels.find(c => c.id === data().selectedId);
  const button = (text, action) => { const value = el('button', text, 'secondary'); value.type = 'button'; value.addEventListener('click', action); return value; };
  function mark() { changed = true; dirtyState(); }
  function field(label, key, type = 'text', choices = null, min, max) {
    const wrapper = el('label'); wrapper.append(el('span', label)); const input = el(choices ? 'select' : 'input'); input.setAttribute('aria-label', label);
    if (choices) for (const [value, title] of choices) { const option = el('option', title); option.value = value; input.append(option); }
    else input.type = type;
    if (min != null) input.min = min; if (max != null) input.max = max;
    if (type === 'checkbox') input.checked = Boolean(draft[key]); else input.value = draft[key] ?? '';
    input.addEventListener('input', () => { draft[key] = type === 'checkbox' ? input.checked : type === 'number' ? Number(input.value) : input.value; mark(); });
    input.dataset.channelField = key; wrapper.append(input); return wrapper;
  }
  function guarded(action) { if (changed) return status('Save or discard the channel draft before changing programs.'); if (!busy()) action(); }
  function settings(channel) { const keys = ['name','sortOrder','rotation','showsPerDay','episodesPerBlock','dailyResetHour','dailyResetMinute','shuffleOnce','shuffleDaily','storyLock','excludesWatched','isFavorite','shuffleSeed']; return Object.fromEntries(keys.filter(key => channel[key] != null).map(key => [key, channel[key]])); }
  function render() {
    const state = data(); if (!state) return;
    const current = selected(); if (!changed && !creating) draft = current ? settings(current) : null;
    const picker = $('channel-picker'); picker.replaceChildren();
    if (!state.channels.length) { const option = el('option', 'Create your first channel'); option.value = ''; picker.append(option); }
    for (const c of state.channels) { const option = el('option', `${c.name} · ${c.itemCount} programs`); option.value = c.id; picker.append(option); } picker.value = state.selectedId || '';
    $('channel-settings').replaceChildren(); $('channel-programming').hidden = !current || creating;
    if (!draft) return;
    const form = el('form'), fields = el('div', null, 'fields');
    fields.append(field('Channel name', 'name'), field('Sort', 'sortOrder', 'text', [['manual','Manual'],['title','Title'],['airDate','Air date']]),
      field('Rotation', 'rotation', 'text', [['sequential','Sequential'],['roundRobin','Round robin']]), field('Titles per rotation (0 for all)', 'showsPerDay', 'number', null, 0, 500),
      field('Episodes per block', 'episodesPerBlock', 'number', null, 1, 100), field('Daily reset hour', 'dailyResetHour', 'number', null, 0, 23), field('Daily reset minute', 'dailyResetMinute', 'number', null, 0, 59));
    for (const [key, title] of [['shuffleOnce','Shuffle once'],['shuffleDaily','Shuffle daily'],['storyLock','Story lock'],['excludesWatched','Exclude watched'],['isFavorite','Favorite']]) fields.append(field(title, key, 'checkbox'));
    fields.append(field('Shuffle seed', 'shuffleSeed')); form.append(fields);
    const save = el('button', creating ? 'Create channel on TV' : 'Save channel settings'); save.type = 'submit'; form.append(save,
      button('Discard channel draft', () => { discard(); render(); }), button('Reshuffle', () => { const bytes = crypto.getRandomValues(new Uint32Array(2)); draft.shuffleSeed = ((BigInt(bytes[0]) << 32n) | BigInt(bytes[1])).toString(); mark(); render(); }));
    form.addEventListener('submit', event => { event.preventDefault(); if (!draft.name?.trim() || draft.name.length > 100) return status('Enter a channel name of 1–100 characters.'); perform('channel-save', { ...(creating ? {} : {id:current.id}), settings:draft }); });
    if (!creating) form.append(button(deleteArmed ? 'Confirm delete channel' : 'Delete channel', () => { if (!deleteArmed) { deleteArmed = true; render(); } else guarded(() => perform('channel-delete', {id:current.id})); }));
    $('channel-settings').append(form); if (!current || creating) return;
    $('channel-branch').replaceChildren(); for (const branch of configuration().branches.branches) { const option = el('option', branch.title); option.value = branch.id; $('channel-branch').append(option); }
    $('channel-add-branch').disabled = !configuration().branches.branches.length;
    $('channel-results').replaceChildren(); for (const candidate of state.candidates) {
      const row = el('div', null, 'branch'); row.append(el('h3', candidate.title), el('p', candidate.subtitle || (candidate.series ? 'Series' : 'Movie')));
      const controls = el('div', null, 'branch-tools'); const modes = candidate.series ? [['allEpisodes','Add all episodes'],['nextUnwatched','Add next unwatched'],['latestEpisodes','Add latest episodes']] : [['allEpisodes','Add movie']];
      for (const [selection, title] of modes) controls.append(button(title, () => guarded(() => perform('channel-add', {id:current.id, candidateId:candidate.id, selection})))); row.append(controls); $('channel-results').append(row);
    }
    $('channel-feeds').replaceChildren(); for (const feed of state.feeds) { const row = el('div', null, 'row'); row.append(el('span', `${feed.title}${feed.error ? ' · ' + feed.error : ''}`), button('Remove feed', () => guarded(() => perform('channel-feed-remove', {id:current.id, feedId:feed.id})))); $('channel-feeds').append(row); }
    $('channel-program-count').textContent = `${state.total} programs${state.total ? ` · ${state.offset + 1}–${Math.min(state.offset + 50,state.total)}` : ''}`;
    $('channel-programs').replaceChildren(); for (const program of state.programs) {
      const row = el('div', null, 'branch'); row.append(el('h3', program.title), el('p', program.durationMs ? `${Math.round(program.durationMs / 60000)} min${program.estimated ? ' · estimated' : ''}` : 'Runtime needed'));
      const controls = el('div', null, 'branch-tools');
      for (const [action,title] of [['up','Move up'],['down','Move down'],[program.paired ? 'unpair' : 'pair',program.paired ? 'Unpair' : 'Pair with next'],['remove','Remove program']]) controls.append(button(title, () => guarded(() => perform('channel-item', {id:current.id,itemId:program.id,action}))));
      const runtime = el('input'); runtime.type = 'number'; runtime.min = 1; runtime.max = 44640; runtime.value = Math.round((program.durationMs || 60000) / 60000); runtime.setAttribute('aria-label', `Runtime minutes for ${program.title}`);
      controls.append(runtime,button('Set runtime', () => guarded(() => perform('channel-item', {id:current.id,itemId:program.id,action:'runtime',minutes:Number(runtime.value)})))); row.append(controls); $('channel-programs').append(row);
    }
    $('channel-previous').disabled = state.offset <= 0; $('channel-next').disabled = state.offset + 50 >= state.total;
    $('channel-download').hidden = !state.exportText;
    if (download) URL.revokeObjectURL(download); download = null;
    if (state.exportText) { download = URL.createObjectURL(new Blob([state.exportText],{type:'application/json'})); $('channel-download').href = download; }
  }
  function discard() { draft = null; changed = false; creating = false; deleteArmed = false; dirtyState(); }
  $('channel-picker').addEventListener('change', () => guarded(() => perform('channel-select', {id:$('channel-picker').value,offset:0})));
  $('channel-new').addEventListener('click', () => guarded(() => { creating = true; changed = true; draft = {name:'My Channel',sortOrder:'manual',rotation:'roundRobin',showsPerDay:0,episodesPerBlock:1,dailyResetHour:6,dailyResetMinute:0,shuffleOnce:false,shuffleDaily:true,storyLock:true,excludesWatched:false,isFavorite:false,shuffleSeed:BigInt(crypto.getRandomValues(new Uint32Array(1))[0]).toString()}; render(); dirtyState(); }));
  $('channel-refresh').addEventListener('click', () => guarded(() => perform('channel-refresh', {})));
  $('channel-search-form').addEventListener('submit', event => { event.preventDefault(); guarded(() => perform('channel-search', {query:$('channel-query').value})); });
  $('channel-add-branch').addEventListener('click', () => guarded(() => perform('channel-add', {id:selected()?.id,branchId:$('channel-branch').value})));
  for (const [id, change] of [['channel-previous',-50],['channel-next',50]]) $(id).addEventListener('click', () => guarded(() => perform('channel-select', {id:selected()?.id,offset:data().offset+change})));
  $('channel-export').addEventListener('click', () => guarded(() => perform('channel-export', {id:selected()?.id})));
  $('channel-import-form').addEventListener('submit', event => { event.preventDefault(); guarded(() => perform('channel-import', {text:$('channel-import-text').value})); });
  return { render, dirty: () => changed, discard, applied(operation) { if (['channel-save','channel-delete','channel-import'].includes(operation)) discard(); if (operation === 'channel-import') $('channel-import-text').value = ''; }, clear() { discard(); if (download) URL.revokeObjectURL(download); download = null; $('channel-download').removeAttribute('href'); $('channel-query').value = ''; $('channel-import-text').value = ''; } };
}
