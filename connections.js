(() => {
  "use strict";
  const region = document.getElementById("connections");
  if (!region) return;
  const get = (id) => document.getElementById(id);
  const lang = document.documentElement.lang;
  const t = (en, es) => (lang === "es" ? es : en);
  const names = new Intl.DisplayNames([lang], { type: "region" });
  const countryName = (code) => names.of(code) || code;
  const sort = (a, b) => a.localeCompare(b, lang, { sensitivity: "base" });
  const tabs = [...region.querySelectorAll("[data-map-mode]")];
  const countryPicker = get("atlas-country"),
    cityPicker = get("atlas-city"),
    results = get("map-results");
  const state = { mode: "collaborations", country: "", city: "" };
  let data = JSON.parse(get("map-snapshot").textContent);
  let map,
    land,
    points,
    labelsShown = false,
    started = false;
  const cities = new Map();
  const comparePlace = (a, b) => sort(a.city, b.city);
  const cityKey = (r) =>
    r.country + "|" + r.city.normalize("NFC").trim().toLocaleLowerCase();
  const item = (tag, txt, cls) => {
    const el = document.createElement(tag);
    if (txt !== undefined) el.textContent = txt;
    if (cls) el.className = cls;
    return el;
  };
  const safeLink = (label, url) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return item("span", label);
    }
    if (!["https:", "http:"].includes(parsed.protocol))
      return item("span", label);
    const a = item("a", label);
    a.href = parsed.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };
  function group(rows, key) {
    const groups = new Map();
    for (const row of rows) {
      const k = key(row);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(row);
    }
    return groups;
  }
  const rows = () => data[state.mode];
  const countryRows = () =>
    rows().filter((r) => !state.country || r.country === state.country);
  const opt = (label, value) => {
    const o = document.createElement("option");
    o.textContent = label;
    o.value = value;
    return o;
  };
  function selectors() {
    const countryCodes = [...new Set(rows().map((r) => r.country))].sort(
      (a, b) => sort(countryName(a), countryName(b)),
    );
    countryPicker.replaceChildren(
      opt(t("All countries", "Todos los países"), ""),
      ...countryCodes.map((c) => opt(countryName(c), c)),
    );
    countryPicker.value = state.country;
    countryPicker.disabled = !countryCodes.length;
    const places = [...group(countryRows(), cityKey)]
      .map(([key, rr]) => [key, rr[0]])
      .sort((a, b) => comparePlace(a[1], b[1]));
    cityPicker.replaceChildren(
      opt(t("All cities", "Todas las ciudades"), ""),
      ...places.map(([key, r]) =>
        opt(
          state.country ? r.city : r.city + " · " + countryName(r.country),
          key,
        ),
      ),
    );
    cityPicker.value = state.city;
    cityPicker.disabled = places.length === 0;
  }
  function personList(records) {
    const list = item("ul", undefined, "atlas-people");
    const people = [...group(records, (r) => r.name)].sort((a, b) =>
      sort(a[0], b[0]),
    );
    for (const [name, entries] of people) {
      const li = item("li");
      if (state.mode === "joy") {
        const friend = item("h4");
        friend.append(safeLink(name, entries.find((r) => r.url)?.url));
        li.append(friend);
        li.append(
          item(
            "p",
            [
              ...new Set(
                entries.map((r) => r.city + " · " + countryName(r.country)),
              ),
            ].join(" / "),
          ),
        );
      } else {
        li.append(item("h4", name));
        for (const [title, papers] of group(entries, (r) => r.paper)) {
          const p = item("p", undefined, "atlas-paper");
          p.append(safeLink(title, papers[0].url));
          const aff = item(
            "p",
            [
              ...new Set(papers.map((r) => r.institution + " · " + r.city)),
            ].join(" / "),
            "atlas-affiliation",
          );
          li.append(p, aff);
        }
      }
      list.append(li);
    }
    return list;
  }
  function renderList() {
    results.replaceChildren();
    let selected = countryRows().filter(
      (r) => !state.city || cityKey(r) === state.city,
    );
    const zoomed =
      map &&
      state.mode === "joy" &&
      map.getZoom() >= 4 &&
      !state.city &&
      !state.country;
    if (zoomed)
      selected = selected.filter((r) =>
        map.getBounds().contains([r.lat, r.lon]),
      );
    if (!rows().length) {
      results.append(
        item("h3", t("A personal geography", "Una geografía personal")),
        item(
          "p",
          t(
            "I’ll add the cities and people with whom I’ve shared the joy of science.",
            "Iré añadiendo aquí las ciudades y las personas con quienes he compartido la alegría de la ciencia.",
          ),
        ),
      );
    } else if (state.country || state.city || zoomed) {
      const head = state.city
        ? selected[0]?.city
        : state.country
          ? countryName(state.country)
          : t("People in view", "Personas en esta vista");
      results.append(item("h3", head || ""));
      if (selected.length) results.append(personList(selected));
      else
        results.append(
          item(
            "p",
            t(
              "Zoom out to see more places.",
              "Aleja el mapa para ver más lugares.",
            ),
          ),
        );
    } else {
      results.append(item("h3", t("Explore by country", "Explora por país")));
      const ul = item("ul", undefined, "atlas-country-list");
      for (const o of [...countryPicker.options].slice(1)) {
        const li = item("li"),
          b = item("button", o.textContent);
        b.type = "button";
        const rr = selected.filter((r) => r.country === o.value);
        b.append(
          item(
            "small",
            String(new Set(rr.map((r) => r.name)).size) +
              " " +
              (state.mode === "joy"
                ? t("people", "personas")
                : t("coauthors", "coautores")),
          ),
        );
        b.addEventListener("click", () => choose(o.value, ""));
        li.append(b);
        ul.append(li);
      }
      results.append(ul);
    }
    get("map-status").textContent =
      results.querySelector("h3")?.textContent || "";
  }
  function boundsForWorld() {
    map.fitBounds(
      [
        [-54, -168],
        [73, 178],
      ],
      { animate: false, padding: [6, 6] },
    );
  }
  function choose(code, key, move = true) {
    state.country = code;
    state.city = key;
    selectors();
    if (map && move) {
      const place = key ? cities.get(key) : null;
      if (place) {
        map.setView([place.lat, place.lon], Math.max(map.getZoom(), 5), {
          animate: false,
        });
      } else if (code) {
        const positions = countryRows().map((r) => [r.lat, r.lon]);
        if (positions.length)
          map.fitBounds(positions, {
            padding: [50, 50],
            maxZoom: 4,
            animate: false,
          });
      } else boundsForWorld();
    }
    if (land) land.setStyle(style);
    if (points) renderPoints();
    renderList();
  }
  function switchTab(mode) {
    state.mode = mode;
    for (const tab of tabs) {
      const active = tab.dataset.mapMode === mode;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) get("map-panel").setAttribute("aria-labelledby", tab.id);
    }
    get("map-intro").textContent =
      mode === "collaborations"
        ? t(
            "Select a country to see coauthors, their affiliations at publication, and the papers we wrote together.",
            "Selecciona un país para ver los coautores, sus afiliaciones en el momento de la publicación y los trabajos que escribimos juntos.",
          )
        : t(
            "Explore the people and cities that made science a shared joy. Select a place or zoom in, then choose a name to visit their profile.",
            "Explora las personas y ciudades con las que he compartido la alegría de la ciencia. Selecciona un lugar o amplía el mapa y elige un nombre para visitar su perfil.",
          );
    choose("", "");
  }
  countryPicker.addEventListener("change", () =>
    choose(countryPicker.value, ""),
  );
  cityPicker.addEventListener("change", () =>
    choose(
      cityPicker.value ? cityPicker.value.split("|")[0] : state.country,
      cityPicker.value,
    ),
  );
  region
    .querySelector(".world-reset")
    .addEventListener("click", () => choose("", ""));
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.mapMode));
    tab.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const next =
        tabs[e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : 1 - i];
      next.focus();
      switchTab(next.dataset.mapMode);
    });
  });
  function style(feature) {
    const code = feature.properties.code,
      present = rows().some((r) => r.country === code);
    return {
      fillColor:
        state.country === code ? "#2d5480" : present ? "#729176" : "#d9ddd1",
      fillOpacity: 1,
      color: "#f8f9f1",
      weight: 1,
      className: present ? "has-records" : "empty-country",
    };
  }
  function renderPoints() {
    points.clearLayers();
    cities.clear();
    labelsShown = state.mode === "joy" && map.getZoom() >= 4;
    for (const [key, entries] of group(rows(), cityKey)) {
      const place = entries[0];
      cities.set(key, place);
      const selected = key === state.city;
      const marker = L.marker([place.lat, place.lon], {
        keyboard: true,
        title: place.city + " · " + countryName(place.country),
        alt: place.city,
        icon: L.divIcon({
          className: "atlas-pin" + (selected ? " is-selected" : ""),
          html: "<span></span>",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(points);
      marker.on("click", () => choose(place.country, key));
      if (labelsShown && (!state.country || place.country === state.country)) {
        const box = item("div", undefined, "map-name-label");
        box.append(item("strong", place.city));
        for (const [name, rr] of group(entries, (r) => r.name))
          box.append(safeLink(name, rr[0].url));
        marker.bindTooltip(box, {
          permanent: true,
          interactive: true,
          direction: "right",
          offset: [6, 0],
          className: "atlas-name-tooltip",
        });
      } else marker.bindTooltip(item("span", place.city), { direction: "top" });
    }
  }
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.append(s);
    });
  function unpack(input, mode) {
    if (!input.length) return [];
    const header = input[0].map((x) => String(x || "").trim());
    const required = [
      "Name",
      "Country code",
      "City",
      "Latitude",
      "Longitude",
      ...(mode === "joy"
        ? ["Profile URL"]
        : ["Institution", "Paper title", "Paper URL", "Affiliation source"]),
    ];
    if (required.some((key) => !header.includes(key)))
      throw Error("Unexpected workbook headers");
    return input.slice(1).flatMap((row) => {
      const value = (k) => String(row[header.indexOf(k)] ?? "").trim();
      const name = value("Name"),
        country = value("Country code").toUpperCase(),
        city = value("City");
      const latitude = value("Latitude"),
        longitude = value("Longitude"),
        lat = Number(latitude),
        lon = Number(longitude);
      if (
        !name ||
        !city ||
        !/^([A-Z]{2})$/.test(country) ||
        !latitude ||
        !longitude ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      )
        return [];
      return [
        {
          name,
          country,
          city,
          lat,
          lon,
          institution: value("Institution"),
          paper: value("Paper title"),
          url: value(mode === "joy" ? "Profile URL" : "Paper URL"),
          source: value("Affiliation source"),
        },
      ];
    });
  }
  async function readWorkbook() {
    await loadScript("assets/map/vendor/read-excel-file.min.js");
    const response = await fetch("assets/science-connections.xlsx", {
      cache: "no-cache",
    });
    if (!response.ok) throw Error("Workbook unavailable");
    const buffer = await response.arrayBuffer();
    const [c, j] = await Promise.all(
      ["Collaborations", "Joy"].map((sheet) => readXlsxFile(buffer, { sheet })),
    );
    return {
      collaborations: unpack(c, "collaborations"),
      joy: unpack(j, "joy"),
    };
  }
  async function start() {
    if (started) return;
    started = true;
    const workbook = readWorkbook()
      .then((newData) => {
        data = newData;
        const keepCountry = rows().some((r) => r.country === state.country)
          ? state.country
          : "";
        const keepCity = rows().some((r) => cityKey(r) === state.city)
          ? state.city
          : "";
        choose(keepCountry, keepCity, false);
      })
      .catch(() => {
        /* The published HTML includes the last built workbook data. */
      });
    try {
      const [geo] = await Promise.all([
        fetch("assets/map/countries.geojson").then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        }),
        loadScript("assets/map/vendor/leaflet.js"),
      ]);
      map = L.map("world-map", {
        minZoom: 0,
        maxZoom: 11,
        zoomSnap: 0.25,
        zoomDelta: 1,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
        maxBounds: [
          [-84, -230],
          [84, 230],
        ],
        maxBoundsViscosity: 0.8,
      });
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution(
        '<a href="https://www.naturalearthdata.com/">Natural Earth</a> · <a href="https://leafletjs.com/">Leaflet</a>',
      );
      L.control
        .zoom({
          zoomInTitle: t("Zoom in", "Acercar"),
          zoomOutTitle: t("Zoom out", "Alejar"),
        })
        .addTo(map);
      boundsForWorld();
      land = L.geoJSON(geo, {
        style,
        onEachFeature: (feature, layer) => {
          const code = feature.properties.code;
          layer.on("click", () => {
            if (rows().some((r) => r.country === code)) choose(code, "");
          });
        },
      }).addTo(map);
      points = L.layerGroup().addTo(map);
      renderPoints();
      map.on("zoomend", () => {
        if ((state.mode === "joy" && map.getZoom() >= 4) !== labelsShown)
          renderPoints();
      });
      map.on("moveend", () => {
        if (state.mode === "joy" && !state.country) renderList();
      });
      if ("ResizeObserver" in window)
        new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(
          get("world-map"),
        );
      if (state.country) choose(state.country, state.city);
    } catch {
      get("world-map").classList.add("map-unavailable");
      get("world-map").replaceChildren(
        item(
          "p",
          t(
            "Explore the locations using the country and city lists.",
            "Explora los lugares con las listas de países y ciudades.",
          ),
        ),
      );
      region.querySelector(".world-reset").hidden = true;
    }
    await workbook;
  }
  selectors();
  renderList();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: "500px" },
    );
    observer.observe(region);
  } else start();
})();
