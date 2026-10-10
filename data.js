// Fletcher Fantasy Football - Data Visualizations & Google Sheets Adapter

// 1. Google Sheets Configuration
const LEAGUE_CONFIG = {
  // To connect your Google Sheet:
  // 1. In Google Sheets: File > Share > Publish to web > Click Publish.
  // 2. Paste your Sheet ID here or use the "⚙️ Google Sheet Sync" button in the site header.
  sheetId: localStorage.getItem("ffl_sheet_id") || "2PACX-1vTb7JO_6jjLvhD2GwVUUbZ9OXJA8T6fjxx_KJ3DyoTA9GUWVTFBgrJchnTfUu2i9_n4v66BcP8r-o0y",

  // Tab names in your Google Sheet matching the 6 views:
  tabNames: {
    powerRankings: "MASTER",
    weeklyPr: "Weekly PR",
    weeklyPoints: "Weekly Points",
    weeklyRanks: "WeeklyPtRanks",
    expectedRecord: "ExpW-L",
    heatmap: "WL Heatmap",
    strengthOfSchedule: "SoS"
  },

  // Direct tab GIDs extracted from published Google Sheet
  tabGids: {
    "power-rankings": "1584196681",
    "weekly-pr": "1417547424",
    "weekly-points": "1667350132",
    "weekly-ranks": "1430645840",
    "expected-record": "492806340",
    "heatmap": "609267916", // WL Heatmap Ordered
    "strength-of-schedule": "1153918705"
  },

  // Optional: direct embed URLs from Google Sheets (File > Share > Publish to web > Embed > select tab)
  embedUrls: {
    powerRankings: "",
    weeklyPoints: "",
    weeklyRanks: "",
    expectedRecord: "",
    heatmap: "",
    strengthOfSchedule: ""
  }
};

