(function () {
  "use strict";

  const DATA_URL = "data/beethoven-journey.json";
  const EN_DATA_URL = "data/beethoven-journey.en.json";
  const BEETHOVEN_BIRTH_YEAR = 1770;
  const THEME_STORAGE_KEY = "beethoven-journey-theme";
  const LANG_STORAGE_KEY = "beethoven-journey-lang";
  // 收藏分组按贝多芬一生的几个核心阶段组织，每组对应该阶段最具代表性的作品。
  const COLLECTIONS = [
    {
      id: "bonn-youth",
      title: "波恩少年时代",
      title_en: "Bonn youth",
      description: "1770 年生于波恩，失聪与成名之前的早期作品：宫廷里的键盘少年，与离乡前的第一批大作。",
      description_en: "Born in Bonn in 1770 — early works before deafness and fame: the keyboard prodigy at court and the first big pieces before he left home.",
    },
    {
      id: "arrival-vienna",
      title: "初到维也纳",
      title_en: "Arriving in Vienna",
      description: "1792 年离开波恩定居维也纳，师从海顿、靠沙龙与出版立足，从《作品第一号》到《月光》。",
      description_en: "Settling in Vienna from 1792 — studying with Haydn and making his name through salons and publishing, from Op. 1 to the Moonlight Sonata.",
    },
    {
      id: "deafness-heiligenstadt",
      title: "失聪与海利根施塔特遗嘱",
      title_en: "Deafness & the Heiligenstadt Testament",
      description: "1802 年听力恶化、在海利根施塔特写下遗嘱的转折，以及随之而来的《英雄》。",
      description_en: "The 1802 turning point — worsening hearing, the testament written at Heiligenstadt, and the Eroica that followed.",
    },
    {
      id: "heroic-period",
      title: "英雄年代（中期）",
      title_en: "The heroic period",
      description: "走出危机后的英雄风格爆发：贝五、田园、《费德里奥》、小提琴与皇帝协奏曲。",
      description_en: "The heroic-style outpouring after the crisis: the Fifth, the Pastoral, Fidelio, and the Violin and Emperor concertos.",
    },
    {
      id: "immortal-beloved",
      title: "永恒的爱人",
      title_en: "The Immortal Beloved",
      description: "1812 年波西米亚温泉与那封从未寄出的情书，和同一时期的《第七交响曲》。",
      description_en: "The 1812 Bohemian spa towns and the never-sent love letter, alongside the Seventh Symphony of the same period.",
    },
    {
      id: "nephew-karl",
      title: "监护侄子卡尔",
      title_en: "Guardianship of nephew Karl",
      description: "1815 年兄弟去世后，争夺与抚养侄子卡尔的漫长岁月，笼罩着晚期创作。",
      description_en: "After his brother's death in 1815, the long fight to win and raise his nephew Karl, which shadowed the late works.",
    },
    {
      id: "late-period",
      title: "第九与晚期",
      title_en: "The Ninth & the late period",
      description: "几近全聋后的晚期巅峰：《第九交响曲》《庄严弥撒》《迪亚贝利变奏》与晚期弦乐四重奏。",
      description_en: "The late summits after near-total deafness: the Ninth Symphony, the Missa Solemnis, the Diabelli Variations and the late string quartets.",
    },
  ];

  // Dynamic strings built in JS. {n}/{t}/{label}/{year} are interpolated.
  const STRINGS = {
    zh: {
      allCities: "全部城市", allGenres: "全部类型",
      resultCount: "{n} 处足迹",
      ageUnit: "{n} 岁",
      themeLight: "白天", themeDark: "黑夜",
      switchToLight: "切换到白天模式", switchToDark: "切换到黑夜模式",
      langLabel: "EN", langAria: "Switch to English",
      viewDetail: "查看作品详情",
      viewDetailAria: "查看 {t} 的作品详情",
      noMatchWork: "没有匹配的足迹", adjustFilters: "请调整筛选条件。", noResults: "当前筛选没有结果。",
      sourceLink: "查看参考来源：{label}",
      placeSource: "查看地点来源：{label}",
      placeRelatedText: "同一地点（{name}）在本页还关联另外 {n} 部作品，点击可切换查看：",
      placeRelatedItem: "{t}（{y}）",
      placeRelatedAria: "查看同一地点的作品 {t}",
      listenTarget: "播放目标：{t}", listenDefault: "听这首作品", listenAria: "在 {label} 试听 {t}",
      imageFail: "地点图片暂时无法加载，可查看图片来源。", imageSource: "图片来源：{label}",
      selected: "已选中：{year} · {t}",
      metaSep: " · ", cityCountrySep: ", ",
      errCount: "数据未加载", errWork: "数据加载失败",
      errMeta: "请通过本地静态服务器打开本页面，例如 python -m http.server 8000。",
      errContext: "浏览器直接打开 file:// 页面时，可能会禁止读取 data/beethoven-journey.json。",
      errMeaning: "启动本地服务器后再访问 http://localhost:8000 即可完整查看地图与时间线。",
    },
    en: {
      allCities: "All cities", allGenres: "All genres",
      resultCount: "{n} stops",
      ageUnit: "age {n}",
      themeLight: "Light", themeDark: "Dark",
      switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode",
      langLabel: "中", langAria: "切换到中文",
      viewDetail: "View work detail",
      viewDetailAria: "View the detail for {t}",
      noMatchWork: "No matching stop", adjustFilters: "Try adjusting the filters.", noResults: "No results for the current filters.",
      sourceLink: "Reference source: {label}",
      placeSource: "Location source: {label}",
      placeRelatedText: "The same location ({name}) is linked to {n} other work(s) on this page — click to switch:",
      placeRelatedItem: "{t} ({y})",
      placeRelatedAria: "View {t}, a work at the same location",
      listenTarget: "Listen to: {t}", listenDefault: "Listen to this work", listenAria: "Listen to {t} on {label}",
      imageFail: "The location image can't load right now — see the image source.", imageSource: "Image source: {label}",
      selected: "Selected: {year} · {t}",
      metaSep: " · ", cityCountrySep: ", ",
      errCount: "Data not loaded", errWork: "Failed to load data",
      errMeta: "Please open this page through a local static server, e.g. python -m http.server 8000.",
      errContext: "Opening the page directly via file:// may block reading data/beethoven-journey.json.",
      errMeaning: "Start a local server and visit http://localhost:8000 to see the full map and timeline.",
    },
  };

  const state = {
    entries: [],
    filtered: [],
    selectedId: null,
    map: null,
    cluster: null,
    markers: new Map(),
    lang: "zh",
    enById: new Map(),
    staticOriginal: null,
  };

  function t(key, vars) {
    let s = (STRINGS[state.lang] && STRINGS[state.lang][key]) || STRINGS.zh[key] || key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace("{" + k + "}", vars[k]);
      }
    }
    return s;
  }

  // ---- Localization of data entries via EN overlay ------------------------
  function localize(entry) {
    if (state.lang !== "en") {
      return entry;
    }
    const overlay = state.enById.get(entry.id);
    if (!overlay) {
      return entry;
    }
    const merged = { ...entry };
    if (overlay.context) merged.context = overlay.context;
    if (overlay.meaning) merged.meaning = overlay.meaning;
    if (overlay.source) merged.source = { ...entry.source, ...overlay.source };
    if (overlay.listening && entry.listening) merged.listening = { ...entry.listening, ...overlay.listening };
    if (overlay.place && entry.place) merged.place = { ...entry.place, ...overlay.place };
    return merged;
  }

  function collectionTitle(collection) {
    return state.lang === "en" && collection.title_en ? collection.title_en : collection.title;
  }

  function collectionDescription(collection) {
    return state.lang === "en" && collection.description_en ? collection.description_en : collection.description;
  }

  function parsePeriod(period) {
    if (!period || period === "all") {
      return null;
    }
    const parts = period.split("-").map((part) => Number.parseInt(part, 10));
    if (parts.length !== 2 || parts.some(Number.isNaN)) {
      return null;
    }
    return { start: parts[0], end: parts[1] };
  }

  function filterEntries(entries, filters) {
    const period = parsePeriod(filters.period);
    const query = normalizeSearchQuery(filters.query);
    return entries.filter((entry) => {
      const cityMatches = !filters.city || filters.city === "all" || entry.city === filters.city;
      const genreMatches = !filters.genre || filters.genre === "all" || entry.genre === filters.genre;
      const periodMatches = !period || (entry.year >= period.start && entry.year <= period.end);
      const queryMatches = !query || getEntrySearchText(entry).includes(query);
      return cityMatches && genreMatches && periodMatches && queryMatches;
    });
  }

  function normalizeSearchQuery(query) {
    return String(query || "").trim().toLowerCase();
  }

  function getEntrySearchText(entry) {
    return [
      entry.work,
      entry.catalogue,
      entry.city,
      entry.country,
      entry.genre,
      entry.year,
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function getFilterOptions(entries, key) {
    return [...new Set(entries.map((entry) => entry[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function byYearThenCity(a, b) {
    return a.year - b.year || a.city.localeCompare(b.city);
  }

  function getEntryCoordinates(entry) {
    if (entry.place && typeof entry.place.lat === "number" && typeof entry.place.lng === "number") {
      return [entry.place.lat, entry.place.lng];
    }
    return [entry.lat, entry.lng];
  }

  function getAge(year) {
    return year - BEETHOVEN_BIRTH_YEAR;
  }

  function formatAge(year) {
    return t("ageUnit", { n: getAge(year) });
  }

  function getCollectionGroups(entries) {
    return COLLECTIONS.map((collection) => ({
      ...collection,
      entries: entries
        .filter((entry) => Array.isArray(entry.collections) && entry.collections.includes(collection.id))
        .sort(byYearThenCity),
    })).filter((collection) => collection.entries.length > 0);
  }

  function getEntryCollections(entry) {
    if (!entry || !Array.isArray(entry.collections)) {
      return [];
    }
    return COLLECTIONS.filter((collection) => entry.collections.includes(collection.id));
  }

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const element = $(id);
    if (element) {
      element.textContent = text;
    }
  }

  // ---- Theme --------------------------------------------------------------
  function getStored(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function saveStored(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      // localStorage can be unavailable for file:// or privacy-restricted contexts.
    }
  }

  function normalizeTheme(theme) {
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    const normalized = normalizeTheme(theme);
    document.documentElement.dataset.theme = normalized;
    const button = $("theme-toggle");
    if (button) {
      const isDark = normalized === "dark";
      button.textContent = isDark ? t("themeLight") : t("themeDark");
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.setAttribute("aria-label", isDark ? t("switchToLight") : t("switchToDark"));
    }
    if (persist) {
      saveStored(THEME_STORAGE_KEY, normalized);
    }
    return normalized;
  }

  function getInitialTheme() {
    const stored = getStored(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function toggleTheme() {
    const current = normalizeTheme(document.documentElement.dataset.theme);
    return applyTheme(current === "dark" ? "light" : "dark", true);
  }

  function initTheme() {
    applyTheme(getInitialTheme(), false);
    const button = $("theme-toggle");
    if (button) {
      button.addEventListener("click", toggleTheme);
    }
  }

  // ---- Language -----------------------------------------------------------
  function normalizeLang(lang) {
    return lang === "en" ? "en" : "zh";
  }

  function getInitialLang() {
    const stored = getStored(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      return stored;
    }
    const docLang = (document.documentElement.lang || "").toLowerCase();
    if (docLang.startsWith("en")) {
      return "en";
    }
    return "zh";
  }

  // Capture the original (zh) static text once, then translate [data-i18n*] nodes.
  function captureStatic() {
    if (state.staticOriginal) {
      return;
    }
    state.staticOriginal = new Map();
    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n") || el.getAttribute("data-i18n-html");
      const isHtml = el.hasAttribute("data-i18n-html");
      state.staticOriginal.set(el, { key, isHtml, zh: isHtml ? el.innerHTML : el.textContent });
    });
  }

  function applyStaticLang() {
    if (!state.staticOriginal) {
      return;
    }
    state.staticOriginal.forEach((info, el) => {
      if (state.lang === "en") {
        const en = STATIC_EN[info.key];
        if (en === undefined) {
          return;
        }
        if (info.isHtml) {
          el.innerHTML = en;
        } else {
          el.textContent = en;
        }
      } else if (info.isHtml) {
        el.innerHTML = info.zh;
      } else {
        el.textContent = info.zh;
      }
    });
  }

  function applyLangChrome() {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    const langButton = $("lang-toggle");
    if (langButton) {
      langButton.textContent = t("langLabel");
      langButton.setAttribute("aria-label", t("langAria"));
    }
    // Re-apply theme so the toggle label matches the language.
    applyTheme(document.documentElement.dataset.theme, false);
    applyStaticLang();
  }

  function setLang(lang, persist) {
    state.lang = normalizeLang(lang);
    if (persist) {
      saveStored(LANG_STORAGE_KEY, state.lang);
    }
    applyLangChrome();
    // Rebuild language-dependent dynamic content.
    rebuildFilterLabels();
    renderCollections(state.entries);
    renderSources(state.entries);
    applyFilters();
  }

  function initLang() {
    captureStatic();
    state.lang = getInitialLang();
    applyLangChrome();
    const button = $("lang-toggle");
    if (button) {
      button.addEventListener("click", () => setLang(state.lang === "en" ? "zh" : "en", true));
    }
  }

  // ---- Data loading -------------------------------------------------------
  async function loadEntries() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`无法加载 ${DATA_URL}`);
      }
      return response.json();
    } catch (error) {
      if (Array.isArray(window.BEETHOVEN_JOURNEY_DATA)) {
        return window.BEETHOVEN_JOURNEY_DATA;
      }
      throw error;
    }
  }

  async function loadEnglishOverlay() {
    try {
      const response = await fetch(EN_DATA_URL);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      // fall through to the inline fallback below
    }
    if (Array.isArray(window.BEETHOVEN_JOURNEY_DATA_EN)) {
      return window.BEETHOVEN_JOURNEY_DATA_EN;
    }
    return [];
  }

  function buildSelect(select, options, allLabel, previousValue) {
    select.innerHTML = "";
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = allLabel;
    select.appendChild(all);

    for (const optionValue of options) {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      select.appendChild(option);
    }
    if (previousValue) {
      select.value = previousValue;
    }
  }

  function currentFilters() {
    const search = $("search-filter");
    return {
      city: $("city-filter").value,
      genre: $("genre-filter").value,
      period: $("period-filter").value,
      query: search ? search.value : "",
    };
  }

  function rebuildFilterLabels() {
    const cityFilter = $("city-filter");
    const genreFilter = $("genre-filter");
    if (cityFilter) {
      buildSelect(cityFilter, getFilterOptions(state.entries, "city"), t("allCities"), cityFilter.value);
    }
    if (genreFilter) {
      buildSelect(genreFilter, getFilterOptions(state.entries, "genre"), t("allGenres"), genreFilter.value);
    }
  }

  function initFilters(entries) {
    buildSelect($("city-filter"), getFilterOptions(entries, "city"), t("allCities"));
    buildSelect($("genre-filter"), getFilterOptions(entries, "genre"), t("allGenres"));
    for (const id of ["city-filter", "genre-filter", "period-filter"]) {
      $(id).addEventListener("change", applyFilters);
    }
    const search = $("search-filter");
    if (search) {
      search.addEventListener("input", applyFilters);
    }
  }

  function initMap() {
    const warning = $("map-warning");
    if (!window.L) {
      warning.hidden = false;
      return;
    }

    state.map = L.map("map", {
      scrollWheelZoom: true,
      worldCopyJump: true,
    }).setView([49.5, 11.5], 5);

    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.on("tileerror", () => {
      warning.hidden = false;
    });
    tiles.addTo(state.map);

    // Many works share the same city-level coordinate (e.g. a dozen Vienna
    // pieces sit on the exact same point), so plain markers would stack and
    // hide one another. When the marker-cluster plugin is available, group
    // them: nearby pins collapse into a count bubble, and a cluster that can't
    // be split by zooming fans out (spiderfies) on click so every work stays
    // reachable. If the plugin failed to load, fall back to plain markers.
    if (typeof L.markerClusterGroup === "function") {
      state.cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 44,
      });
      state.map.addLayer(state.cluster);
    }

    // Leaflet caches the container size when the map is created. Inside the
    // stretch-aligned grid layout the panel's final height can settle a frame
    // later, which leaves the tiles unrendered (a blank/gray map) until the
    // window is resized. Recompute the size once the layout is ready and on
    // every later resize so the tiles always fill the panel.
    const refreshMapSize = () => {
      if (state.map) {
        state.map.invalidateSize();
      }
    };
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(refreshMapSize);
      window.addEventListener("load", refreshMapSize);
      window.addEventListener("resize", refreshMapSize);
    }
  }

  function renderMarkers(entries) {
    if (!state.map) {
      return;
    }

    state.map.closePopup();
    for (const marker of state.markers.values()) {
      marker.closePopup();
      if (state.cluster) {
        state.cluster.removeLayer(marker);
      } else {
        state.map.removeLayer(marker);
      }
    }
    if (state.cluster) {
      state.cluster.clearLayers();
    }
    state.map.closePopup();
    document.querySelectorAll(".leaflet-popup").forEach((popup) => popup.remove());
    state.markers.clear();

    for (const entry of entries) {
      const coords = getEntryCoordinates(entry);
      const placeLine = entry.place ? `<br><span>${entry.place.name}</span>` : "";
      const marker = L.marker(coords);
      if (state.cluster) {
        state.cluster.addLayer(marker);
      } else {
        marker.addTo(state.map);
      }
      marker.bindPopup(`
        <strong>${entry.city}, ${entry.year}</strong><br>
        ${entry.work} ${entry.catalogue}${placeLine}
        <br><button type="button" class="popup-detail-link" data-id="${entry.id}" aria-label="${t("viewDetailAria", { t: `${entry.work} ${entry.catalogue}` })}">${t("viewDetail")}</button>
      `);
      marker.on("click", () => selectEntry(entry.id, false, false));
      marker.on("popupopen", () => {
        const popup = marker.getPopup && marker.getPopup().getElement ? marker.getPopup().getElement() : null;
        const detailLink = popup ? popup.querySelector(".popup-detail-link") : null;
        if (detailLink) {
          detailLink.addEventListener("click", () => selectEntry(entry.id, false, true), { once: true });
        }
      });
      state.markers.set(entry.id, marker);
    }

    if (entries.length > 1) {
      const bounds = L.latLngBounds(entries.map(getEntryCoordinates));
      state.map.fitBounds(bounds, { padding: [36, 36] });
    } else if (entries.length === 1) {
      state.map.setView(getEntryCoordinates(entries[0]), 7);
    }
  }

  function renderTimeline(entries) {
    const list = $("timeline-list");
    list.innerHTML = "";

    for (const entry of entries.slice().sort(byYearThenCity)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timeline-item";
      button.dataset.id = entry.id;
      button.innerHTML = `
        <span class="timeline-year">${entry.year}<small>${formatAge(entry.year)}</small></span>
        <span class="timeline-body">
          <strong>${entry.city}</strong>
          <span>${entry.work} · ${entry.catalogue}</span>
        </span>
      `;
      button.addEventListener("click", () => selectEntry(entry.id, true, false));
      list.appendChild(button);
    }
  }

  function renderSources(entries) {
    const container = $("source-list");
    container.innerHTML = "";
    for (const entry of entries.slice().sort(byYearThenCity)) {
      const localized = localize(entry);
      const link = document.createElement("a");
      link.href = localized.source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = `${entry.year} ${entry.city}: ${localized.source.label}`;
      container.appendChild(link);
    }
  }

  function renderCollections(entries) {
    const container = $("collection-list");
    if (!container) {
      return;
    }

    const groups = getCollectionGroups(entries);
    container.innerHTML = "";
    renderCollectionNav(groups);
    for (const collection of groups) {
      const section = document.createElement("article");
      section.className = "collection-card";
      section.id = `collection-${collection.id}`;

      const items = collection.entries.map((entry) => `
        <button type="button" class="collection-item" data-id="${entry.id}" aria-pressed="false">
          <span>${entry.year} · ${formatAge(entry.year)}</span>
          <strong>${entry.work}</strong>
          <small>${entry.catalogue} · ${entry.city}</small>
        </button>
      `).join("");

      section.innerHTML = `
        <div class="collection-card-head">
          <h3>${collectionTitle(collection)}</h3>
          <p>${collectionDescription(collection)}</p>
        </div>
        <div class="collection-items">${items}</div>
      `;

      section.querySelectorAll(".collection-item").forEach((button) => {
        button.addEventListener("click", () => selectEntry(button.dataset.id, true, true));
      });
      container.appendChild(section);
    }
    highlightSelected();
  }

  function renderCollectionNav(collections) {
    const nav = $("collection-nav");
    if (!nav) {
      return;
    }

    nav.replaceChildren();
    for (const collection of collections) {
      const link = document.createElement("a");
      link.href = `#collection-${collection.id}`;
      link.textContent = `${collectionTitle(collection)} (${collection.entries.length})`;
      nav.appendChild(link);
    }
  }

  function highlightSelected() {
    document.querySelectorAll(".timeline-item").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.id === state.selectedId);
    });
    document.querySelectorAll(".collection-item").forEach((item) => {
      const selected = item.dataset.id === state.selectedId;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function updateTimelineSelection(entry) {
    const container = $("timeline-selection");
    const text = $("timeline-selection-text");
    if (!container || !text) {
      return;
    }
    if (!entry) {
      text.textContent = "";
      container.hidden = true;
      return;
    }
    text.textContent = t("selected", { year: entry.year, t: `${entry.work} ${entry.catalogue}` });
    container.hidden = false;
  }

  function renderDetail(entry) {
    if (!entry) {
      setText("detail-work", t("noMatchWork"));
      setText("detail-meta", t("adjustFilters"));
      setText("detail-context", t("noResults"));
      setText("detail-meaning", t("noResults"));
      renderDetailCollections(null);
      renderListening(null);
      const mapLink = $("detail-map-link");
      if (mapLink) {
        mapLink.hidden = true;
      }
      $("detail-source").hidden = true;
      return;
    }

    const localized = localize(entry);
    setText("detail-work", `${localized.work} ${localized.catalogue}`);
    setText("detail-meta", `${entry.year}${t("metaSep")}${formatAge(entry.year)}${t("metaSep")}${entry.city}${t("cityCountrySep")}${entry.country}${t("metaSep")}${entry.genre}`);
    setText("detail-context", localized.context);
    setText("detail-meaning", localized.meaning);
    renderDetailCollections(entry);
    renderListening(localized);
    renderPlace(localized);
    const mapLink = $("detail-map-link");
    if (mapLink) {
      mapLink.hidden = false;
    }
    const source = $("detail-source");
    source.href = localized.source.url;
    source.textContent = t("sourceLink", { label: localized.source.label });
    source.hidden = false;
  }

  function renderDetailCollections(entry) {
    const container = $("detail-collections");
    if (!container) {
      return;
    }

    const collections = getEntryCollections(entry);
    container.replaceChildren();
    if (collections.length === 0) {
      container.hidden = true;
      return;
    }

    for (const collection of collections) {
      const item = document.createElement("a");
      item.className = "detail-collection-link";
      item.href = `#collection-${collection.id}`;
      item.textContent = collectionTitle(collection);
      container.appendChild(item);
    }
    container.hidden = false;
  }

  function renderListening(entry) {
    const container = $("detail-listening");
    const links = $("detail-listening-links");
    const target = $("detail-listening-target");
    const note = $("detail-listening-note");
    if (!container || !links || !entry || !entry.listening) {
      if (links) {
        links.replaceChildren();
      }
      if (target) {
        target.textContent = "";
      }
      if (note) {
        note.textContent = "";
      }
      if (container) {
        container.hidden = true;
      }
      return;
    }

    links.replaceChildren();
    const listeningTargetText = entry.listening.target || `${entry.work} ${entry.catalogue}`;
    if (target) {
      target.textContent = t("listenTarget", { t: listeningTargetText });
    }
    if (note) {
      note.textContent = entry.listening.note || t("listenDefault");
    }

    const actions = [
      ["Bilibili", entry.listening.bilibiliSearch],
      ["YouTube", entry.listening.youtubeSearch],
      ["Apple Music", entry.listening.appleMusic || entry.listening.appleMusicSearch],
      ["Spotify", entry.listening.spotifySearch],
    ].filter((item) => item[1]);

    if (actions.length === 0) {
      container.hidden = true;
      return;
    }

    for (const [label, url] of actions) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = label;
      link.setAttribute("aria-label", t("listenAria", { label, t: listeningTargetText }));
      links.appendChild(link);
    }
    container.hidden = false;
  }

  function placeKey(place) {
    if (!place || typeof place.lat !== "number" || typeof place.lng !== "number") {
      return "";
    }
    // Match on coordinates: the descriptive name can vary between works that
    // sit at the same physical spot (e.g. the Bonn electoral court), so the
    // point itself is the reliable signal of "same place".
    return `${place.lat}|${place.lng}`;
  }

  // Works that share the exact same venue as `entry` (same coordinates).
  function getSameVenueEntries(entry) {
    if (!entry || !entry.place) {
      return [];
    }
    const key = placeKey(entry.place);
    if (!key) {
      return [];
    }
    return state.entries
      .filter((other) => other.id !== entry.id && other.place && placeKey(other.place) === key)
      .sort(byYearThenCity);
  }

  function renderPlaceRelated(entry) {
    const container = $("detail-place-related");
    const text = $("detail-place-related-text");
    const links = $("detail-place-related-links");
    if (!container || !text || !links) {
      return;
    }
    links.innerHTML = "";
    const related = getSameVenueEntries(entry);
    if (related.length === 0) {
      container.hidden = true;
      return;
    }

    text.textContent = t("placeRelatedText", { name: entry.place.name, n: related.length });
    for (const other of related) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "place-related-link";
      button.dataset.id = other.id;
      const label = `${other.work} ${other.catalogue}`;
      button.textContent = t("placeRelatedItem", { t: label, y: other.year });
      button.setAttribute("aria-label", t("placeRelatedAria", { t: label }));
      button.addEventListener("click", () => selectEntry(other.id, false, false));
      links.appendChild(button);
    }
    container.hidden = false;
  }

  function renderPlace(entry) {
    const place = entry && entry.place;
    const container = $("detail-place");
    if (!container || !place) {
      if (container) {
        container.classList.remove("has-image");
        container.hidden = true;
      }
      renderPlaceImage(null);
      renderPlaceRelated(null);
      return;
    }

    setText("detail-place-kind", `${place.kind}${t("metaSep")}${place.certainty}`);
    setText("detail-place-name", place.name);
    setText("detail-place-address", place.address);
    setText("detail-place-note", place.note);
    renderPlaceRelated(entry);
    const source = $("detail-place-source");
    source.href = place.source.url;
    source.textContent = t("placeSource", { label: place.source.label });
    renderPlaceImage(place.image);
    container.classList.toggle("has-image", Boolean(place.image));
    container.hidden = false;
  }

  function renderPlaceImage(image) {
    const figure = $("detail-place-image");
    const img = $("detail-place-image-img");
    const caption = $("detail-place-image-caption");
    const source = $("detail-place-image-source");
    if (!figure || !img || !caption || !source || !image) {
      if (img) {
        img.removeAttribute("src");
        img.alt = "";
        img.hidden = false;
        img.onload = null;
        img.onerror = null;
      }
      if (caption) {
        caption.textContent = "";
      }
      if (source) {
        source.href = "#";
      }
      if (figure) {
        figure.hidden = true;
      }
      return;
    }

    img.alt = image.alt;
    img.hidden = false;
    img.onload = () => {
      img.hidden = false;
      caption.textContent = image.caption;
    };
    img.onerror = () => {
      img.hidden = true;
      caption.textContent = t("imageFail");
    };
    caption.textContent = image.caption;
    source.href = image.sourceUrl;
    source.textContent = t("imageSource", { label: image.sourceLabel });
    img.src = image.url;
    figure.hidden = false;
  }

  function focusEntryOnMap(entry, scrollToMap) {
    const mapElement = $("map");
    if (scrollToMap && mapElement && typeof mapElement.scrollIntoView === "function") {
      mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (state.map) {
      const marker = state.markers.get(entry.id);
      // Inside a cluster the marker may be hidden in a count bubble; ask the
      // plugin to zoom/spiderfy until it is visible, then open its popup.
      if (state.cluster && marker && typeof state.cluster.zoomToShowLayer === "function") {
        state.cluster.zoomToShowLayer(marker, () => marker.openPopup());
        return;
      }
      state.map.setView(getEntryCoordinates(entry), Math.max(state.map.getZoom(), 6), { animate: true });
      if (marker) {
        marker.openPopup();
      }
    }
  }

  function selectEntry(id, focusMap, scrollToDetail) {
    const entry = state.filtered.find((item) => item.id === id) || state.entries.find((item) => item.id === id);
    if (!entry) {
      return;
    }
    state.selectedId = entry.id;
    renderDetail(entry);
    highlightSelected();
    updateTimelineSelection(entry);

    if (scrollToDetail) {
      const detail = $("detail");
      if (detail && typeof detail.scrollIntoView === "function") {
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (focusMap) {
      focusEntryOnMap(entry, false);
    }
  }

  function initDetailActions() {
    const mapLink = $("detail-map-link");
    if (!mapLink) {
      return;
    }
    mapLink.addEventListener("click", () => {
      const entry = state.entries.find((item) => item.id === state.selectedId);
      if (entry) {
        focusEntryOnMap(entry, true);
      }
    });
  }

  function initTimelineActions() {
    const detailLink = $("timeline-detail-link");
    if (!detailLink) {
      return;
    }
    detailLink.addEventListener("click", () => {
      if (state.selectedId) {
        selectEntry(state.selectedId, false, true);
      }
    });
  }

  function applyFilters() {
    state.filtered = filterEntries(state.entries, currentFilters()).sort(byYearThenCity);
    setText("result-count", t("resultCount", { n: state.filtered.length }));
    renderMarkers(state.filtered);
    renderTimeline(state.filtered);
    const stillVisible = state.filtered.some((entry) => entry.id === state.selectedId);
    const nextEntry = stillVisible ? state.filtered.find((entry) => entry.id === state.selectedId) : state.filtered[0];
    state.selectedId = nextEntry ? nextEntry.id : null;
    renderDetail(nextEntry);
    highlightSelected();
    updateTimelineSelection(nextEntry);
  }

  async function init() {
    try {
      initTheme();
      initLang();
      const [entries, overlay] = await Promise.all([loadEntries(), loadEnglishOverlay()]);
      state.entries = entries.sort(byYearThenCity);
      state.enById = new Map((overlay || []).map((item) => [item.id, item]));
      initFilters(state.entries);
      initMap();
      initDetailActions();
      initTimelineActions();
      renderCollections(state.entries);
      renderSources(state.entries);
      applyFilters();
    } catch (error) {
      console.error(error);
      setText("result-count", t("errCount"));
      setText("detail-work", t("errWork"));
      setText("detail-meta", t("errMeta"));
      setText("detail-context", t("errContext"));
      setText("detail-meaning", t("errMeaning"));
      $("map-warning").hidden = false;
    }
  }

  // English overrides for static [data-i18n*] markup, keyed by attribute value.
  const STATIC_EN = {
    "brand": "Beethoven Journey",
    "nav.stages": "Stages",
    "nav.timeline": "Timeline",
    "nav.detail": "Work detail",
    "nav.sources": "Sources",
    "nav.mozart": "Mozart Journey ↗",
    "nav.diary": "Music Diary ↗",
    "nav.moltpany": "Moltpany ↗",
    "hero.eyebrow": "1770–1827 · Bonn · Vienna · signature works",
    "hero.title": "Beethoven's footsteps",
    "hero.copy": "Follow the map and the year-by-year timeline through Beethoven's life — from his Bonn childhood and arrival in Vienna, through deafness, the Heiligenstadt Testament and the guardianship of his nephew Karl, all the way to the Ninth Symphony — and the signature works of each stage.",
    "filters.kicker": "Filter",
    "filters.title": "Explore by city, period and genre",
    "filters.search": "Search",
    "filters.searchPh": "Op. 67 / Symphony / Vienna",
    "filters.city": "City",
    "filters.period": "Period",
    "filters.genre": "Genre",
    "period.all": "All periods",
    "period.bonn": "1770–1792 Bonn & departure",
    "period.early": "1792–1802 early Vienna",
    "period.heroic": "1803–1814 the heroic middle years",
    "period.late": "1815–1827 late period & the Ninth",
    "map.kicker": "Map",
    "map.title": "Footsteps across Europe",
    "map.warning": "The map tiles need a network connection; the timeline and work detail below still read fine.",
    "timeline.kicker": "Timeline",
    "timeline.title": "Years and works",
    "timeline.detailLink": "View work detail",
    "detail.kicker": "Work detail",
    "detail.title": "Select a place or a year",
    "detail.metaDefault": "After you click a map marker or a timeline node, the background and meaning of the work show up here.",
    "detail.contextHead": "Background",
    "detail.meaningHead": "Meaning",
    "detail.context": "Waiting for a selection.",
    "detail.meaning": "Waiting for a selection.",
    "detail.placeSource": "View location source",
    "detail.imageSource": "Image source",
    "detail.mapLink": "Show on the map",
    "detail.source": "View reference source",
    "collections.kicker": "Life stages",
    "collections.title": "Organized by the core stages of a life",
    "sources.kicker": "About the sources",
    "sources.title": "Conservative wording, easy to extend",
    "sources.body": "This first version picks key moments across Beethoven's life; source fields live in the JSON data. For works with uncertain commissions, premieres or interpretations, the page uses cautious wording such as “is generally considered”, “the nickname was added later” and “the specific occasion is uncertain”.",
    "footer.line1": "Static-page prototype · Leaflet + OpenStreetMap · content lives in <code>data/beethoven-journey.json</code>",
    "footer.line2": "Sister project: <a href=\"https://moltpany.github.io/mozart-journey/\">Mozart Journey</a> · music hub: <a href=\"https://moltpany.github.io/music-diary/\">Music Diary</a> · back to <a href=\"https://moltpany.github.io/\">Moltpany</a>",
  };

  window.BeethovenJourney = {
    filterEntries,
    getFilterOptions,
    getEntryCoordinates,
    getAge,
    formatAge,
    getCollectionGroups,
    getEntryCollections,
    applyTheme,
    getInitialTheme,
    toggleTheme,
    loadEntries,
    parsePeriod,
    localize,
    setLang,
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
