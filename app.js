const mainElementSelect = document.getElementById("mainElementSelect");
const resetBtn = document.getElementById("resetBtn");
const tabBar = document.getElementById("tabBar");
const treeView = document.getElementById("treeView");
const summary = document.getElementById("summary");
const selectedList = document.getElementById("selectedList");
const summaryPanel = summary?.closest(".panel");
const POINT_LIMIT = 331;
const EARTH_ICON_BASE = "assets/earth-icons";
const WATER_ICON_BASE = "assets/water-icons";
const WIND_ICON_BASE = "assets/wind-icons";
const FIRE_ICON_BASE = "assets/fire-icons";
const TITLE_ICON_BASE = "assets/title-icons";

const ELEMENTS = ["ดิน", "น้ำ", "ลม", "ไฟ"];
const TITLE_KEY = "ฉายา";
const TABS = [...ELEMENTS, TITLE_KEY];
const CANVAS_W = 980;
const CANVAS_H = 920;
const FIRE_CANVAS_W = 980;
const FIRE_CANVAS_H = 920;
const NODE_W = 51;
const NODE_H = 51;
const NODE_TOP_OFFSET = -100;
const GRID_MARGIN = 24;

const FIRE_FIXED_GRID = {
  "12001": "k1",
  "12002": "o2",
  "12003": "g2",
  "12004": "p3",
  "12005": "n3",
  "12006": "f3",
  "12007": "q4",
  "12008": "m4",
  "12009": "e4",
  "12010": "q5",
  "12011": "m5",
  "12012": "f5",
  "12013": "p6",
  "12014": "n6",
  "12015": "g6",
  "12020": "ab1",
  "12021": "ad2",
  "12022": "ad4",
  "12023": "z2",
  "12024": "ad3",
  "12025": "z4",
  "12026": "z3",
  "12027": "c3",
  "12028": "k5",
  "12029": "r3",
  "12030": "r6",
  "12031": "g7",
  "12032": "n7",
  "12033": "ad5",
  "12034": "x3"
};

const EARTH_FIXED_GRID = {
  "10001": "m1",
  "10002": "p2",
  "10003": "j2",
  "10004": "r3",
  "10005": "f3",
  "10006": "t4",
  "10007": "i4",
  "10008": "e4",
  "10009": "v5",
  "10010": "r5",
  "10011": "j5",
  "10012": "f5",
  "10013": "d5",
  "10014": "s6",
  "10015": "q6",
  "10020": "ab1",
  "10021": "ad2",
  "10022": "z2",
  "10023": "z4",
  "10024": "z3",
  "10025": "ad3",
  "10026": "ad4",
  "10027": "j6",
  "10028": "af2",
  "10029": "c3",
  "10030": "a4",
  "10031": "q7",
  "10032": "d6",
  "10033": "af3",
  "10034": "x3"
};

const WATER_FIXED_GRID = {
  "11001": "k1",
  "11002": "n2",
  "11003": "f2",
  "11004": "p3",
  "11005": "d3",
  "11006": "r4",
  "11007": "l4",
  "11008": "b4",
  "11009": "t5",
  "11010": "j5",
  "11011": "d5",
  "11012": "p6",
  "11013": "n6",
  "11014": "e6",
  "11015": "c6",
  "11020": "ab1",
  "11021": "z2",
  "11022": "z3",
  "11023": "z4",
  "11024": "ad2",
  "11025": "ad3",
  "11026": "ad4",
  "11027": "d7",
  "11028": "f7",
  "11029": "v5",
  "11030": "j6",
  "11031": "af3",
  "11032": "af2",
  "11033": "x3",
  "11034": "x4"
};

const WIND_FIXED_GRID = {
  "13001": "i1",
  "13002": "l2",
  "13003": "f2",
  "13004": "n3",
  "13005": "d3",
  "13006": "p4",
  "13007": "l4",
  "13008": "d4",
  "13009": "r5",
  "13010": "k5",
  "13011": "e5",
  "13012": "c5",
  "13013": "k6",
  "13014": "d6",
  "13019": "ab1",
  "13020": "ad3",
  "13021": "ad2",
  "13022": "z2",
  "13023": "z4",
  "13024": "z3",
  "13025": "ad4",
  "13026": "r6",
  "13027": "p5",
  "13028": "r3",
  "13029": "x3",
  "13030": "d7",
  "13031": "z5",
  "13032": "b3",
  "13033": "k7"
};

