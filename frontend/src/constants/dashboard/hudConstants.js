// frontend/src/constants/dashboard/hudConstants.js

// Configuración de colores y rangos para cada estadística
export const statRanges = {
  VPIP: [
    { min: 0, max: 15, color: 'blue.400', label: 'Nit' },
    { min: 15, max: 22, color: 'green.400', label: 'TAG' },
    { min: 22, max: 28, color: 'yellow.400', label: 'LAG' },
    { min: 28, max: 35, color: 'orange.400', label: 'Loose' },
    { min: 35, max: 100, color: 'red.400', label: 'Fish' }
  ],
  PFR: [
    { min: 0, max: 12, color: 'blue.400', label: 'Nit' },
    { min: 12, max: 18, color: 'green.400', label: 'TAG' },
    { min: 18, max: 25, color: 'yellow.400', label: 'LAG' },
    { min: 25, max: 30, color: 'orange.400', label: 'Loose' },
    { min: 30, max: 100, color: 'red.400', label: 'Maniac' }
  ],
  '3Bet': [
    { min: 0, max: 4, color: 'blue.400', label: 'Tight' },
    { min: 4, max: 7, color: 'green.400', label: 'Balanced' },
    { min: 7, max: 10, color: 'yellow.400', label: 'Aggressive' },
    { min: 10, max: 15, color: 'orange.400', label: 'Very Aggressive' },
    { min: 15, max: 100, color: 'red.400', label: 'Maniac' }
  ],
  'F3B': [
    { min: 0, max: 50, color: 'red.400', label: 'Calls too much' },
    { min: 50, max: 60, color: 'orange.400', label: 'Sticky' },
    { min: 60, max: 70, color: 'green.400', label: 'Balanced' },
    { min: 70, max: 80, color: 'yellow.400', label: 'Tight' },
    { min: 80, max: 100, color: 'blue.400', label: 'Overfolds' }
  ],
  'AF': [
    { min: 0, max: 1, color: 'blue.400', label: 'Passive' },
    { min: 1, max: 2, color: 'green.400', label: 'Balanced' },
    { min: 2, max: 3, color: 'yellow.400', label: 'Aggressive' },
    { min: 3, max: 4, color: 'orange.400', label: 'Very Aggressive' },
    { min: 4, max: 100, color: 'red.400', label: 'Hyper Aggressive' }
  ],
  'WTSD': [
    { min: 0, max: 20, color: 'blue.400', label: 'Folds too much' },
    { min: 20, max: 25, color: 'green.400', label: 'Balanced' },
    { min: 25, max: 30, color: 'yellow.400', label: 'Calls light' },
    { min: 30, max: 35, color: 'orange.400', label: 'Station' },
    { min: 35, max: 100, color: 'red.400', label: 'Calling Station' }
  ],
  'WSD': [
    { min: 0, max: 45, color: 'red.400', label: 'Weak' },
    { min: 45, max: 50, color: 'orange.400', label: 'Below average' },
    { min: 50, max: 55, color: 'green.400', label: 'Balanced' },
    { min: 55, max: 60, color: 'yellow.400', label: 'Strong' },
    { min: 60, max: 100, color: 'blue.400', label: 'Very Strong' }
  ],
  'CBet': [
    { min: 0, max: 50, color: 'blue.400', label: 'Passive' },
    { min: 50, max: 65, color: 'green.400', label: 'Balanced' },
    { min: 65, max: 75, color: 'yellow.400', label: 'Aggressive' },
    { min: 75, max: 85, color: 'orange.400', label: 'Very Aggressive' },
    { min: 85, max: 100, color: 'red.400', label: 'Over CBets' }
  ],
  'FCBET': [
    { min: 0, max: 40, color: 'red.400', label: 'Calls too much' },
    { min: 40, max: 50, color: 'orange.400', label: 'Sticky' },
    { min: 50, max: 60, color: 'green.400', label: 'Balanced' },
    { min: 60, max: 70, color: 'yellow.400', label: 'Tight' },
    { min: 70, max: 100, color: 'blue.400', label: 'Overfolds' }
  ]
};

