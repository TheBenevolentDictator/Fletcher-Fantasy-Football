document.addEventListener("DOMContentLoaded", async () => {
  const deckList = document.getElementById("deck-list");
  const mainFrame = document.getElementById("main-frame");
  const activeTitle = document.getElementById("active-title");
  const openExternal = document.getElementById("open-external");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let items = [];

  try {
    const res = await fetch("content.json");
    items = await res.json();
    renderList(items);
    if (items.length > 0) loadItem(items[0]);
  } catch (err) {
    console.error("Failed to load content manifest:", err);
  }

  function renderList(filteredItems) {
    deckList.innerHTML = "";
    filteredItems.forEach((item) => {
      const li = document.createElement("li");
      li.className = "deck-item";
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
});