const TITLE_FIXED_GRID = {
  "99001": "m6",
  "99002": "m4",
  "99003": "o6",
  "99004": "m8",
  "99005": "k6",
  "99006": "u6",
  "99007": "u4",
  "99008": "w6",
  "99009": "u8",
  "99010": "s6",
  "99011": "m12",
  "99012": "m10",
  "99013": "o12",
  "99014": "m14",
  "99015": "k12",
  "99016": "u12",
  "99017": "u10",
  "99018": "w12",
  "99019": "u14",
  "99020": "s12"
};


const FALLBACK_TSV = `ID\tName\tPoint\tRule\tPre1\tPre2\tPre3\tPre4\tPre5\tPre6\tMax\tElement\tTier
10001\tศิลาร่วง\t1\tAND\t-\t\t\t\t\t\t10\tดิน\t0
11001\tน้ำโถมท่วม\t1\tAND\t-\t\t\t\t\t\t10\tน้ำ\t0
12001\tวิชาไฟเพลิง\t1\tAND\t-\t\t\t\t\t\t10\tไฟ\t0
13001\tลมพายุโจมตี\t1\tAND\t-\t\t\t\t\t\t10\tลม\t0`;

const state = {
  skills: [],
  levels: new Map(),
  mainElement: "ดิน",
  activeTab: "ดิน",
  currentByGroup: new Map()
};

let skillTooltipEl = null;

function ensureSkillTooltip() {
  if (skillTooltipEl) return skillTooltipEl;
  const el = document.createElement("div");
  el.className = "skill-tooltip";
  el.setAttribute("role", "tooltip");
  document.body.append(el);
  skillTooltipEl = el;
  return el;
}

function showSkillTooltip(text, x, y) {
  const el = ensureSkillTooltip();
  el.textContent = text;
  el.classList.add("show");
  moveSkillTooltip(x, y);
}

function moveSkillTooltip(x, y) {
  const el = ensureSkillTooltip();
  el.style.left = `${x + 12}px`;
  el.style.top = `${y + 14}px`;
}

function hideSkillTooltip() {
  if (!skillTooltipEl) return;
  skillTooltipEl.classList.remove("show");
}

function normName(name) {
  return (name || "")
    .replace(/^วิชา/, "")
    .replace(/\s+/g, "")
    .replace("ปิศาจ", "ปีศาจ")
    .replace("รักษาบาดเจ็บ", "รักษาการบาดเจ็บ")
    .replace("ห้าอัสนี", "ห้าอสนี")
    .trim();
}

function parseTSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const [head, ...rows] = lines;
  const headers = head.split("\t");
  const preCols = ["Pre1", "Pre2", "Pre3", "Pre4", "Pre5", "Pre6"];

  return rows.map((line) => {
    const cols = line.split("\t");
    const obj = Object.fromEntries(headers.map((h, i) => [h, (cols[i] || "").trim()]));
    return {
      id: obj.ID,
      name: obj.Name,
      point: Number(obj.Point) || 0,
      rule: (obj.Rule || "AND").toUpperCase(),
      preNames: preCols.map((k) => obj[k]).filter((x) => x && x !== "-"),
      max: Number(obj.Max) || 1,
      element: obj.Element,
      tier: String(obj.Tier)
    };
  });
}

function findByName(name, candidates) {
  const key = normName(name);
  return candidates.find((s) => normName(s.name) === key);
}

function getLevel(id) { return state.levels.get(id) || 0; }

function isBlockedByElementRule(targetElement) {
  const pairBlock = { "ไฟ": "ดิน", "ดิน": "ไฟ", "ลม": "น้ำ", "น้ำ": "ลม" };
  return pairBlock[state.mainElement] === targetElement;
}