// 2. Realistic Default League Dataset
// (Displayed immediately and serves as fallback when Google Sheet is not yet connected)
const DEFAULT_LEAGUE_DATA = {
  teams: [
    { id: 1, name: "Iain", manager: "Iain", avatar: "🏈" },
    { id: 2, name: "Lana", manager: "Lana", avatar: "⭐" },
    { id: 3, name: "John", manager: "John", avatar: "⚡" },
    { id: 4, name: "Jim", manager: "Jim", avatar: "🔥" },
    { id: 5, name: "Max", manager: "Max", avatar: "👑" },
    { id: 6, name: "Rafi", manager: "Rafi", avatar: "🎯" },
    { id: 7, name: "Alex", manager: "Alex", avatar: "🏃" },
    { id: 8, name: "Courtney", manager: "Courtney", avatar: "🌸" },
    { id: 9, name: "Cornelius", manager: "Cornelius", avatar: "🎩" },
    { id: 10, name: "Kinsey", manager: "Kinsey", avatar: "🚀" },
    { id: 11, name: "Yliana", manager: "Yliana", avatar: "☀️" },
    { id: 12, name: "Bill", manager: "Bill", avatar: "🔧" },
    { id: 13, name: "Matt", manager: "Matt", avatar: "🛡️" },
    { id: 14, name: "Nigel", manager: "Nigel", avatar: "🦁" }
  ],
  weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],

  powerRankings: [
    { rank: 1, prevRank: 1, team: "Iain", manager: "Iain", record: "4-0", pf: 564.1, pa: 480.0, powerScore: 2093.5, trend: 0, tier: "Tier 1: Heavyweight" },
    { rank: 2, prevRank: 4, team: "Lana", manager: "Lana", record: "3-1", pf: 534.4, pa: 490.2, powerScore: 1818.8, trend: 2, tier: "Tier 1: Heavyweight" },
    { rank: 3, prevRank: 2, team: "John", manager: "John", record: "2-2", pf: 545.5, pa: 512.0, powerScore: 1762.3, trend: 0, tier: "Tier 2: Contender" },
    { rank: 4, prevRank: 7, team: "Jim", manager: "Jim", record: "2-2", pf: 552.8, pa: 508.4, powerScore: 1743.4, trend: 3, tier: "Tier 2: Contender" },
    { rank: 5, prevRank: 2, team: "Max", manager: "Max", record: "2-2", pf: 566.3, pa: 520.1, powerScore: 1742.5, trend: -3, tier: "Tier 2: Contender" },
    { rank: 6, prevRank: 5, team: "Rafi", manager: "Rafi", record: "3-1", pf: 490.6, pa: 460.5, powerScore: 1613.3, trend: -1, tier: "Tier 2: Contender" },
    { rank: 7, prevRank: 10, team: "Alex", manager: "Alex", record: "2-2", pf: 498.1, pa: 495.0, powerScore: 1503.8, trend: 3, tier: "Tier 3: Bubble" },
    { rank: 8, prevRank: 8, team: "Courtney", manager: "Courtney", record: "2-1", pf: 354.2, pa: 360.2, powerScore: 1458.9, trend: 0, tier: "Tier 3: Bubble" },
    { rank: 9, prevRank: 9, team: "Cornelius", manager: "Cornelius", record: "2-2", pf: 486.2, pa: 490.1, powerScore: 1458.4, trend: 0, tier: "Tier 3: Bubble" },
    { rank: 10, prevRank: 6, team: "Kinsey", manager: "Kinsey", record: "3-1", pf: 442.7, pa: 430.8, powerScore: 1396.2, trend: -4, tier: "Tier 3: Bubble" },
    { rank: 11, prevRank: 11, team: "Yliana", manager: "Yliana", record: "2-2", pf: 474.6, pa: 480.0, powerScore: 1368.9, trend: 0, tier: "Tier 4: Danger Zone" },
    { rank: 12, prevRank: 12, team: "Bill", manager: "Bill", record: "1-3", pf: 489.0, pa: 530.2, powerScore: 1335.5, trend: 0, tier: "Tier 4: Danger Zone" },
    { rank: 13, prevRank: 14, team: "Matt", manager: "Matt", record: "0-4", pf: 445.3, pa: 540.0, powerScore: 1002.0, trend: 1, tier: "Tier 5: Cellar" },
    { rank: 14, prevRank: 13, team: "Nigel", manager: "Nigel", record: "0-4", pf: 397.9, pa: 535.1, powerScore: 864.6, trend: -1, tier: "Tier 5: Cellar" }
  ],

  weeklyScores: [
    { team: "Mahomes Magic", manager: "Dan", scores: [142.4, 138.8, 129.5, 144.2, 127.5], total: 682.4, avg: 136.5, high: 144.2, low: 127.5 },
    { team: "Bijan Mustard", manager: "Mike", scores: [136.2, 145.1, 118.4, 131.8, 132.6], total: 664.1, avg: 132.8, high: 145.1, low: 118.4 },
    { team: "Run CMC", manager: "Alex", scores: [148.6, 121.3, 133.7, 119.5, 128.8], total: 651.9, avg: 130.4, high: 148.6, low: 119.5 },
    { team: "CeeDee Lambos", manager: "Chris", scores: [119.5, 132.4, 124.6, 136.2, 116.0], total: 628.7, avg: 125.7, high: 136.2, low: 116.0 },
    { team: "Stroud 9", manager: "Sam", scores: [126.8, 119.6, 138.2, 112.4, 125.3], total: 622.3, avg: 124.5, high: 138.2, low: 112.4 },
    { team: "Breece Lightning", manager: "Tyler", scores: [131.0, 114.2, 121.8, 128.5, 119.0], total: 614.5, avg: 122.9, high: 131.0, low: 114.2 },
    { team: "Sun God St. Brown", manager: "Matt", scores: [115.4, 128.0, 116.5, 122.8, 116.5], total: 599.2, avg: 119.8, high: 128.0, low: 115.4 },
    { team: "Kyler the Creator", manager: "Jordan", scores: [122.1, 124.5, 108.2, 118.6, 115.2], total: 588.6, avg: 117.7, high: 124.5, low: 108.2 },
    { team: "Hurts So Good", manager: "Dave", scores: [109.8, 118.2, 114.0, 121.4, 111.4], total: 574.8, avg: 115.0, high: 121.4, low: 109.8 },
    { team: "Achane Reaction", manager: "Ryan", scores: [124.5, 106.8, 111.2, 115.0, 110.7], total: 568.2, avg: 113.6, high: 124.5, low: 106.8 },
    { team: "Gibbs Me That", manager: "Josh", scores: [102.6, 112.4, 105.8, 108.2, 112.4], total: 541.4, avg: 108.3, high: 112.4, low: 102.6 },
    { team: "Allen Wrench", manager: "Nick", scores: [98.4, 104.2, 112.6, 101.8, 104.8], total: 521.8, avg: 104.4, high: 112.6, low: 98.4 }
  ],

  weeklyRanks: [
    { team: "Mahomes Magic", manager: "Dan", ranks: [2, 2, 3, 1, 3], avgRank: 2.2, best: 1, worst: 3 },
    { team: "Bijan Mustard", manager: "Mike", ranks: [3, 1, 6, 3, 1], avgRank: 2.8, best: 1, worst: 6 },
    { team: "Run CMC", manager: "Alex", ranks: [1, 5, 2, 6, 2], avgRank: 3.2, best: 1, worst: 6 },
    { team: "CeeDee Lambos", manager: "Chris", ranks: [7, 3, 4, 2, 6], avgRank: 4.4, best: 2, worst: 7 },
    { team: "Stroud 9", manager: "Sam", ranks: [4, 6, 1, 9, 4], avgRank: 4.8, best: 1, worst: 9 },
    { team: "Breece Lightning", manager: "Tyler", ranks: [5, 8, 5, 4, 5], avgRank: 5.4, best: 4, worst: 8 },
    { team: "Sun God St. Brown", manager: "Matt", ranks: [8, 4, 7, 5, 7], avgRank: 6.2, best: 4, worst: 8 },
    { team: "Kyler the Creator", manager: "Jordan", ranks: [6, 7, 11, 8, 8], avgRank: 8.0, best: 6, worst: 11 },
    { team: "Hurts So Good", manager: "Dave", ranks: [10, 9, 8, 7, 9], avgRank: 8.6, best: 7, worst: 10 },
    { team: "Achane Reaction", manager: "Ryan", ranks: [9, 11, 10, 10, 10], avgRank: 10.0, best: 9, worst: 11 },
    { team: "Gibbs Me That", manager: "Josh", ranks: [11, 10, 12, 11, 11], avgRank: 11.0, best: 10, worst: 12 },
    { team: "Allen Wrench", manager: "Nick", ranks: [12, 12, 9, 12, 12], avgRank: 11.4, best: 9, worst: 12 }
  ],

  expectedRecord: [
    { rank: 1, team: "Mahomes Magic", manager: "Dan", actualW: 4, actualL: 1, expW: 44, expL: 11, expWinPct: 0.800, actualWinPct: 0.800, luckDiff: 0.0, status: "Fair" },
    { rank: 2, team: "Bijan Mustard", manager: "Mike", actualW: 4, actualL: 1, expW: 41, expL: 14, expWinPct: 0.745, actualWinPct: 0.800, luckDiff: 0.3, status: "Slightly Lucky" },
    { rank: 3, team: "Run CMC", manager: "Alex", actualW: 3, actualL: 2, expW: 39, expL: 16, expWinPct: 0.709, actualWinPct: 0.600, luckDiff: -0.5, status: "Tough Luck" },
    { rank: 4, team: "CeeDee Lambos", manager: "Chris", actualW: 4, actualL: 1, expW: 33, expL: 22, expWinPct: 0.600, actualWinPct: 0.800, luckDiff: 1.0, status: "Lucky (+1.0 Win)" },
    { rank: 5, team: "Stroud 9", manager: "Sam", actualW: 3, actualL: 2, expW: 31, expL: 24, expWinPct: 0.564, actualWinPct: 0.600, luckDiff: 0.2, status: "Fair" },
    { rank: 6, team: "Breece Lightning", manager: "Tyler", actualW: 2, actualL: 3, expW: 28, expL: 27, expWinPct: 0.509, actualWinPct: 0.400, luckDiff: -0.5, status: "Tough Luck" },
    { rank: 7, team: "Sun God St. Brown", manager: "Matt", actualW: 3, actualL: 2, expW: 24, expL: 31, expWinPct: 0.436, actualWinPct: 0.600, luckDiff: 0.8, status: "Lucky (+0.8 Win)" },
    { rank: 8, team: "Kyler the Creator", manager: "Jordan", actualW: 2, actualL: 3, expW: 15, expL: 40, expWinPct: 0.273, actualWinPct: 0.400, luckDiff: 0.6, status: "Slightly Lucky" },
    { rank: 9, team: "Hurts So Good", manager: "Dave", actualW: 2, actualL: 3, expW: 12, expL: 43, expWinPct: 0.218, actualWinPct: 0.400, luckDiff: 0.9, status: "Lucky (+0.9 Win)" },
    { rank: 10, team: "Achane Reaction", manager: "Ryan", actualW: 1, actualL: 4, expW: 5, expL: 50, expWinPct: 0.091, actualWinPct: 0.200, luckDiff: 0.5, status: "Slightly Lucky" },
    { rank: 11, team: "Gibbs Me That", manager: "Josh", actualW: 1, actualL: 4, expW: 0, expL: 55, expWinPct: 0.000, actualWinPct: 0.200, luckDiff: 1.0, status: "Bailout King (+1.0)" },
    { rank: 12, team: "Allen Wrench", manager: "Nick", actualW: 1, actualL: 4, expW: 2, expL: 53, expWinPct: 0.036, actualWinPct: 0.200, luckDiff: 0.8, status: "Lucky Win" }
  ],

  // W-L Heatmap: Shows each person's weekly scoring rank for each win and loss!
  // result: "W" or "L", rank: scoring rank that week (1-12)
  // note: "bad-beat" if lost with top-6 score, "bailout" if won with bottom-6 score
  heatmap: [
    {
      team: "Mahomes Magic", manager: "Dan",
      weeks: [
        { result: "W", rank: 2, score: 142.4 },
        { result: "W", rank: 2, score: 138.8 },
        { result: "W", rank: 3, score: 129.5 },
        { result: "W", rank: 1, score: 144.2 },
        { result: "L", rank: 3, score: 127.5, note: "bad-beat" }
      ]
    },
    {
      team: "Bijan Mustard", manager: "Mike",
      weeks: [
        { result: "W", rank: 3, score: 136.2 },
        { result: "W", rank: 1, score: 145.1 },
        { result: "L", rank: 6, score: 118.4 },
        { result: "W", rank: 3, score: 131.8 },
        { result: "W", rank: 1, score: 132.6 }
      ]
    },
    {
      team: "Run CMC", manager: "Alex",
      weeks: [
        { result: "W", rank: 1, score: 148.6 },
        { result: "L", rank: 5, score: 121.3, note: "bad-beat" },
        { result: "W", rank: 2, score: 133.7 },
        { result: "L", rank: 6, score: 119.5 },
        { result: "W", rank: 2, score: 128.8 }
      ]
    },
    {
      team: "CeeDee Lambos", manager: "Chris",
      weeks: [
        { result: "W", rank: 7, score: 119.5, note: "bailout" },
        { result: "W", rank: 3, score: 132.4 },
        { result: "W", rank: 4, score: 124.6 },
        { result: "W", rank: 2, score: 136.2 },
        { result: "L", rank: 6, score: 116.0 }
      ]
    },
    {
      team: "Stroud 9", manager: "Sam",
      weeks: [
        { result: "W", rank: 4, score: 126.8 },
        { result: "L", rank: 6, score: 119.6 },
        { result: "W", rank: 1, score: 138.2 },
        { result: "L", rank: 9, score: 112.4 },
        { result: "W", rank: 4, score: 125.3 }
      ]
    },
    {
      team: "Breece Lightning", manager: "Tyler",
      weeks: [
        { result: "L", rank: 5, score: 131.0, note: "bad-beat" },
        { result: "L", rank: 8, score: 114.2 },
        { result: "W", rank: 5, score: 121.8 },
        { result: "W", rank: 4, score: 128.5 },
        { result: "L", rank: 5, score: 119.0, note: "bad-beat" }
      ]
    },
    {
      team: "Sun God St. Brown", manager: "Matt",
      weeks: [
        { result: "L", rank: 8, score: 115.4 },
        { result: "W", rank: 4, score: 128.0 },
        { result: "L", rank: 7, score: 116.5 },
        { result: "W", rank: 5, score: 122.8 },
        { result: "W", rank: 7, score: 116.5, note: "bailout" }
      ]
    },
    {
      team: "Kyler the Creator", manager: "Jordan",
      weeks: [
        { result: "W", rank: 6, score: 122.1 },
        { result: "W", rank: 7, score: 124.5, note: "bailout" },
        { result: "L", rank: 11, score: 108.2 },
        { result: "L", rank: 8, score: 118.6 },
        { result: "L", rank: 8, score: 115.2 }
      ]
    },
    {
      team: "Hurts So Good", manager: "Dave",
      weeks: [
        { result: "L", rank: 10, score: 109.8 },
        { result: "W", rank: 9, score: 118.2, note: "bailout" },
        { result: "L", rank: 8, score: 114.0 },
        { result: "W", rank: 7, score: 121.4, note: "bailout" },
        { result: "L", rank: 9, score: 111.4 }
      ]
    },
    {
      team: "Achane Reaction", manager: "Ryan",
      weeks: [
        { result: "L", rank: 9, score: 124.5 },
        { result: "L", rank: 11, score: 106.8 },
        { result: "L", rank: 10, score: 111.2 },
        { result: "L", rank: 10, score: 115.0 },
        { result: "W", rank: 10, score: 110.7, note: "bailout" }
      ]
    },
    {
      team: "Gibbs Me That", manager: "Josh",
      weeks: [
        { result: "L", rank: 11, score: 102.6 },
        { result: "L", rank: 10, score: 112.4 },
        { result: "L", rank: 12, score: 105.8 },
        { result: "L", rank: 11, score: 108.2 },
        { result: "W", rank: 11, score: 112.4, note: "bailout" }
      ]
    },
    {
      team: "Allen Wrench", manager: "Nick",
      weeks: [
        { result: "L", rank: 12, score: 98.4 },
        { result: "L", rank: 12, score: 104.2 },
        { result: "W", rank: 9, score: 112.6, note: "bailout" },
        { result: "L", rank: 12, score: 101.8 },
        { result: "L", rank: 12, score: 104.8 }
      ]
    }
  ],

  strengthOfSchedule: [
    { rank: 1, team: "Gibbs Me That", manager: "Josh", totalPA: 665.2, avgPA: 133.0, oppAvgRank: 3.2, difficulty: "Gauntlet / Brutal", badgeClass: "diff-brutal" },
    { rank: 2, team: "Allen Wrench", manager: "Nick", totalPA: 649.3, avgPA: 129.9, oppAvgRank: 4.1, difficulty: "Tuff", badgeClass: "diff-tuff" },
    { rank: 3, team: "Achane Reaction", manager: "Ryan", totalPA: 642.6, avgPA: 128.5, oppAvgRank: 4.6, difficulty: "Solid", badgeClass: "diff-solid" },
    { rank: 4, team: "Breece Lightning", manager: "Tyler", totalPA: 631.1, avgPA: 126.2, oppAvgRank: 5.2, difficulty: "Above Average", badgeClass: "diff-medium" },
    { rank: 5, team: "Kyler the Creator", manager: "Jordan", totalPA: 620.5, avgPA: 124.1, oppAvgRank: 5.8, difficulty: "Average", badgeClass: "diff-medium" },
    { rank: 6, team: "Hurts So Good", manager: "Dave", totalPA: 618.9, avgPA: 123.8, oppAvgRank: 6.0, difficulty: "Average", badgeClass: "diff-medium" },
    { rank: 7, team: "Run CMC", manager: "Alex", totalPA: 612.0, avgPA: 122.4, oppAvgRank: 6.4, difficulty: "Moderate", badgeClass: "diff-medium" },
    { rank: 8, team: "Sun God St. Brown", manager: "Matt", totalPA: 604.7, avgPA: 120.9, oppAvgRank: 6.9, difficulty: "Favorable", badgeClass: "diff-easy" },
    { rank: 9, team: "Stroud 9", manager: "Sam", totalPA: 598.4, avgPA: 119.7, oppAvgRank: 7.4, difficulty: "Favorable", badgeClass: "diff-easy" },
    { rank: 10, team: "Bijan Mustard", manager: "Mike", totalPA: 590.8, avgPA: 118.2, oppAvgRank: 7.8, difficulty: "Easy", badgeClass: "diff-easy" },
    { rank: 11, team: "CeeDee Lambos", manager: "Chris", totalPA: 569.3, avgPA: 113.9, oppAvgRank: 8.6, difficulty: "Cake Walk", badgeClass: "diff-soft" },
    { rank: 12, team: "Mahomes Magic", manager: "Dan", totalPA: 554.2, avgPA: 110.8, oppAvgRank: 9.4, difficulty: "Cake Walk", badgeClass: "diff-soft" }
  ]
};