// Tooltips con explicaciones de cada stat
export const statTooltips = {
  VPIP: "Voluntarily Put money In Pot - % de manos que juega voluntariamente",
  PFR: "Pre-Flop Raise - % de manos que sube preflop",
  '3Bet': "% de veces que hace 3-bet cuando tiene la oportunidad",
  'F3B': "Fold to 3-Bet - % que foldea ante un 3-bet",
  '4Bet': "% de veces que hace 4-bet cuando tiene la oportunidad",
  'F4B': "Fold to 4-Bet - % que foldea ante un 4-bet",
  'SQZ': "Squeeze - % que hace squeeze (3-bet después de call)",
  'LIMP': "% de veces que solo iguala el big blind preflop",
  'LF': "Limp/Fold - % que foldea después de limpear",
  'LR': "Limp/Raise - % que sube después de limpear",
  'AF': "Aggression Factor - (Bets + Raises) / Calls",
  'WWSF': "Won When Saw Flop - % que gana cuando ve el flop",
  'WTSD': "Went To ShowDown - % que llega al showdown",
  'WSD': "Won ShowDown - % que gana en el showdown",
  'CBet': "Continuation Bet Flop - % que apuesta continuación en flop",
  'FCBET': "Fold to CBet - % que foldea ante CBet",
  'CBetT': "Continuation Bet Turn - % que apuesta continuación en turn",
  'FCBetT': "Fold to CBet Turn - % que foldea ante CBet en turn",
  'CBetR': "Continuation Bet River - % que apuesta continuación en river",
  'PROBE': "Probe Bet - % que apuesta cuando el agresor no continúa",
  'BetR': "Bet River - % que apuesta en el river",
  'FBetR': "Fold to Bet River - % que foldea ante apuesta en river",
  'OBT': "Overbet Turn - % que hace overbet en turn",
  'OBR': "Overbet River - % que hace overbet en river",
  'XRF': "Check-Raise Flop - % que hace check-raise en flop",
  'XRT': "Check-Raise Turn - % que hace check-raise en turn",
  'DONK': "Donk Bet - % que apuesta fuera de posición al agresor",
  'FLOAT': "Float Flop - % que hace call con intención de robar después",
  'STEAL': "Steal Turn - % que roba el bote en turn",
  'B&F': "Bet & Fold River - % que apuesta y foldea en river",
  'AI BB': "All-In Adjusted BB/100 - Winrate ajustado por all-ins",
  'CBet IP': "Continuation Bet In Position - % CBet en posición",
  'CBet OOP': "Continuation Bet Out of Position - % CBet fuera de posición",
  'FOBT': "Fold to Overbet Turn - % que foldea ante overbet en turn",
  'FOBR': "Fold to Overbet River - % que foldea ante overbet en river",
  'BRS': "Bet River Small - % que apuesta pequeño en river",
  'BRB': "Bet River Big - % que apuesta grande en river",
  'WSDBR': "Won Showdown with Bet River - % que gana showdown cuando apuesta river",
  'WSDOBR': "Won Showdown with Overbet River - % que gana showdown con overbet river",
  'WSDRR': "Won Showdown with River Raise - % que gana showdown con raise river",
  'WWRBS': "Won Without River Bet Small - % que gana sin apostar pequeño river",
  'WWRBB': "Won Without River Bet Big - % que gana sin apostar grande river"
};