function buildTrees() {
  state.currentByGroup.clear();

  for (const element of ELEMENTS) {
    const skills = state.skills
      .filter((s) => s.element === element && s.tier !== "ฉายา")
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((s) => ({ ...s, pres: [], children: [] }));

    for (const skill of skills) {
      skill.pres = skill.preNames.map((n) => findByName(n, skills)).filter(Boolean).map((s) => s.id);
    }

    const byId = new Map(skills.map((s) => [s.id, s]));
    for (const skill of skills) {
      for (const pid of skill.pres) {
        const p = byId.get(pid);
        if (p) p.children.push(skill.id);
      }
    }
    state.currentByGroup.set(element, skills);
  }

  const titleSkills = state.skills
    .filter((s) => s.tier === "ฉายา")
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => ({ ...s, pres: [], children: [] }));

  for (const skill of titleSkills) {
    skill.pres = skill.preNames.map((n) => findByName(n, titleSkills)).filter(Boolean).map((s) => s.id);
  }

  const byId = new Map(titleSkills.map((s) => [s.id, s]));
  for (const skill of titleSkills) {
    for (const pid of skill.pres) {
      const p = byId.get(pid);
      if (p) p.children.push(skill.id);
    }
  }

  state.currentByGroup.set(TITLE_KEY, titleSkills);
}

function canLearn(skill) {
  if (ELEMENTS.includes(skill.element) && isBlockedByElementRule(skill.element)) return false;
  if (!skill.pres.length) return true;
  const checks = skill.pres.map((pid) => getLevel(pid) > 0);
  return skill.rule === "OR" ? checks.some(Boolean) : checks.every(Boolean);
}

function canDecrease(skill) {
  const lv = getLevel(skill.id);
  if (lv <= 0) return false;
  if (lv >= 2) return true;
  return !skill.children.some((cid) => getLevel(cid) > 0);
}

function getSkillById(id) {
  for (const skills of state.currentByGroup.values()) {
    const found = skills.find((s) => s.id === id);
    if (found) return found;
  }
  return null;
}

function autoPrepareSkill(skill, visiting = new Set()) {
  if (!skill) return false;
  if (canLearn(skill)) return true;
  if (visiting.has(skill.id)) return false;
  visiting.add(skill.id);

  if (!skill.pres.length) {
    visiting.delete(skill.id);
    return canLearn(skill);
  }

  if (skill.rule === "OR") {
    const existing = skill.pres.some((pid) => getLevel(pid) > 0);
    if (!existing) {
      let ok = false;
      for (const pid of skill.pres) {
        const pre = getSkillById(pid);
        if (ensureLevelOne(pre, visiting)) {
          ok = true;
          break;
        }
      }
      if (!ok) {
        visiting.delete(skill.id);
        return false;
      }
    }
  } else {
    for (const pid of skill.pres) {
      const pre = getSkillById(pid);
      if (!ensureLevelOne(pre, visiting)) {
        visiting.delete(skill.id);
        return false;
      }
    }
  }

  visiting.delete(skill.id);
  return canLearn(skill);
}

function ensureLevelOne(skill, visiting = new Set()) {
  if (!skill) return false;
  if (getLevel(skill.id) > 0) return true;
  if (!canLearn(skill) && !autoPrepareSkill(skill, visiting)) return false;
  if (!canLearn(skill)) return false;
  state.levels.set(skill.id, 1);
  return true;
}

function tryAutoUnlockForClick(skill) {
  const snapshot = new Map(state.levels);
  if (autoPrepareSkill(skill) && canLearn(skill)) return true;
  state.levels = snapshot;
  return false;
}

function costAtLevel(skill, level) {
  if (level <= 0) return 0;
  if (level >= 2) return 1;
  if (!ELEMENTS.includes(skill.element)) return skill.point;
  return skill.element !== state.mainElement ? skill.point * 2 : skill.point;
}

function totalSkillCost(skill, level) {
  let sum = 0;
  for (let lv = 1; lv <= level; lv++) sum += costAtLevel(skill, lv);
  return sum;
}

function totalPoints() {
  let sum = 0;
  for (const skills of state.currentByGroup.values()) {
    for (const s of skills) sum += totalSkillCost(s, getLevel(s.id));
  }
  return sum;
}