// 3. Visualization Definitions & Metadata
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
  }
];

// 4. Robust CSV Parser
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

// 5. Fetch Google Sheet Tab as CSV
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

// 6. View Renderers

// Color gradient scale for ranks 1 to 14
// Standard: #1 is Green (best), #7.5 is Yellow, #14 is Red (worst)
// Inverted: #1 is Red (hardest schedule), #7.5 is Yellow, #14 is Green (easiest schedule)
function getRankGradientStyle(val, inverted = false) {
  const r = parseFloat(val);
  if (isNaN(r) || r < 1) return '';
  const clamped = Math.max(1, Math.min(14, r));
  const t = (clamped - 1) / 13; // 0 for #1, 1 for #14
  const hue = Math.round((inverted ? t : (1 - t)) * 130);
  return `background: hsla(${hue}, 70%, 20%, 0.5); color: hsl(${hue}, 85%, 68%); border: 1px solid hsla(${hue}, 70%, 42%, 0.45);`;
}

// Percentile gradient scale for Weekly Points
// 100th percentile = Green (hue 130), 50th percentile = Yellow (hue 65), 0th percentile = Red (hue 0)
function getScoreGradientStyle(score, minScore, maxScore) {
  const s = parseFloat(score);
  if (isNaN(s) || s <= 0) return '';
  const min = parseFloat(minScore);
  const max = parseFloat(maxScore);
  if (isNaN(min) || isNaN(max) || max <= min) return '';
  const t = Math.max(0, Math.min(1, (s - min) / (max - min))); // 0 (0th %ile) to 1 (100th %ile)
  const hue = Math.round(t * 130);
  return `background: hsla(${hue}, 70%, 18%, 0.45); color: hsl(${hue}, 85%, 72%); border: 1px solid hsla(${hue}, 70%, 42%, 0.4); font-weight: 700; border-radius: 4px; padding: 0.1rem 0.25rem; display: inline-block;`;
}

