document.addEventListener("DOMContentLoaded", async () => {
  const deckList = document.getElementById("deck-list");
  const mainFrame = document.getElementById("main-frame");
  const activeTitle = document.getElementById("active-title");
  const openExternal = document.getElementById("open-external");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const fsBtn = document.getElementById("fullscreen-btn");
  const frameContainer = document.querySelector(".frame-container");

  let items = [];

  // Fetch manifest
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

  // Populate sidebar items
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

  // Switch displayed item
  function loadItem(item) {
    activeTitle.textContent = item.title;
    mainFrame.src = item.src;
    openExternal.href = item.src;
  }

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const type = btn.dataset.filter;
      const filtered = type === "all" ? items : items.filter(i => i.type === type);
      renderList(filtered);
    };
  });

  // Fullscreen toggle
  if (fsBtn && frameContainer) {
    fsBtn.addEventListener("click", () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      
      if (!isFullscreen) {
        if (frameContainer.requestFullscreen) {
          frameContainer.requestFullscreen();
        } else if (frameContainer.webkitRequestFullscreen) {
          frameContainer.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });

    // Toggle button text based on state
    const updateFsBtnText = () => {
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      fsBtn.innerHTML = isFs ? "⛶ Exit" : "⛶ Fullscreen";
    };

    document.addEventListener("fullscreenchange", updateFsBtnText);
    document.addEventListener("webkitfullscreenchange", updateFsBtnText);
  }
});
