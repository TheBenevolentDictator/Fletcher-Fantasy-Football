document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const enterHubBtn = document.getElementById("enter-hub-btn");
  const fsBtn = document.getElementById("fullscreen-btn");
  const fsCloseBtn = document.getElementById("fs-close-btn");
  const frameContainer = document.getElementById("frame-container");
  const deckList = document.getElementById("deck-list");
  const mainFrame = document.getElementById("main-frame");
  const activeTitle = document.getElementById("active-title");
  const openExternal = document.getElementById("open-external");
  const filterBtns = document.querySelectorAll(".filter-btn");

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
  function toggleFullscreen() {
    if (!frameContainer) return;

    if (frameContainer.classList.contains("pseudo-fullscreen")) {
      exitFullscreen();
      return;
    }

    if (frameContainer.requestFullscreen) {
      frameContainer.requestFullscreen().catch(() => enterPseudoFullscreen());
    } else if (frameContainer.webkitRequestFullscreen) {
      frameContainer.webkitRequestFullscreen();
    } else {
      enterPseudoFullscreen();
    }
  }

  function enterPseudoFullscreen() {
    frameContainer.classList.add("pseudo-fullscreen");
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
    if (frameContainer) {
      frameContainer.classList.remove("pseudo-fullscreen");
    }
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
    if (!document.fullscreenElement && frameContainer) {
      frameContainer.classList.remove("pseudo-fullscreen");
      document.body.style.overflow = "";
    }
  });

  // 3. Data & Deck Loading
  let items = [];

  function loadItem(item) {
    if (activeTitle) activeTitle.textContent = item.title;
    if (mainFrame) mainFrame.src = item.src;
    if (openExternal) openExternal.href = item.src;
  }

  function renderList(filteredItems) {
    if (!deckList) return;
    deckList.innerHTML = "";
    filteredItems.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "deck-item" + (index === 0 ? " selected" : "");
      li.innerHTML = `
        <span class="item-type ${item.type}">${item.type.toUpperCase()}</span>
        <span class="item-title">${item.title}</span>
        <span class="item-date">${item.date}</span>
      `;
      li.addEventListener("click", () => {
        document.querySelectorAll(".deck-item").forEach((el) => el.classList.remove("selected"));
        li.classList.add("selected");
        loadItem(item);
      });
      deckList.appendChild(li);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const type = btn.dataset.filter;
      const filtered = type === "all" ? items : items.filter((i) => i.type === type);
      renderList(filtered);
    });
  });

  fetch("content.json")
    .then((res) => {
      if (!res.ok) throw new Error("Manifest could not be loaded");
      return res.json();
    })
    .then((data) => {
      items = data;
      renderList(items);
      if (items.length > 0) {
        loadItem(items[0]);
      }
    })
    .catch((err) => {
      console.error("Data load error:", err);
    });
});
