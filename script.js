(function () {
  "use strict";

  const DATA_URL = "data/beethoven-journey.json";
  const BEETHOVEN_BIRTH_YEAR = 1770;
  const THEME_STORAGE_KEY = "beethoven-journey-theme";
  // 收藏分组按贝多芬一生的几个核心阶段组织，每组对应该阶段最具代表性的作品。
  const COLLECTIONS = [
    {
      id: "bonn-youth",
      title: "波恩少年时代",
      description: "1770 年生于波恩，失聪与成名之前的早期作品：宫廷里的键盘少年，与离乡前的第一批大作。",
    },
    {
      id: "arrival-vienna",
      title: "初到维也纳",
      description: "1792 年离开波恩定居维也纳，师从海顿、靠沙龙与出版立足，从《作品第一号》到《月光》。",
    },
    {
      id: "deafness-heiligenstadt",
      title: "失聪与海利根施塔特遗嘱",
      description: "1802 年听力恶化、在海利根施塔特写下遗嘱的转折，以及随之而来的《英雄》。",
    },
    {
      id: "heroic-period",
      title: "英雄年代（中期）",
      description: "走出危机后的英雄风格爆发：贝五、田园、《费德里奥》、小提琴与皇帝协奏曲。",
    },
    {
      id: "immortal-beloved",
      title: "永恒的爱人",
      description: "1812 年波西米亚温泉与那封从未寄出的情书，和同一时期的《第七交响曲》。",
    },
    {
      id: "nephew-karl",
      title: "监护侄子卡尔",
      description: "1815 年兄弟去世后，争夺与抚养侄子卡尔的漫长岁月，笼罩着晚期创作。",
    },
    {
      id: "late-period",
      title: "第九与晚期",
      description: "几近全聋后的晚期巅峰：《第九交响曲》《庄严弥撒》《迪亚贝利变奏》与晚期弦乐四重奏。",
    },
  ];
  const state = {
    entries: [],
    filtered: [],
    selectedId: null,
    map: null,
    markers: new Map(),
  };

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
    return `${getAge(year)} 岁`;
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

  function getStoredTheme() {
    try {
      return window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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
      button.textContent = isDark ? "白天" : "黑夜";
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.setAttribute("aria-label", isDark ? "切换到白天模式" : "切换到黑夜模式");
    }
    if (persist) {
      saveTheme(normalized);
    }
    return normalized;
  }

  function getInitialTheme() {
    const stored = getStoredTheme();
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

  function buildSelect(select, options, allLabel) {
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

  function initFilters(entries) {
    buildSelect($("city-filter"), getFilterOptions(entries, "city"), "全部城市");
    buildSelect($("genre-filter"), getFilterOptions(entries, "genre"), "全部类型");
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
  }

  function renderMarkers(entries) {
    if (!state.map) {
      return;
    }

    state.map.closePopup();
    for (const marker of state.markers.values()) {
      marker.closePopup();
      state.map.removeLayer(marker);
    }
    state.map.closePopup();
    document.querySelectorAll(".leaflet-popup").forEach((popup) => popup.remove());
    state.markers.clear();

    for (const entry of entries) {
      const coords = getEntryCoordinates(entry);
      const placeLine = entry.place ? `<br><span>${entry.place.name}</span>` : "";
      const marker = L.marker(coords).addTo(state.map);
      marker.bindPopup(`
        <strong>${entry.city}, ${entry.year}</strong><br>
        ${entry.work} ${entry.catalogue}${placeLine}
        <br><button type="button" class="popup-detail-link" data-id="${entry.id}" aria-label="查看 ${entry.work} ${entry.catalogue} 的作品详情">查看作品详情</button>
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
      const link = document.createElement("a");
      link.href = entry.source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = `${entry.year} ${entry.city}: ${entry.source.label}`;
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
          <h3>${collection.title}</h3>
          <p>${collection.description}</p>
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
      link.textContent = `${collection.title} (${collection.entries.length})`;
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
    text.textContent = `已选中：${entry.year} · ${entry.work} ${entry.catalogue}`;
    container.hidden = false;
  }

  function renderDetail(entry) {
    if (!entry) {
      setText("detail-work", "没有匹配的足迹");
      setText("detail-meta", "请调整筛选条件。");
      setText("detail-context", "当前筛选没有结果。");
      setText("detail-meaning", "当前筛选没有结果。");
      renderDetailCollections(null);
      renderListening(null);
      const mapLink = $("detail-map-link");
      if (mapLink) {
        mapLink.hidden = true;
      }
      $("detail-source").hidden = true;
      return;
    }

    setText("detail-work", `${entry.work} ${entry.catalogue}`);
    setText("detail-meta", `${entry.year} · ${formatAge(entry.year)} · ${entry.city}, ${entry.country} · ${entry.genre}`);
    setText("detail-context", entry.context);
    setText("detail-meaning", entry.meaning);
    renderDetailCollections(entry);
    renderListening(entry);
    renderPlace(entry.place);
    const mapLink = $("detail-map-link");
    if (mapLink) {
      mapLink.hidden = false;
    }
    const source = $("detail-source");
    source.href = entry.source.url;
    source.textContent = `查看参考来源：${entry.source.label}`;
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
      item.textContent = collection.title;
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
    if (target) {
      target.textContent = `播放目标：${entry.listening.target || `${entry.work} ${entry.catalogue}`}`;
    }
    if (note) {
      note.textContent = entry.listening.note || "听这首作品";
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

    const listeningTargetText = entry.listening.target || `${entry.work} ${entry.catalogue}`;
    for (const [label, url] of actions) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = label;
      link.setAttribute("aria-label", `在 ${label} 试听 ${listeningTargetText}`);
      links.appendChild(link);
    }
    container.hidden = false;
  }

  function renderPlace(place) {
    const container = $("detail-place");
    if (!container || !place) {
      if (container) {
        container.classList.remove("has-image");
        container.hidden = true;
      }
      renderPlaceImage(null);
      return;
    }

    setText("detail-place-kind", `${place.kind} · ${place.certainty}`);
    setText("detail-place-name", place.name);
    setText("detail-place-address", place.address);
    setText("detail-place-note", place.note);
    const source = $("detail-place-source");
    source.href = place.source.url;
    source.textContent = `查看地点来源：${place.source.label}`;
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
      caption.textContent = "地点图片暂时无法加载，可查看图片来源。";
    };
    caption.textContent = image.caption;
    source.href = image.sourceUrl;
    source.textContent = `图片来源：${image.sourceLabel}`;
    img.src = image.url;
    figure.hidden = false;
  }

  function focusEntryOnMap(entry, scrollToMap) {
    const mapElement = $("map");
    if (scrollToMap && mapElement && typeof mapElement.scrollIntoView === "function") {
      mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (state.map) {
      state.map.setView(getEntryCoordinates(entry), Math.max(state.map.getZoom(), 6), { animate: true });
      if (state.markers.has(entry.id)) {
        state.markers.get(entry.id).openPopup();
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
    setText("result-count", `${state.filtered.length} 处足迹`);
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
      state.entries = (await loadEntries()).sort(byYearThenCity);
      initFilters(state.entries);
      initMap();
      initDetailActions();
      initTimelineActions();
      renderCollections(state.entries);
      renderSources(state.entries);
      applyFilters();
    } catch (error) {
      console.error(error);
      setText("result-count", "数据未加载");
      setText("detail-work", "数据加载失败");
      setText("detail-meta", "请通过本地静态服务器打开本页面，例如 python -m http.server 8000。");
      setText("detail-context", "浏览器直接打开 file:// 页面时，可能会禁止读取 data/beethoven-journey.json。");
      setText("detail-meaning", "启动本地服务器后再访问 http://localhost:8000 即可完整查看地图与时间线。");
      $("map-warning").hidden = false;
    }
  }

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
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