function titlePlusPositions(skills) {
  const positions = new Map();
  const roots = skills.filter((s) => s.pres.length === 0);
  const groups = roots.length ? roots : skills.slice(0, 4);

  const baseX = 130;
  const spacing = 210;
  const centerY = 210;

  groups.forEach((root, i) => {
    const cx = baseX + i * spacing;
    positions.set(root.id, { x: cx, y: centerY });

    const children = skills.filter((s) => s.pres.includes(root.id));
    const dirs = [
      { x: 0, y: -95 },
      { x: 0, y: 95 },
      { x: -95, y: 0 },
      { x: 95, y: 0 }
    ];

    children.slice(0, 4).forEach((c, idx) => {
      positions.set(c.id, { x: cx + dirs[idx].x, y: centerY + dirs[idx].y });
    });
  });

  let fallback = 0;
  for (const s of skills) {
    if (!positions.has(s.id)) {
      positions.set(s.id, { x: 80 + (fallback % 10) * 88, y: 40 + Math.floor(fallback / 10) * 72 });
      fallback += 1;
    }
  }

  return positions;
}

function computeDepthMap(list) {
  const byId = new Map(list.map((s) => [s.id, s]));
  const memo = new Map();
  function depth(id, seen = new Set()) {
    if (memo.has(id)) return memo.get(id);
    if (seen.has(id)) return 0;
    seen.add(id);
    const s = byId.get(id);
    if (!s || !s.pres.length) return 0;
    const d = Math.max(...s.pres.map((pid) => depth(pid, new Set(seen)))) + 1;
    memo.set(id, d);
    return d;
  }
  for (const s of list) depth(s.id);
  return memo;
}

function alphaToIndex(alpha) {
  let n = 0;
  const s = alpha.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 96);
  }
  return n - 1;
}

function parseGridToken(token) {
  const m = /^([a-zA-Z]+)(\d+)$/.exec(token || "");
  if (!m) return null;
  return { col: alphaToIndex(m[1]), row: Number(m[2]) - 1 };
}

function fixedGridToCanvasPositions(skills, fixedGrid, canvasW, canvasH, yScale = 1) {
  const entries = [];
  for (const s of skills) {
    const t = parseGridToken(fixedGrid[s.id]);
    if (!t) continue;
    entries.push({ id: s.id, col: t.col, row: t.row });
  }
  if (!entries.length) return new Map();

  const minCol = Math.min(...entries.map((e) => e.col));
  const maxCol = Math.max(...entries.map((e) => e.col));
  const minRow = Math.min(...entries.map((e) => e.row));
  const maxRow = Math.max(...entries.map((e) => e.row));
  const spanCol = Math.max(1, maxCol - minCol);
  const spanRow = Math.max(1, maxRow - minRow);

  const stepX = (canvasW - GRID_MARGIN * 2 - NODE_W) / spanCol;
  const rawStepY = (canvasH - GRID_MARGIN * 2 - NODE_H) / spanRow;
  const stepY = rawStepY * yScale;
  const usedHeight = spanRow * stepY + NODE_H;
  const baseY = 10;

  const map = new Map();
  for (const e of entries) {
    map.set(e.id, {
      x: GRID_MARGIN + (e.col - minCol) * stepX,
      y: baseY + (e.row - minRow) * stepY
    });
  }
  return map;
}

function fitPositionsToCanvas(positions, canvasW, canvasH) {
  const vals = [...positions.values()];
  if (!vals.length) return positions;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of vals) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const margin = 24;
  const contentW = (maxX - minX) + NODE_W;
  const contentH = (maxY - minY) + NODE_H;
  const availW = Math.max(1, canvasW - margin * 2);
  const availH = Math.max(1, canvasH - margin * 2);
  const scale = Math.min(availW / contentW, availH / contentH);

  const fitted = new Map();
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const offsetX = (canvasW - scaledW) / 2;
  const offsetY = (canvasH - scaledH) / 2;

  for (const [id, p] of positions.entries()) {
    fitted.set(id, {
      x: offsetX + (p.x - minX) * scale,
      y: offsetY + (p.y - minY) * scale
    });
  }
  return fitted;
}

function balanceTitleAxisSpacing(positions, skills) {
  const byId = new Map(skills.map((s) => [s.id, s]));
  let hSum = 0;
  let hCount = 0;
  let vSum = 0;
  let vCount = 0;

  for (const skill of skills) {
    const to = positions.get(skill.id);
    if (!to) continue;
    for (const pid of skill.pres) {
      const fromSkill = byId.get(pid);
      const from = positions.get(fromSkill?.id);
      if (!from) continue;
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      if (dx >= dy) {
        hSum += dx;
        hCount += 1;
      } else {
        vSum += dy;
        vCount += 1;
      }
    }
  }

  if (!hCount || !vCount) return positions;
  const avgH = hSum / hCount;
  const avgV = vSum / vCount;
  if (!avgV) return positions;

  const factor = avgH / avgV;
  const vals = [...positions.values()];
  const centerY = vals.reduce((sum, p) => sum + p.y, 0) / vals.length;
  const out = new Map();
  for (const [id, p] of positions.entries()) {
    out.set(id, { x: p.x, y: centerY + (p.y - centerY) * factor });
  }
  return out;
}

