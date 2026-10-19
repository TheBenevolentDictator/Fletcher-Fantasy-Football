// Fletcher Fantasy Football - Data Visualizations & Google Sheets Adapter

// 1. Google Sheets Configuration
const LEAGUE_CONFIG = {
  sheetId: localStorage.getItem("ffl_sheet_id") || "2PACX-1vTb7JO_6jjLvhD2GwVUUbZ9OXJA8T6fjxx_KJ3DyoTA9GUWVTFBgrJchnTfUu2i9_n4v66BcP8r-o0y",

  tabNames: {
    powerRankings: "MASTER",
    weeklyPr: "Weekly PR",
    weeklyPoints: "Weekly Points",
    weeklyRanks: "WeeklyPtRanks",
    expectedRecord: "ExpW-L",
    heatmap: "WL Heatmap",
    strengthOfSchedule: "SoS"
  },

  tabGids: {
    "power-rankings": "1584196681",
    "weekly-pr": "1417547424",
    "weekly-points": "1667350132",
    "weekly-ranks": "1430645840",
    "expected-record": "492806340",
    "heatmap": "609267916",
    "strength-of-schedule": "1153918705"
  },

  embedUrls: {
    powerRankings: "",
    weeklyPoints: "",
    weeklyRanks: "",
    expectedRecord: "",
    heatmap: "",
    strengthOfSchedule: ""
  }
};

// 2. Visualization Menu Definitions
const DATA_VIS_ITEMS = [
  {
    id: "power-rankings",
    title: "Power Rankings",
    shortTitle: "Power Rankings",
    icon: "🏆",
    badge: "Official",
    tag: "Leaderboard",
    description: "Dashboard page for league data."
  },
  {
    id: "weekly-points",
    title: "Weekly Points Scored",
    shortTitle: "Points Scored",
    icon: "📈",
    badge: "Offense",
    tag: "Scoring Trends",
    description: "Week-by-week scoring output, league averages, high-water marks, and offensive breakdowns."
  },
  {
    id: "weekly-ranks",
    title: "Weekly Points Scored Rank",
    shortTitle: "Points Rank",
    icon: "🔢",
    badge: "Consistency",
    tag: "Rank Matrix",
    description: "How each manager ranked in scoring across every week of the fantasy season."
  },
  {
    id: "expected-record",
    title: "Win Luck",
    shortTitle: "Win Luck",
    icon: "⚖️",
    badge: "All-Play",
    tag: "Luck Index",
    description: "Actual W-L record compared to All-Play expected record, highlighting the luckiest and unluckiest managers."
  },
  {
    id: "heatmap",
    title: "W-L Heatmap",
    shortTitle: "W-L Heatmap",
    icon: "🟩",
    badge: "Visual Grid",
    tag: "Results & Ranks",
    description: "Visual matrix of each person's weekly scoring rank for each win and loss with bad beats and bailouts."
  },
  {
    id: "strength-of-schedule",
    title: "Schedule Strength",
    shortTitle: "Schedule Strength",
    icon: "🛡️",
    badge: "Defense",
    tag: "Difficulty Rating",
    description: "Opponent scoring faced (PA), opponent rank average, and schedule difficulty ratings."
  },
  {
    id: "line-race",
    title: "Standings Race",
    shortTitle: "Line Race",
    icon: "🏎️",
    badge: "Animated",
    tag: "Season Race",
    description: "Animated week-by-week line race across the fantasy season."
  }
];

// 3. CSV Parser
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
    lines.push(row);
  }
  return lines;
}

