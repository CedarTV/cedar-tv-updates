// The Apple apps page became Features. Keep old links (in any language) landing on the same place.
(() => {
  location.replace(`${location.pathname.replace(/apple\/(?:index\.html)?$/, "features/")}${location.hash}`);
})();