function scalePositionsAroundCenter(positions, scale = 1) {
  if (scale === 1) return positions;
  const vals = [...positions.values()];
  if (!vals.length) return positions;
  const centerX = vals.reduce((sum, p) => sum + p.x, 0) / vals.length;
  const centerY = vals.reduce((sum, p) => sum + p.y, 0) / vals.length;
  const out = new Map();
  for (const [id, p] of positions.entries()) {
    out.set(id, {
      x: centerX + (p.x - centerX) * scale,
      y: centerY + (p.y - centerY) * scale
    });
  }
  return out;
}

function elementalPositions(skills, elementName, canvasW, canvasH) {
  if (skills.length && skills[0].element === "ดิน") {
    const positions = fixedGridToCanvasPositions(skills, EARTH_FIXED_GRID, canvasW, canvasH, 0.75);
    const evo0 = skills.filter((s) => s.tier === "0").sort((a, b) => a.id.localeCompare(b.id));
    return { positions, firstEvo0Id: evo0[0]?.id || null };
  }

  if (skills.length && skills[0].element === "น้ำ") {
    const positions = fixedGridToCanvasPositions(skills, WATER_FIXED_GRID, canvasW, canvasH, 0.75);
    const evo0 = skills.filter((s) => s.tier === "0").sort((a, b) => a.id.localeCompare(b.id));
    return { positions, firstEvo0Id: evo0[0]?.id || null };
  }

  if (skills.length && skills[0].element === "ลม") {
    const positions = fixedGridToCanvasPositions(skills, WIND_FIXED_GRID, canvasW, canvasH, 0.75);
    const evo0 = skills.filter((s) => s.tier === "0").sort((a, b) => a.id.localeCompare(b.id));
    return { positions, firstEvo0Id: evo0[0]?.id || null };
  }

  if (skills.length && skills[0].element === "ไฟ") {
    const positions = fixedGridToCanvasPositions(skills, FIRE_FIXED_GRID, canvasW, canvasH, 0.75);
    const evo0 = skills.filter((s) => s.tier === "0").sort((a, b) => a.id.localeCompare(b.id));
    return { positions, firstEvo0Id: evo0[0]?.id || null };
  }

  const evo0 = skills.filter((s) => s.tier === "0").sort((a, b) => a.id.localeCompare(b.id));
  const evo1 = skills.filter((s) => s.tier === "1").sort((a, b) => a.id.localeCompare(b.id));
  const evo2 = skills.filter((s) => s.tier === "2").sort((a, b) => a.id.localeCompare(b.id));
  const positions = new Map();
  const used = new Set();
  const isFire = elementName === "ไฟ";
  const rowStep = isFire ? 170 : 108;
  const rowKey = (x, row) => `${x}|${row}`;
  const placeInColumn = (x, preferredRow) => {
    let row = preferredRow;
    while (used.has(rowKey(x, row))) row += 1;
    used.add(rowKey(x, row));
    return { x, y: 44 + row * rowStep, row };
  };

  // Tree 1: Evo0 (left), vertical flow top->bottom by depth.
  const d0 = computeDepthMap(evo0);
  const rows0 = new Map();
  for (const s of evo0) {
    const d = d0.get(s.id) || 0;
    if (!rows0.has(d)) rows0.set(d, []);
    rows0.get(d).push(s);
  }
  for (const [d, arr] of [...rows0.entries()].sort((a, b) => a[0] - b[0])) {
    arr.forEach((s, i) => {
      const p = placeInColumn(isFire ? (80 + i * 220) : (80 + i * 140), d);
      positions.set(s.id, p);
    });
  }

  // Tree 2: Evo1 (right), also vertical flow.
  const d1 = computeDepthMap(evo1);
  const rows1 = new Map();
  for (const s of evo1) {
    const d = d1.get(s.id) || 0;
    if (!rows1.has(d)) rows1.set(d, []);
    rows1.get(d).push(s);
  }
  for (const [d, arr] of [...rows1.entries()].sort((a, b) => a[0] - b[0])) {
    arr.forEach((s, i) => {
      const p = placeInColumn(isFire ? (980 + i * 220) : (700 + i * 140), d);
      positions.set(s.id, p);
    });
  }

  const byId = new Map(skills.map((s) => [s.id, s]));
  // Evo2: place next to its pre-skill (priority to non-evo2 pre).
  evo2.forEach((s, i) => {
    const anchorId = s.pres.find((pid) => byId.get(pid)?.tier !== "2") || s.pres[0];
    const anchor = positions.get(anchorId) || { x: 450, y: 90 + i * rowStep, row: i };
    const p = placeInColumn(anchor.x + (isFire ? 240 : 150), anchor.row ?? i);
    positions.set(s.id, p);
  });

  return { positions, firstEvo0Id: evo0[0]?.id || null };
}

