// Artwork moved into Creator. Keep old ?kind= links landing on the same gallery.
(() => {
  const kind = new URLSearchParams(location.search).get("kind");
  location.replace(`../creator/?tab=${kind === "badges" ? "badges" : "avatars"}`);
})();
