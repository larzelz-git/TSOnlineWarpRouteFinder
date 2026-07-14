const routeForm = document.getElementById("routeForm");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const swapBtn = document.getElementById("swapBtn");
const fileInput = document.getElementById("fileInput");
const edgeCount = document.getElementById("edgeCount");
const nodeCount = document.getElementById("nodeCount");
const dataSource = document.getElementById("dataSource");
const resultTitle = document.getElementById("resultTitle");
const hopBadge = document.getElementById("hopBadge");
const resultMessage = document.getElementById("resultMessage");
const pathSummary = document.getElementById("pathSummary");
const pathOutput = document.getElementById("pathOutput");
const rawTabBtn = document.getElementById("rawTabBtn");
const portalTabBtn = document.getElementById("portalTabBtn");
const sampleButtons = document.querySelectorAll("[data-sample-start]");

const state = {
  rawText: typeof window.DOOR_DATA === "string" ? window.DOOR_DATA : "",
  edges: [],
  adjacency: new Map(),
  nodes: new Set(),
  activeResultTab: "raw",
  lastPath: []
};

function parseDoorData(rawText) {
  const edges = [];
  const adjacency = new Map();
  const nodes = new Set();

  for (const line of rawText.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/).filter(Boolean);

    if (parts.length < 3) continue;
    if (!parts.slice(0, 3).every((value) => /^\d+$/.test(value))) continue;

    const [from, doorId, to] = parts;
    const edge = { from, doorId, to };

    edges.push(edge);
    nodes.add(from);
    nodes.add(to);

    if (!adjacency.has(from)) {
      adjacency.set(from, []);
    }

    adjacency.get(from).push(edge);
  }

  return { edges, adjacency, nodes };
}

function hydrateGraph(rawText, sourceLabel) {
  const graph = parseDoorData(rawText);
  state.rawText = rawText;
  state.edges = graph.edges;
  state.adjacency = graph.adjacency;
  state.nodes = graph.nodes;

  edgeCount.textContent = graph.edges.length.toLocaleString("en-US");
  nodeCount.textContent = graph.nodes.size.toLocaleString("en-US");
  dataSource.textContent = sourceLabel;
}

function findShortestPath(start, end) {
  if (!state.nodes.has(start)) {
    return { error: `ไม่พบ ID ต้นทาง ${start} ในข้อมูล` };
  }

  if (!state.nodes.has(end)) {
    return { error: `ไม่พบ ID ปลายทาง ${end} ในข้อมูล` };
  }

  if (start === end) {
    return { path: [], summary: `${start} คือแผนที่เดียวกันอยู่แล้ว` };
  }

  const queue = [start];
  const previous = new Map([[start, null]]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === end) break;

    for (const edge of state.adjacency.get(current) || []) {
      if (previous.has(edge.to)) continue;
      previous.set(edge.to, edge);
      queue.push(edge.to);
    }
  }

  if (!previous.has(end)) {
    return { error: `หาเส้นทางจาก ${start} ไป ${end} ไม่เจอ` };
  }

  const path = [];
  let cursor = end;

  while (previous.get(cursor) !== null) {
    const edge = previous.get(cursor);
    path.push(edge);
    cursor = edge.from;
  }

  path.reverse();

  return {
    path,
    summary: [start, ...path.map((edge) => edge.to)].join(" → ")
  };
}

function formatRawPath(path) {
  if (path.length === 0) return "";
  return path.map((edge) => `${edge.from} ${edge.doorId} ${edge.to}`).join("\n");
}

function formatWarpPortalPath(path) {
  if (path.length === 0) return "";
  return path.map((edge) => `0  WarpPortal  ${edge.doorId}`).join("\n");
}

function updateResultTabs() {
  const isRaw = state.activeResultTab === "raw";
  rawTabBtn.classList.toggle("is-active", isRaw);
  rawTabBtn.setAttribute("aria-selected", String(isRaw));
  portalTabBtn.classList.toggle("is-active", !isRaw);
  portalTabBtn.setAttribute("aria-selected", String(!isRaw));
}

function updatePathOutput() {
  const formatter = state.activeResultTab === "raw" ? formatRawPath : formatWarpPortalPath;
  pathOutput.textContent = formatter(state.lastPath);
}

function renderResult(start, end) {
  const result = findShortestPath(start, end);

  resultTitle.textContent = `${start} → ${end}`;

  if (result.error) {
    hopBadge.textContent = "0 hops";
    resultMessage.textContent = result.error;
    pathSummary.classList.add("is-hidden");
    pathSummary.textContent = "";
    state.lastPath = [];
    pathOutput.textContent = "";
    pathOutput.classList.add("is-error");
    return;
  }

  state.lastPath = result.path;
  hopBadge.textContent = `${result.path.length} hops`;
  resultMessage.textContent = "เส้นทางสั้นที่สุดจากข้อมูลปัจจุบัน";
  pathSummary.textContent = result.summary;
  pathSummary.classList.remove("is-hidden");
  pathOutput.classList.remove("is-error");

  if (result.path.length === 0) {
    pathOutput.textContent = `${start}`;
    return;
  }

  updatePathOutput();
}

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const start = startInput.value.trim();
  const end = endInput.value.trim();

  if (!start || !end) {
    resultTitle.textContent = "กรอกข้อมูลไม่ครบ";
    resultMessage.textContent = "กรุณาใส่ ID Map ต้นทางและปลายทาง";
    pathSummary.classList.add("is-hidden");
    state.lastPath = [];
    pathOutput.textContent = "";
    pathOutput.classList.add("is-error");
    return;
  }

  renderResult(start, end);
});

swapBtn.addEventListener("click", () => {
  const nextStart = endInput.value;
  endInput.value = startInput.value;
  startInput.value = nextStart;
});

fileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;

  const rawText = await file.text();
  hydrateGraph(rawText, file.name);
  resultTitle.textContent = "โหลดข้อมูลใหม่แล้ว";
  resultMessage.textContent = "พร้อมค้นหาเส้นทางจากไฟล์ที่อัปโหลด";
  pathSummary.classList.add("is-hidden");
  state.lastPath = [];
  pathOutput.textContent = "";
  pathOutput.classList.remove("is-error");
});

rawTabBtn.addEventListener("click", () => {
  state.activeResultTab = "raw";
  updateResultTabs();
  updatePathOutput();
});

portalTabBtn.addEventListener("click", () => {
  state.activeResultTab = "portal";
  updateResultTabs();
  updatePathOutput();
});

for (const button of sampleButtons) {
  button.addEventListener("click", () => {
    startInput.value = button.dataset.sampleStart || "";
    endInput.value = button.dataset.sampleEnd || "";
    renderResult(startInput.value, endInput.value);
  });
}

hydrateGraph(state.rawText, "door.ini เริ่มต้น");
updateResultTabs();
startInput.value = "12000";
endInput.value = "12825";
renderResult("12000", "12825");