function makeNode(skill, pos) {
  const lv = getLevel(skill.id);
  const blocked = ELEMENTS.includes(skill.element) && isBlockedByElementRule(skill.element);
  const unlocked = canLearn(skill);
  const initialCost = costAtLevel(skill, 1);

  const node = document.createElement("button");
  node.type = "button";
  node.className = `node ${lv > 0 ? "active" : ""} ${unlocked ? "" : "locked"} ${blocked ? "blocked" : ""}`;
  node.removeAttribute("title");
  if (skill.tier === "0") node.classList.add("evo0");
  if (skill.tier === "1") node.classList.add("evo1");
  if (skill.tier === "2") node.classList.add("evo2");
  node.style.left = `${pos.x}px`;
  node.style.top = `${pos.y + NODE_TOP_OFFSET}px`;

  const iconBase = skill.element === "ดิน"
    ? EARTH_ICON_BASE
    : skill.element === "น้ำ"
      ? WATER_ICON_BASE
      : skill.element === "ลม"
        ? WIND_ICON_BASE
        : skill.element === "ไฟ"
          ? FIRE_ICON_BASE
          : skill.tier === "ฉายา"
            ? TITLE_ICON_BASE
      : null;
  const useElementIcon = !!iconBase;
  node.innerHTML = useElementIcon
    ? `
    <img class="node-icon" src="${iconBase}/${skill.id}.png" alt="${skill.name}" />
    <div class="node-name sr-only">${skill.name}</div>
    <div class="node-lv">${lv}/${skill.max}</div>
  `
    : `
    <div class="node-name">${skill.name}</div>
    <div class="node-lv">${lv}/${skill.max}</div>
  `;

  node.addEventListener("click", () => {
    if (!canLearn(skill) && !tryAutoUnlockForClick(skill)) return;
    const curr = getLevel(skill.id);
    if (curr >= skill.max) return;
    state.levels.set(skill.id, curr + 1);
    refresh();
  });

  node.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    if (!canDecrease(skill)) return;
    state.levels.set(skill.id, getLevel(skill.id) - 1);
    refresh();
  });

  const tooltipText = `${skill.name} | ${initialCost}`;
  node.addEventListener("mouseenter", (ev) => {
    showSkillTooltip(tooltipText, ev.clientX, ev.clientY);
  });
  node.addEventListener("mousemove", (ev) => {
    moveSkillTooltip(ev.clientX, ev.clientY);
  });
  node.addEventListener("mouseleave", hideSkillTooltip);
  node.addEventListener("blur", hideSkillTooltip);

  return node;
}