// Configuración de todas las estadísticas disponibles
export const ALL_STATS = {
  preflop: [
    { id: 'VPIP', label: 'VPIP', dbField: 'vpip', tooltip: statTooltips.VPIP },
    { id: 'PFR', label: 'PFR', dbField: 'pfr', tooltip: statTooltips.PFR },
    { id: '3Bet', label: '3B', dbField: 'three_bet', tooltip: statTooltips['3Bet'] },
    { id: 'F3B', label: 'F3B', dbField: 'fold_to_3bet_pct', tooltip: statTooltips.F3B },
    { id: '4Bet', label: '4B', dbField: 'four_bet_preflop_pct', tooltip: statTooltips['4Bet'] },
    { id: 'F4B', label: 'F4B', dbField: 'fold_to_4bet_pct', tooltip: statTooltips.F4B },
    { id: 'SQZ', label: 'SQZ', dbField: 'squeeze', tooltip: statTooltips.SQZ },
    { id: 'LIMP', label: 'LIMP', dbField: 'limp_pct', tooltip: statTooltips.LIMP },
    { id: 'LF', label: 'L/F', dbField: 'limp_fold_pct', tooltip: statTooltips.LF, premium: true },
    { id: 'LR', label: 'L/R', dbField: 'limp_raise_pct', tooltip: statTooltips.LR, premium: true },
  ],
  postflop: [
    { id: 'AF', label: 'AF', dbField: 'aggression_factor', tooltip: statTooltips.AF },
    { id: 'WWSF', label: 'WWSF', dbField: 'wwsf', tooltip: statTooltips.WWSF },
    { id: 'WTSD', label: 'WTSD', dbField: 'wtsd', tooltip: statTooltips.WTSD },
    { id: 'WSD', label: 'WSD', dbField: 'wsd', tooltip: statTooltips.WSD },
    { id: 'AIBB', label: 'AIBB', dbField: 'all_in_adj_bb_100', tooltip: statTooltips['AI BB'] },
  ],
  flop: [
    { id: 'CB', label: 'CB', dbField: 'cbet_flop', tooltip: statTooltips.CBet },
    { id: 'FCB', label: 'FCB', dbField: 'fold_to_flop_cbet_pct', tooltip: statTooltips.FCBET },
    { id: 'CBIP', label: 'CB-IP', dbField: 'cbet_flop_ip', tooltip: statTooltips['CBet IP'] },
    { id: 'CBOOP', label: 'CB-OOP', dbField: 'cbet_flop_oop', tooltip: statTooltips['CBet OOP'] },
    { id: 'XRF', label: 'X/R', dbField: 'check_raise_flop', tooltip: statTooltips.XRF },
    { id: 'DONK', label: 'DONK', dbField: 'donk_flop', tooltip: statTooltips.DONK },
    { id: 'FLOAT', label: 'FLOAT', dbField: 'float_flop', tooltip: statTooltips.FLOAT, premium: true },
  ],
  turn: [
    { id: 'CBT', label: 'CB-T', dbField: 'cbet_turn', tooltip: statTooltips.CBetT },
    { id: 'FCBT', label: 'FCB-T', dbField: 'fold_to_turn_cbet_pct', tooltip: statTooltips.FCBetT },
    { id: 'PROBE', label: 'PROBE', dbField: 'probe_bet_turn_pct', tooltip: statTooltips.PROBE },
    { id: 'OBT', label: 'OB-T', dbField: 'overbet_turn_pct', tooltip: statTooltips.OBT },
    { id: 'FOBT', label: 'FOB-T', dbField: 'fold_to_turn_overbet', tooltip: statTooltips.FOBT, premium: true },
    { id: 'XRT', label: 'X/R-T', dbField: 'check_raise_turn', tooltip: statTooltips.XRT, premium: true },
    { id: 'STEAL', label: 'STEAL', dbField: 'steal_turn', tooltip: statTooltips.STEAL, premium: true },
  ],
  river: [
    { id: 'CBR', label: 'CB-R', dbField: 'cbet_river', tooltip: statTooltips.CBetR },
    { id: 'BETR', label: 'BET-R', dbField: 'bet_river_pct', tooltip: statTooltips.BetR },
    { id: 'FBR', label: 'FB-R', dbField: 'fold_to_river_bet_pct', tooltip: statTooltips.FBetR },
    { id: 'OBR', label: 'OB-R', dbField: 'overbet_river_pct', tooltip: statTooltips.OBR },
    { id: 'FOBR', label: 'FOB-R', dbField: 'fold_to_river_overbet', tooltip: statTooltips.FOBR, premium: true },
    { id: 'BF', label: 'B&F', dbField: 'bet_river_fold', tooltip: statTooltips['B&F'], premium: true },
    { id: 'BRS', label: 'BR-S', dbField: 'bet_river_small_pot', tooltip: statTooltips.BRS, premium: true },
    { id: 'BRB', label: 'BR-B', dbField: 'bet_river_big_pot', tooltip: statTooltips.BRB, premium: true },
  ],
  showdown: [
    { id: 'WSDBR', label: 'WSDBR', dbField: 'wsdwbr_pct', tooltip: statTooltips.WSDBR, premium: true },
    { id: 'WSDOBR', label: 'WSDOBR', dbField: 'wsdwobr', tooltip: statTooltips.WSDOBR, premium: true },
    { id: 'WSDRR', label: 'WSDRR', dbField: 'wsdwrr', tooltip: statTooltips.WSDRR, premium: true },
    { id: 'WWRBS', label: 'WWRBS', dbField: 'wwrb_small', tooltip: statTooltips.WWRBS, premium: true },
    { id: 'WWRBB', label: 'WWRBB', dbField: 'wwrb_big', tooltip: statTooltips.WWRBB, premium: true },
  ]
};