// Detailed luck gradient scale for Win Luck and Power Rankings
// Closer to 0 -> fades into opaque/neutral background with muted text
// Large luck values -> rich, vivid saturated color and border
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

// Count total weeks at #1 in the "Weekly PR" tab
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

// RENDERER 1: POWER RANKINGS
function renderPowerRankings(data) {
  const list = data.powerRankings || DEFAULT_LEAGUE_DATA.powerRankings;
  const topTeam = list[0];
  const glowingUp = list.filter((item) => item.trend > 0);
  const blowingUp = list.filter((item) => item.trend < 0);

  return `
    <div class="vis-view-wrapper">
      <div class="vis-summary-banner pwr-cards-row">
        <div class="summary-metric-card pwr-metric-card card-leader">
          <span class="metric-label">Leader</span>
          <span class="metric-val accent">${topTeam.manager}</span>
          <span class="metric-sub">3 Weeks at #1</span>
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
              <th>PF</th>
              <th>PA</th>
              <th class="fixed-rank-col">Pwr</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((item) => {
              const trendDisplay = item.trend > 0 ? `<span class="trend-up">▲ +${item.trend}</span>` : item.trend < 0 ? `<span class="trend-down">▼ ${item.trend}</span>` : `<span class="trend-even">—</span>`;
              return `
                <tr>
                  <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                  <td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(item.rank)}">#${item.rank}</span></td>
                  <td class="fixed-trend-val">${trendDisplay}</td>
                  <td><span class="record-badge">${item.record}</span></td>
                  <td class="bold-stat">${item.pf.toFixed(1)}</td>
                  <td class="muted-stat">${item.pa.toFixed(1)}</td>
                  <td class="accent-text bold-stat fixed-rank-val">${item.powerScore.toFixed(1)}</td>
                  <td><span class="tier-pill">${item.tier.split(':')[0]}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 2: WEEKLY POINTS SCORED
