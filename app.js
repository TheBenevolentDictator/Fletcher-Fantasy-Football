document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const splashScreen = document.getElementById("splash-screen");
  const enterHubBtn = document.getElementById("enter-hub-btn");
  const tabDecks = document.getElementById("tab-decks");
  const tabDatavis = document.getElementById("tab-datavis");
  const decksNavPanel = document.getElementById("decks-nav-panel");
  const datavisNavPanel = document.getElementById("datavis-nav-panel");
  const deckList = document.getElementById("deck-list");
  const decksCount = document.getElementById("decks-count");
  const visButtonGrid = document.getElementById("vis-button-grid");
  const mobileVisBar = document.getElementById("mobile-vis-bar");
  const mobileVisTrack = document.getElementById("mobile-vis-track");

  const frameContainer = document.getElementById("frame-container");
  const mainFrame = document.getElementById("main-frame");
  const datavisStage = document.getElementById("datavis-stage");
  const datavisContent = document.getElementById("datavis-content");

  const activeTitle = document.getElementById("active-title");
  const activeSubtitle = document.getElementById("active-subtitle");
  const activeBadge = document.getElementById("active-badge");
  const openExternal = document.getElementById("open-external");
  const fsBtn = document.getElementById("fullscreen-btn");
  const fsCloseBtn = document.getElementById("fs-close-btn");

  // Sheet Sync Modal Elements
  const sheetSyncBtn = document.getElementById("sheet-sync-btn");
  const sheetModal = document.getElementById("sheet-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalSaveBtn = document.getElementById("modal-save-btn");
  const modalClearBtn = document.getElementById("modal-clear-btn");
  const sheetIdInput = document.getElementById("sheet-id-input");
  const syncFeedback = document.getElementById("sync-feedback");
  const sheetStatusIndicator = document.getElementById("sheet-status-indicator");

  // State
  let currentSection = "decks"; // "decks" | "datavis"
  let deckItems = [];
  let selectedDeckIndex = 0;
  let activeVisId = "power-rankings";
  let activeLeagueData = window.FFL_DATA ? window.FFL_DATA.defaultData : null;
  let isGoogleSheetActive = false;

  // 1. Splash Screen Dismissal
  function dismissSplash() {
    if (splashScreen) {
      splashScreen.classList.add("dismissed");
    }
  }

  if (enterHubBtn) enterHubBtn.addEventListener("click", dismissSplash);
  if (splashScreen) {
    splashScreen.addEventListener("click", (e) => {
      if (e.target === splashScreen) dismissSplash();
    });
  }

  // 2. Fullscreen Handlers
  function getActiveContainer() {
    return currentSection === "decks" ? frameContainer : datavisStage;
  }

  function toggleFullscreen() {
    const target = getActiveContainer();
    if (!target) return;

    if (target.classList.contains("pseudo-fullscreen")) {
      exitFullscreen();
      return;
    }

    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => enterPseudoFullscreen(target));
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
    } else {
      enterPseudoFullscreen(target);
    }
  }

  function enterPseudoFullscreen(target) {
    target.classList.add("pseudo-fullscreen");
    document.body.style.overflow = "hidden";
  }

  function exitFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    if (frameContainer) frameContainer.classList.remove("pseudo-fullscreen");
    if (datavisStage) datavisStage.classList.remove("pseudo-fullscreen");
    document.body.style.overflow = "";
  }

  if (fsBtn) {
    fsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  if (fsCloseBtn) {
    fsCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exitFullscreen();
    });
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      if (frameContainer) frameContainer.classList.remove("pseudo-fullscreen");
      if (datavisStage) datavisStage.classList.remove("pseudo-fullscreen");
      document.body.style.overflow = "";
    }
  });

  // 3. Section Switcher: Decks vs Data Vis
  function switchSection(section) {
    currentSection = section;

    if (section === "decks") {
      tabDecks.classList.add("active");
      tabDecks.setAttribute("aria-selected", "true");
      tabDatavis.classList.remove("active");
      tabDatavis.setAttribute("aria-selected", "false");

      decksNavPanel.style.display = "block";
      datavisNavPanel.style.display = "none";
      if (mobileVisBar) mobileVisBar.style.display = "none";

      frameContainer.style.display = "block";
      datavisStage.style.display = "none";

      if (deckItems.length > 0) {
        loadDeck(deckItems[selectedDeckIndex]);
      }
    } else {
      tabDatavis.classList.add("active");
      tabDatavis.setAttribute("aria-selected", "true");
      tabDecks.classList.remove("active");
      tabDecks.setAttribute("aria-selected", "false");

      datavisNavPanel.style.display = "block";
      decksNavPanel.style.display = "none";
      if (mobileVisBar) mobileVisBar.style.display = "block";

      datavisStage.style.display = "block";
      frameContainer.style.display = "none";

      loadVisualization(activeVisId);
    }
  }

  if (tabDecks) {
    tabDecks.addEventListener("click", () => switchSection("decks"));
  }
  if (tabDatavis) {
    tabDatavis.addEventListener("click", () => switchSection("datavis"));
  }

  // 4. Decks Loading & Rendering
  function loadDeck(item) {
    if (!item) return;
    if (activeBadge) activeBadge.textContent = "DECK";
    if (activeTitle) activeTitle.textContent = item.title;
    if (activeSubtitle) activeSubtitle.textContent = `Presentation Briefing • ${item.date || "2026"}`;
    if (mainFrame) mainFrame.src = item.src;
    if (openExternal) {
      openExternal.href = item.src;
      openExternal.style.display = "inline-flex";
    }
  }

  function renderDeckList(items) {
    if (!deckList) return;
    deckList.innerHTML = "";

    if (decksCount) {
      decksCount.textContent = `${items.length} ${items.length === 1 ? 'Deck' : 'Decks'}`;
    }

    if (items.length === 0) {
      deckList.innerHTML = `<li class="deck-empty">No slide decks available yet.</li>`;
      return;
    }

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "deck-item" + (index === selectedDeckIndex ? " selected" : "");
      li.innerHTML = `
        <div class="deck-item-header">
          <span class="item-type slides">SLIDES</span>
          <span class="item-date">${item.date || ""}</span>
        </div>
        <span class="item-title">${item.title}</span>
      `;
      li.addEventListener("click", () => {
        selectedDeckIndex = index;
        document.querySelectorAll(".deck-item").forEach((el) => el.classList.remove("selected"));
        li.classList.add("selected");
        loadDeck(item);
      });
      deckList.appendChild(li);
    });
  }

  // 5. Data Visualizations Button Display & View Loading
  function initDataVisButtons() {
    if (!window.FFL_DATA) return;
    const items = window.FFL_DATA.visItems;

    // A) Populate Sidebar Button Display
    if (visButtonGrid) {
      visButtonGrid.innerHTML = "";
      items.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vis-nav-btn" + (item.id === activeVisId ? " active" : "");
        btn.dataset.visId = item.id;
        btn.innerHTML = `
          <div class="vis-btn-icon">${item.icon}</div>
          <div class="vis-btn-info">
            <div class="vis-btn-title-row">
              <span class="vis-btn-title">${item.title}</span>
              <span class="vis-btn-tag">${item.badge}</span>
            </div>
            <span class="vis-btn-desc">${item.description}</span>
          </div>
        `;
        btn.addEventListener("click", () => {
          loadVisualization(item.id);
        });
        visButtonGrid.appendChild(btn);
      });
    }

    // B) Populate Mobile Horizontal Touch Bar
    if (mobileVisTrack) {
      mobileVisTrack.innerHTML = "";
      items.forEach((item) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "mobile-vis-chip" + (item.id === activeVisId ? " active" : "");
        chip.dataset.visId = item.id;
        chip.innerHTML = `
          <span class="chip-icon">${item.icon}</span>
          <span class="chip-label">${item.shortTitle}</span>
        `;
        chip.addEventListener("click", () => {
          loadVisualization(item.id);
          chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
        mobileVisTrack.appendChild(chip);
      });
    }
  }

  const liveTabCache = {};

  async function loadVisualization(visId) {
    activeVisId = visId;
    if (!window.FFL_DATA) return;

    const visMeta = window.FFL_DATA.visItems.find((i) => i.id === visId);
    if (!visMeta) return;

    // Update Header
    if (activeBadge) activeBadge.textContent = "DATA VIS";
    if (activeTitle) activeTitle.textContent = `${visMeta.icon} ${visMeta.title}`;
    if (activeSubtitle) activeSubtitle.textContent = visMeta.description;

    const savedSheetId = localStorage.getItem("ffl_sheet_id") || (window.FFL_DATA && window.FFL_DATA.config ? window.FFL_DATA.config.sheetId : "");

    // Update External Link
    if (openExternal) {
      if (savedSheetId) {
        if (savedSheetId.startsWith("2PACX-")) {
          openExternal.href = `https://docs.google.com/spreadsheets/d/e/${savedSheetId}/pubhtml`;
        } else {
          openExternal.href = `https://docs.google.com/spreadsheets/d/${savedSheetId}`;
        }
        openExternal.textContent = "Open Google Sheet ↗";
      } else {
        openExternal.href = "#";
        openExternal.textContent = "Interactive View ↗";
      }
    }

    // Update Active Buttons in Sidebar & Mobile Bar
    document.querySelectorAll(".vis-nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.visId === visId);
    });
    document.querySelectorAll(".mobile-vis-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.visId === visId);
    });

    const tabKeyMap = {
      "power-rankings": "powerRankings",
      "weekly-points": "weeklyPoints",
      "weekly-ranks": "weeklyRanks",
      "expected-record": "expectedRecord",
      "heatmap": "heatmap",
      "strength-of-schedule": "strengthOfSchedule"
    };

    const tabKey = tabKeyMap[visId];
    const tabName = window.FFL_DATA.config.tabNames[tabKey];

    // If Google Sheet is connected, try to render live data
    if (savedSheetId && tabName) {
      if (liveTabCache[tabName]) {
        if (datavisContent) {
          datavisContent.innerHTML = window.FFL_DATA.renderLiveSheetTab(liveTabCache[tabName], visId, tabName);
        }
        return;
      }

      if (datavisContent) {
        datavisContent.innerHTML = `
          <div class="vis-view-wrapper">
            <p class="muted-stat" style="padding: 2.5rem; text-align: center;">
              ⏳ Fetching live data from tab <b>"${tabName}"</b>...
            </p>
          </div>
        `;
      }

      try {
        const rows = await window.FFL_DATA.fetchTab(savedSheetId, tabName, visId);
        if (rows && rows.length > 1) {
          liveTabCache[tabName] = rows;
          if (activeVisId === visId && datavisContent) {
            datavisContent.innerHTML = window.FFL_DATA.renderLiveSheetTab(rows, visId, tabName);
          }
          return;
        }
      } catch (err) {
        console.warn(`Could not fetch live tab "${tabName}":`, err);
      }
    }

    // Default Fallback
    const renderer = window.FFL_DATA.renderers[visId];
    if (renderer && datavisContent) {
      datavisContent.innerHTML = renderer(activeLeagueData);
    }
  }

  // 6. Google Sheet Connection & Synchronization
  function extractSheetId(input) {
    if (!input) return "";
    const trimmed = input.trim();
    // Check if it's a published 2PACX URL: /spreadsheets/d/e/(2PACX-[a-zA-Z0-9-_]+)
    const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (pubMatch && pubMatch[1]) {
      return pubMatch[1];
    }
    // Check if it's a standard Google Sheet URL: /spreadsheets/d/([a-zA-Z0-9-_]+)
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  }

  function updateSheetIndicator() {
    const savedId = localStorage.getItem("ffl_sheet_id") || (window.FFL_DATA && window.FFL_DATA.config ? window.FFL_DATA.config.sheetId : "");
    if (sheetStatusIndicator) {
      if (savedId) {
        sheetStatusIndicator.textContent = "Sheet Synced";
        sheetStatusIndicator.classList.add("synced");
      } else {
        sheetStatusIndicator.textContent = "Default Data";
        sheetStatusIndicator.classList.remove("synced");
      }
    }
    if (sheetIdInput && savedId) {
      sheetIdInput.value = savedId;
    }
  }

  async function syncGoogleSheet(sheetId) {
    // Clear live cache on sync
    Object.keys(liveTabCache).forEach(k => delete liveTabCache[k]);

    if (!sheetId) {
      activeLeagueData = window.FFL_DATA.defaultData;
      isGoogleSheetActive = false;
      updateSheetIndicator();
      if (currentSection === "datavis") loadVisualization(activeVisId);
      return;
    }

    if (syncFeedback) {
      syncFeedback.style.display = "block";
      syncFeedback.className = "sync-feedback loading";
      syncFeedback.textContent = "Testing connection to Google Sheet...";
    }

    try {
      // Test fetching the first tab ("MASTER")
      const tabName = window.FFL_DATA.config.tabNames.powerRankings || "MASTER";
      const rows = await window.FFL_DATA.fetchTab(sheetId, tabName, "power-rankings");

      if (rows && rows.length > 1) {
        localStorage.setItem("ffl_sheet_id", sheetId);
        liveTabCache[tabName] = rows;
        isGoogleSheetActive = true;
        updateSheetIndicator();

        if (syncFeedback) {
          syncFeedback.className = "sync-feedback success";
          syncFeedback.textContent = `✓ Successfully connected to Google Sheet! Tab "${tabName}" found with ${rows.length - 1} rows.`;
        }

        setTimeout(() => {
          if (sheetModal) sheetModal.style.display = "none";
          if (currentSection === "datavis") loadVisualization(activeVisId);
        }, 1200);
      } else {
        throw new Error("No data rows found in the sheet.");
      }
    } catch (err) {
      console.warn("Google Sheet sync error:", err);
      if (syncFeedback) {
        syncFeedback.className = "sync-feedback error";
        syncFeedback.innerHTML = `
          ⚠️ Could not access Google Sheet. Please verify:
          <br>1. You published the sheet via <b>File &gt; Share &gt; Publish to web</b>.
          <br>2. General sharing is set to <b>"Anyone with the link can view"</b>.
          <br>3. Primary tab name is <b>"${window.FFL_DATA.config.tabNames.powerRankings}"</b>.
        `;
      }
    }
  }

  // Modal Handlers
  if (sheetSyncBtn) {
    sheetSyncBtn.addEventListener("click", () => {
      if (sheetModal) {
        sheetModal.style.display = "flex";
        if (syncFeedback) syncFeedback.style.display = "none";
        const savedId = localStorage.getItem("ffl_sheet_id");
        if (sheetIdInput) sheetIdInput.value = savedId || "";
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      if (sheetModal) sheetModal.style.display = "none";
    });
  }

  if (sheetModal) {
    sheetModal.addEventListener("click", (e) => {
      if (e.target === sheetModal) sheetModal.style.display = "none";
    });
  }

  if (modalSaveBtn) {
    modalSaveBtn.addEventListener("click", () => {
      const rawVal = sheetIdInput ? sheetIdInput.value : "";
      const cleanedId = extractSheetId(rawVal);
      if (cleanedId) {
        syncGoogleSheet(cleanedId);
      } else {
        if (syncFeedback) {
          syncFeedback.style.display = "block";
          syncFeedback.className = "sync-feedback error";
          syncFeedback.textContent = "Please enter a valid Google Sheet ID or URL.";
        }
      }
    });
  }

  if (modalClearBtn) {
    modalClearBtn.addEventListener("click", () => {
      localStorage.removeItem("ffl_sheet_id");
      if (sheetIdInput) sheetIdInput.value = "";
      syncGoogleSheet("");
      if (syncFeedback) {
        syncFeedback.style.display = "block";
        syncFeedback.className = "sync-feedback info";
        syncFeedback.textContent = "Reset to high-fidelity default league data.";
      }
      setTimeout(() => {
        if (sheetModal) sheetModal.style.display = "none";
      }, 900);
    });
  }

  // 7. Initial Data Fetch & Boot
  initDataVisButtons();
  updateSheetIndicator();

  // Load Content Manifest (PPTs strictly under Decks)
  fetch("content.json")
    .then((res) => {
      if (!res.ok) throw new Error("Manifest could not be loaded");
      return res.json();
    })
    .then((data) => {
      // PPT slide decks strictly belong in "slides"
      deckItems = data.filter((item) => item.type === "slides" || !item.type);
      renderDeckList(deckItems);

      // Start on Decks section
      switchSection("decks");
    })
    .catch((err) => {
      console.error("Manifest load error:", err);
      // Fallback deck item if content.json fails
      deckItems = [
        {
          id: "week-1-chart-party",
          title: "Week 1 Chart Party",
          date: "2026-09-18",
          type: "slides",
          src: "https://docs.google.com/presentation/d/e/2PACX-1vQfTOFXlRfpPiTGprTJd4ayKUmSTHqthm9DExTKxh6yUtB4s0YT72vUZD13cnNPEbKbRv0xGnO5tgLM/embed?start=true&loop=false&delayms=60000"
        }
      ];
      renderDeckList(deckItems);
      switchSection("decks");
    });
});
