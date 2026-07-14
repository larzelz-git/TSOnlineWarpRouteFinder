const mapElement = { "ดิน": "earth", "น้ำ": "water", "ลม": "wind", "ไฟ": "fire" };
const oldIconBase = { "ดิน": "assets/earth-icons", "น้ำ": "assets/water-icons", "ลม": "assets/wind-icons", "ไฟ": "assets/fire-icons" };

function parseSkillsFromTSV(tsvText) {
  const text = String(tsvText || "").trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || "").trim(); });
    return obj;
  });
}

const state = {
  list: parseSkillsFromTSV(window.SKILL_TSV).filter((s) => s.Tier !== "ฉายา").sort((a, b) => String(a.ID).localeCompare(String(b.ID))),
  idx: 0,
  selected: "",
  mapping: {},
  allCandidates: []
};

const el = {
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  skipBtn: document.getElementById("skipBtn"),
  filterElement: document.getElementById("filterElement"),
  exportBtn: document.getElementById("exportBtn"),
  copyBtn: document.getElementById("copyBtn"),
  status: document.getElementById("status"),
  skillTitle: document.getElementById("skillTitle"),
  skillMeta: document.getElementById("skillMeta"),
  oldIcon: document.getElementById("oldIcon"),
  pickedName: document.getElementById("pickedName"),
  candBox: document.getElementById("candBox"),
  mappedText: document.getElementById("mappedText"),
  candidateLabel: document.getElementById("candidateLabel")
};

function currentSkill() { return state.list[state.idx]; }

function buildAllCandidates() {
  const out = [];
  const manifest = window.SKILL_ICON_MANIFEST || {};
  for (const folder of Object.keys(manifest)) {
    for (const filename of manifest[folder] || []) {
      out.push({ folder, filename });
    }
  }
  return out;
}

function renderCandidates() {
  const filter = el.filterElement?.value || "all";
  const used = new Set(
    Object.values(state.mapping)
      .filter((v) => v && v !== "__KEEP_OLD__")
  );
  const pool = state.allCandidates.filter((c) => !used.has(`${c.folder}/${c.filename}`));
  const visible = filter === "all" ? pool : pool.filter((c) => c.folder === filter);
  const filterLabel = filter === "all" ? "ทั้งหมด" : filter;
  el.candidateLabel.textContent = `ไอคอนใหม่ (${filterLabel}) ${visible.length}/${pool.length}`;
  el.candBox.innerHTML = visible.map((c) => {
    const key = `${c.folder}/${c.filename}`;
    return `
    <button type="button" class="item ${state.selected === key ? "sel" : ""}" data-name="${key}">
      <img src="assets/Skill/${c.folder}/${c.filename}" alt="${key}" />
      <div>${key}</div>
    </button>
  `;
  }).join("");
  el.candBox.querySelectorAll(".item").forEach((b) => {
    b.addEventListener("click", () => {
      state.selected = b.dataset.name || "";
      const sk = currentSkill();
      if (!sk || !state.selected) return;
      state.mapping[sk.ID] = state.selected;
      el.pickedName.value = state.selected;
      renderMappedList();
      move(1);
    });
  });
}

function renderMappedList() {
  const entries = Object.entries(state.mapping).sort((a, b) => a[0].localeCompare(b[0]));
  el.mappedText.value = entries.length
    ? entries.map(([k, v]) => `${k} -> ${v === "__KEEP_OLD__" ? "(ใช้รูปเดิม)" : v}`).join("\n")
    : "";
}

function render() {
  const sk = currentSkill();
  if (!sk) {
    el.skillTitle.textContent = "ไม่พบข้อมูลสกิล";
    el.skillMeta.textContent = "";
    el.status.textContent = "0/0";
    el.oldIcon.removeAttribute("src");
    el.candBox.innerHTML = "";
    return;
  }
  el.skillTitle.textContent = `[${sk.ID}] ${sk.Name}`;
  el.skillMeta.textContent = `ธาตุ: ${sk.Element}`;
  el.status.textContent = `${state.idx + 1}/${state.list.length}`;
  el.oldIcon.src = `${oldIconBase[sk.Element]}/${sk.ID}.png`;
  state.selected = state.mapping[sk.ID] || "";
  el.pickedName.value = state.selected;
  renderCandidates();
  renderMappedList();
}

function move(step) {
  state.idx = Math.max(0, Math.min(state.list.length - 1, state.idx + step));
  render();
}

el.prevBtn.addEventListener("click", () => move(-1));
el.nextBtn.addEventListener("click", () => move(1));

el.skipBtn.addEventListener("click", () => {
  const sk = currentSkill();
  if (!sk) return;
  state.mapping[sk.ID] = "__KEEP_OLD__";
  renderMappedList();
  move(1);
});

el.filterElement.addEventListener("change", renderCandidates);

el.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.mapping, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "skill-icon-map.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

el.copyBtn.addEventListener("click", async () => {
  const text = JSON.stringify(state.mapping, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    el.copyBtn.textContent = "Copied!";
    setTimeout(() => { el.copyBtn.textContent = "Copy Mapping"; }, 1200);
  } catch (_) {
    const ok = window.prompt("คัดลอกอัตโนมัติไม่สำเร็จ กด Cmd+C แล้ว Enter", text);
    if (ok !== null) {
      el.copyBtn.textContent = "Copied!";
      setTimeout(() => { el.copyBtn.textContent = "Copy Mapping"; }, 1200);
    }
  }
});

state.allCandidates = buildAllCandidates();
render();
