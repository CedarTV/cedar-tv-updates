const allowedRepositoryPath = "/CedarTV/cedar-tv-updates/releases/download/";
const appleBetaURL = "https://testflight.apple.com/join/4A7sZ4q2";

// Best-effort guess used only to label the hero button; every visitor can still reach #download.
const visitorDevice = (() => {
  const agent = navigator.userAgent;
  if (/\bAFT[A-Z]|Android TV|GoogleTV|BRAVIA|AmazonWebAppPlatform/i.test(agent)) return "android-tv";
  if (/iPhone|iPod/.test(agent)) return "iphone";
  if (/iPad/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return "ipad";
  if (/Macintosh/.test(agent)) return "mac";
  return null;
})();

const deviceNames = new Map([["iphone", "iPhone"], ["ipad", "iPad"], ["mac", "Mac"]]);

const formatDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
};

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const applyRelease = (manifest) => {
  const version = typeof manifest.versionName === "string" ? manifest.versionName.trim() : "";
  const download = new URL(manifest.apkUrl, window.location.href);
  const trustedDownload = download.protocol === "https:" &&
    download.hostname === "github.com" &&
    download.pathname.startsWith(allowedRepositoryPath);

  if (!version || !trustedDownload) return;

  document.querySelectorAll("[data-version]").forEach((node) => { node.textContent = version; });
  const build = Number(manifest.versionCode);
  if (Number.isSafeInteger(build) && build > 0) {
    document.querySelectorAll("[data-build]").forEach((node) => { node.textContent = String(build); });
  }
  document.querySelectorAll("[data-download-link]").forEach((link) => { link.href = download.href; });
  if (visitorDevice === "android-tv") {
    document.querySelectorAll("[data-get-cedar]").forEach((link) => {
      link.href = download.href;
      link.textContent = "Download for Android TV";
    });
  }
  document.querySelectorAll("[data-release-link]").forEach((link) => {
    link.href = `https://github.com/CedarTV/cedar-tv-updates/releases/tag/v${encodeURIComponent(version)}`;
  });

  const fileSize = formatBytes(Number(manifest.apkSize));
  if (fileSize) {
    document.querySelectorAll("[data-file-size]").forEach((node) => { node.textContent = fileSize; });
  }
};

const statusLabels = new Map([
  ["release-candidate", "Coming soon"],
  ["testflight", "Public beta"],
  ["released", "Available now"],
]);

const applyPlatformReleases = (catalog) => {
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.platforms)) return;
  const releases = new Map(catalog.platforms.map((release) => [release.id, release]));

  document.querySelectorAll("[data-platform-version]").forEach((node) => {
    const release = releases.get(node.dataset.platformVersion);
    if (!release || typeof release.version !== "string" || !/^\d+\.\d+\.\d+$/.test(release.version)) return;
    const build = String(release.build ?? "");
    if (!/^[1-9]\d*$/.test(build)) return;
    node.textContent = `Version ${release.version} · Build ${build}`;
  });

  document.querySelectorAll("[data-platform-status]").forEach((node) => {
    const release = releases.get(node.dataset.platformStatus);
    const label = release ? statusLabels.get(release.status) : null;
    if (!label) return;
    node.textContent = label;
    node.dataset.status = release.status;
  });

  document.querySelectorAll("[data-platform-date]").forEach((node) => {
    const release = releases.get(node.dataset.platformDate);
    const label = release ? formatDate(release.date) : null;
    if (!label) return;
    const time = document.createElement("time");
    time.dateTime = release.date;
    time.textContent = label;
    node.replaceChildren("Updated ", time);
  });

  document.querySelectorAll("[data-beta-link]").forEach((link) => {
    const release = releases.get(link.dataset.betaLink);
    if (release) link.hidden = release.status !== "testflight";
  });

  const visitorRelease = releases.get(visitorDevice);
  if (deviceNames.has(visitorDevice) && visitorRelease?.status === "testflight") {
    document.querySelectorAll("[data-get-cedar]").forEach((link) => {
      link.href = appleBetaURL;
      link.textContent = `Join the ${deviceNames.get(visitorDevice)} beta`;
    });
  }
};

fetch("update-v1.json", { cache: "no-store", credentials: "omit" })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Manifest unavailable")))
  .then(applyRelease)
  .catch(() => {});

fetch("releases/releases.json", { cache: "no-store", credentials: "omit" })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Release catalog unavailable")))
  .then(applyPlatformReleases)
  .catch(() => {});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