// 4. Fetch Google Sheet Tab as CSV
async function fetchGoogleSheetTab(sheetId, tabName, visId) {
  let url = "";
  const tabGid = window.FFL_DATA && window.FFL_DATA.config && window.FFL_DATA.config.tabGids && visId ? window.FFL_DATA.config.tabGids[visId] : null;
  if (sheetId.startsWith("2PACX-") || sheetId.includes("/d/e/")) {
    const cleanId = sheetId.includes("/d/e/") ? sheetId.match(/\/d\/e\/([a-zA-Z0-9-_]+)/)[1] : sheetId;
    if (tabGid) {
      url = `https://docs.google.com/spreadsheets/d/e/${cleanId}/pub?gid=${tabGid}&single=true&output=csv`;
    } else {
      url = `https://docs.google.com/spreadsheets/d/e/${cleanId}/pub?output=csv&sheet=${encodeURIComponent(tabName)}`;
    }
  } else {
    url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching tab "${tabName}"`);
  const text = await res.text();
  return parseCSV(text);
}

// 5. Visual Scales Helpers
function getRankGradientStyle(val, inverted = false) {
  const r = parseFloat(val);
  if (isNaN(r) || r < 1) return '';
  const clamped = Math.max(1, Math.min(14, r));
  const t = (clamped - 1) / 13;
  const hue = Math.round((inverted ? t : (1 - t)) * 130);
  return `background: hsla(${hue}, 70%, 20%, 0.5); color: hsl(${hue}, 85%, 68%); border: 1px solid hsla(${hue}, 70%, 42%, 0.45);`;
}

function getScoreGradientStyle(score, minScore, maxScore) {
  const s = parseFloat(score);
  if (isNaN(s) || s <= 0) return '';
  const min = parseFloat(minScore);
  const max = parseFloat(maxScore);
  if (isNaN(min) || isNaN(max) || max <= min) return '';
  const t = Math.max(0, Math.min(1, (s - min) / (max - min)));
  const hue = Math.round(t * 130);
  return `background: hsla(${hue}, 70%, 18%, 0.45); color: hsl(${hue}, 85%, 72%); border: 1px solid hsla(${hue}, 70%, 42%, 0.4); font-weight: 700; border-radius: 4px; padding: 0.1rem 0.25rem; display: inline-block;`;
}

function getLuckGradientStyle(diff, minDiff = -1.5, maxDiff = 1.5) {
  const d = parseFloat(diff);
  if (isNaN(d)) return '';
  if (Math.abs(d) < 0.15) {
    return 'background: rgba(148, 163, 184, 0.08); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.18); font-weight: 600;';
  }
  if (d > 0) {
    const max = Math.max(1.0, maxDiff > 0 ? maxDiff : 1.5);
    const t = Math.min(1, Math.max(0, d / max));
    const p = Math.pow(t, 1.25);
    const sat = Math.round(22 + p * 74);
    const lightness = Math.round(72 + p * 15);
    const bgAlpha = (0.06 + p * 0.44).toFixed(2);
    const borderAlpha = (0.12 + p * 0.58).toFixed(2);
    return `background: hsla(142, ${sat}%, 20%, ${bgAlpha}); color: hsl(142, ${sat}%, ${lightness}%); border: 1px solid hsla(142, ${sat}%, 45%, ${borderAlpha}); font-weight: 700;`;
  } else {
    const min = Math.max(1.0, minDiff < 0 ? Math.abs(minDiff) : 1.5);
    const t = Math.min(1, Math.max(0, Math.abs(d) / min));
    const p = Math.pow(t, 1.25);
    const sat = Math.round(22 + p * 74);
    const lightness = Math.round(72 + p * 15);
    const bgAlpha = (0.06 + p * 0.44).toFixed(2);
    const borderAlpha = (0.12 + p * 0.58).toFixed(2);
    return `background: hsla(0, ${sat}%, 20%, ${bgAlpha}); color: hsl(0, ${sat}%, ${lightness}%); border: 1px solid hsla(0, ${sat}%, 45%, ${borderAlpha}); font-weight: 700;`;
  }
}

function getWeeksAtNumberOne(managerName, weeklyPrRows) {
  if (!weeklyPrRows || weeklyPrRows.length < 2 || !managerName) return 0;
  const target = managerName.trim().toLowerCase();
  for (const r of weeklyPrRows) {
    if (!r || r.length === 0) continue;
    const cell0 = (r[0] || '').trim().toLowerCase();
    const cell1 = (r[1] || '').trim().toLowerCase();

    let isMatch = false;
    let startCol = 1;

    if (cell0 === target) {
      isMatch = true;
      startCol = 1;
    } else if (cell1 === target) {
      isMatch = true;
      startCol = 2;
    } else if (cell0 && (cell0.startsWith(target + ' ') || cell0.endsWith(' ' + target) || cell0.includes('(' + target + ')') || cell0.includes(' - ' + target))) {
      isMatch = true;
      startCol = 1;
    }

    if (isMatch) {
      let count = 0;
      for (let c = startCol; c < r.length; c++) {
        const val = (r[c] || '').trim();
        if (val === '1' || val === '#1' || val === '1.0') count++;
      }
      return count;
    }
  }
  return 0;
}

// 6. Standings Line Race (Flourish)
function renderLineRace() {
  return `
    <div class="vis-view-wrapper">
      <div class="flourish-embed flourish-chart" data-src="visualisation/30507835">
        <noscript>
          <img src="https://public.flourish.studio/visualisation/30507835/thumbnail" width="100%" alt="chart visualization" />
        </noscript>
      </div>
    </div>
  `;
}

function renderSheetRequiredNotice(viewName) {
  return `
    <div class="vis-view-wrapper">
      <p class="muted-stat" style="padding: 3rem; text-align: center;">
        ⚠️ Live Google Sheet data unavailable for ${viewName}. Please verify connection in the setup modal.
      </p>
    </div>
  `;
}
// 7. Dynamic Live Google Sheet Tab Renderer
function renderLiveSheetTab(rows, visId, tabName, extraData = {}) {
  if (!rows || rows.length < 2) {
    return `<div class="vis-view-wrapper"><p class="muted-stat">No data found in tab "${tabName}".</p></div>`;
  }

  const knownManagers = [
    'Alex', 'Bill', 'Cornelius', 'Courtney', 'Iain',
    'Jim', 'John', 'Kinsey', 'Lana', 'Matt',
    'Max', 'Nigel', 'Rafi', 'Yliana'
  ];

  const managerTeamMap = {
    'Alex': 'Cornelius Fudge',
    'Bill': 'Phoenix Odyssey',
    'Cornelius': 'Global Affairs School Graduate',
    'Courtney': 'Almost Alcoholics',
    'Iain': 'Rock Bottom',
    'Jim': 'Team Grom',
    'John': "Bill's Bills",
    'Kinsey': 'Team Koko',
    'Lana': 'Mook Squad',
    'Matt': 'Trade Banned',
    'Max': 'Spectres Haunting',
    'Nigel': 'Soccer Is Better',
    'Rafi': 'Benevolent Dictators',
    'Yliana': 'Still a Student'
  };

  function findManagerInRow(r) {
    for (let i = 0; i < r.length; i++) {
      const val = (r[i] || '').trim();
      const match = knownManagers.find(m => m.toLowerCase() === val.toLowerCase());
      if (match) {
        return { index: i, name: match, team: managerTeamMap[match] || '' };
      }
    }
    return null;
  }

  // Live Heatmap Parser
  if (visId === "heatmap") {
    const headerRow = rows.find(r => r.some(c => /wins/i.test(c) && !/avg/i.test(c)) && r.some(c => /losses/i.test(c) && !/avg/i.test(c))) || rows[1] || rows[0] || [];
    const winsCol = headerRow.findIndex(c => /wins/i.test((c || '').trim()) && !/avg/i.test(c));
    const lossesCol = headerRow.findIndex(c => /losses/i.test((c || '').trim()) && !/avg/i.test(c));

    const heatRows = [];
    for (const r of rows) {
      const mgr = findManagerInRow(r);
      if (!mgr) continue;

      const idx = mgr.index;
      const actualWinsCol = winsCol !== -1 ? winsCol : (idx + 1);
      const actualLossesCol = lossesCol !== -1 ? lossesCol : (idx + 8);

      const wins = [];
      const endWinCol = actualLossesCol > actualWinsCol ? actualLossesCol : r.length;
      for (let c = actualWinsCol; c < endWinCol; c++) {
        const val = (r[c] || '').trim();
        if (/^\d+$/.test(val)) {
          const num = parseInt(val, 10);
          if (num >= 1 && num <= 14) wins.push(num);
        }
      }

      const losses = [];
      for (let c = actualLossesCol; c < r.length; c++) {
        const val = (r[c] || '').trim();
        if (/^\d+$/.test(val)) {
          const num = parseInt(val, 10);
          if (num >= 1 && num <= 14) losses.push(num);
        }
      }

      const avgWin = wins.length > 0 ? (wins.reduce((a, b) => a + b, 0) / wins.length).toFixed(2) : '—';
      const avgLoss = losses.length > 0 ? (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(2) : '—';

      heatRows.push({
        manager: mgr.name,
        record: `${wins.length}-${losses.length}`,
        winsCount: wins.length,
        lossesCount: losses.length,
        wins,
        losses,
        avgWin,
        avgLoss
      });
    }

    if (heatRows.length > 0) {
      heatRows.sort((a, b) => b.winsCount - a.winsCount || (parseFloat(a.avgWin) || 99) - (parseFloat(b.avgWin) || 99));

      return `
        <div class="vis-view-wrapper">
          <div class="table-responsive-container">
            <table class="vis-table heatmap-vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th>REC</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Avg W</th>
                  <th>Avg L</th>
                </tr>
              </thead>
              <tbody>
                ${heatRows.map(item => `
                  <tr>
                    <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                    <td><span class="record-badge">${item.record}</span></td>
                    <td>
                      <div class="heat-chip-stack">
                        ${item.wins.length === 0 ? '<span class="muted-stat">—</span>' : item.wins.map(w => `
                          <span class="heat-chip win-chip" title="${w >= 10 ? 'Bailout Win (scoring rank #' + w + ')' : 'Scoring rank #' + w}">
                            ${w}${w >= 10 ? '<span class="chip-flag">🍀</span>' : ''}
                          </span>
                        `).join('')}
                      </div>
                    </td>
                    <td>
                      <div class="heat-chip-stack">
                        ${item.losses.length === 0 ? '<span class="muted-stat">—</span>' : item.losses.map(l => `
                          <span class="heat-chip loss-chip" title="${l <= 5 ? 'Bad Beat Loss (scoring rank #' + l + ')' : 'Scoring rank #' + l}">
                            ${l}${l <= 5 ? '<span class="chip-flag">🔥</span>' : ''}
                          </span>
                        `).join('')}
                      </div>
                    </td>
                    <td><span class="rank-box-wide" style="${item.avgWin !== '—' ? getRankGradientStyle(item.avgWin) : ''}">${item.avgWin}</span></td>
                    <td><span class="rank-box-wide" style="${item.avgLoss !== '—' ? getRankGradientStyle(item.avgLoss) : ''}">${item.avgLoss}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Live Power Rankings Parser
  if (visId === "power-rankings") {
    const headerRow = rows.find(r => r.some(c => /pwr.*rnk|power.*rank|ppg/i.test(c))) || rows[0] || [];
    const pwrCol = headerRow.findIndex(c => /new\s*pwr|power.*score/i.test(c));
    const rankCol = headerRow.findIndex(c => /pwr\s*rnk|power\s*rank|^rank|^#/i.test(c) && !/score/i.test(c));
    const ppgCol = headerRow.findIndex(c => /ppg|^pts|^points/i.test(c));
    const avgRankCol = headerRow.findIndex(c => /avg.*scoring|avg.*rank/i.test(c));
    const sosRankCol = headerRow.findIndex(c => /sos.*rank/i.test(c));
    const luckCol = headerRow.findIndex(c => /win\s*luck|luck/i.test(c));
    const wCol = headerRow.findIndex(c => /^w$/i.test((c || '').trim()));
    const lCol = headerRow.findIndex(c => /^l$/i.test((c || '').trim()));

    const pwrRows = [];
    for (const r of rows) {
      const mgr = findManagerInRow(r);
      if (!mgr) continue;

      const idx = mgr.index;
      let rank = (rankCol !== -1 ? r[rankCol] : r[idx - 2]) || '';
      if (!/^\d+$/.test(rank.trim())) {
        rank = (r[idx - 2] && /^\d+$/.test(r[idx - 2].trim())) ? r[idx - 2].trim() : (r[idx - 1] && /^\d+$/.test(r[idx - 1].trim())) ? r[idx - 1].trim() : String(pwrRows.length + 1);
      }

      let trend = '➟';
      for (let c = Math.max(0, idx - 2); c <= idx + 2; c++) {
        const val = (r[c] || '').trim();
        if (/^[➟➚➘▲▼―\-=]+$/.test(val)) {
          trend = val;
          break;
        }
      }

      let w = (wCol !== -1 ? r[wCol] : r[idx + 1]) || '0';
      let l = (lCol !== -1 ? r[lCol] : r[idx + 2]) || '0';
      if (!/^\d+$/.test(w.trim())) w = r[idx + 1] || '0';
      if (!/^\d+$/.test(l.trim())) l = r[idx + 2] || '0';

      const ppg = parseFloat(ppgCol !== -1 ? r[ppgCol] : r[idx + 4]) || 0;
      const avgRank = (avgRankCol !== -1 ? r[avgRankCol] : r[idx + 5]) || '';
      const sosRank = (sosRankCol !== -1 ? r[sosRankCol] : r[idx + 7]) || '';
      const pwrScore = (pwrCol !== -1 ? r[pwrCol] : r[2]) || '';
      const luck = (luckCol !== -1 ? r[luckCol] : r[idx + 12]) || '';

      pwrRows.push({
        rank: parseInt(rank, 10) || (pwrRows.length + 1),
        trend,
        manager: mgr.name,
        record: `${w}-${l}`,
        ppg,
        avgRank,
        sosRank,
        pwrScore: pwrScore.trim(),
        luck: luck.trim()
      });
    }

    if (pwrRows.length > 0) {
      pwrRows.sort((a, b) => a.rank - b.rank);

      let weeksAtOne = getWeeksAtNumberOne(pwrRows[0].manager, extraData && extraData.weeklyPrRows);
      if (!weeksAtOne && (!extraData || !extraData.weeklyPrRows) && pwrRows[0].manager.toLowerCase() === 'iain') {
        weeksAtOne = 3;
      }
      const isPositiveTrend = (t) => t === '▲' || t === '➚' || (typeof t === 'number' && t > 0) || (typeof t === 'string' && (t.includes('▲') || t.includes('➚') || t.startsWith('+')));
      const isNegativeTrend = (t) => t === '▼' || t === '➘' || (typeof t === 'number' && t < 0) || (typeof t === 'string' && (t.includes('▼') || t.includes('➘') || (t.startsWith('-') && t !== '—' && t !== '-')));

      const glowingUp = pwrRows.filter(r => isPositiveTrend(r.trend));
      const blowingUp = pwrRows.filter(r => isNegativeTrend(r.trend));

      return `
        <div class="vis-view-wrapper">
          <div class="vis-summary-banner pwr-cards-row">
            <div class="summary-metric-card pwr-metric-card card-leader">
              <span class="metric-label">Leader</span>
              <span class="metric-val accent">${pwrRows[0].manager}</span>
              <span class="metric-sub">${weeksAtOne} ${weeksAtOne === 1 ? 'Week' : 'Weeks'} at #1</span>
            </div>
            <div class="summary-metric-card pwr-metric-card card-glowing-up">
              <span class="metric-label">▲ Glowing Up</span>
              <div class="metric-list">
                ${glowingUp.length ? glowingUp.map(m => `<span class="mover-tag up">${m.manager}</span>`).join('') : '<span class="mover-tag none">None</span>'}
              </div>
            </div>
            <div class="summary-metric-card pwr-metric-card card-blowing-up">
              <span class="metric-label">▼ Blowing Up</span>
              <div class="metric-list">
                ${blowingUp.length ? blowingUp.map(m => `<span class="mover-tag down">${m.manager}</span>`).join('') : '<span class="mover-tag none">None</span>'}
              </div>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th class="fixed-rank-col">Rank</th>
                  <th class="fixed-trend-col">Trend</th>
                  <th>Rec</th>
                  <th>Pwr</th>
                  <th>PPG</th>
                  <th class="fixed-rank-col">Avg Rnk</th>
                  <th class="fixed-rank-col">SoS</th>
                  <th>Luck</th>
                </tr>
              </thead>
              <tbody>
                ${pwrRows.map(item => {
                  const trendDisplay = item.trend === '➚' ? '<span class="trend-up">▲</span>' : item.trend === '➘' ? '<span class="trend-down">▼</span>' : '<span class="trend-even">➟</span>';
                  const luckVal = parseFloat(item.luck) || 0;
                  const luckDisplay = item.luck ? (luckVal > 0 ? '+' : '') + item.luck : '—';
                  return `
                    <tr>
                      <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                      <td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(item.rank)}">#${item.rank}</span></td>
                      <td class="fixed-trend-val">${trendDisplay}</td>
                      <td><span class="record-badge">${item.record}</span></td>
                      <td class="accent-text bold-stat">${item.pwrScore}</td>
                      <td class="bold-stat">${item.ppg.toFixed(1)}</td>
                      <td class="fixed-rank-val"><span class="rank-box-wide" style="${getRankGradientStyle(item.avgRank)}">#${item.avgRank}</span></td>
                      <td class="fixed-rank-val"><span class="rank-box-wide" style="${getRankGradientStyle(item.sosRank, true)}">#${item.sosRank}</span></td>
                      <td><span class="luck-badge" style="${getLuckGradientStyle(luckVal)}">${luckDisplay}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Live Weekly Points Parser
  if (visId === "weekly-points") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) \vert{}\vert{} /^week\s*\d+$/i.test(h);
      if (isWeekHeader) {
        const hasScore = managerRows.some(x => {
          const val = (x.row[c] || '').trim();
          return val !== '' && !isNaN(val) && parseFloat(val) > 0;
        });
        if (hasScore) {
          const wkNum = h.replace(/^week\s*/i, '');
          activeWeeks.push({ col: c, wkNum: wkNum, label: `W${wkNum}` });
        }
      }
    }

    const avgCol = headerRow.findIndex(c => /^avg|^ppg/i.test((c || '').trim()));

    const ptsRows = [];
    for (const { row: r, mgr } of managerRows) {
      const actualAvgCol = avgCol !== -1 ? avgCol : (mgr.index + 1);
      const avg = parseFloat(r[actualAvgCol]) || 0;
      const scores = activeWeeks.map(w => parseFloat(r[w.col]) || 0);
      const validScores = scores.filter(s => s > 0);
      const high = validScores.length ? Math.max(...validScores) : 0;
      const low = validScores.length ? Math.min(...validScores) : 0;
      const total = scores.reduce((sum, s) => sum + s, 0);

      ptsRows.push({ manager: mgr.name, avg, scores, high, low, total });
    }

    if (ptsRows.length > 0) {
      ptsRows.sort((a, b) => b.avg - a.avg);

      const weekMinMax = activeWeeks.map((w, wIdx) => {
        const valid = ptsRows.map(item => item.scores[wIdx]).filter(s => s > 0);
        return {
          min: valid.length ? Math.min(...valid) : 0,
          max: valid.length ? Math.max(...valid) : 200
        };
      });
      const allAvgs = ptsRows.map(item => item.avg).filter(a => a > 0);
      const avgMinMax = {
        min: allAvgs.length ? Math.min(...allAvgs) : 0,
        max: allAvgs.length ? Math.max(...allAvgs) : 200
      };

      const overallAvg = ptsRows.reduce((sum, item) => sum + item.avg, 0) / (ptsRows.length || 1);
      const weekAvgScores = activeWeeks.map((w, wIdx) => {
        const scores = ptsRows.map(r => r.scores[wIdx]).filter(s => s > 0);
        return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      });

      return `
        <div class="vis-view-wrapper">
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th class="col-fixed-pts">Avg</th>
                  ${activeWeeks.map(w => `<th class="col-fixed-pts">${w.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${ptsRows.map(item => `
                  <tr>
                    <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                    <td class="col-fixed-pts"><span class="score-pill" style="${getScoreGradientStyle(item.avg, avgMinMax.min, avgMinMax.max)}">${item.avg.toFixed(1)}</span></td>${item.scores.map((s, wIdx) => {
                      const mm = weekMinMax[wIdx] || { min: 0, max: 200 };
                      return `<td class="col-fixed-pts"><span class="score-pill" style="${getScoreGradientStyle(s, mm.min, mm.max)}">${s > 0 ? s.toFixed(1) : '—'}</span></td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="table-average-row">
                  <td class="sticky-col">Average</td>
                  <td class="col-fixed-pts"><span class="avg-score-val">${overallAvg.toFixed(1)}</span></td>
                  ${weekAvgScores.map((wAvg) => `
                    <td class="col-fixed-pts"><span class="avg-score-val">${wAvg > 0 ? wAvg.toFixed(1) : '—'}</span></td>
                  `).join('')}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Live Weekly Scoring Ranks Parser
  if (visId === "weekly-ranks") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) \vert{}\vert{} /^week\s*\d+$/i.test(h);
      if (isWeekHeader) {
        const hasRank = managerRows.some(x => {
          const val = (x.row[c] || '').trim();
          return /^\d+$/.test(val) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 14;
        });
        if (hasRank) {
          const wkNum = h.replace(/^week\s*/i, '');
          activeWeeks.push({ col: c, wkNum: wkNum, label: `W${wkNum}` });
        }
      }
    }

    const rnkRows = [];
    for (const { row: r, mgr } of managerRows) {
      const idx = mgr.index;
      let seasonRank = parseInt(r[0], 10) || parseInt(r[idx - 1], 10) || 0;
      let avgRank = (r[2] || r[idx + 1] || '').trim();
      const ranks = activeWeeks.map(w => parseInt(r[w.col], 10) || 0);

      rnkRows.push({ seasonRank, manager: mgr.name, avg: avgRank, ranks });
    }

    if (rnkRows.length > 0) {
      rnkRows.sort((a, b) => a.seasonRank - b.seasonRank);

      return `
        <div class="vis-view-wrapper">
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th class="fixed-rank-col">Rank</th>
                  <th class="fixed-rank-col">Avg</th>
                  ${activeWeeks.map(w => `<th class="fixed-rank-col">${w.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rnkRows.map(item => `
                  <tr>
                    <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                    <td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(item.seasonRank)}">#${item.seasonRank}</span></td>
                    <td class="fixed-rank-val"><span class="rank-box-wide" style="${getRankGradientStyle(item.avg)}">#${item.avg}</span></td>${item.ranks.map(r => `<td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(r)}">${r}</span></td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Live Expected Record Parser
  if (visId === "expected-record") {
    const expRows = [];
    for (const r of rows) {
      const mgr = findManagerInRow(r);
      if (!mgr) continue;

      const idx = mgr.index;
      const hasTeamCol = isNaN(parseFloat(r[idx + 1])) && (r[idx + 1] || '').trim().length > 0 && !/^\d+(\.\d+)?$/.test((r[idx + 1] || '').trim());
      const offset = hasTeamCol ? 1 : 0;
      const expW = parseFloat(r[idx + offset + 1]) || 0;
      const expL = parseFloat(r[idx + offset + 2]) || 0;
      const actualW = parseInt(r[idx + offset + 3], 10) || 0;
      const actualL = parseInt(r[idx + offset + 4], 10) || 0;
      const diff = parseFloat(r[idx + offset + 5]) || (actualW - expW);

      const actualTotal = actualW + actualL;
      const expTotal = expW + expL;
      const actualWinPct = actualTotal > 0 ? (actualW / actualTotal) : 0;
      const expWinPct = expTotal > 0 ? (expW / expTotal) : 0;

      const absDiff = Math.abs(diff);
      const status = absDiff < 0.4 ? 'Fair' : diff >= 0.7 ? 'RIGGED' : diff >= 0.4 ? 'Noice' : diff <= -0.7 ? 'RIGGED' : 'Bummer';
      const statusClass = (status === 'RIGGED' && diff >= 0.7) ? 'status-rigged-lucky' : (status === 'RIGGED') ? 'status-rigged-unlucky' : status === 'Noice' ? 'status-noice' : status === 'Bummer' ? 'status-bummer' : 'status-fair';

      expRows.push({
        manager: mgr.name,
        actualW,
        actualL,
        expW,
        expL,
        diff,
        actualWinPct,
        expWinPct,
        status,
        statusClass
      });
    }

    if (expRows.length > 0) {
      expRows.sort((a, b) => b.diff - a.diff);

      const minDiff = Math.min(...expRows.map(r => r.diff));
      const maxDiff = Math.max(...expRows.map(r => r.diff));

      return `
        <div class="vis-view-wrapper">
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th>REC</th>
                  <th>Exp Rec</th>
                  <th>Luck</th>
                  <th class="col-status-fixed">Status</th>
                  <th>Win%</th>
                  <th>Exp%</th>
                </tr>
              </thead>
              <tbody>
                ${expRows.map(item => `
                  <tr>
                    <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                    <td><span class="record-badge">${item.actualW}-${item.actualL}</span></td>
                    <td class="bold-stat">${item.expW.toFixed(2)}-${item.expL.toFixed(2)}</td>
                    <td>
                      <span class="luck-badge" style="${getLuckGradientStyle(item.diff, minDiff, maxDiff)}">
                        ${item.diff > 0 ? '+' : ''}${item.diff.toFixed(2)}
                      </span>
                    </td>
                    <td class="col-status-fixed"><span class="status-pill ${item.statusClass}">${item.status}</span></td>
                    <td>${(item.actualWinPct * 100).toFixed(0)}%</td>
                    <td>${(item.expWinPct * 100).toFixed(0)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Live Strength of Schedule Parser
  if (visId === "strength-of-schedule") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) \vert{}\vert{} /^week\s*\d+$/i.test(h);
      if (isWeekHeader) {
        const hasRank = managerRows.some(x => {
          const val = (x.row[c] || '').trim();
          return /^\d+$/.test(val) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 14;
        });
        if (hasRank) {
          const wkNum = h.replace(/^week\s*/i, '');
          activeWeeks.push({ col: c, wkNum: wkNum, label: `W${wkNum}` });
        }
      }
    }

    const sosRows = [];
    for (const { row: r, mgr } of managerRows) {
      const idx = mgr.index;
      let sosRank = parseInt(r[idx - 1], 10) || (sosRows.length + 1);
      let avgOppRank = parseFloat(r[idx + 1]) || 7.0;
      const oppRanks = activeWeeks.map(w => parseInt(r[w.col], 10) || 0);

      const diffLabel = avgOppRank <= 4.0 ? 'Brutal' : avgOppRank <= 6.0 ? 'Tuff' : avgOppRank <= 7.5 ? 'Solid' : avgOppRank <= 9.0 ? 'Average' : 'Soft';
      const diffBadge = avgOppRank <= 4.0 ? 'diff-brutal' : avgOppRank <= 6.0 ? 'diff-tuff' : avgOppRank <= 7.5 ? 'diff-solid' : avgOppRank <= 9.0 ? 'diff-medium' : 'diff-soft';

      sosRows.push({ sosRank, manager: mgr.name, avgOppRank, diffLabel, diffBadge, oppRanks });
    }

    if (sosRows.length > 0) {
      sosRows.sort((a, b) => a.sosRank - b.sosRank || a.avgOppRank - b.avgOppRank);

      return `
        <div class="vis-view-wrapper">
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">MGR</th>
                  <th class="col-sos-uniform">SoS</th>
                  <th class="col-sos-uniform">Opp Avg</th>
                  <th class="col-sos-strength">Strength</th>
                  ${activeWeeks.map(w => `<th class="col-sos-uniform">${w.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sosRows.map(item => `
                  <tr>
                    <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                    <td class="col-sos-uniform"><span class="rank-box" style="${getRankGradientStyle(item.sosRank, true)}">#${item.sosRank}</span></td>
                    <td class="col-sos-uniform"><span class="rank-box-wide" style="${getRankGradientStyle(item.avgOppRank, true)}">#${item.avgOppRank.toFixed(2)}</span></td>
                    <td class="col-sos-strength"><span class="diff-badge ${item.diffBadge}">${item.diffLabel}</span></td>${item.oppRanks.map(r => `<td class="col-sos-uniform"><span class="rank-box" style="${getRankGradientStyle(r, true)}">${r}</span></td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // Generic Fallback Table
  const validRows = rows.filter(r => r.some(c => c && c.trim() !== ""));
  const headers = validRows[0];
  const dataRows = validRows.slice(1);

  return `
    <div class="vis-view-wrapper">
      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              ${headers.map((h, i) => {
                const headerText = /manager/i.test(h || '') ? 'MGR' : (h || 'Col ' + (i + 1));
                return `<th class="${i === 0 ? 'sticky-col' : ''}">${headerText}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataRows.map(row => `
              <tr>
                ${row.map((cell, i) => {
                  const trimmed = (cell || '').trim();
                  if (i === 0) {
                    return `<td class="sticky-col"><span class="team-title-bold">${trimmed}</span></td>`;
                  }
                  return `<td>${trimmed}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Export for app.js
window.FFL_DATA = {
  config: LEAGUE_CONFIG,
  visItems: DATA_VIS_ITEMS,
  defaultData: null,
  fetchTab: fetchGoogleSheetTab,
  renderLiveSheetTab: renderLiveSheetTab,
  renderers: {
    "line-race": renderLineRace,
    "power-rankings": () => renderSheetRequiredNotice("Power Rankings"),
    "weekly-points": () => renderSheetRequiredNotice("Weekly Points"),
    "weekly-ranks": () => renderSheetRequiredNotice("Weekly Points Scored Rank"),
    "expected-record": () => renderSheetRequiredNotice("Win Luck"),
    "heatmap": () => renderSheetRequiredNotice("W-L Heatmap"),
    "strength-of-schedule": () => renderSheetRequiredNotice("Schedule Strength")
  }
};
