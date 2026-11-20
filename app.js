(() => {
  "use strict";
  const root = document.documentElement;
  const es = root.lang === "es";
  const select = (selector, scope = document) => scope.querySelector(selector);
  const all = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const hero = select(".hero");
  const menu = select("#menu-button");
  const nav = select(".main-nav");
  const wall = select(".wall-display");
  const viewport = select(".slide-viewport");
  const track = select(".slide-track");
  const slides = all(".slide", wall);
  const indicators = all("[data-slide]", wall);
  const view = select("#view-toggle");
  const save = (key, value) => {
    try {
      localStorage.setItem("pavilion." + key, value);
    } catch {}
  };
  function closeMenu() {
    document.body.classList.remove("menu-open");
    menu.setAttribute("aria-expanded", "false");
  }
  menu.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".site-header") ||
      event.target.closest("#main-nav a")
    )
      closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      document.body.classList.contains("menu-open")
    ) {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

  // Preserve the visitor's location and selected language on subsequent visits.
  all("[data-lang]").forEach((link) =>
    link.addEventListener("click", () => {
      save("language", link.dataset.lang);
      link.href =
        (link.dataset.lang === "es" ? "es.html" : "index.html") +
        location.search +
        location.hash;
    }),
  );
  function renderView() {
    const reading = root.classList.contains("reading");
    view.setAttribute("aria-pressed", String(reading));
    select("span", view).textContent = reading
      ? view.dataset.spatial
      : view.dataset.reading;
  }
  view.addEventListener("click", () => {
    const reading = root.classList.toggle("reading");
    save("view", reading ? "reading" : "spatial");
    stopCursor();
    resetCamera();
    renderView();
    hero.scrollIntoView({ behavior: "instant" });
  });
  renderView();

  let active = 0;
  function showSlide(index, announce = true) {
    active = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + active * 100 + "%)";
    slides.forEach((slide, i) => {
      slide.inert = i !== active;
      slide.setAttribute("aria-hidden", String(i !== active));
      if (active === i) select("img", slide).loading = "eager";
    });
    indicators.forEach((dot, i) => {
      if (i === active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    const position =
      String(active + 1).padStart(2, "0") +
      " / " +
      String(slides.length).padStart(2, "0");
    select("#wall-count").textContent = position;
    if (announce)
      select("#wall-status").textContent =
        position + ". " + select("h2", slides[active]).textContent;
  }
  all("[data-move]", wall).forEach((button) =>
    button.addEventListener("click", () =>
      showSlide(active + Number(button.dataset.move)),
    ),
  );
  indicators.forEach((dot, i) => {
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      showSlide(i);
    });
    dot.addEventListener("keydown", (event) => {
      if (event.key === " ") {
        event.preventDefault();
        showSlide(i);
      }
    });
  });
  wall.addEventListener("keydown", (event) => {
    const destinations = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    if (event.target.closest(".slide")) wall.focus({ preventScroll: true });
    showSlide(destinations[event.key]);
  });
  let touchStart = null,
    swipeTime = -Infinity;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      const p = event.touches[0];
      touchStart =
        event.touches.length === 1 ? { x: p.clientX, y: p.clientY } : null;
    },
    { passive: true },
  );
  viewport.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;
      const p = event.changedTouches[0],
        dx = p.clientX - touchStart.x,
        dy = p.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) < 35 || Math.abs(dx) <= Math.abs(dy) * 1.3) return;
      swipeTime = performance.now();
      showSlide(active + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );
  viewport.addEventListener("touchcancel", () => {
    touchStart = null;
  });
  showSlide(0, false);

  const records = all(".pub-record");
  const filters = all("[data-filter]");
  function filterTopics(topic) {
    let count = 0;
    for (const record of records) {
      record.hidden =
        topic !== "all" && !record.dataset.topics.split(" ").includes(topic);
      if (!record.hidden) count++;
    }
    filters.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === topic)),
    );
    select("#results").textContent =
      count + (es ? " publicaciones" : " publications");
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => filterTopics(button.dataset.filter)),
  );

  function revealDestination(hash) {
    if (!hash.startsWith("#")) return;
    const destination = document.getElementById(hash.slice(1));
    if (!destination) return;
    if (destination.matches(".pub-record") && destination.hidden)
      filterTopics("all");
    if (destination.matches("details")) destination.open = true;
  }
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) revealDestination(link.hash);
  });
  window.addEventListener("hashchange", () => revealDestination(location.hash));
  revealDestination(location.hash);

  const dialog = select("#publication-dialog");
  let lastOpener = null;
  function openPublication(link) {
    const entry = document.getElementById("pub-" + link.dataset.pub);
    if (!entry || !dialog.showModal) return false;
    const body = select(".dialog-body", dialog);
    body.replaceChildren();
    const header = select(".journal", entry).cloneNode(true);
    header.textContent =
      select(".pub-year", entry).textContent + " · " + header.textContent;
    const title = document.createElement("h2");
    title.id = "dialog-title";
    title.lang = "en";
    title.textContent = select("h3", entry).textContent;
    body.append(header, title);
    [".translation", ".authors", ".pub-topics"].forEach((selector) => {
      const elem = select(selector, entry);
      if (elem) body.append(elem.cloneNode(true));
    });
    const note = select(".publication-details p", entry).cloneNode(true);
    note.className = "study-note";
    body.append(note);
    const figure = select(".scientific-figure", entry);
    if (figure) body.append(figure.cloneNode(true));
    body.append(select(".resources", entry).cloneNode(true));
    const archive = document.createElement("a");
    archive.href = "#" + entry.id;
    archive.className = "text-link";
    archive.textContent = es
      ? "Ver en el archivo de publicaciones"
      : "View in the publication archive";
    archive.addEventListener("click", (e) => {
      e.preventDefault();
      dialog.close();
      revealDestination(archive.hash);
      location.hash = archive.hash;
      entry.tabIndex = -1;
      entry.focus({ preventScroll: true });
      entry.scrollIntoView();
    });
    body.append(archive);
    lastOpener = link;
    stopCursor();
    dialog.showModal();
    dialog.scrollTop = 0;
    select(".dialog-close", dialog).focus({ preventScroll: true });
    return true;
  }
  all("[data-pub]").forEach((link) =>
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (performance.now() - swipeTime < 450) {
        e.preventDefault();
        return;
      }
      if (openPublication(link)) e.preventDefault();
    }),
  );
  select(".dialog-close", dialog).addEventListener("click", () =>
    dialog.close(),
  );
  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    if (
      e.target === dialog &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (
      lastOpener &&
      (document.activeElement === document.body ||
        dialog.contains(document.activeElement))
    )
      lastOpener.focus({ preventScroll: true });
  });

  // All camera updates are input-driven. The frame loop stops between events.
  const cursor = select("#controller");
  let cursorTarget = null,
    cameraFrame = 0,
    pointerX = 0,
    pointerY = 0;
  const spatial = () => !reduced.matches && !root.classList.contains("reading");
  function stopCursor() {
    cursor.classList.remove("visible", "over", "pressed");
    if (cursorTarget) cursorTarget.classList.remove("cursor-ready");
    cursorTarget = null;
  }
  function resetCamera() {
    pointerX = 0;
    pointerY = 0;
    hero.style.setProperty("--x", "0px");
    hero.style.setProperty("--y", "0px");
    hero.style.setProperty("--travel", "0px");
  }
  function cameraUpdate() {
    cameraFrame = 0;
    hero.style.setProperty("--x", pointerX.toFixed(2) + "px");
    hero.style.setProperty("--y", pointerY.toFixed(2) + "px");
  }
  function placeCursor(event, over) {
    if (cursorTarget && cursorTarget !== event.target)
      cursorTarget.classList.remove("cursor-ready");
    cursorTarget = event.target;
    cursor.style.transform =
      "translate3d(" +
      (event.clientX - 11) +
      "px," +
      (event.clientY - 11) +
      "px,0)";
    cursor.classList.add("visible");
    cursor.classList.toggle("over", over);
    cursorTarget.classList.add("cursor-ready");
  }
  all(".research-display").forEach((display) => {
    display.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "mouse" && fine.matches && spatial())
          placeCursor(event, true);
        else stopCursor();
      },
      { passive: true },
    );
    display.addEventListener("pointerleave", stopCursor);
    display.addEventListener("pointerdown", () =>
      cursor.classList.add("pressed"),
    );
  });
  hero.addEventListener(
    "pointermove",
    (e) => {
      if (!fine.matches || !spatial() || e.pointerType !== "mouse") {
        stopCursor();
        return;
      }
      const rect = hero.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      if (!cameraFrame) cameraFrame = requestAnimationFrame(cameraUpdate);
      const picture = e.target.closest(".projection-image");
      if (
        !picture &&
        e.target.closest("a,button,summary,.hero-copy,.slide-meta,.slide h2")
      ) {
        stopCursor();
        return;
      }
      placeCursor(e, !!e.target.closest(".wall-display"));
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    stopCursor();
    resetCamera();
  });
  hero.addEventListener("pointerdown", () => cursor.classList.add("pressed"));
  window.addEventListener("pointerup", () =>
    cursor.classList.remove("pressed"),
  );
  window.addEventListener("blur", stopCursor);
  document.addEventListener("focusin", stopCursor);
  reduced.addEventListener("change", () => {
    stopCursor();
    resetCamera();
  });
  fine.addEventListener("change", stopCursor);

  const zones = [hero, ...all("main > section.zone")];
  const guideLinks = all(".directory nav a"),
    navLinks = all(".main-nav a");
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    let current = zones[0];
    const line = Math.min(innerHeight * 0.28, 220);
    for (const zone of zones) {
      if (zone.getBoundingClientRect().top <= line) current = zone;
    }
    [...guideLinks, ...navLinks].forEach((a) => {
      if (a.hash === "#" + current.id)
        a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    if (spatial() && scrollY <= hero.offsetHeight)
      hero.style.setProperty("--travel", Math.min(45, scrollY * 0.12) + "px");
  }
  window.addEventListener(
    "scroll",
    () => {
      stopCursor();
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  updateScroll();
})();
