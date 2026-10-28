// Cedar Studio became Creator's Your Home tab. Old links keep their section.
const tab = { avatars: "avatars", badges: "badges" }[location.hash.slice(1)] || "home";
location.replace(`../creator/?tab=${tab}`);