function renderTabTree(groupName, skills) {
  const card = document.createElement("section");
  card.className = "tree-card";
  card.innerHTML = `<div class="tree-wrap"><svg></svg><div class="tree-nodes"></div></div>`;

  const svg = card.querySelector("svg");
  const nodesLayer = card.querySelector(".tree-nodes");
  const canvasW = groupName === "ไฟ" ? FIRE_CANVAS_W : CANVAS_W;
  const canvasH = groupName === "ไฟ" ? FIRE_CANVAS_H : CANVAS_H;
  svg.setAttribute("width", canvasW);
  svg.setAttribute("height", canvasH);
  nodesLayer.style.width = `${canvasW}px`;
  nodesLayer.style.height = `${canvasH}px`;

  let positions;
  let firstEvo0Id = null;
  if (groupName === TITLE_KEY) {
    positions = fixedGridToCanvasPositions(skills, TITLE_FIXED_GRID, canvasW, canvasH, 0.75);
    if (!positions.size) positions = titlePlusPositions(skills);
  } else {
    const out = elementalPositions(skills, groupName, canvasW, canvasH);
    positions = out.positions;
    firstEvo0Id = out.firstEvo0Id;
  }
  positions = fitPositionsToCanvas(positions, canvasW, canvasH);
  if (groupName === TITLE_KEY) {
    positions = balanceTitleAxisSpacing(positions, skills);
    positions = scalePositionsAroundCenter(positions, 0.5);
  }

  for (const skill of skills) {
    nodesLayer.append(makeNode(skill, positions.get(skill.id)));
  }

  const paths = [];
  let edgeIdx = 0;
  const byId = new Map(skills.map((s) => [s.id, s]));
  for (const skill of skills) {
    const to = positions.get(skill.id);
    for (const pid of skill.pres) {
      if (firstEvo0Id && skill.id === firstEvo0Id) continue;
      const fromSkill = byId.get(pid);
      if (skill.tier === "1" && fromSkill?.tier === "0") continue;
      const from = positions.get(pid);
      if (!from || !to) continue;
      const x1 = from.x + NODE_W / 2;
      const y1 = from.y + NODE_H / 2 + NODE_TOP_OFFSET;
      const x2 = to.x + NODE_W / 2;
      const y2 = to.y + NODE_H / 2 + NODE_TOP_OFFSET;
      paths.push(`<path d="M ${x1} ${y1} L ${x2} ${y2}" />`);
      edgeIdx += 1;
    }
  }
  svg.innerHTML = `<g stroke="var(--line)" stroke-width="3" fill="none" stroke-linecap="round">${paths.join("")}</g>`;
  return card;
}

function renderTabs() {
  tabBar.innerHTML = "";
  for (const tab of TABS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `tab-btn ${state.activeTab === tab ? "active" : ""}`;
    b.textContent = tab;
    b.addEventListener("click", () => {
      state.activeTab = tab;
      renderTabs();
      renderTreeView();
    });
    tabBar.append(b);
  }
}

function renderTreeView() {
  const skills = state.currentByGroup.get(state.activeTab) || [];
  treeView.innerHTML = "";
  treeView.append(renderTabTree(state.activeTab, skills));
}

function renderSummary() {
  const total = totalPoints();
  const picked = [];
  for (const skills of state.currentByGroup.values()) {
    for (const s of skills) {
      const lv = getLevel(s.id);
      if (lv > 0) picked.push({ skill: s, level: lv });
    }
  }
  summary.textContent = `ธาตุตัวละคร ${state.mainElement} | แต้มรวม ${total}`;
  if (summaryPanel) summaryPanel.classList.toggle("over-limit", total > POINT_LIMIT);
  selectedList.innerHTML = picked
    .sort((a, b) => a.skill.id.localeCompare(b.skill.id))
    .map(({ skill, level }) => `<li>[${skill.element}] ${skill.name} ระดับ ${level} ใช้ ${totalSkillCost(skill, level)} แต้ม</li>`)
    .join("");
}

function refresh() {
  buildTrees();
  renderTabs();
  renderTreeView();
  renderSummary();
}

function resetAll() {
  state.levels.clear();
  refresh();
}

async function loadTSV() {
  if (typeof window.SKILL_TSV === "string" && window.SKILL_TSV.trim()) return window.SKILL_TSV;
  try {
    const res = await fetch("data/skills.tsv", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (_) {
    return FALLBACK_TSV;
  }
}

async function init() {
  mainElementSelect.innerHTML = ELEMENTS.map((e) => `<option value="${e}">${e}</option>`).join("");
  state.mainElement = ELEMENTS[0];

  const tsv = await loadTSV();
  state.skills = parseTSV(tsv);
  if (!state.skills.length) {
    summary.textContent = "ไม่พบข้อมูลสกิล";
    return;
  }

  refresh();

  mainElementSelect.addEventListener("change", () => {
    state.mainElement = mainElementSelect.value;
    resetAll();
  });
  resetBtn.addEventListener("click", resetAll);
}

init().catch((err) => {
  summary.textContent = `โหลดข้อมูลไม่สำเร็จ: ${err.message}`;
});
