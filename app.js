document.addEventListener("DOMContentLoaded", async () => {
  const deckList = document.getElementById("deck-list");
  const mainFrame = document.getElementById("main-frame");
  const activeTitle = document.getElementById("active-title");
  const openExternal = document.getElementById("open-external");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const fsBtn = document.getElementById("fullscreen-btn");
  const fsCloseBtn = document.getElementById("fs-close-btn");
  const frameContainer = document.getElementById("frame-container");

  let items = [];

  try {
    const res = await fetch("content.json");
    items = await res.json();
    renderList(items);
    if (items.length > 0) {
      loadItem(items[0]);
    }
  } catch (err) {
    console.error("Failed to load content manifest:", err);
  }

  function renderList(filteredItems) {
    deckList.innerHTML = "";
    filteredItems.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "deck-item" + (index === 0 ? " selected" : "");
      li.innerHTML = `
        <span class="item-type ${item.type}">${item.type.toUpperCase()}</span>
        <span class="item-title">${item.title}</span>
        <span class="item-date">${item.date}</span>
      `;
      li.onclick = () => {
        document.querySelectorAll(".deck-item").forEach(el => el.classList.remove("selected"));
        li.classList.add("selected");
        loadItem(item);
      };
      deckList.appendChild(li);
    });
  }

  function loadItem(item) {
    activeTitle.textContent = item.title;
    mainFrame.src = item.src;
    openExternal.href = item.src;
  }

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const type = btn.dataset.filter;
      const filtered = type === "all" ? items : items.filter(i => i.type === type);
      renderList(filtered);
    };
  });

  function enterFullscreen() {
    if (frameContainer.requestFullscreen) {
      frameContainer.requestFullscreen().catch(() => enterPseudoFullscreen());
    } else if (frameContainer.webkitRequestFullscreen) {
      frameContainer.webkitRequestFullscreen();
    } else {
      enterPseudoFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      exitPseudoFullscreen();
    }
  }

  function enterPseudoFullscreen() {
    frameContainer.classList.add("pseudo-fullscreen");
    document.body.style.overflow = "hidden";
  }

  function exitPseudoFullscreen() {
    frameContainer.classList.remove("pseudo-fullscreen");
    document.body.style.overflow = "";
  }

  if (fsBtn) {
    fsBtn.addEventListener("click", () => enterFullscreen());
  }

  if (fsCloseBtn) {
    fsCloseBtn.addEventListener("click", () => exitFullscreen());
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      exitPseudoFullscreen();
    }
  });

  document.addEventListener("webkitfullscreenchange", () => {
    if (!document.webkitFullscreenElement) {
      exitPseudoFullscreen();
    }
  });
});