// Configuración por defecto
export const DEFAULT_HUD_CONFIG = {
  visibleStats: {
    preflop: ['VPIP', 'PFR', '3Bet', 'F3B', '4Bet', 'F4B', 'SQZ', 'LIMP'],
    postflop: ['AF', 'WWSF', 'WTSD', 'WSD', 'AIBB'],
    flop: ['CB', 'FCB', 'CBIP', 'CBOOP', 'XRF', 'DONK'],
    turn: ['CBT', 'FCBT', 'PROBE', 'OBT'],
    river: ['CBR', 'BETR', 'FBR', 'OBR'],
    showdown: []
  },
  autoCopyStats: ['VPIP', 'PFR', '3Bet', 'WTSD', 'WSD'],
  statOrder: {
    preflop: ['VPIP', 'PFR', '3Bet', 'F3B', '4Bet', 'F4B', 'SQZ', 'LIMP', 'LF', 'LR'],
    postflop: ['AF', 'WWSF', 'WTSD', 'WSD', 'AIBB'],
    flop: ['CB', 'FCB', 'CBIP', 'CBOOP', 'XRF', 'DONK', 'FLOAT'],
    turn: ['CBT', 'FCBT', 'PROBE', 'OBT', 'FOBT', 'XRT', 'STEAL'],
    river: ['CBR', 'BETR', 'FBR', 'OBR', 'FOBR', 'BF', 'BRS', 'BRB'],
    showdown: ['WSDBR', 'WSDOBR', 'WSDRR', 'WWRBS', 'WWRBB']
  }
};

// Abreviaciones de estadísticas
export const statAbbreviations = {
  "VPIP": "VPIP",
  "PFR": "PFR",
  "3Bet": "3B",
  "F3B": "F3B",
  "4Bet": "4B",
  "F4B": "F4B",
  "SQZ": "SQZ",
  "CBet": "CBF",
  "CB": "CB",
  "FCB": "FCB",
  "CBT": "CBT",
  "CBR": "CBR",
  "WWSF": "WWSF",
  "WTSD": "WTSD",
  "WSD": "WSD",
  "LIMP": "LIMP",
  "LF": "LF",
  "LR": "LR",
  "FCBET": "FCB",
  "FCBT": "FCBT",
  "FBR": "FBR",
  "PROBE": "PROBE",
  "BETR": "BR",
  "OBT": "OBT",
  "OBR": "OBR",
  "FOBT": "FOBT",
  "FOBR": "FOBR",
  "XRF": "XRF",
  "XRT": "XRT",
  "CBIP": "CBIP",
  "CBOOP": "CBOOP",
  "DONK": "DONK",
  "FLOAT": "FLOAT",
  "STEAL": "STEAL",
  "BF": "BFR",
  "BRS": "BRS",
  "BRB": "BRB",
  "WSDBR": "WSDBR",
  "WSDOBR": "WSDOBR",
  "WSDRR": "WSDRR",
  "WWRBS": "WWRBS",
  "WWRBB": "WWRBB",
  "AIBB": "AIBB",
  "AF": "AF"
};

// Colores de stakes
export const STAKE_COLORS = {
  'microstakes': 'green',
  'nl100': 'blue',
  'nl200': 'purple',
  'nl400': 'orange',
  'high-stakes': 'red'
};

// Labels de stakes
export const STAKE_LABELS = {
  'microstakes': 'Micro',
  'nl100': 'NL100',
  'nl200': 'NL200',
  'nl400': 'NL400',
  'high-stakes': 'High Stakes'
};