// Home page interactions. Without JavaScript every screen and feature stays readable as plain content.
(() => {
  const root = document.documentElement;
  const header = document.querySelector(".cedar-header");
  const hero = document.querySelector(".home-hero");

  // The hero sits under the sticky header; the header turns solid once the hero scrolls away.
  if (header && hero) {
    const measure = () => root.style.setProperty("--header-h", `${header.offsetHeight}px`);
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > hero.offsetHeight - header.offsetHeight);
    measure();
    update();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", update, { passive: true });
  }

  // In the app: one device and one screen at a time.
  const gallery = document.querySelector("#in-the-app");
  if (gallery) {
    const deviceTabs = [...gallery.querySelectorAll("[data-device]")];
    const panels = [...gallery.querySelectorAll("[data-device-panel]")];
    const shotTabs = [...gallery.querySelectorAll("[data-shot-tabs] [data-shot]")];
    const caption = gallery.querySelector("[data-shot-caption]");
    let device = deviceTabs[0]?.dataset.device;
    let shot = "home";

    const render = () => {
      deviceTabs.forEach((tab) => {
        const selected = tab.dataset.device === device;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      const panel = panels.find((candidate) => candidate.dataset.devicePanel === device);
      panels.forEach((candidate) => { candidate.hidden = candidate !== panel; });
      const figures = [...panel.querySelectorAll("figure[data-shot]")];
      const available = new Set(figures.map((figure) => figure.dataset.shot));
      if (!available.has(shot)) shot = figures[0].dataset.shot;
      figures.forEach((figure) => { figure.hidden = figure.dataset.shot !== shot; });
      shotTabs.forEach((tab) => {
        tab.hidden = !available.has(tab.dataset.shot);
        tab.setAttribute("aria-selected", String(tab.dataset.shot === shot));
      });
      const figure = figures.find((candidate) => candidate.dataset.shot === shot);
      caption.textContent = figure.querySelector("figcaption")?.textContent ?? "";
    };

    gallery.querySelector("[data-device-tabs]").addEventListener("click", (event) => {
      const tab = event.target.closest("[data-device]");
      if (!tab) return;
      device = tab.dataset.device;
      render();
    });
    gallery.querySelector("[data-device-tabs]").addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const index = deviceTabs.findIndex((tab) => tab.dataset.device === device);
      const next = deviceTabs[(index + (event.key === "ArrowRight" ? 1 : -1) + deviceTabs.length) % deviceTabs.length];
      device = next.dataset.device;
      render();
      next.focus();
    });
    gallery.querySelector("[data-shot-tabs]").addEventListener("click", (event) => {
      const tab = event.target.closest("[data-shot]");
      if (!tab) return;
      shot = tab.dataset.shot;
      render();
    });

    gallery.querySelectorAll("[data-device-tabs], [data-shot-tabs]").forEach((tabs) => { tabs.hidden = false; });
    gallery.classList.add("is-enhanced");
    render();
  }

  // What's on: Cedar's features as a programme guide around the visitor's own clock.
  const epg = document.querySelector("[data-epg]");
  if (epg) {
    const icons = {
      home: "M4 11l8-7 8 7v9H4zM10 20v-5h4v5",
      tv: "M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM8.5 3l3.5 4 3.5-4",
      play: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM10.2 9.2v5.6l4.6-2.8z",
      search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
      server: "M5.5 4h13A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 9.5v-4A1.5 1.5 0 0 1 5.5 4zM5.5 13h13a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-4A1.5 1.5 0 0 1 5.5 13zM8 7.5h.01M8 16.5h.01",
      sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
    };
    const slots = 7;
    const slotMinutes = 30;
    const nowSlot = 2;
    const svg = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] ?? icons.sparkle}"/></svg>`;
    const element = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    };
    const channelTile = (channel) => {
      const tile = element("div", `ch-tile tint-${channel.tint}`);
      tile.insertAdjacentHTML("afterbegin", svg(channel.icon));
      tile.append(element("strong", "", channel.name), element("small", "", channel.note));
      return tile;
    };

    const channels = [...epg.querySelectorAll(".epg-source > li")].map((item) => ({
      name: item.querySelector("h3").textContent,
      note: item.querySelector(":scope > p").textContent,
      tint: item.dataset.tint,
      icon: item.dataset.icon,
      programmes: [...item.querySelectorAll("ol > li")].map((programme) => ({
        title: programme.querySelector("h4").textContent,
        description: programme.querySelector("p").textContent,
        link: programme.querySelector("a"),
        span: Number(programme.dataset.span) || 1,
      })),
    }));

    const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
    const range = (start, end) => `${time.format(start)} – ${time.format(end)}`;
    const head = element("div", "epg-head");
    head.setAttribute("aria-live", "polite");
    const scroll = element("div", "epg-scroll");
    const grid = element("div", "epg-grid");
    grid.setAttribute("aria-label", "What’s on");
    grid.style.setProperty("--slots", String(slots));
    scroll.append(grid);
    epg.append(head, scroll);

    let selected = null;
    let start = 0;
    let placeNowLine = () => {};
    window.addEventListener("resize", () => placeNowLine());

    const minutesLeft = (end) => Math.max(1, Math.round((end - Date.now()) / 60000));

    const showDetails = (channel, programme) => {
      head.replaceChildren(channelTile(channel));
      const body = element("div");
      body.append(element("h3", "", programme.title));
      const when = element("p", "epg-when");
      const now = Date.now();
      if (programme.start <= now && now < programme.end) {
        const bar = element("span", "bar");
        const fill = element("i");
        fill.style.width = `${((now - programme.start) / (programme.end - programme.start)) * 100}%`;
        bar.append(fill);
        when.append(element("span", "live-badge", "ON NOW"), element("span", "", range(programme.start, programme.end)), bar, element("span", "", `${minutesLeft(programme.end)}m left`));
      } else {
        when.append(element("span", "later-badge", programme.end <= now ? "EARLIER" : "LATER"), element("span", "", range(programme.start, programme.end)));
      }
      body.append(when, element("p", "epg-desc", programme.description));
      if (programme.link) {
        const link = element("a", "", programme.link.textContent);
        link.href = programme.link.getAttribute("href");
        body.append(link);
      }
      head.append(body);
    };

    const build = () => {
      const now = new Date();
      const base = new Date(now);
      base.setSeconds(0, 0);
      base.setMinutes(now.getMinutes() < slotMinutes ? 0 : slotMinutes);
      start = base.getTime() - nowSlot * slotMinutes * 60000;

      grid.replaceChildren(element("div", "epg-corner", "Today"));
      for (let index = 0; index < slots; index += 1) {
        const label = element("div", `epg-time${index === nowSlot ? " is-now" : ""}`, time.format(new Date(start + index * slotMinutes * 60000)));
        grid.append(label);
      }

      let focus = null;
      channels.forEach((channel, row) => {
        const cell = element("div", "epg-channel");
        cell.append(channelTile(channel));
        grid.append(cell);
        let offset = 0;
        channel.programmes.forEach((programme) => {
          programme.start = start + offset * slotMinutes * 60000;
          programme.end = programme.start + programme.span * slotMinutes * 60000;
          offset += programme.span;
          const button = element("button", `prog tint-${channel.tint}`);
          button.type = "button";
          button.style.gridColumn = `span ${programme.span}`;
          button.append(element("strong", "", programme.title), element("span", "", range(programme.start, programme.end)));
          const nowTime = now.getTime();
          if (programme.end <= nowTime) button.classList.add("is-past");
          if (programme.start <= nowTime && nowTime < programme.end) {
            button.style.setProperty("--played", `${((nowTime - programme.start) / (programme.end - programme.start)) * 100}%`);
            button.append(element("span", "left", `${minutesLeft(programme.end)}m left`));
            if (row === 1 || !focus) focus = { channel, programme };
          }
          const isSelected = selected ? selected.programme.title === programme.title : false;
          button.setAttribute("aria-pressed", String(isSelected));
          button.addEventListener("click", () => {
            selected = { channel, programme };
            grid.querySelectorAll(".prog").forEach((other) => other.setAttribute("aria-pressed", "false"));
            button.setAttribute("aria-pressed", "true");
            showDetails(channel, programme);
          });
          programme.button = button;
          grid.append(button);
        });
      });

      const line = element("div", "now-line");
      grid.append(line);
      placeNowLine = () => {
        const firstTime = grid.querySelector(".epg-time");
        const slotWidth = firstTime.getBoundingClientRect().width + 4;
        const elapsed = (Date.now() - start) / (slotMinutes * 60000);
        line.style.left = `${firstTime.offsetLeft + elapsed * slotWidth}px`;
      };
      placeNowLine();

      selected = selected
        ? channels.flatMap((channel) => channel.programmes.map((programme) => ({ channel, programme }))).find((entry) => entry.programme.title === selected.programme.title)
        : focus;
      if (selected) {
        selected.programme.button.setAttribute("aria-pressed", "true");
        showDetails(selected.channel, selected.programme);
      }
    };

    build();
    epg.classList.add("is-built");
    window.setInterval(build, 60000);
  }

  // The plans differ only in how they say $0.
  const plans = document.querySelector("[data-plans]");
  plans?.addEventListener("click", (event) => {
    const plan = event.target.closest(".plan");
    if (!plan) return;
    plans.querySelectorAll(".plan").forEach((other) => other.setAttribute("aria-pressed", String(other === plan)));
  });
})();
