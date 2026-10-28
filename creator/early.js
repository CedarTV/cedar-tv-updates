// Runs in <head>, before Creator paints. The page holds the preview banner's place because an empty
// Home gets the featured setup as a preview once the catalogs load (start() in creator.js). A saved
// Home, an older draft or cart, a requested tab or a shared link won't get one, so release the space
// now; doing it from creator.js would move the preview after it's already on screen.
(() => {
  let preview = true;
  try {
    const saved = JSON.parse(localStorage.getItem('cedar-studio-home-v2') || 'null');
    if (saved?.rows?.length || localStorage.getItem('cedar-studio-draft-v1') || localStorage.getItem('cedar-creator-cart')) preview = false;
  } catch {
    preview = false;
  }
  const query = new URLSearchParams(location.search);
  if (['tab', 'kind', 'i', 'a', 'b'].some(name => query.has(name))) preview = false;
  if (!preview) document.documentElement.classList.add('creator-no-preview');
})();
