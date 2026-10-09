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
    weeklyPoints: "Weekly Points",
    weeklyRanks: "WeeklyPtRanks",
    expectedRecord: "ExpW-L",
    heatmap: "WL Heatmap",
    strengthOfSchedule: "SoS"
  },

  // Direct tab GIDs extracted from published Google Sheet
  tabGids: {
    "power-rankings": "1584196681",
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
    { rank: 1, team: "Mahomes Magic", manager: "Dan", actualW: 4, actualL: 1, expW: 44, expL: 11, expWinPct: 0.800, actualWinPct: 0.800, luckDiff: 0.0, status: "Fair (Even)" },
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
    { rank: 2, team: "Allen Wrench", manager: "Nick", totalPA: 649.3, avgPA: 129.9, oppAvgRank: 4.1, difficulty: "Very Hard", badgeClass: "diff-hard" },
    { rank: 3, team: "Achane Reaction", manager: "Ryan", totalPA: 642.6, avgPA: 128.5, oppAvgRank: 4.6, difficulty: "Hard", badgeClass: "diff-hard" },
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
    title: "Master Power Rankings",
    shortTitle: "Power Rankings",
    icon: "🏆",
    badge: "Official",
    tag: "Leaderboard",
    description: "Consensus league power rankings, power rating scores, tiers, and weekly trend movement."
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
    title: "Expected W-L Record",
    shortTitle: "Expected W-L",
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
    title: "Strength of Schedule",
    shortTitle: "Schedule SoS",
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

// RENDERER 1: MASTER POWER RANKINGS
function renderPowerRankings(data) {
  const list = data.powerRankings || DEFAULT_LEAGUE_DATA.powerRankings;
  const topTeam = list[0];
  const biggestMover = [...list].sort((a, b) => b.trend - a.trend)[0];

  return `
    <div class="vis-view-wrapper">
      <div class="vis-summary-banner">
        <div class="summary-metric-card">
          <span class="metric-label">League Leader</span>
          <span class="metric-val accent">${topTeam.team}</span>
          <span class="metric-sub">${topTeam.record} • ${topTeam.powerScore} Rating</span>
        </div>
        <div class="summary-metric-card">
          <span class="metric-label">Biggest Mover</span>
          <span class="metric-val">${biggestMover.trend > 0 ? '▲ +' + biggestMover.trend : '—'}</span>
          <span class="metric-sub">${biggestMover.team}</span>
        </div>
        <div class="summary-metric-card">
          <span class="metric-label">League Scoring Avg</span>
          <span class="metric-val">120.9</span>
          <span class="metric-sub">Points / Week</span>
        </div>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              <th>Rank</th>
              <th>Record</th>
              <th>PF</th>
              <th>PA</th>
              <th>Power Score</th>
              <th>Trend</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((item) => {
              const rankBadge = item.rank === 1 ? 'gold-rank' : item.rank === 2 ? 'silver-rank' : item.rank === 3 ? 'bronze-rank' : 'standard-rank';
              const trendDisplay = item.trend > 0 ? `<span class="trend-up">▲ +${item.trend}</span>` : item.trend < 0 ? `<span class="trend-down">▼ ${item.trend}</span>` : `<span class="trend-even">—</span>`;
              return `
                <tr>
                  <td class="sticky-col">
                    <div class="team-identity-sticky">
                      <span class="rank-circle ${rankBadge}">#${item.rank}</span>
                      <div class="team-identity">
                        <span class="team-title-bold">${item.team}</span>
                        <span class="manager-sub">${item.manager}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="rank-circle ${rankBadge}">#${item.rank}</span></td>
                  <td><span class="record-badge">${item.record}</span></td>
                  <td class="bold-stat">${item.pf.toFixed(1)}</td>
                  <td class="muted-stat">${item.pa.toFixed(1)}</td>
                  <td>
                    <div class="score-bar-group">
                      <span class="power-score-num">${item.powerScore.toFixed(1)}</span>
                      <div class="mini-progress-track">
                        <div class="mini-progress-fill" style="width: ${item.powerScore}%"></div>
                      </div>
                    </div>
                  </td>
                  <td>${trendDisplay}</td>
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

  return `
    <div class="vis-view-wrapper">
      <div class="vis-control-bar">
        <span class="vis-note">📊 Weekly points scored per manager across the season</span>
        <div class="vis-legend">
          <span class="legend-chip"><span class="chip-color high-chip"></span> High Score</span>
          <span class="legend-chip"><span class="chip-color low-chip"></span> Low Score</span>
        </div>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              ${weeks.map(w => `<th>${w}</th>`).join('')}
              <th>Total PF</th>
              <th>Avg/Wk</th>
              <th>High</th>
              <th>Low</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td class="sticky-col">
                  <div class="team-identity">
                    <span class="team-title-bold">${item.team}</span>
                    <span class="manager-sub">${item.manager}</span>
                  </div>
                </td>
                ${item.scores.map(s => {
                  const isHigh = s === item.high;
                  const isLow = s === item.low;
                  const cellClass = isHigh ? 'score-highlight-high' : isLow ? 'score-highlight-low' : '';
                  return `<td class="${cellClass}">${s.toFixed(1)}</td>`;
                }).join('')}
                <td class="bold-stat accent-text">${item.total.toFixed(1)}</td>
                <td class="bold-stat">${item.avg.toFixed(1)}</td>
                <td class="stat-high">${item.high.toFixed(1)}</td>
                <td class="stat-low">${item.low.toFixed(1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 3: WEEKLY POINTS SCORED RANK
function renderWeeklyRanks(data) {
  const list = data.weeklyRanks || DEFAULT_LEAGUE_DATA.weeklyRanks;
  const weeks = data.weeks || DEFAULT_LEAGUE_DATA.weeks;

  function getRankBadge(rank) {
    if (rank <= 3) return 'rank-cell-top';
    if (rank >= 10) return 'rank-cell-bottom';
    return 'rank-cell-mid';
  }

  return `
    <div class="vis-view-wrapper">
      <div class="vis-control-bar">
        <span class="vis-note">🔢 Scoring Rank in the League (1 = Highest Scorer, 12 = Lowest Scorer)</span>
        <div class="vis-legend">
          <span class="legend-chip"><span class="chip-color rank-top-chip"></span> Top 3 (#1-#3)</span>
          <span class="legend-chip"><span class="chip-color rank-mid-chip"></span> Mid (#4-#9)</span>
          <span class="legend-chip"><span class="chip-color rank-bot-chip"></span> Bottom 3 (#10-#12)</span>
        </div>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              ${weeks.map(w => `<th>${w} Rank</th>`).join('')}
              <th>Avg Rank</th>
              <th>Best</th>
              <th>Worst</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td class="sticky-col">
                  <div class="team-identity">
                    <span class="team-title-bold">${item.team}</span>
                    <span class="manager-sub">${item.manager}</span>
                  </div>
                </td>
                ${item.ranks.map(r => `
                  <td>
                    <span class="rank-pill-box ${getRankBadge(r)}">#${r}</span>
                  </td>
                `).join('')}
                <td class="bold-stat">${item.avgRank.toFixed(1)}</td>
                <td class="stat-high">#${item.best}</td>
                <td class="stat-low">#${item.worst}</td>
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

  return `
    <div class="vis-view-wrapper">
      <div class="vis-control-bar">
        <span class="vis-note">⚖️ All-Play Expected Record: What your record would be if you played every league manager every week</span>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              <th>Actual Record</th>
              <th>Expected (All-Play)</th>
              <th>Actual Win %</th>
              <th>Expected Win %</th>
              <th>Luck Factor</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((item, idx) => {
              const luckClass = item.luckDiff > 0.5 ? 'luck-lucky' : item.luckDiff < -0.4 ? 'luck-unlucky' : 'luck-neutral';
              const luckSign = item.luckDiff > 0 ? `+${item.luckDiff.toFixed(1)}` : item.luckDiff.toFixed(1);
              return `
                <tr>
                  <td class="sticky-col">
                    <div class="team-identity-sticky">
                      <span class="rank-circle standard-rank">#${item.rank || (idx + 1)}</span>
                      <div class="team-identity">
                        <span class="team-title-bold">${item.team}</span>
                        <span class="manager-sub">${item.manager}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="record-badge">${item.actualW}-${item.actualL}</span></td>
                  <td class="bold-stat">${item.expW}-${item.expL}</td>
                  <td>${(item.actualWinPct * 100).toFixed(0)}%</td>
                  <td>${(item.expWinPct * 100).toFixed(0)}%</td>
                  <td>
                    <span class="luck-badge ${luckClass}">
                      ${luckSign} Wins
                    </span>
                  </td>
                  <td><span class="status-pill">${item.status}</span></td>
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
// Displays each person's weekly scoring rank for each win and loss!
function renderHeatmap(data) {
  const list = data.heatmap || DEFAULT_LEAGUE_DATA.heatmap;
  const weeks = data.weeks || DEFAULT_LEAGUE_DATA.weeks;

  return `
    <div class="vis-view-wrapper">
      <div class="vis-control-bar">
        <span class="vis-note">🟩 W-L Heatmap: Matchup result paired with weekly scoring rank (#1 to #12)</span>
        <div class="vis-legend">
          <span class="legend-chip"><span class="chip-color heatmap-win-chip"></span> Win</span>
          <span class="legend-chip"><span class="chip-color heatmap-loss-chip"></span> Loss</span>
          <span class="legend-chip"><span class="badge-callout">🔥 Bad Beat</span> Top 6 score & lost</span>
          <span class="legend-chip"><span class="badge-callout">🍀 Bailout</span> Bottom 6 score & won</span>
        </div>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table heatmap-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              ${weeks.map(w => `<th class="heatmap-header">${w}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${list.map(item => `
              <tr>
                <td class="sticky-col">
                  <div class="team-identity">
                    <span class="team-title-bold">${item.team}</span>
                    <span class="manager-sub">${item.manager}</span>
                  </div>
                </td>
                ${item.weeks.map(w => {
                  const isWin = w.result === 'W';
                  const cellClass = isWin ? 'heatmap-win' : 'heatmap-loss';
                  const calloutBadge = w.note === 'bad-beat' 
                    ? `<span class="heatmap-callout bad-beat" title="Top score that lost!">🔥 Bad Beat</span>` 
                    : w.note === 'bailout' 
                    ? `<span class="heatmap-callout bailout" title="Bottom score that won!">🍀 Bailout</span>` 
                    : '';

                  return `
                    <td class="heatmap-cell ${cellClass}">
                      <div class="cell-content-stack">
                        <div class="cell-primary-row">
                          <span class="cell-result">${w.result}</span>
                          <span class="cell-rank-pill">#${w.rank}</span>
                        </div>
                        <span class="cell-score-sub">${w.score.toFixed(1)} pts</span>
                        ${calloutBadge}
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
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
      <div class="vis-control-bar">
        <span class="vis-note">🛡️ Strength of Schedule: Evaluates opponent points against and schedule difficulty</span>
      </div>

      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              <th class="sticky-col">Manager & Team</th>
              <th>Opponent Avg Rank</th>
              <th>Schedule Difficulty</th>
              <th>Total PA</th>
              <th>Opponent Avg/Wk</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(item => {
              const diffPercent = Math.max(10, Math.min(100, ((13 - item.rank) / 12) * 100));
              return `
                <tr>
                  <td class="sticky-col">
                    <div class="team-identity-sticky">
                      <span class="rank-circle standard-rank">#${item.rank}</span>
                      <div class="team-identity">
                        <span class="team-title-bold">${item.team}</span>
                        <span class="manager-sub">${item.manager}</span>
                      </div>
                    </div>
                  </td>
                  <td class="bold-stat">#${item.oppAvgRank.toFixed(1)}</td>
                  <td>
                    <div class="sos-bar-cell">
                      <span class="diff-badge ${item.badgeClass}">${item.difficulty}</span>
                      <div class="mini-progress-track">
                        <div class="mini-progress-fill ${item.badgeClass}" style="width: ${diffPercent}%"></div>
                      </div>
                    </div>
                  </td>
                  <td>${item.totalPA.toFixed(1)}</td>
                  <td>${item.avgPA.toFixed(1)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// RENDERER 7: DYNAMIC LIVE GOOGLE SHEET TAB RENDERER
function renderLiveSheetTab(rows, visId, tabName) {
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
    const heatRows = [];
    for (const r of rows) {
      const mgr = findManagerInRow(r);
      if (!mgr) continue;

      const idx = mgr.index;
      // Wins ranks are up to 14 slots after manager column
      const wins = r.slice(idx + 1, idx + 15).filter(x => /^\d+$/.test(x.trim())).map(Number);
      // Losses ranks are the 14 slots after wins
      const losses = r.slice(idx + 15, idx + 29).filter(x => /^\d+$/.test(x.trim())).map(Number);

      const avgWin = wins.length > 0 ? (wins.reduce((a, b) => a + b, 0) / wins.length).toFixed(2) : '—';
      const avgLoss = losses.length > 0 ? (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(2) : '—';

      heatRows.push({
        manager: mgr.name,
        team: mgr.team,
        record: `${wins.length}-${losses.length}`,
        winsCount: wins.length,
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
          <div class="vis-control-bar">
            <span class="vis-note">🟢 Live data from tab <b>"${tabName}"</b> • ${heatRows.length} Managers</span>
            <div class="vis-legend">
              <span class="legend-chip"><span class="chip-color heatmap-win-chip"></span> Win</span>
              <span class="legend-chip"><span class="chip-color heatmap-loss-chip"></span> Loss</span>
              <span class="legend-chip"><span class="badge-callout">🔥 Bad Beat</span> Top 6 score & lost</span>
              <span class="legend-chip"><span class="badge-callout">🍀 Bailout</span> Bottom 7 score & won</span>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table heatmap-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>Record</th>
                  <th>Avg Win Rank</th>
                  <th>Avg Loss Rank</th>
                  <th>Wins (Scoring Ranks)</th>
                  <th>Losses (Scoring Ranks)</th>
                </tr>
              </thead>
              <tbody>
                ${heatRows.map(item => `
                  <tr>
                    <td class="sticky-col">
                      <div class="team-identity">
                        <span class="team-title-bold">${item.manager}</span>
                        <span class="manager-sub">${item.team}</span>
                      </div>
                    </td>
                    <td><span class="record-badge">${item.record}</span></td>
                    <td class="stat-high">${item.avgWin}</td>
                    <td class="stat-low">${item.avgLoss}</td>
                    <td>
                      <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                        ${item.wins.length === 0 ? '<span class="muted-stat">—</span>' : item.wins.map(w => `
                          <div class="heatmap-cell heatmap-win" style="display: inline-flex; flex-direction: column; align-items: center; padding: 0.25rem 0.5rem !important;">
                            <span class="cell-result" style="font-size: 0.8rem;">W #${w}</span>
                            ${w >= 7 ? '<span class="heatmap-callout bailout">🍀 Bailout</span>' : ''}
                          </div>
                        `).join('')}
                      </div>
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                        ${item.losses.length === 0 ? '<span class="muted-stat">—</span>' : item.losses.map(l => `
                          <div class="heatmap-cell heatmap-loss" style="display: inline-flex; flex-direction: column; align-items: center; padding: 0.25rem 0.5rem !important;">
                            <span class="cell-result" style="font-size: 0.8rem;">L #${l}</span>
                            ${l <= 6 ? '<span class="heatmap-callout bad-beat">🔥 Bad Beat</span>' : ''}
                          </div>
                        `).join('')}
                      </div>
                    </td>
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
    const rankCol = headerRow.findIndex(c => /pwr\s*rnk|power\s*rank|^rank|^#/i.test(c));
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
        team: mgr.team,
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

      return `
        <div class="vis-view-wrapper">
          <div class="vis-summary-banner">
            <div class="summary-metric-card">
              <span class="metric-label">League Leader</span>
              <span class="metric-val accent">${pwrRows[0].manager}</span>
              <span class="metric-sub">${pwrRows[0].record} • ${pwrRows[0].pwrScore} Pwr Score</span>
            </div>
            <div class="summary-metric-card">
              <span class="metric-label">Leader Scoring</span>
              <span class="metric-val">${pwrRows[0].ppg.toFixed(1)}</span>
              <span class="metric-sub">Points / Week</span>
            </div>
            <div class="summary-metric-card">
              <span class="metric-label">Total Teams</span>
              <span class="metric-val">${pwrRows.length}</span>
              <span class="metric-sub">Active Managers</span>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>Rank</th>
                  <th>Record</th>
                  <th>Power Score</th>
                  <th>PPG</th>
                  <th>Trend</th>
                  <th>Avg Scoring Rank</th>
                  <th>SoS Rank</th>
                  <th>Win Luck</th>
                </tr>
              </thead>
              <tbody>
                ${pwrRows.map(item => {
                  const rNum = item.rank;
                  const rankBadge = rNum === 1 ? 'gold-rank' : rNum === 2 ? 'silver-rank' : rNum === 3 ? 'bronze-rank' : 'standard-rank';
                  const trendDisplay = item.trend === '➚' ? '<span class="trend-up">▲</span>' : item.trend === '➘' ? '<span class="trend-down">▼</span>' : '<span class="trend-even">➟</span>';
                  const luckVal = parseFloat(item.luck) || 0;
                  const luckClass = luckVal > 0 ? 'luck-lucky' : luckVal < 0 ? 'luck-unlucky' : 'luck-neutral';
                  const luckDisplay = item.luck ? (luckVal > 0 ? '+' : '') + item.luck : '—';
                  return `
                    <tr>
                      <td class="sticky-col">
                        <div class="team-identity-sticky">
                          <span class="rank-circle ${rankBadge}">#${item.rank}</span>
                          <div class="team-identity">
                            <span class="team-title-bold">${item.manager}</span>
                            <span class="manager-sub">${item.team}</span>
                          </div>
                        </div>
                      </td>
                      <td><span class="rank-circle ${rankBadge}">#${item.rank}</span></td>
                      <td><span class="record-badge">${item.record}</span></td>
                      <td class="accent-text bold-stat">${item.pwrScore}</td>
                      <td class="bold-stat">${item.ppg.toFixed(1)}</td>
                      <td>${trendDisplay}</td>
                      <td>#${item.avgRank}</td>
                      <td>#${item.sosRank}</td>
                      <td><span class="luck-badge ${luckClass}">${luckDisplay}</span></td>
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
          activeWeeks.push({ col: c, label: `Week ${wkNum}` });
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
        team: mgr.team,
        avg,
        scores,
        high,
        low,
        total
      });
    }

    if (ptsRows.length > 0) {
      ptsRows.sort((a, b) => b.avg - a.avg);

      return `
        <div class="vis-view-wrapper">
          <div class="vis-control-bar">
            <span class="vis-note">🟢 Live data from tab <b>"${tabName}"</b> • ${ptsRows.length} Managers</span>
            <div class="vis-legend">
              <span class="legend-chip"><span class="chip-color high-chip"></span> Personal High</span>
              <span class="legend-chip"><span class="chip-color low-chip"></span> Personal Low</span>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>PPG Avg</th>
                  ${activeWeeks.map(w => `<th>${w.label}</th>`).join('')}
                  <th>High</th>
                  <th>Low</th>
                </tr>
              </thead>
              <tbody>
                ${ptsRows.map(item => `
                  <tr>
                    <td class="sticky-col">
                      <div class="team-identity">
                        <span class="team-title-bold">${item.manager}</span>
                        <span class="manager-sub">${item.team}</span>
                      </div>
                    </td>
                    <td class="bold-stat accent-text">${item.avg.toFixed(1)}</td>
                    ${item.scores.map(s => {
                      const isHigh = s === item.high && s > 0;
                      const isLow = s === item.low && s > 0;
                      const cls = isHigh ? 'score-highlight-high' : isLow ? 'score-highlight-low' : '';
                      return `<td class="${cls}">${s.toFixed(1)}</td>`;
                    }).join('')}
                    <td class="stat-high">${item.high.toFixed(1)}</td>
                    <td class="stat-low">${item.low.toFixed(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
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
          activeWeeks.push({ col: c, label: `Week ${wkNum}` });
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
        team: mgr.team,
        avg: avgRank,
        ranks
      });
    }

    if (rnkRows.length > 0) {
      rnkRows.sort((a, b) => a.seasonRank - b.seasonRank);

      return `
        <div class="vis-view-wrapper">
          <div class="vis-control-bar">
            <span class="vis-note">🟢 Live scoring ranks from tab <b>"${tabName}"</b></span>
            <div class="vis-legend">
              <span class="legend-chip"><span class="chip-color rank-top-chip"></span> Top 3 (#1-#3)</span>
              <span class="legend-chip"><span class="chip-color rank-mid-chip"></span> Mid (#4-#9)</span>
              <span class="legend-chip"><span class="chip-color rank-bot-chip"></span> Bottom (#10-#14)</span>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>Season Rank</th>
                  <th>Avg Rank</th>
                  ${activeWeeks.map(w => `<th>${w.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rnkRows.map(item => {
                  const rankBadge = item.seasonRank === 1 ? 'gold-rank' : item.seasonRank === 2 ? 'silver-rank' : item.seasonRank === 3 ? 'bronze-rank' : 'standard-rank';
                  return `
                    <tr>
                      <td class="sticky-col">
                        <div class="team-identity-sticky">
                          <span class="rank-circle ${rankBadge}">#${item.seasonRank}</span>
                          <div class="team-identity">
                            <span class="team-title-bold">${item.manager}</span>
                            <span class="manager-sub">${item.team}</span>
                          </div>
                        </div>
                      </td>
                      <td><span class="rank-circle ${rankBadge}">#${item.seasonRank}</span></td>
                      <td class="bold-stat">#${item.avg}</td>
                      ${item.ranks.map(r => {
                        const badgeClass = r <= 3 ? 'rank-cell-top' : r >= 10 ? 'rank-cell-bottom' : 'rank-cell-mid';
                        return `<td><span class="rank-pill-box ${badgeClass}">#${r}</span></td>`;
                      }).join('')}
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

  // 5. LIVE EXPECTED RECORD & LUCK PARSER (ExpW-L)
  if (visId === "expected-record") {
    const expRows = [];
    for (const r of rows) {
      const mgr = findManagerInRow(r);
      if (!mgr) continue;

      const idx = mgr.index;
      const team = (r[idx + 1] && isNaN(r[idx + 1]) ? r[idx + 1].trim() : mgr.team);
      const expW = parseFloat(r[idx + 2]) || 0;
      const expL = parseFloat(r[idx + 3]) || 0;
      const actualW = parseInt(r[idx + 4], 10) || 0;
      const actualL = parseInt(r[idx + 5], 10) || 0;
      const diff = parseFloat(r[idx + 6]) || (actualW - expW);

      const actualTotal = actualW + actualL;
      const expTotal = expW + expL;
      const actualWinPct = actualTotal > 0 ? (actualW / actualTotal) : 0;
      const expWinPct = expTotal > 0 ? (expW / expTotal) : 0;

      const luckClass = diff >= 0.2 ? 'luck-lucky' : diff <= -0.2 ? 'luck-unlucky' : 'luck-neutral';
      const status = diff >= 0.7 ? 'Extremely Lucky' : diff >= 0.2 ? 'Slightly Lucky' : diff <= -0.7 ? 'Heartbroken (Very Unlucky)' : diff <= -0.2 ? 'Tough Luck' : 'Fair (Even)';

      expRows.push({
        manager: mgr.name,
        team,
        actualW,
        actualL,
        expW,
        expL,
        diff,
        actualWinPct,
        expWinPct,
        luckClass,
        status
      });
    }

    if (expRows.length > 0) {
      expRows.sort((a, b) => b.diff - a.diff);

      return `
        <div class="vis-view-wrapper">
          <div class="vis-control-bar">
            <span class="vis-note">🟢 Live data from tab <b>"${tabName}"</b> • All-Play Expected Record & Luck</span>
            <div class="vis-legend">
              <span class="legend-chip"><span class="chip-color high-chip"></span> Positive Luck</span>
              <span class="legend-chip"><span class="chip-color low-chip"></span> Unlucky</span>
            </div>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>Actual Record</th>
                  <th>Expected Record</th>
                  <th>Luck Diff</th>
                  <th>Luck Status</th>
                  <th>Actual Win %</th>
                  <th>Expected Win %</th>
                </tr>
              </thead>
              <tbody>
                ${expRows.map(item => `
                  <tr>
                    <td class="sticky-col">
                      <div class="team-identity">
                        <span class="team-title-bold">${item.manager}</span>
                        <span class="manager-sub">${item.team}</span>
                      </div>
                    </td>
                    <td><span class="record-badge">${item.actualW}-${item.actualL}</span></td>
                    <td class="bold-stat">${item.expW.toFixed(2)}-${item.expL.toFixed(2)}</td>
                    <td>
                      <span class="luck-badge ${item.luckClass}">
                        ${item.diff > 0 ? '+' : ''}${item.diff.toFixed(2)} Wins
                      </span>
                    </td>
                    <td><span class="status-pill">${item.status}</span></td>
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
          activeWeeks.push({ col: c, label: `Week ${wkNum}` });
        }
      }
    }

    const sosRows = [];
    for (const { row: r, mgr } of managerRows) {
      const idx = mgr.index;
      let sosRank = parseInt(r[idx - 1], 10) || (sosRows.length + 1);
      let avgOppRank = parseFloat(r[idx + 1]) || 7.0;
      const oppRanks = activeWeeks.map(w => parseInt(r[w.col], 10) || 0);

      const diffLabel = avgOppRank <= 4.0 ? 'Gauntlet / Brutal' : avgOppRank <= 6.0 ? 'Very Hard' : avgOppRank <= 7.5 ? 'Hard' : avgOppRank <= 9.0 ? 'Average' : 'Favorable / Soft';
      const diffBadge = avgOppRank <= 4.0 ? 'diff-brutal' : avgOppRank <= 7.5 ? 'diff-hard' : avgOppRank <= 9.0 ? 'diff-medium' : 'diff-soft';
      const diffPercent = Math.max(10, Math.min(100, ((15 - avgOppRank) / 14) * 100));

      sosRows.push({
        sosRank,
        manager: mgr.name,
        team: mgr.team,
        avgOppRank,
        diffLabel,
        diffBadge,
        diffPercent,
        oppRanks
      });
    }

    if (sosRows.length > 0) {
      sosRows.sort((a, b) => a.sosRank - b.sosRank || a.avgOppRank - b.avgOppRank);

      return `
        <div class="vis-view-wrapper">
          <div class="vis-control-bar">
            <span class="vis-note">🟢 Live Strength of Schedule from tab <b>"${tabName}"</b></span>
          </div>
          <div class="table-responsive-container">
            <table class="vis-table">
              <thead>
                <tr>
                  <th class="sticky-col">Manager</th>
                  <th>SoS Rank</th>
                  <th>Opponent Avg Rank</th>
                  <th>Difficulty Rating</th>
                  ${activeWeeks.map(w => `<th>${w.label} Opp Rank</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sosRows.map(item => `
                  <tr>
                    <td class="sticky-col">
                      <div class="team-identity-sticky">
                        <span class="rank-circle standard-rank">#${item.sosRank}</span>
                        <div class="team-identity">
                          <span class="team-title-bold">${item.manager}</span>
                          <span class="manager-sub">${item.team}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="rank-circle standard-rank">#${item.sosRank}</span></td>
                    <td class="bold-stat">#${item.avgOppRank.toFixed(2)}</td>
                    <td>
                      <div class="sos-bar-cell">
                        <span class="diff-badge ${item.diffBadge}">${item.diffLabel}</span>
                        <div class="mini-progress-track">
                          <div class="mini-progress-fill ${item.diffBadge}" style="width: ${item.diffPercent}%"></div>
                        </div>
                      </div>
                    </td>
                    ${item.oppRanks.map(r => `<td><span class="rank-pill-box ${r <= 3 ? 'rank-cell-bottom' : r >= 10 ? 'rank-cell-top' : 'rank-cell-mid'}">#${r}</span></td>`).join('')}
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
      <div class="vis-control-bar">
        <span class="vis-note">🟢 Live data from tab <b>"${tabName}"</b> (${dataRows.length} rows)</span>
      </div>
      <div class="table-responsive-container">
        <table class="vis-table">
          <thead>
            <tr>
              ${headers.map((h, i) => `<th class="${i === 0 ? 'sticky-col' : ''}">${h || 'Col ' + (i + 1)}</th>`).join('')}
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