function renderWeeklyPoints(data) {
  const list = data.weeklyScores || DEFAULT_LEAGUE_DATA.weeklyScores;
  const weeks = data.weeks || DEFAULT_LEAGUE_DATA.weeks;

  // Calculate min and max per week across all managers for percentile coloring
  const weekMinMax = weeks.map((w, i) => {
    const scores = list.map(item => item.scores[i]).filter(s => s > 0);
    return {
      min: scores.length ? Math.min(...scores) : 0,
      max: scores.length ? Math.max(...scores) : 200
    };
  });
  const allAvgs = list.map(item => item.avg).filter(a => a > 0);
  const avgMinMax = {
    min: allAvgs.length ? Math.min(...allAvgs) : 0,
    max: allAvgs.length ? Math.max(...allAvgs) : 200
  };

  const overallAvg = list.reduce((sum, item) => sum + item.avg, 0) / (list.length || 1);
  const weekAvgs = weeks.map((w, i) => {
    const scores = list.map(item => item.scores[i]).filter(s => s > 0);
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
              ${weeks.map((w, i) => `<th class="col-fixed-pts">W${i + 1}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                <td class="col-fixed-pts"><span class="score-pill" style="${getScoreGradientStyle(item.avg, avgMinMax.min, avgMinMax.max)}">${item.avg.toFixed(1)}</span></td>
                ${item.scores.map((s, i) => {
                  const mm = weekMinMax[i] || { min: 0, max: 200 };
                  return `<td class="col-fixed-pts"><span class="score-pill" style="${getScoreGradientStyle(s, mm.min, mm.max)}">${s.toFixed(1)}</span></td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="table-average-row">
              <td class="sticky-col">Average</td>
              <td class="col-fixed-pts"><span class="avg-score-val">${overallAvg.toFixed(1)}</span></td>
              ${weekAvgs.map((wAvg) => `
                <td class="col-fixed-pts"><span class="avg-score-val">${wAvg > 0 ? wAvg.toFixed(1) : '—'}</span></td>
              `).join('')}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 3: WEEKLY POINTS SCORED RANK
function renderWeeklyRanks(data) {
  const list = data.weeklyRanks || DEFAULT_LEAGUE_DATA.weeklyRanks;
  const weeks = data.weeks || DEFAULT_LEAGUE_DATA.weeks;

  return `
    <div class="vis-view-wrapper">
      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">MGR</th>
              <th class="fixed-rank-col">Rank</th>
              <th class="fixed-rank-col">Avg</th>
              ${weeks.map((w, i) => `<th class="fixed-rank-col">W${i + 1}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${list.map((item, idx) => `
              <tr>
                <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                <td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(idx + 1)}">#${idx + 1}</span></td>
                <td class="fixed-rank-val"><span class="rank-box-wide" style="${getRankGradientStyle(item.avgRank)}">#${item.avgRank.toFixed(1)}</span></td>
                ${item.ranks.map(r => `
                  <td class="fixed-rank-val">
                    <span class="rank-box" style="${getRankGradientStyle(r)}">${r}</span>
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 4: EXPECTED W-L RECORD
function renderExpectedRecord(data) {
  const list = data.expectedRecord || DEFAULT_LEAGUE_DATA.expectedRecord;
  const minDiff = Math.min(...list.map(i => i.luckDiff));
  const maxDiff = Math.max(...list.map(i => i.luckDiff));

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
            ${list.map((item) => {
              const absDiff = Math.abs(item.luckDiff);
              const status = absDiff < 0.4 ? 'Fair' : item.luckDiff >= 0.7 ? 'RIGGED' : item.luckDiff >= 0.4 ? 'Noice' : item.luckDiff <= -0.7 ? 'RIGGED' : 'Bummer';
              const statusClass = (status === 'RIGGED' && item.luckDiff >= 0.7) ? 'status-rigged-lucky' : (status === 'RIGGED') ? 'status-rigged-unlucky' : status === 'Noice' ? 'status-noice' : status === 'Bummer' ? 'status-bummer' : 'status-fair';
              const luckSign = item.luckDiff > 0 ? `+${item.luckDiff.toFixed(2)}` : item.luckDiff.toFixed(2);
              return `
                <tr>
                  <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                  <td><span class="record-badge">${item.actualW}-${item.actualL}</span></td>
                  <td class="bold-stat">${item.expW}-${item.expL}</td>
                  <td>
                    <span class="luck-badge" style="${getLuckGradientStyle(item.luckDiff, minDiff, maxDiff)}">
                      ${luckSign}
                    </span>
                  </td>
                  <td class="col-status-fixed"><span class="status-pill ${statusClass}">${status}</span></td>
                  <td>${(item.actualWinPct * 100).toFixed(0)}%</td>
                  <td>${(item.expWinPct * 100).toFixed(0)}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 5: W-L HEATMAP
function renderHeatmap(data) {
  const list = data.heatmap || DEFAULT_LEAGUE_DATA.heatmap;

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
            ${list.map(item => {
              const wins = item.weeks.filter(w => w.result === 'W').map(w => w.rank);
              const losses = item.weeks.filter(w => w.result === 'L').map(w => w.rank);
              const avgWin = wins.length ? (wins.reduce((a, b) => a + b, 0) / wins.length).toFixed(2) : '—';
              const avgLoss = losses.length ? (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(2) : '—';

              return `
                <tr>
                  <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                  <td><span class="record-badge">${wins.length}-${losses.length}</span></td>
                  <td>
                    <div class="heat-chip-stack">
                      ${wins.length === 0 ? '<span class="muted-stat">—</span>' : wins.map(w => `
                        <span class="heat-chip win-chip" title="${w >= 10 ? 'Bailout Win (scoring rank #' + w + ')' : 'Scoring rank #' + w}">
                          ${w}${w >= 10 ? '<span class="chip-flag">🍀</span>' : ''}
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <div class="heat-chip-stack">
                      ${losses.length === 0 ? '<span class="muted-stat">—</span>' : losses.map(l => `
                        <span class="heat-chip loss-chip" title="${l <= 5 ? 'Bad Beat Loss (scoring rank #' + l + ')' : 'Scoring rank #' + l}">
                          ${l}${l <= 5 ? '<span class="chip-flag">🔥</span>' : ''}
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td><span class="rank-box-wide" style="${avgWin !== '—' ? getRankGradientStyle(avgWin) : ''}">${avgWin}</span></td>
                  <td><span class="rank-box-wide" style="${avgLoss !== '—' ? getRankGradientStyle(avgLoss) : ''}">${avgLoss}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 6: STRENGTH OF SCHEDULE
function renderStrengthOfSchedule(data) {
  const list = data.strengthOfSchedule || DEFAULT_LEAGUE_DATA.strengthOfSchedule;

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
              <th class="col-sos-uniform">Total PA</th>
              <th class="col-sos-uniform">Avg PA</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td class="sticky-col"><span class="team-title-bold">${item.manager}</span></td>
                <td class="col-sos-uniform"><span class="rank-box" style="${getRankGradientStyle(item.rank, true)}">#${item.rank}</span></td>
                <td class="col-sos-uniform"><span class="rank-box-wide" style="${getRankGradientStyle(item.oppAvgRank, true)}">#${item.oppAvgRank.toFixed(1)}</span></td>
                <td class="col-sos-strength"><span class="diff-badge ${item.badgeClass}">${item.difficulty}</span></td>
                <td class="col-sos-uniform">${item.totalPA.toFixed(1)}</td>
                <td class="col-sos-uniform">${item.avgPA.toFixed(1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 7: DYNAMIC LIVE GOOGLE SHEET TAB RENDERER
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

  // Helper to dynamically find a manager in any row regardless of column deletions/movements
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

  // 1. LIVE HEATMAP PARSER (WL Heatmap / WL Heatmap Ordered)
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

  // 2. LIVE POWER RANKINGS PARSER (MASTER)
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

  // 3. LIVE WEEKLY POINTS PARSER (Weekly Points)
  if (visId === "weekly-points") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    // Identify active week columns that have actual numeric scores
    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) || /^week\s*\d+$/i.test(h);
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

      ptsRows.push({
        manager: mgr.name,
        avg,
        scores,
        high,
        low,
        total
      });
    }

    if (ptsRows.length > 0) {
      ptsRows.sort((a, b) => b.avg - a.avg);

      // Compute min and max per active week for percentile gradient
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
                    <td class="col-fixed-pts"><span class="score-pill" style="${getScoreGradientStyle(item.avg, avgMinMax.min, avgMinMax.max)}">${item.avg.toFixed(1)}</span></td>
                    ${item.scores.map((s, wIdx) => {
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

  // 4. LIVE WEEKLY SCORING RANKS PARSER (WeeklyPtRanks)
  if (visId === "weekly-ranks") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    // Identify active week columns
    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) || /^week\s*\d+$/i.test(h);
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

      rnkRows.push({
        seasonRank,
        manager: mgr.name,
        avg: avgRank,
        ranks
      });
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
                    <td class="fixed-rank-val"><span class="rank-box-wide" style="${getRankGradientStyle(item.avg)}">#${item.avg}</span></td>
                    ${item.ranks.map(r => `<td class="fixed-rank-val"><span class="rank-box" style="${getRankGradientStyle(r)}">${r}</span></td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // 5. LIVE EXPECTED RECORD & LUCK PARSER (ExpW-L)
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

  // 6. LIVE STRENGTH OF SCHEDULE PARSER (SoS)
  if (visId === "strength-of-schedule") {
    const headerRow = rows[0] || [];
    const managerRows = rows.map(r => ({ row: r, mgr: findManagerInRow(r) })).filter(x => x.mgr !== null);

    // Identify active week columns
    const activeWeeks = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = (headerRow[c] || '').trim();
      const isWeekHeader = /^\d+$/.test(h) || /^week\s*\d+$/i.test(h);
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

      sosRows.push({
        sosRank,
        manager: mgr.name,
        avgOppRank,
        diffLabel,
        diffBadge,
        oppRanks
      });
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
                    <td class="col-sos-strength"><span class="diff-badge ${item.diffBadge}">${item.diffLabel}</span></td>
                    ${item.oppRanks.map(r => `<td class="col-sos-uniform"><span class="rank-box" style="${getRankGradientStyle(r, true)}">${r}</span></td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  // 7. GENERIC STRUCTURED TABLE FALLBACK
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
  defaultData: DEFAULT_LEAGUE_DATA,
  fetchTab: fetchGoogleSheetTab,
  renderLiveSheetTab: renderLiveSheetTab,
  renderers: {
    "power-rankings": renderPowerRankings,
    "weekly-points": renderWeeklyPoints,
    "weekly-ranks": renderWeeklyRanks,
    "expected-record": renderExpectedRecord,
    "heatmap": renderHeatmap,
    "strength-of-schedule": renderStrengthOfSchedule
  }
};


